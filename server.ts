import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

if (
  !process.env.GEMINI_MODEL ||
  process.env.GEMINI_MODEL.includes('2.5') ||
  process.env.GEMINI_MODEL.includes('2.0') ||
  process.env.GEMINI_MODEL.includes('1.5')
) {
  process.env.GEMINI_MODEL = 'gemini-3.8-flash';
}

const app = express();

const PORT = Number(process.env.PORT) || 10000;

app.use(express.json({ limit: '25mb' }));

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'MY_GEMINI_API_KEY'
  ) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  return aiClient;
}

function getModelName(): string {
  const envModel = process.env.GEMINI_MODEL?.trim();

  const deprecatedModels = [
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-2.0-flash-lite',
    'gemini-2.0-pro',
    'gemini-2.0-flash-thinking',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro',
  ];

  if (
    envModel &&
    !deprecatedModels.includes(envModel) &&
    !envModel.includes('2.5-flash') &&
    !envModel.includes('2.0') &&
    !envModel.includes('1.5')
  ) {
    return envModel;
  }

  return 'gemini-3.8-flash';
}

const modelCooldownMap = new Map<string, number>();

function isModelInCooldown(model: string): boolean {
  const cooldownUntil = modelCooldownMap.get(model);

  if (!cooldownUntil) return false;

  if (Date.now() >= cooldownUntil) {
    modelCooldownMap.delete(model);
    return false;
  }

  return true;
}

function markModelCooldown(model: string, err: any) {
  let cooldownSec = 45;

  try {
    const raw =
      typeof err === 'string'
        ? err
        : err?.message || JSON.stringify(err);

    const retryMatch =
      raw.match(/retry in ([0-9.]+)s/i) ||
      raw.match(/retryDelay["']?\s*:\s*["']?([0-9]+)s/i);

    if (retryMatch?.[1]) {
      const parsedSec = Math.ceil(parseFloat(retryMatch[1]));

      if (parsedSec > 0 && parsedSec <= 3600) {
        cooldownSec = parsedSec + 2;
      }
    } else if (
      raw.includes('RESOURCE_EXHAUSTED') ||
      raw.includes('429')
    ) {
      cooldownSec = 60;
    }
  } catch {}

  modelCooldownMap.set(
    model,
    Date.now() + cooldownSec * 1000
  );
}

function getOrderedCandidates(): string[] {
  const configured = getModelName();

  const allCandidates = [
    configured,
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
  ];

  const unique = Array.from(new Set(allCandidates));

  const healthy = unique.filter(
    (m) => !isModelInCooldown(m)
  );

  const cooling = unique.filter(
    (m) => isModelInCooldown(m)
  );

  return [...healthy, ...cooling];
}

const ASSISTANT_MODES: Record<string, string> = {
  general: `You are Aura AI, a modern, highly intelligent, friendly, and helpful AI assistant.
Always respond in the language used by the user. If the user writes Hindi or Hinglish, respond naturally in Hindi or Hinglish.
Explain complex topics in beginner-friendly language.
For programming questions, provide correct modern code with explanations.
Never pretend an external action was executed if it was not.
If you do not know something, clearly say so.
Use Markdown for readable answers.`,

  coding: `You are Aura AI in Coding Assistant Mode.
Provide clean, robust, modern, production-grade code.
Explain important choices, edge cases, performance and security considerations.`,

  tutor: `You are Aura AI in Study Tutor Mode.
Break complex subjects into simple lessons.
Use real-world examples and analogies.
Encourage understanding and active learning.`,

  writing: `You are Aura AI in Writing Assistant Mode.
Help users draft, refine, polish and proofread writing while preserving their intent.`,

  research: `You are Aura AI in Research Assistant Mode.
Provide structured, objective explanations.
Distinguish established facts, competing ideas and open questions.`,
};

const DEFAULT_SYSTEM_INSTRUCTION = ASSISTANT_MODES.general;

app.get('/api/health', (req: Request, res: Response) => {
  const hasKey = Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
  );

  const configured = getModelName();
  const candidates = getOrderedCandidates();

  res.json({
    status: 'ok',
    appName: 'Aura AI',
    model: configured,
    activeModel: candidates[0] || configured,
    isRateLimited: isModelInCooldown(configured),
    hasApiKey: hasKey,
    port: PORT,
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    appName: 'Aura AI',
  });
});

app.post('/api/chat/title', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      res.json({ title: 'New Conversation' });
      return;
    }

    const cleanMsg = message.trim().replace(/^["']|["']$/g, '');
    const firstLine = cleanMsg.split('\n')[0].trim();

    if (
      firstLine.length > 0 &&
      firstLine.length <= 35 &&
      !firstLine.includes('{')
    ) {
      res.json({ title: firstLine });
      return;
    }

    const ai = getGeminiClient();

    for (const model of getOrderedCandidates()) {
      try {
        const result = await ai.models.generateContent({
          model,
          contents: `Provide a short title (3-5 words, no quotes) for a chat beginning with: "${firstLine.slice(
            0,
            120
          )}"`,
        });

        if (result.text) {
          res.json({
            title: result.text
              .trim()
              .replace(/^["'#*]+|["'#*]+$/g, '')
              .slice(0, 45),
          });

          return;
        }
      } catch (err: any) {
        markModelCooldown(model, err);
      }
    }

    res.json({
      title:
        firstLine.split(/\s+/).slice(0, 5).join(' ') ||
        'New Conversation',
    });
  } catch {
    res.json({ title: 'New Conversation' });
  }
});

function extractCleanErrorMessage(err: any): string {
  if (!err) return 'An unexpected error occurred.';

  const msg =
    typeof err === 'string'
      ? err
      : err.message || String(err);

  if (
    msg.includes('RESOURCE_EXHAUSTED') ||
    msg.includes('Quota exceeded') ||
    msg.includes('429')
  ) {
    return 'The AI service quota is currently reached on the free tier. Please wait and try again.';
  }

  return msg || 'Failed to generate AI response. Please try again.';
}

app.post('/api/chat/stream', async (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let isAborted = false;

  res.on('close', () => {
    if (!res.writableEnded) {
      isAborted = true;
    }
  });

  try {
    const {
      messages,
      customSystemInstruction,
      mode,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.write(
        `data: ${JSON.stringify({
          error: 'Messages array is required.',
        })}\n\n`
      );

      res.end();
      return;
    }

    const ai = getGeminiClient();

    const formattedContents = messages.map((m: any) => {
      const role =
        m.role === 'assistant' || m.role === 'model'
          ? 'model'
          : 'user';

      const parts: any[] = [];

      if (Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.textContent) {
            parts.push({
              text: `[Attached Document: ${
                att.name || 'document'
              }]\n${att.textContent}`,
            });
          } else if (att.data && att.mimeType) {
            parts.push({
              inlineData: {
                data: att.data.replace(
                  /^data:[^;]+;base64,/,
                  ''
                ),
                mimeType: att.mimeType,
              },
            });
          }
        }
      }

      if (m.text?.trim()) {
        parts.push({ text: m.text });
      }

      if (parts.length === 0) {
        parts.push({ text: '' });
      }

      return { role, parts };
    });

    const systemInstruction =
      customSystemInstruction ||
      (mode && ASSISTANT_MODES[mode]) ||
      DEFAULT_SYSTEM_INSTRUCTION;

    let streamResponse: any = null;
    let usedModel = '';
    let lastError: any = null;

    for (const model of getOrderedCandidates()) {
      try {
        streamResponse =
          await ai.models.generateContentStream({
            model,
            contents: formattedContents,
            config: {
              systemInstruction,
              temperature: 0.7,
            },
          });

        usedModel = model;
        break;
      } catch (err: any) {
        lastError = err;
        markModelCooldown(model, err);
      }
    }

    if (!streamResponse) {
      throw (
        lastError ||
        new Error('All model candidates are unavailable.')
      );
    }

    for await (const chunk of streamResponse) {
      if (isAborted) break;

      const textChunk =
        (chunk as GenerateContentResponse).text;

      if (textChunk) {
        res.write(
          `data: ${JSON.stringify({
            chunk: textChunk,
          })}\n\n`
        );
      }
    }

    if (!isAborted) {
      res.write(
        `data: ${JSON.stringify({
          done: true,
          model: usedModel,
        })}\n\n`
      );
    }

    res.end();
  } catch (error: any) {
    if (!isAborted) {
      res.write(
        `data: ${JSON.stringify({
          error: extractCleanErrorMessage(error),
        })}\n\n`
      );

      res.end();
    }
  }
});

app.post('/api/chat/generate', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      customSystemInstruction,
      mode,
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({
        error: 'Messages array is required.',
      });

      return;
    }

    const ai = getGeminiClient();

    const formattedContents = messages.map((m: any) => {
      const role =
        m.role === 'assistant' || m.role === 'model'
          ? 'model'
          : 'user';

      const parts: any[] = [];

      if (Array.isArray(m.attachments)) {
        for (const att of m.attachments) {
          if (att.textContent) {
            parts.push({
              text: `[Attached Document: ${
                att.name || 'document'
              }]\n${att.textContent}`,
            });
          } else if (att.data && att.mimeType) {
            parts.push({
              inlineData: {
                data: att.data.replace(
                  /^data:[^;]+;base64,/,
                  ''
                ),
                mimeType: att.mimeType,
              },
            });
          }
        }
      }

      if (m.text?.trim()) {
        parts.push({ text: m.text });
      }

      if (parts.length === 0) {
        parts.push({ text: '' });
      }

      return { role, parts };
    });

    const systemInstruction =
      customSystemInstruction ||
      (mode && ASSISTANT_MODES[mode]) ||
      DEFAULT_SYSTEM_INSTRUCTION;

    let response: GenerateContentResponse | null = null;
    let usedModel = '';
    let lastError: any = null;

    for (const model of getOrderedCandidates()) {
      try {
        response = await ai.models.generateContent({
          model,
          contents: formattedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });

        usedModel = model;
        break;
      } catch (err: any) {
        lastError = err;
        markModelCooldown(model, err);
      }
    }

    if (!response) {
      throw (
        lastError ||
        new Error('All model candidates are unavailable.')
      );
    }

    res.json({
      text: response.text || '',
      model: usedModel,
    });
  } catch (error: any) {
    res.status(500).json({
      error: extractCleanErrorMessage(error),
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');

    app.use(express.static(distPath));

    app.get('*', (req: Request, res: Response) => {
      res.sendFile(
        path.join(distPath, 'index.html')
      );
    });
  }

  const server = app.listen(
    PORT,
    '0.0.0.0',
    () => {
      console.log(
        `Aura AI server running on http://0.0.0.0:${PORT}`
      );
      console.log(
        `Render PORT environment variable: ${
          process.env.PORT || 'not set'
        }`
      );
    }
  );

  server.keepAliveTimeout = 120000;
  server.headersTimeout = 120000;
}

startServer();

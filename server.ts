import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import {
  GoogleGenAI,
  GenerateContentResponse,
} from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

/*
|--------------------------------------------------------------------------
| MODEL CONFIGURATION
|--------------------------------------------------------------------------
*/

if (
  !process.env.GEMINI_MODEL ||
  process.env.GEMINI_MODEL.includes('2.5') ||
  process.env.GEMINI_MODEL.includes('2.0') ||
  process.env.GEMINI_MODEL.includes('1.5')
) {
  process.env.GEMINI_MODEL = 'gemini-3.8-flash';
}

const app = express();

const PORT =
  Number(process.env.PORT) || 10000;

app.use(
  express.json({
    limit: '25mb',
  })
);

let aiClient: GoogleGenAI | null = null;

/*
|--------------------------------------------------------------------------
| GEMINI CLIENT
|--------------------------------------------------------------------------
*/

function getGeminiClient(): GoogleGenAI {
  const apiKey =
    process.env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'MY_GEMINI_API_KEY'
  ) {
    throw new Error(
      'AI service is not configured.'
    );
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

/*
|--------------------------------------------------------------------------
| MODEL NAME
|--------------------------------------------------------------------------
*/

function getModelName(): string {
  const envModel =
    process.env.GEMINI_MODEL?.trim();

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
    !envModel.includes('2.5') &&
    !envModel.includes('2.0') &&
    !envModel.includes('1.5')
  ) {
    return envModel;
  }

  return 'gemini-3.8-flash';
}

/*
|--------------------------------------------------------------------------
| MODEL FALLBACK / COOLDOWN
|--------------------------------------------------------------------------
*/

const modelCooldownMap =
  new Map<string, number>();

function isModelInCooldown(
  model: string
): boolean {
  const cooldownUntil =
    modelCooldownMap.get(model);

  if (!cooldownUntil) {
    return false;
  }

  if (Date.now() >= cooldownUntil) {
    modelCooldownMap.delete(model);
    return false;
  }

  return true;
}

function markModelCooldown(
  model: string,
  err: any
) {
  let cooldownSec = 45;

  try {
    const raw =
      typeof err === 'string'
        ? err
        : err?.message ||
          JSON.stringify(err);

    const retryMatch =
      raw.match(
        /retry in ([0-9.]+)s/i
      ) ||
      raw.match(
        /retryDelay["']?\s*:\s*["']?([0-9]+)s/i
      );

    if (retryMatch?.[1]) {
      const parsedSec =
        Math.ceil(
          parseFloat(
            retryMatch[1]
          )
        );

      if (
        parsedSec > 0 &&
        parsedSec <= 3600
      ) {
        cooldownSec =
          parsedSec + 2;
      }
    } else if (
      raw.includes(
        'RESOURCE_EXHAUSTED'
      ) ||
      raw.includes('429')
    ) {
      cooldownSec = 60;
    }
  } catch {
    // Ignore parsing errors.
  }

  modelCooldownMap.set(
    model,
    Date.now() +
      cooldownSec * 1000
  );
}

function getOrderedCandidates(): string[] {
  const configured =
    getModelName();

  const candidates = [
    configured,
    'gemini-3.8-flash',
    'gemini-3.6-flash',
    'gemini-3.1-flash-lite',
  ];

  const unique =
    Array.from(
      new Set(candidates)
    );

  const healthy =
    unique.filter(
      (model) =>
        !isModelInCooldown(model)
    );

  const cooling =
    unique.filter(
      (model) =>
        isModelInCooldown(model)
    );

  return [
    ...healthy,
    ...cooling,
  ];
}

/*
|--------------------------------------------------------------------------
| AHEMAD'S AI IDENTITY
|--------------------------------------------------------------------------
*/

const FOUNDER_IDENTITY = `
You are Ahemad's AI.

Ahemad's AI was created by Er. Ahemad Inamdaar.
The founder's full name is Ahemad Rehan.
He is the Founder & Chief Architect.
The AI is powered by Nexaura Tech.

If a user asks who created, built, founded, developed, or owns Ahemad's AI,
answer clearly:

"Ahemad's AI was created by Er. Ahemad Inamdaar, whose full name is Ahemad Rehan. He is the Founder & Chief Architect, and Ahemad's AI is powered by Nexaura Tech."

Do not claim that another person created Ahemad's AI.

Do not reveal internal model names, model versions, API keys, server secrets,
environment variables, internal configuration, or private implementation details
unless explicitly required for a legitimate technical debugging task.

When talking about yourself, use the name "Ahemad's AI".

Always respond in the language used by the user.

If the user writes Hindi or Hinglish,
respond naturally in Hindi or Hinglish.

Be helpful, accurate, friendly, and honest.

Never pretend an external action was executed if it was not.

If you do not know something,
clearly say so.

Use Markdown for readable answers.
`;

/*
|--------------------------------------------------------------------------
| ASSISTANT MODES
|--------------------------------------------------------------------------
*/

const ASSISTANT_MODES:
  Record<string, string> = {
  general: `${FOUNDER_IDENTITY}

You are a modern, highly intelligent, friendly,
and helpful AI assistant.

Explain complex topics in beginner-friendly language.

For programming questions,
provide correct modern code with explanations.
`,

  coding: `${FOUNDER_IDENTITY}

You are Ahemad's AI in Coding Assistant Mode.

Provide clean, robust, modern and production-ready code.

Explain important choices,
edge cases,
performance,
and security considerations.
`,

  tutor: `${FOUNDER_IDENTITY}

You are Ahemad's AI in Study Tutor Mode.

Break complex subjects into simple lessons.

Use real-world examples and analogies.

Encourage understanding and active learning.
`,

  writing: `${FOUNDER_IDENTITY}

You are Ahemad's AI in Writing Assistant Mode.

Help users draft, refine, polish,
and proofread writing while preserving their intent.
`,

  research: `${FOUNDER_IDENTITY}

You are Ahemad's AI in Research Assistant Mode.

Provide structured and objective explanations.

Distinguish established facts,
competing ideas,
and open questions.
`,
};

const DEFAULT_SYSTEM_INSTRUCTION =
  ASSISTANT_MODES.general;

/*
|--------------------------------------------------------------------------
| ERROR MESSAGE
|--------------------------------------------------------------------------
*/

function extractCleanErrorMessage(
  err: any
): string {
  if (!err) {
    return 'An unexpected error occurred.';
  }

  const msg =
    typeof err === 'string'
      ? err
      : err?.message ||
        String(err);

  if (
    msg.includes(
      'RESOURCE_EXHAUSTED'
    ) ||
    msg.includes(
      'Quota exceeded'
    ) ||
    msg.includes('429')
  ) {
    return "Ahemad's AI is temporarily busy. Please wait a moment and try again.";
  }

  if (
    msg.includes(
      'API key'
    ) ||
    msg.includes(
      'API_KEY'
    )
  ) {
    return "Ahemad's AI service configuration needs attention.";
  }

  if (
    msg.includes(
      'NOT_FOUND'
    ) ||
    msg.includes(
      'not found'
    )
  ) {
    return "The requested AI model or service is currently unavailable.";
  }

  return (
    msg ||
    "Ahemad's AI could not generate a response. Please try again."
  );
}

/*
|--------------------------------------------------------------------------
| FORMAT ATTACHMENTS
|--------------------------------------------------------------------------
*/

function formatAttachmentParts(
  attachments: any[]
): any[] {
  const parts: any[] = [];

  if (!Array.isArray(attachments)) {
    return parts;
  }

  for (const attachment of attachments) {
    if (
      attachment?.textContent
    ) {
      parts.push({
        text: `[Attached Document: ${
          attachment.name ||
          'document'
        }]\n${attachment.textContent}`,
      });
    } else if (
      attachment?.data &&
      attachment?.mimeType
    ) {
      parts.push({
        inlineData: {
          data:
            attachment.data.replace(
              /^data:[^;]+;base64,/,
              ''
            ),
          mimeType:
            attachment.mimeType,
        },
      });
    }
  }

  return parts;
}

/*
|--------------------------------------------------------------------------
| FORMAT GEMINI MESSAGES
|--------------------------------------------------------------------------
*/

function formatMessages(
  messages: any[]
) {
  if (!Array.isArray(messages)) {
    return [];
  }

  return messages.map(
    (message: any) => {
      const role =
        message.role ===
          'assistant' ||
        message.role === 'model'
          ? 'model'
          : 'user';

      const parts: any[] = [];

      const attachmentParts =
        formatAttachmentParts(
          message.attachments
        );

      parts.push(
        ...attachmentParts
      );

      const text =
        typeof message.text ===
        'string'
          ? message.text
          : typeof message.content ===
              'string'
            ? message.content
            : '';

      if (text.trim()) {
        parts.push({
          text: text,
        });
      }

      if (parts.length === 0) {
        parts.push({
          text: '',
        });
      }

      return {
        role,
        parts,
      };
    }
  );
}

/*
|--------------------------------------------------------------------------
| SYSTEM INSTRUCTION
|--------------------------------------------------------------------------
*/

function buildSystemInstruction(
  customSystemInstruction?: string,
  mode?: string
): string {
  const modeInstruction =
    (mode &&
      ASSISTANT_MODES[mode]) ||
    DEFAULT_SYSTEM_INSTRUCTION;

  if (
    customSystemInstruction &&
    typeof customSystemInstruction ===
      'string' &&
    customSystemInstruction.trim()
  ) {
    return `${FOUNDER_IDENTITY}

${customSystemInstruction.trim()}

Remember:

- Your name is Ahemad's AI.
- Creator: Er. Ahemad Inamdaar.
- Full name: Ahemad Rehan.
- Role: Founder & Chief Architect.
- Powered by Nexaura Tech.
`;
  }

  return modeInstruction;
}

/*
|--------------------------------------------------------------------------
| HEALTH
|--------------------------------------------------------------------------
*/

app.get(
  '/api/health',
  (
    req: Request,
    res: Response
  ) => {
    try {
      const hasKey =
        Boolean(
          process.env.GEMINI_API_KEY &&
            process.env.GEMINI_API_KEY !==
              'MY_GEMINI_API_KEY'
        );

      const configured =
        getModelName();

      const candidates =
        getOrderedCandidates();

      res.json({
        status: 'ok',

        appName:
          "Ahemad's AI",

        model:
          configured,

        activeModel:
          candidates[0] ||
          configured,

        isRateLimited:
          isModelInCooldown(
            configured
          ),

        hasApiKey:
          hasKey,

        port: PORT,
      });
    } catch (error: any) {
      res.status(200).json({
        status: 'ok',
        appName:
          "Ahemad's AI",
        hasApiKey: Boolean(
          process.env.GEMINI_API_KEY
        ),
        model:
          'gemini-3.8-flash',
      });
    }
  }
);

app.get(
  '/health',
  (
    req: Request,
    res: Response
  ) => {
    res.status(200).json({
      status: 'ok',
      appName:
        "Ahemad's AI",
    });
  }
);

/*
|--------------------------------------------------------------------------
| CHAT TITLE
|--------------------------------------------------------------------------
*/

app.post(
  '/api/chat/title',
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        message,
      } = req.body;

      if (
        !message ||
        typeof message !==
          'string'
      ) {
        res.json({
          title:
            'New Conversation',
        });

        return;
      }

      const cleanMessage =
        message
          .trim()
          .replace(
            /^["']|["']$/g,
            ''
          );

      const firstLine =
        cleanMessage
          .split('\n')[0]
          .trim();

      if (
        firstLine.length > 0 &&
        firstLine.length <= 35 &&
        !firstLine.includes(
          '{'
        )
      ) {
        res.json({
          title:
            firstLine,
        });

        return;
      }

      const ai =
        getGeminiClient();

      for (const model of getOrderedCandidates()) {
        try {
          const result =
            await ai.models.generateContent(
              {
                model,

                contents:
                  `Provide a short title (3-5 words, no quotes) for a chat beginning with: "${firstLine.slice(
                    0,
                    120
                  )}"`,
              }
            );

          if (result.text) {
            res.json({
              title:
                result.text
                  .trim()
                  .replace(
                    /^["'#*]+|["'#*]+$/g,
                    ''
                  )
                  .slice(
                    0,
                    45
                  ),
            });

            return;
          }
        } catch (error: any) {
          markModelCooldown(
            model,
            error
          );
        }
      }

      res.json({
        title:
          firstLine
            .split(/\s+/)
            .slice(0, 5)
            .join(' ') ||
          'New Conversation',
      });
    } catch {
      res.json({
        title:
          'New Conversation',
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| MAIN CHAT API
|--------------------------------------------------------------------------
|
| IMPORTANT:
| App.tsx calls /api/chat.
| This route returns PLAIN TEXT streaming,
| not SSE, because App.tsx reads response.body
| directly as text.
|--------------------------------------------------------------------------
*/

app.post(
  '/api/chat',
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        message,
        messages,
        attachments,
        customSystemInstruction,
        systemInstruction,
        mode,
      } = req.body;

      if (
        (!message ||
          typeof message !==
            'string') &&
        (!Array.isArray(
          messages
        ) ||
          messages.length === 0)
      ) {
        res.status(400).json({
          error:
            'Message is required.',
        });

        return;
      }

      const ai =
        getGeminiClient();

      const history =
        Array.isArray(messages)
          ? formatMessages(
              messages
            )
          : [];

      /*
       * Add current user message.
       *
       * App.tsx sends previous messages
       * separately and current message in
       * the "message" field.
       */
      const currentParts: any[] =
        formatAttachmentParts(
          Array.isArray(
            attachments
          )
            ? attachments
            : []
        );

      if (
        typeof message ===
          'string' &&
        message.trim()
      ) {
        currentParts.push({
          text: message.trim(),
        });
      }

      if (
        currentParts.length > 0
      ) {
        history.push({
          role: 'user',
          parts: currentParts,
        });
      }

      const finalSystemInstruction =
        buildSystemInstruction(
          customSystemInstruction ||
            systemInstruction,
          mode
        );

      let streamResponse:
        | AsyncIterable<GenerateContentResponse>
        | null = null;

      let usedModel = '';

      let lastError:
        | any = null;

      for (const model of getOrderedCandidates()) {
        try {
          streamResponse =
            await ai.models.generateContentStream(
              {
                model,

                contents:
                  history,

                config: {
                  systemInstruction:
                    finalSystemInstruction,
                },
              }
            );

          usedModel = model;

          break;
        } catch (error: any) {
          lastError =
            error;

          console.error(
            `Model ${model} failed:`,
            error
          );

          markModelCooldown(
            model,
            error
          );
        }
      }

      if (!streamResponse) {
        throw (
          lastError ||
          new Error(
            'All AI service candidates are unavailable.'
          )
        );
      }

      /*
       * Plain text streaming.
       */
      res.status(200);

      res.setHeader(
        'Content-Type',
        'text/plain; charset=utf-8'
      );

      res.setHeader(
        'Cache-Control',
        'no-cache, no-transform'
      );

      res.setHeader(
        'Connection',
        'keep-alive'
      );

      res.flushHeaders?.();

      for await (const chunk of streamResponse) {
        const textChunk =
          (
            chunk as GenerateContentResponse
          ).text;

        if (
          textChunk &&
          !res.writableEnded
        ) {
          res.write(
            textChunk
          );
        }
      }

      console.log(
        `Chat completed using model: ${usedModel}`
      );

      if (!res.writableEnded) {
        res.end();
      }
    } catch (error: any) {
      console.error(
        'MAIN CHAT ERROR:',
        error
      );

      const errorMessage =
        extractCleanErrorMessage(
          error
        );

      if (
        !res.headersSent
      ) {
        res.status(500).json({
          error:
            errorMessage,
        });
      } else if (
        !res.writableEnded
      ) {
        res.end();
      }
    }
  }
);

/*
|--------------------------------------------------------------------------
| STREAMING CHAT API
|--------------------------------------------------------------------------
|
| Kept for future frontend usage.
| This endpoint uses SSE.
|--------------------------------------------------------------------------
*/

app.post(
  '/api/chat/stream',
  async (
    req: Request,
    res: Response
  ) => {
    res.setHeader(
      'Content-Type',
      'text/event-stream'
    );

    res.setHeader(
      'Cache-Control',
      'no-cache, no-transform'
    );

    res.setHeader(
      'Connection',
      'keep-alive'
    );

    res.flushHeaders?.();

    let isAborted =
      false;

    res.on(
      'close',
      () => {
        if (
          !res.writableEnded
        ) {
          isAborted =
            true;
        }
      }
    );

    try {
      const {
        messages,
        customSystemInstruction,
        systemInstruction,
        mode,
      } = req.body;

      if (
        !Array.isArray(
          messages
        ) ||
        messages.length === 0
      ) {
        res.write(
          `data: ${JSON.stringify(
            {
              error:
                'Messages array is required.',
            }
          )}\n\n`
        );

        res.end();

        return;
      }

      const ai =
        getGeminiClient();

      const formattedContents =
        formatMessages(
          messages
        );

      const finalSystemInstruction =
        buildSystemInstruction(
          customSystemInstruction ||
            systemInstruction,
          mode
        );

      let streamResponse:
        | AsyncIterable<GenerateContentResponse>
        | null = null;

      let usedModel = '';

      let lastError:
        | any = null;

      for (const model of getOrderedCandidates()) {
        try {
          streamResponse =
            await ai.models.generateContentStream(
              {
                model,

                contents:
                  formattedContents,

                config: {
                  systemInstruction:
                    finalSystemInstruction,
                },
              }
            );

          usedModel = model;

          break;
        } catch (error: any) {
          lastError =
            error;

          markModelCooldown(
            model,
            error
          );
        }
      }

      if (!streamResponse) {
        throw (
          lastError ||
          new Error(
            'All AI service candidates are unavailable.'
          )
        );
      }

      for await (const chunk of streamResponse) {
        if (
          isAborted
        ) {
          break;
        }

        const textChunk =
          (
            chunk as GenerateContentResponse
          ).text;

        if (textChunk) {
          res.write(
            `data: ${JSON.stringify(
              {
                chunk:
                  textChunk,
              }
            )}\n\n`
          );
        }
      }

      if (
        !isAborted
      ) {
        res.write(
          `data: ${JSON.stringify(
            {
              done: true,
              model:
                usedModel,
            }
          )}\n\n`
        );
      }

      res.end();
    } catch (error: any) {
      if (
        !isAborted
      ) {
        res.write(
          `data: ${JSON.stringify(
            {
              error:
                extractCleanErrorMessage(
                  error
                ),
            }
          )}\n\n`
        );

        res.end();
      }
    }
  }
);

/*
|--------------------------------------------------------------------------
| NORMAL CHAT GENERATION
|--------------------------------------------------------------------------
*/

app.post(
  '/api/chat/generate',
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        messages,
        customSystemInstruction,
        systemInstruction,
        mode,
      } = req.body;

      if (
        !Array.isArray(
          messages
        ) ||
        messages.length === 0
      ) {
        res.status(400).json({
          error:
            'Messages array is required.',
        });

        return;
      }

      const ai =
        getGeminiClient();

      const formattedContents =
        formatMessages(
          messages
        );

      const finalSystemInstruction =
        buildSystemInstruction(
          customSystemInstruction ||
            systemInstruction,
          mode
        );

      let response:
        | GenerateContentResponse
        | null = null;

      let usedModel = '';

      let lastError:
        | any = null;

      for (const model of getOrderedCandidates()) {
        try {
          response =
            await ai.models.generateContent(
              {
                model,

                contents:
                  formattedContents,

                config: {
                  systemInstruction:
                    finalSystemInstruction,
                },
              }
            );

          usedModel = model;

          break;
        } catch (error: any) {
          lastError =
            error;

          markModelCooldown(
            model,
            error
          );
        }
      }

      if (!response) {
        throw (
          lastError ||
          new Error(
            'All AI service candidates are unavailable.'
          )
        );
      }

      res.json({
        text:
          response.text ||
          '',

        model:
          usedModel,
      });
    } catch (error: any) {
      console.error(
        'CHAT GENERATE ERROR:',
        error
      );

      res.status(500).json({
        error:
          extractCleanErrorMessage(
            error
          ),
      });
    }
  }
);

/*
|--------------------------------------------------------------------------
| 404 API HANDLER
|--------------------------------------------------------------------------
*/

app.use(
  '/api',
  (
    req: Request,
    res: Response
  ) => {
    res.status(404).json({
      error:
        `API route not found: ${req.method} ${req.path}`,
    });
  }
);

/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

async function startServer() {
  if (
    process.env.NODE_ENV !==
    'production'
  ) {
    const vite =
      await createViteServer({
        server: {
          middlewareMode:
            true,
        },

        appType: 'spa',
      });

    app.use(
      vite.middlewares
    );
  } else {
    const distPath =
      path.join(
        process.cwd(),
        'dist'
      );

    app.use(
      express.static(
        distPath
      )
    );

    app.get(
      '*',
      (
        req: Request,
        res: Response
      ) => {
        res.sendFile(
          path.join(
            distPath,
            'index.html'
          )
        );
      }
    );
  }

  const server =
    app.listen(
      PORT,
      '0.0.0.0',
      () => {
        console.log(
          `Ahemad's AI server running on port ${PORT}`
        );

        console.log(
          `Render PORT: ${
            process.env.PORT ||
            'not set'
          }`
        );

        console.log(
          `Active Gemini model: ${getModelName()}`
        );
      }
    );

  server.keepAliveTimeout =
    120000;

  server.headersTimeout =
    120000;
}

startServer();

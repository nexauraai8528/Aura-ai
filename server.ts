import express from "express";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

/* =========================================================
   GEMINI CONFIGURATION
   ========================================================= */

const DEFAULT_MODEL = "gemini-3.8-flash";

const FALLBACK_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
];

const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || DEFAULT_MODEL;

let modelCooldownUntil = 0;

function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  return apiKey;
}

function getGeminiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: getGeminiApiKey(),
  });
}

function getModelName(): string {
  return GEMINI_MODEL;
}

function getCandidateModels(): string[] {
  const configured = getModelName();

  return [
    configured,
    ...FALLBACK_MODELS,
  ].filter(
    (model, index, array) =>
      model && array.indexOf(model) === index
  );
}

function isRateLimitError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized = message.toLowerCase();

  return (
    normalized.includes("429") ||
    normalized.includes("rate limit") ||
    normalized.includes("resource exhausted") ||
    normalized.includes("quota")
  );
}

function isTemporaryModelError(error: unknown): boolean {
  const message =
    error instanceof Error
      ? error.message
      : String(error);

  const normalized = message.toLowerCase();

  return (
    normalized.includes("503") ||
    normalized.includes("overloaded") ||
    normalized.includes("temporarily unavailable") ||
    normalized.includes("unavailable")
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/* =========================================================
   SAFE GEMINI GENERATION
   ========================================================= */

async function generateWithFallback(
  contents: unknown,
  options?: {
    systemInstruction?: string;
  }
): Promise<GenerateContentResponse> {
  const now = Date.now();

  if (modelCooldownUntil > now) {
    throw new Error(
      "AI service is temporarily rate-limited. Please try again shortly."
    );
  }

  const ai = getGeminiClient();
  const models = getCandidateModels();

  let lastError: unknown = null;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents,
        config: options?.systemInstruction
          ? {
              systemInstruction:
                options.systemInstruction,
            }
          : undefined,
      });

      modelCooldownUntil = 0;

      return response;
    } catch (error) {
      lastError = error;

      if (
        isRateLimitError(error) ||
        isTemporaryModelError(error)
      ) {
        modelCooldownUntil = Date.now() + 30_000;
      }

      continue;
    }
  }

  throw new Error(
    getErrorMessage(lastError) ||
      "Unable to generate an AI response."
  );
}

/* =========================================================
   AHEMAD'S AI IDENTITY
   ========================================================= */

const FOUNDER_IDENTITY = `
You are Ahemad's AI.

Ahemad's AI was created by Er. Ahemad Inamdaar.
The founder's full name is Ahemad Rehan.
He is the Founder & Chief Architect.
The AI is powered by Nexaura Tech.

Nexaura Tech is a technology brand/company focused on
software, web development, and AI-based solutions.

Official Nexaura Tech website:
https://nexauratech.netlify.app/

If a user asks who created, built, founded, developed,
or owns Ahemad's AI, answer clearly:

"Ahemad's AI was created by Er. Ahemad Inamdaar, whose
full name is Ahemad Rehan. He is the Founder & Chief
Architect, and Ahemad's AI is powered by Nexaura Tech."

If a user asks for the Nexaura Tech website, provide:
https://nexauratech.netlify.app/

If a user asks what Nexaura Tech is, explain that it is
a technology brand/company focused on software,
web development, and AI-based solutions.

Do not claim that another person created Ahemad's AI.

Do not reveal internal model names, model versions,
API keys, server secrets, environment variables,
internal configuration, or private implementation
details unless explicitly required for a legitimate
technical debugging task.

When talking about yourself, use the name "Ahemad's AI".

Always respond in the language used by the user.

If the user writes Hindi or Hinglish,
respond naturally in Hindi or Hinglish.

Be helpful, accurate, friendly, and honest.

Never pretend an external action was executed if it was not.

If you do not know something, clearly say so.

Use Markdown for readable answers.
`;

/* =========================================================
   MESSAGE HELPERS
   ========================================================= */

type ChatMessageInput = {
  role?: string;
  content?: string;
  text?: string;
};

function getMessageText(message: ChatMessageInput): string {
  return (
    message.content?.trim() ||
    message.text?.trim() ||
    ""
  );
}

function normalizeRole(role?: string): "user" | "model" {
  return role === "model" || role === "assistant"
    ? "model"
    : "user";
}

function buildGeminiContents(
  messages: ChatMessageInput[]
) {
  return messages
    .map((message) => ({
      role: normalizeRole(message.role),
      parts: [
        {
          text: getMessageText(message),
        },
      ],
    }))
    .filter(
      (message) =>
        message.parts[0].text.length > 0
    );
}

/* =========================================================
   HEALTH DATA
   ========================================================= */

function getHealthStatus() {
  return {
    status: "ok",
    appName: "Ahemad's AI",
    model: "Ahemad's AI",
    activeModel: "Ahemad's AI",
    isRateLimited:
      modelCooldownUntil > Date.now(),
    hasApiKey:
      Boolean(process.env.GEMINI_API_KEY?.trim()),
  };
                     }
/* =========================================================
   HEALTH ROUTES
   ========================================================= */

app.get("/api/health", (_req, res) => {
  res.json(getHealthStatus());
});

app.get("/health", (_req, res) => {
  res.json(getHealthStatus());
});

/* =========================================================
   CHAT ROUTE
   ========================================================= */

app.post("/api/chat", async (req, res) => {
  try {
    const body = req.body ?? {};

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : typeof body.text === "string"
          ? body.text.trim()
          : "";

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (!content && incomingMessages.length === 0) {
      return res.status(400).send(
        "Please provide a message."
      );
    }

    const messages: ChatMessageInput[] =
      incomingMessages.length > 0
        ? incomingMessages
        : [
            {
              role: "user",
              content,
            },
          ];

    if (
      incomingMessages.length > 0 &&
      content &&
      getMessageText(
        incomingMessages[incomingMessages.length - 1]
      ) !== content
    ) {
      messages.push({
        role: "user",
        content,
      });
    }

    const contents = buildGeminiContents(messages);

    if (contents.length === 0) {
      return res.status(400).send(
        "Please provide a valid message."
      );
    }

    const response = await generateWithFallback(
      contents,
      {
        systemInstruction: FOUNDER_IDENTITY,
      }
    );

    const text =
      typeof response.text === "string"
        ? response.text
        : "";

    if (!text.trim()) {
      return res.status(502).send(
        "Ahemad's AI could not generate a response."
      );
    }

    res.setHeader(
      "Content-Type",
      "text/plain; charset=utf-8"
    );

    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );

    res.setHeader(
      "X-Content-Type-Options",
      "nosniff"
    );

    return res.send(text);
  } catch (error) {
    console.error("POST /api/chat error:", error);

    if (isRateLimitError(error)) {
      return res.status(429).send(
        "Ahemad's AI is temporarily rate-limited. Please try again shortly."
      );
    }

    return res.status(500).send(
      "Ahemad's AI is temporarily unable to respond. Please try again."
    );
  }
});

/* =========================================================
   STREAMING CHAT ROUTE — SSE
   ========================================================= */

app.post("/api/chat/stream", async (req, res) => {
  try {
    const body = req.body ?? {};

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : typeof body.text === "string"
          ? body.text.trim()
          : "";

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    if (!content && incomingMessages.length === 0) {
      return res.status(400).json({
        error: "Please provide a message.",
      });
    }

    const messages: ChatMessageInput[] =
      incomingMessages.length > 0
        ? [...incomingMessages]
        : [
            {
              role: "user",
              content,
            },
          ];

    if (
      incomingMessages.length > 0 &&
      content &&
      getMessageText(
        incomingMessages[incomingMessages.length - 1]
      ) !== content
    ) {
      messages.push({
        role: "user",
        content,
      });
    }

    const contents = buildGeminiContents(messages);

    if (contents.length === 0) {
      return res.status(400).json({
        error: "Please provide a valid message.",
      });
    }

    const ai = getGeminiClient();
    const models = getCandidateModels();

    let streamResponse: AsyncIterable<GenerateContentResponse> | null =
      null;

    let lastError: unknown = null;

    for (const model of models) {
      try {
        const result = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction: FOUNDER_IDENTITY,
          },
        });

        streamResponse = result;
        break;
      } catch (error) {
        lastError = error;

        if (
          isRateLimitError(error) ||
          isTemporaryModelError(error)
        ) {
          modelCooldownUntil =
            Date.now() + 30_000;
        }
      }
    }

    if (!streamResponse) {
      throw (
        lastError ||
        new Error("Unable to start AI stream.")
      );
    }

    res.status(200);
    res.setHeader(
      "Content-Type",
      "text/event-stream; charset=utf-8"
    );
    res.setHeader(
      "Cache-Control",
      "no-cache, no-transform"
    );
    res.setHeader("Connection", "keep-alive");
    res.setHeader(
      "X-Accel-Buffering",
      "no"
    );

    for await (const chunk of streamResponse) {
      const chunkText =
        typeof chunk.text === "string"
          ? chunk.text
          : "";

      if (!chunkText) continue;

      res.write(
        `data: ${JSON.stringify({
          text: chunkText,
        })}\n\n`
      );
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error(
      "POST /api/chat/stream error:",
      error
    );

    if (!res.headersSent) {
      return res.status(
        isRateLimitError(error) ? 429 : 500
      ).json({
        error: isRateLimitError(error)
          ? "Ahemad's AI is temporarily rate-limited. Please try again shortly."
          : "Ahemad's AI is temporarily unable to respond.",
      });
    }

    res.write(
      `data: ${JSON.stringify({
        error: "Ahemad's AI could not complete the response.",
      })}\n\n`
    );

    res.end();
  }
});

/* =========================================================
   GENERATE ROUTE
   ========================================================= */

app.post("/api/chat/generate", async (req, res) => {
  try {
    const body = req.body ?? {};

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : typeof body.text === "string"
          ? body.text.trim()
          : "";

    const incomingMessages = Array.isArray(body.messages)
      ? body.messages
      : [];

    const messages: ChatMessageInput[] =
      incomingMessages.length > 0
        ? [...incomingMessages]
        : content
          ? [
              {
                role: "user",
                content,
              },
            ]
          : [];

    if (
      incomingMessages.length > 0 &&
      content &&
      getMessageText(
        incomingMessages[incomingMessages.length - 1]
      ) !== content
    ) {
      messages.push({
        role: "user",
        content,
      });
    }

    if (messages.length === 0) {
      return res.status(400).json({
        error: "Please provide a message.",
      });
    }

    const contents = buildGeminiContents(messages);

    if (contents.length === 0) {
      return res.status(400).json({
        error: "Please provide a valid message.",
      });
    }

    const response = await generateWithFallback(
      contents,
      {
        systemInstruction: FOUNDER_IDENTITY,
      }
    );

    const text =
      typeof response.text === "string"
        ? response.text
        : "";

    return res.json({
      text,
      content: text,
      model: "Ahemad's AI",
    });
  } catch (error) {
    console.error(
      "POST /api/chat/generate error:",
      error
    );

    return res.status(
      isRateLimitError(error) ? 429 : 500
    ).json({
      error: isRateLimitError(error)
        ? "Ahemad's AI is temporarily rate-limited. Please try again shortly."
        : "Ahemad's AI is temporarily unable to respond.",
    });
  }
});

/* =========================================================
   CHAT TITLE ROUTE
   ========================================================= */

app.post("/api/chat/title", async (req, res) => {
  try {
    const body = req.body ?? {};

    const content =
      typeof body.content === "string"
        ? body.content.trim()
        : typeof body.text === "string"
          ? body.text.trim()
          : "";

    if (!content) {
      return res.status(400).json({
        error: "Please provide chat content.",
      });
    }

    const response = await generateWithFallback(
      [
        {
          role: "user",
          parts: [
            {
              text: `Create a short chat title for this conversation.

Rules:
- Maximum 6 words.
- No quotation marks.
- Do not use Markdown.
- Return only the title.

Conversation:
${content}`,
            },
          ],
        },
      ],
      {
        systemInstruction: `
You create short, accurate conversation titles for Ahemad's AI.
Never reveal internal model names or implementation details.
Return only the requested title.
`,
      }
    );

    const title =
      typeof response.text === "string"
        ? response.text
            .replace(/^["']|["']$/g, "")
            .trim()
            .slice(0, 80)
        : "";

    return res.json({
      title: title || "New Chat",
    });
  } catch (error) {
    console.error(
      "POST /api/chat/title error:",
      error
    );

    return res.json({
      title: "New Chat",
    });
  } 
  /* =========================================================
   404 HANDLER FOR API ROUTES
   ========================================================= */

app.use("/api", (req, res, next) => {
  if (req.path.startsWith("/")) {
    return res.status(404).json({
      error: "API endpoint not found.",
      path: req.path,
    });
  }

  next();
});

/* =========================================================
   VITE / STATIC FILE SERVING
   ========================================================= */

async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production";

  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
      },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(
      __dirname,
      "dist"
    );

    app.use(
      express.static(distPath, {
        index: false,
      })
    );

    app.get("*", (_req, res) => {
      res.sendFile(
        path.join(distPath, "index.html")
      );
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `Ahemad's AI server running on port ${PORT}`
    );
  });
}

startServer().catch((error) => {
  console.error(
    "Failed to start Ahemad's AI server:",
    error
  );

  process.exit(1);
});
});

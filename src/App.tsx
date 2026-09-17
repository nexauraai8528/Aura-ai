import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Conversation,
  Message,
  ThemeMode,
  AppSettings,
  HealthStatus,
} from "./types";

import {
  storage,
} from "./utils/storage";

import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SettingsModal } from "./components/SettingsModal";


// ============================================================
// DEFAULT SETTINGS
// ============================================================

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  enterToSend: true,
  streamingEnabled: true,
  autoScroll: true,
  activeMode: "general",
  appTheme: "midnight",
  fontSize: "medium",
  soundEnabled: true,
  voiceAutoPlay: false,
  notificationsEnabled: false,
};


// ============================================================
// APP THEME CONFIG
// ============================================================

const APP_THEME_CONFIG: Record<
  string,
  {
    background: string;
    surface: string;
    accent: string;
  }
> = {
  midnight: {
    background: "#080812",
    surface: "#0F0F1E",
    accent: "#8B5CF6",
  },

  aurora: {
    background: "#071012",
    surface: "#0C181B",
    accent: "#22D3EE",
  },

  ocean: {
    background: "#07111C",
    surface: "#0C1B2A",
    accent: "#3B82F6",
  },

  emerald: {
    background: "#07120D",
    surface: "#0D1C14",
    accent: "#10B981",
  },

  crimson: {
    background: "#140709",
    surface: "#211012",
    accent: "#F43F5E",
  },

  royal: {
    background: "#0D0918",
    surface: "#171028",
    accent: "#A855F7",
  },

  sunset: {
    background: "#160C06",
    surface: "#24150D",
    accent: "#F97316",
  },

  graphite: {
    background: "#0C0C0D",
    surface: "#171719",
    accent: "#A1A1AA",
  },

  rose: {
    background: "#150A10",
    surface: "#24121B",
    accent: "#EC4899",
  },
};


// ============================================================
// FONT SIZE CONFIG
// ============================================================

const FONT_SIZE_CONFIG: Record<
  string,
  {
    message: string;
    input: string;
  }
> = {
  small: {
    message: "text-sm",
    input: "text-sm",
  },

  medium: {
    message: "text-[15px]",
    input: "text-[15px]",
  },

  large: {
    message: "text-base",
    input: "text-base",
  },
};


// ============================================================
// MAIN APP
// ============================================================

export default function App() {

  // ----------------------------------------------------------
  // CONVERSATIONS
  // ----------------------------------------------------------

  const [conversations, setConversations] =
    useState<Conversation[]>(
      () => storage.getConversations()
    );


  // ----------------------------------------------------------
  // ACTIVE CONVERSATION
  // ----------------------------------------------------------

  const [activeId, setActiveId] =
    useState<string | null>(
      () => storage.getCurrentConversationId()
    );


  // ----------------------------------------------------------
  // THEME
  // ----------------------------------------------------------

  const [theme, setTheme] =
    useState<ThemeMode>(
      () => storage.getTheme()
    );


  // ----------------------------------------------------------
  // SETTINGS
  // ----------------------------------------------------------

  const [settings, setSettings] =
    useState<AppSettings>(
      () => ({
        ...DEFAULT_SETTINGS,
        ...storage.getSettings(),
      })
    );


  // ----------------------------------------------------------
  // SETTINGS MODAL
  // ----------------------------------------------------------

  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);


  // ----------------------------------------------------------
  // MOBILE SIDEBAR
  // ----------------------------------------------------------

  const [sidebarOpen, setSidebarOpen] =
    useState(false);


  // ----------------------------------------------------------
  // INPUT
  // ----------------------------------------------------------

  const [inputDraft, setInputDraft] =
    useState("");


  // ----------------------------------------------------------
  // LOADING
  // ----------------------------------------------------------

  const [isLoading, setIsLoading] =
    useState(false);


  // ----------------------------------------------------------
  // HEALTH
  // ----------------------------------------------------------

  const [health, setHealth] =
    useState<HealthStatus | null>(null);


  // ----------------------------------------------------------
  // CHAT SCROLL
  // ----------------------------------------------------------

  const chatScrollRef =
    useRef<HTMLDivElement | null>(null);


  // ----------------------------------------------------------
  // CURRENT CONVERSATION
  // ----------------------------------------------------------

  const currentConversation =
    useMemo(() => {
      if (!activeId) {
        return null;
      }

      return (
        conversations.find(
          (conversation) =>
            conversation.id === activeId
        ) || null
      );
    }, [
      conversations,
      activeId,
    ]);


  // ==========================================================
  // THEME EFFECT
  // ==========================================================

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);


  // ==========================================================
  // APP THEME EFFECT
  // ==========================================================

  useEffect(() => {
    const selectedTheme =
      APP_THEME_CONFIG[
        settings.appTheme || "midnight"
      ] ||
      APP_THEME_CONFIG.midnight;

    document.documentElement.style.setProperty(
      "--app-bg",
      selectedTheme.background
    );

    document.documentElement.style.setProperty(
      "--app-surface",
      selectedTheme.surface
    );

    document.documentElement.style.setProperty(
      "--app-accent",
      selectedTheme.accent
    );
  }, [
    settings.appTheme,
  ]);


  // ==========================================================
  // FONT SIZE EFFECT
  // ==========================================================

  useEffect(() => {
    const selectedFont =
      FONT_SIZE_CONFIG[
        settings.fontSize || "medium"
      ] ||
      FONT_SIZE_CONFIG.medium;

    document.documentElement.style.setProperty(
      "--chat-message-size",
      selectedFont.message
    );

    document.documentElement.style.setProperty(
      "--chat-input-size",
      selectedFont.input
    );
  }, [
    settings.fontSize,
  ]);


  // ==========================================================
  // SAVE CONVERSATIONS
  // ==========================================================

  useEffect(() => {
    storage.saveConversations(
      conversations
    );
  }, [
    conversations,
  ]);


  // ==========================================================
  // SAVE ACTIVE CONVERSATION
  // ==========================================================

  useEffect(() => {
    storage.setCurrentConversationId(
      activeId
    );
  }, [
    activeId,
  ]);


  // ==========================================================
  // SAVE THEME
  // ==========================================================

  useEffect(() => {
    storage.setTheme(
      theme
    );
  }, [
    theme,
  ]);


  // ==========================================================
  // SAVE SETTINGS
  // ==========================================================

  useEffect(() => {
    storage.saveSettings(
      settings
    );
  }, [
    settings,
  ]);


  // ==========================================================
  // HEALTH CHECK
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    const checkHealth =
      async () => {
        try {
          const response =
            await fetch(
              "/api/health"
            );

          if (!response.ok) {
            throw new Error(
              "Health check failed"
            );
          }

          const data =
            await response.json();

          if (!cancelled) {
            setHealth({
              ...data,

              // Hide the actual backend
              // model name from users.
              model: "Ahemad's AI",
            });
          }
        } catch {
          if (!cancelled) {
            setHealth(null);
          }
        }
      };

    checkHealth();

    const interval =
      window.setInterval(
        checkHealth,
        30000
      );

    return () => {
      cancelled = true;
      window.clearInterval(
        interval
      );
    };
  }, []);


  // ==========================================================
  // AUTO SCROLL
  // ==========================================================

  useEffect(() => {
    if (!settings.autoScroll) {
      return;
    }

    const element =
      chatScrollRef.current;

    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });
  }, [
    currentConversation?.messages,
    isLoading,
    settings.autoScroll,
  ]);


  // ==========================================================
  // NEW CHAT
  // ==========================================================

  const handleNewChat =
    useCallback(() => {
      const id =
        crypto.randomUUID();

      const newConversation:
        Conversation = {
        id,
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: "Ahemad's AI",
        isPinned: false,
      };

      setConversations(
        (previous) => [
          newConversation,
          ...previous,
        ]
      );

      setActiveId(id);
      setInputDraft("");
      setSidebarOpen(false);
    }, []);


  // ==========================================================
  // SETTINGS UPDATE
  // ==========================================================

  const handleUpdateSettings =
    useCallback(
      (
        updates: Partial<AppSettings>
      ) => {
        setSettings(
          (previous) => ({
            ...previous,
            ...updates,
          })
        );
      },
      []
    );


  // ==========================================================
  // UPDATE CONVERSATION
  // ==========================================================

  const updateConversation =
    useCallback(
      (
        conversationId: string,
        updater: (
          conversation: Conversation
        ) => Conversation
      ) => {
        setConversations(
          (previous) =>
            previous.map(
              (conversation) =>
                conversation.id ===
                conversationId
                  ? updater(
                      conversation
                    )
                  : conversation
            )
        );
      },
      []
    );


  // ==========================================================
  // ENSURE CONVERSATION
  // ==========================================================

  const ensureConversation =
    useCallback(() => {

      if (activeId) {
        const exists =
          conversations.some(
            (conversation) =>
              conversation.id ===
              activeId
          );

        if (exists) {
          return activeId;
        }
      }

      const id =
        crypto.randomUUID();

      const conversation:
        Conversation = {
        id,
        title: "New Chat",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: "Ahemad's AI",
        isPinned: false,
      };

      setConversations(
        (previous) => [
          conversation,
          ...previous,
        ]
      );

      setActiveId(id);

      return id;
    }, [
      activeId,
      conversations,
    ]);


  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const handleSendMessage =
    useCallback(
      async (
        text: string,
        attachments?: any[]
      ) => {

        const trimmed =
          text.trim();

        if (
          !trimmed &&
          !attachments?.length
        ) {
          return;
        }

        const conversationId =
          ensureConversation();

        const userMessage:
          Message = {
          id:
            crypto.randomUUID(),
          role: "user",
          content: trimmed,
          timestamp: Date.now(),
          status: "complete",
          attachments:
            attachments &&
            attachments.length
              ? attachments
              : undefined,
          mode:
            settings.activeMode,
        };

        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,

            messages: [
              ...conversation.messages,
              userMessage,
            ],

            updatedAt:
              Date.now(),

            title:
              conversation
                .messages
                .length === 0
                ? (
                    trimmed.slice(
                      0,
                      40
                    ) ||
                    "New Chat"
                  )
                : conversation.title,
          })
        );

        setInputDraft("");
        setIsLoading(true);

        try {
          const response =
            await fetch(
              "/api/chat",
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                body: JSON.stringify({
                  content:
                    trimmed,

                  messages: [
                    ...(
                      currentConversation
                        ?.messages ||
                      []
                    ),
                    userMessage,
                  ],

                  mode:
                    settings.activeMode,

                  conversationId,
                }),
              }
            );

          if (!response.ok) {
            throw new Error(
              `Request failed with status ${response.status}`
            );
          }

          const reader =
            response.body?.getReader();

          if (!reader) {
            throw new Error(
              "No response stream available"
            );
          }

          const decoder =
            new TextDecoder();

          let assistantContent =
            "";

          const assistantId =
            crypto.randomUUID();

          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,

              messages: [
                ...conversation.messages,

                {
                  id: assistantId,
                  role: "assistant",
                  content: "",
                  timestamp: Date.now(),
                  status:
                    "streaming",
                  mode:
                    settings.activeMode,
                },
              ],

              updatedAt:
                Date.now(),
            })
          );

          while (true) {
            const {
              value,
              done,
            } =
              await reader.read();

            if (done) {
              break;
            }

            const chunk =
              decoder.decode(
                value,
                {
                  stream: true,
                }
              );

            assistantContent +=
              chunk;

            updateConversation(
              conversationId,
              (conversation) => ({
                ...conversation,

                messages:
                  conversation.messages.map(
                    (message) =>
                      message.id ===
                      assistantId
                        ? {
                            ...message,
                            content:
                              assistantContent,
                            status:
                              "streaming",
                          }
                        : message
                  ),

                updatedAt:
                  Date.now(),
              })
            );
          }

          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,

              messages:
                conversation.messages.map(
                  (message) =>
                    message.id ===
                    assistantId
                      ? {
                          ...message,
                          content:
                            assistantContent.trim(),
                          status:
                            "complete",
                        }
                      : message
                ),

              updatedAt:
                Date.now(),
            })
          );

        } catch (error) {

          const errorMessage =
            error instanceof Error
              ? error.message
              : "Something went wrong.";

          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,

              messages: [
                ...conversation.messages,

                {
                  id:
                    crypto.randomUUID(),
                  role: "assistant",
                  content:
                    `Sorry, something went wrong.\n\n${errorMessage}`,
                  timestamp:
                    Date.now(),
                  status: "error",
                  error:
                    errorMessage,
                },
              ],

              updatedAt:
                Date.now(),
            })
          );

        } finally {
          setIsLoading(false);
        }
      },
      [
        ensureConversation,
        updateConversation,
        settings.activeMode,
        currentConversation?.messages,
      ]
    );


  // ============================================================
  // PART 1 ENDS HERE
  // ============================================================

// ============================================================
// PART 2 — CHAT ACTIONS
// ============================================================


// ------------------------------------------------------------
// STOP GENERATING
// ------------------------------------------------------------

const handleStopGenerating = useCallback(() => {
  setIsLoading(false);
}, []);


// ------------------------------------------------------------
// REGENERATE LAST RESPONSE
// ------------------------------------------------------------

const handleRegenerate = useCallback(async () => {
  if (!currentConversation) {
    return;
  }

  const messages =
    currentConversation.messages;

  const lastUserMessage =
    [...messages]
      .reverse()
      .find(
        (message) =>
          message.role === "user"
      );

  if (!lastUserMessage) {
    return;
  }

  const lastUserIndex =
    messages.findIndex(
      (message) =>
        message.id ===
        lastUserMessage.id
    );

  const cleanedMessages =
    messages.slice(
      0,
      lastUserIndex + 1
    );

  updateConversation(
    currentConversation.id,
    (conversation) => ({
      ...conversation,

      messages:
        cleanedMessages,

      updatedAt:
        Date.now(),
    })
  );

  await handleSendMessage(
    lastUserMessage.content,
    lastUserMessage.attachments
  );
}, [
  currentConversation,
  updateConversation,
  handleSendMessage,
]);


// ------------------------------------------------------------
// EDIT MESSAGE
// ------------------------------------------------------------

const handleEditMessage =
  useCallback(
    (
      messageId: string,
      newContent: string
    ) => {

      if (!currentConversation) {
        return;
      }

      updateConversation(
        currentConversation.id,
        (conversation) => ({
          ...conversation,

          messages:
            conversation.messages.map(
              (message) =>
                message.id ===
                messageId
                  ? {
                      ...message,
                      content:
                        newContent,
                    }
                  : message
            ),

          updatedAt:
            Date.now(),
        })
      );
    },
    [
      currentConversation,
      updateConversation,
    ]
  );


// ------------------------------------------------------------
// DELETE MESSAGE
// ------------------------------------------------------------

const handleDeleteMessage =
  useCallback(
    (messageId: string) => {

      if (!currentConversation) {
        return;
      }

      updateConversation(
        currentConversation.id,
        (conversation) => ({
          ...conversation,

          messages:
            conversation.messages.filter(
              (message) =>
                message.id !==
                messageId
            ),

          updatedAt:
            Date.now(),
        })
      );
    },
    [
      currentConversation,
      updateConversation,
    ]
  );


// ------------------------------------------------------------
// DELETE CONVERSATION
// ------------------------------------------------------------

const handleDeleteConversation =
  useCallback(
    (conversationId: string) => {

      setConversations(
        (previous) =>
          previous.filter(
            (conversation) =>
              conversation.id !==
              conversationId
          )
      );

      if (
        activeId ===
        conversationId
      ) {
        setActiveId(null);
      }
    },
    [activeId]
  );


// ------------------------------------------------------------
// RENAME CONVERSATION
// ------------------------------------------------------------

const handleRenameConversation =
  useCallback(
    (
      conversationId: string,
      newTitle: string
    ) => {

      const title =
        newTitle.trim();

      if (!title) {
        return;
      }

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          title,

          updatedAt:
            Date.now(),
        })
      );
    },
    [updateConversation]
  );


// ------------------------------------------------------------
// PIN / UNPIN CONVERSATION
// ------------------------------------------------------------

const handleTogglePin =
  useCallback(
    (conversationId: string) => {

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          isPinned:
            !conversation.isPinned,

          updatedAt:
            Date.now(),
        })
      );
    },
    [updateConversation]
  );


// ------------------------------------------------------------
// CLEAR ALL CONVERSATIONS
// ------------------------------------------------------------

const handleClearAll =
  useCallback(() => {
    setConversations([]);
    setActiveId(null);
    setInputDraft("");
  }, []);


// ------------------------------------------------------------
// RESET APP
// ------------------------------------------------------------

const handleResetApp =
  useCallback(() => {

    setConversations([]);
    setActiveId(null);
    setInputDraft("");

    setTheme("dark");

    setSettings({
      ...DEFAULT_SETTINGS,
    });

    storage.clearAllData();
  }, []);


// ------------------------------------------------------------
// SELECT CONVERSATION
// ------------------------------------------------------------

const handleSelectConversation =
  useCallback(
    (conversationId: string) => {

      setActiveId(
        conversationId
      );

      setSidebarOpen(false);
    },
    []
  );


// ------------------------------------------------------------
// TOGGLE LIGHT / DARK THEME
// ------------------------------------------------------------

const handleToggleTheme =
  useCallback(() => {

    setTheme(
      (previous) =>
        previous === "dark"
          ? "light"
          : "dark"
    );
  }, []);


// ------------------------------------------------------------
// ACTIVE CHAT TITLE
// ------------------------------------------------------------

const activeChatTitle =
  currentConversation?.title ||
  "New Chat";


// ------------------------------------------------------------
// KEYBOARD SHORTCUTS
// ------------------------------------------------------------

useEffect(() => {

  const handleKeyDown = (
    event: KeyboardEvent
  ) => {

    // Ctrl + K / Cmd + K
    // Creates a new chat.
    if (
      (event.ctrlKey ||
        event.metaKey) &&
      event.key.toLowerCase() ===
        "k"
    ) {
      event.preventDefault();

      handleNewChat();
    }


    // Escape closes mobile
    // sidebar and settings.
    if (
      event.key === "Escape"
    ) {
      setSidebarOpen(false);
      setIsSettingsOpen(false);
    }
  };


  window.addEventListener(
    "keydown",
    handleKeyDown
  );


  return () => {
    window.removeEventListener(
      "keydown",
      handleKeyDown
    );
  };

}, [
  handleNewChat,
]);


// ============================================================
// PART 2 ENDS HERE
// ============================================================

  // ============================================================
  // PART 3 — FINAL UI / RETURN
  // ============================================================

  return (
    <div
      className={`h-screen w-full overflow-hidden ${theme === "dark" ? "dark" : ""}`}
      style={{
        fontSize:
          FONT_SIZE_CONFIG[
            settings.fontSize || "medium"
          ].base,
      }}
    >
      <div
        className={`h-full w-full flex ${APP_THEME_CONFIG[
          settings.appTheme || "midnight"
        ].page}`}
      >
        {/* SIDEBAR */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={handleSelectConversation}
          onNewChat={handleNewChat}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onTogglePinConversation={handleTogglePin}
          onClearAll={handleClearAll}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          isOpen={sidebarOpen}
          onCloseMobile={() => setSidebarOpen(false)}
          modelName="Ahemad's AI"
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* MAIN AREA */}
        <main className="flex-1 min-w-0 h-full flex flex-col">
          {/* HEADER */}
          <Header
            onToggleSidebar={() => setSidebarOpen(true)}
            onNewChat={handleNewChat}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            health={health}
            activeChatTitle={activeChatTitle}
            onOpenSettings={() => setIsSettingsOpen(true)}
            activeMode={
              (settings.activeMode || "general") as AssistantMode
            }
          />

          {/* CHAT CONTENT */}
          <div
            ref={chatScrollRef}
            className="flex-1 overflow-y-auto overflow-x-hidden"
          >
            <div className="min-h-full w-full">
              {!currentConversation ||
              currentConversation.messages.length === 0 ? (
                <WelcomeScreen
                  onPromptSelect={(prompt: string) => {
                    setInputDraft(prompt);
                  }}
                />
              ) : (
                <div className="w-full max-w-5xl mx-auto px-3 sm:px-5 lg:px-8 py-5">
                  {currentConversation.messages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onEdit={handleEditMessage}
                      onDelete={handleDeleteMessage}
                      onRegenerate={
                        message.role === "assistant"
                          ? handleRegenerate
                          : undefined
                      }
                    />
                  ))}

                  {isLoading && (
                    <div className="flex items-start gap-3 py-4">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>

                      <div className="rounded-2xl bg-white/5 border border-white/10 px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" />
                          <span
                            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                            style={{ animationDelay: "120ms" }}
                          />
                          <span
                            className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                            style={{ animationDelay: "240ms" }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* INPUT */}
          <div className="shrink-0 border-t border-white/10 bg-black/10 backdrop-blur-xl">
            <div className="max-w-5xl mx-auto w-full px-3 sm:px-5 lg:px-8 py-3">
              <ChatInput
                value={inputDraft}
                onChange={setInputDraft}
                onSend={handleSendMessage}
                onStop={handleStopGenerating}
                isLoading={isLoading}
                activeMode={
                  (settings.activeMode || "general") as AssistantMode
                }
              />
            </div>
          </div>
        </main>

        {/* SETTINGS MODAL */}
        {isSettingsOpen && (
          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={() => setIsSettingsOpen(false)}
            settings={settings}
            onSave={setSettings}
            theme={theme}
            onToggleTheme={handleToggleTheme}
            health={health}
            onResetApp={handleResetApp}
          />
        )}
      </div>
    </div>
  );
}

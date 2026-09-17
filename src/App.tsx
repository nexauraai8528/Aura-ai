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

import { storage } from "./utils/storage";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ChatMessage } from "./components/ChatMessage";
import { ChatInput } from "./components/ChatInput";
import { WelcomeScreen } from "./components/WelcomeScreen";
import { SettingsModal } from "./components/SettingsModal";

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

const APP_THEME_CONFIG: Record<
  string,
  {
    background: string;
    surface: string;
    accent: string;
  }
> = {
  midnight: {
    background: "#080b14",
    surface: "#101525",
    accent: "#8b5cf6",
  },
  ocean: {
    background: "#061019",
    surface: "#0b1b29",
    accent: "#38bdf8",
  },
  aurora: {
    background: "#07110f",
    surface: "#10201d",
    accent: "#34d399",
  },
  emerald: {
    background: "#06100c",
    surface: "#0d1c15",
    accent: "#10b981",
  },
  crimson: {
    background: "#120709",
    surface: "#211014",
    accent: "#f43f5e",
  },
  royal: {
    background: "#090714",
    surface: "#151027",
    accent: "#a78bfa",
  },
  sunset: {
    background: "#120b07",
    surface: "#21150e",
    accent: "#fb923c",
  },
  graphite: {
    background: "#0b0c0e",
    surface: "#17181b",
    accent: "#9ca3af",
  },
  rose: {
    background: "#12090e",
    surface: "#21111a",
    accent: "#f472b6",
  },
};

const FONT_SIZE_CONFIG: Record<
  string,
  {
    message: string;
    input: string;
  }
> = {
  small: {
    message: "14px",
    input: "14px",
  },
  medium: {
    message: "15px",
    input: "15px",
  },
  large: {
    message: "17px",
    input: "17px",
  },
  "extra-large": {
    message: "19px",
    input: "19px",
  },
};

function createId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
}

const App: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>(
    () => storage.getConversations()
  );

  const [activeId, setActiveId] = useState<string | null>(
    () => storage.getCurrentConversationId()
  );

  const [theme, setTheme] = useState<ThemeMode>(
    () => storage.getTheme()
  );

  const [settings, setSettings] = useState<AppSettings>(() => ({
    ...DEFAULT_SETTINGS,
    ...storage.getSettings(),
  }));

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [health, setHealth] = useState<HealthStatus | null>(null);

  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) => conversation.id === activeId
      ) || null
    );
  }, [conversations, activeId]);

  useEffect(() => {
    document.documentElement.classList.toggle(
      "dark",
      theme === "dark"
    );
  }, [theme]);

  useEffect(() => {
    const selectedTheme =
      APP_THEME_CONFIG[settings.appTheme || "midnight"] ||
      APP_THEME_CONFIG.midnight;

    const selectedFont =
      FONT_SIZE_CONFIG[settings.fontSize || "medium"] ||
      FONT_SIZE_CONFIG.medium;

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

    document.documentElement.style.setProperty(
      "--chat-message-size",
      selectedFont.message
    );

    document.documentElement.style.setProperty(
      "--chat-input-size",
      selectedFont.input
    );
  }, [settings]);

  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.setCurrentConversationId(activeId);
  }, [activeId]);

  useEffect(() => {
    storage.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    let cancelled = false;

    const loadHealth = async () => {
      try {
        const response = await fetch("/api/health");

        if (!response.ok) {
          throw new Error("Health request failed");
        }

        const data = await response.json();

        if (!cancelled) {
          setHealth({
            ...data,
            appName: "Ahemad's AI",
            model: "Ahemad's AI",
            activeModel: "Ahemad's AI",
          });
        }
      } catch {
        if (!cancelled) {
          setHealth({
            status: "ok",
            appName: "Ahemad's AI",
            model: "Ahemad's AI",
            activeModel: "Ahemad's AI",
            hasApiKey: false,
          });
        }
      }
    };

    loadHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!settings.autoScroll) return;

    const element = chatScrollRef.current;

    if (!element) return;

    requestAnimationFrame(() => {
      element.scrollTop = element.scrollHeight;
    });
  }, [
    activeConversation?.messages,
    isLoading,
    settings.autoScroll,
  ]);

  const updateConversation = useCallback(
    (
      conversationId: string,
      updater: (
        conversation: Conversation
      ) => Conversation
    ) => {
      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id === conversationId
            ? updater(conversation)
            : conversation
        )
      );
    },
    []
  );

  const handleNewChat = useCallback(() => {
    const newConversation: Conversation = {
      id: createId(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((previous) => [
      newConversation,
      ...previous,
    ]);

    setActiveId(newConversation.id);
    setInputDraft("");
    setSidebarOpen(false);
  }, []);

  const ensureConversation = useCallback(() => {
    if (activeId) {
      const existing = conversations.find(
        (conversation) => conversation.id === activeId
      );

      if (existing) {
        return existing.id;
      }
    }

    const newConversation: Conversation = {
      id: createId(),
      title: "New Conversation",
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setConversations((previous) => [
      newConversation,
      ...previous,
    ]);

    setActiveId(newConversation.id);

    return newConversation.id;
  }, [activeId, conversations]);

  const handleSendMessage = useCallback(
    async (
      text: string,
      attachments: any[] = []
    ) => {
      const trimmed = text.trim();

      if (!trimmed && attachments.length === 0) {
        return;
      }

      if (isLoading) {
        return;
      }

      const conversationId = ensureConversation();

      const currentConversation =
        conversations.find(
          (conversation) =>
            conversation.id === conversationId
        );

      const userMessage: Message = {
        id: createId(),
        role: "user",
        text: trimmed,
        content: trimmed,
        attachments,
        timestamp: Date.now(),
      };

      const assistantMessageId = createId();

      const assistantMessage: Message = {
        id: assistantMessageId,
        role: "assistant",
        text: "",
        content: "",
        timestamp: Date.now(),
        isStreaming: true,
      };

      const previousMessages =
        currentConversation?.messages || [];

      const requestMessages = [
        ...previousMessages,
        userMessage,
      ];

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,
          messages: [
            ...conversation.messages,
            userMessage,
            assistantMessage,
          ],
          updatedAt: Date.now(),
          title:
            conversation.messages.length === 0
              ? trimmed.slice(0, 45) ||
                "New Conversation"
              : conversation.title,
        })
      );

      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            content: trimmed,
            message: trimmed,
            messages: requestMessages,
            attachments,
            mode: settings.activeMode,
            conversationId,
          }),
        });

        if (!response.ok) {
          let errorMessage =
            "Ahemad's AI could not generate a response.";

          try {
            const errorData = await response.json();

            if (errorData?.error) {
              errorMessage = errorData.error;
            }
          } catch {
            // Ignore invalid JSON.
          }

          throw new Error(errorMessage);
        }

        if (!response.body) {
          throw new Error(
            "AI response stream is unavailable."
          );
        }

        const reader =
          response.body.getReader();

        const decoder =
          new TextDecoder();

        let accumulated = "";

        while (true) {
          const { value, done } =
            await reader.read();

          if (done) break;

          const chunk =
            decoder.decode(value, {
              stream: true,
            });

          accumulated += chunk;

          const currentText =
            accumulated;

          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,
              messages:
                conversation.messages.map(
                  (message) =>
                    message.id ===
                    assistantMessageId
                      ? {
                          ...message,
                          text: currentText,
                          content: currentText,
                          isStreaming: true,
                        }
                      : message
                ),
              updatedAt: Date.now(),
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
                  assistantMessageId
                    ? {
                        ...message,
                        text: accumulated,
                        content: accumulated,
                        isStreaming: false,
                      }
                    : message
              ),
            updatedAt: Date.now(),
          })
        );
      } catch (error: any) {
        if (
          error?.name === "AbortError"
        ) {
          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,
              messages:
                conversation.messages.map(
                  (message) =>
                    message.id ===
                    assistantMessageId
                      ? {
                          ...message,
                          isStreaming: false,
                        }
                      : message
                ),
            })
          );
        } else {
          const message =
            error?.message ||
            "Ahemad's AI could not generate a response.";

          updateConversation(
            conversationId,
            (conversation) => ({
              ...conversation,
              messages:
                conversation.messages.map(
                  (item) =>
                    item.id ===
                    assistantMessageId
                      ? {
                          ...item,
                          text: message,
                          content: message,
                          isStreaming: false,
                          error: true,
                        }
                      : item
                ),
            })
          );
        }
      } finally {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    },
    [
      conversations,
      ensureConversation,
      isLoading,
      settings.activeMode,
      updateConversation,
    ]
  );

  const handleStopGenerating =
    useCallback(() => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }, []);

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (!activeConversation || isLoading) {
        return;
      }

      const assistantIndex =
        activeConversation.messages.findIndex(
          (message) =>
            message.id === messageId
        );

      if (assistantIndex < 0) {
        return;
      }

      const previousUserMessage =
        [...activeConversation.messages]
          .slice(0, assistantIndex)
          .reverse()
          .find(
            (message) =>
              message.role === "user"
          );

      if (!previousUserMessage) {
        return;
      }

      const messagesBeforeAssistant =
        activeConversation.messages.slice(
          0,
          assistantIndex
        );

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation.id ===
          activeConversation.id
            ? {
                ...conversation,
                messages:
                  messagesBeforeAssistant,
                updatedAt: Date.now(),
              }
            : conversation
        )
      );

      await handleSendMessage(
        previousUserMessage.text ||
          previousUserMessage.content ||
          "",
        previousUserMessage.attachments || []
      );
    },
    [
      activeConversation,
      handleSendMessage,
      isLoading,
    ]
  );

  const handleEditMessage = useCallback(
    (
      messageId: string,
      newText: string
    ) => {
      if (!activeConversation) return;

      updateConversation(
        activeConversation.id,
        (conversation) => ({
          ...conversation,
          messages:
            conversation.messages.map(
              (message) =>
                message.id === messageId
                  ? {
                      ...message,
                      text: newText,
                      content: newText,
                    }
                  : message
            ),
          updatedAt: Date.now(),
        })
      );
    },
    [activeConversation, updateConversation]
  );

  const handleDeleteMessage = useCallback(
    (messageId: string) => {
      if (!activeConversation) return;

      updateConversation(
        activeConversation.id,
        (conversation) => ({
          ...conversation,
          messages:
            conversation.messages.filter(
              (message) =>
                message.id !== messageId
            ),
          updatedAt: Date.now(),
        })
      );
    },
    [activeConversation, updateConversation]
  );

  const handleDeleteConversation =
    useCallback(
      (conversationId: string) => {
        setConversations((previous) =>
          previous.filter(
            (conversation) =>
              conversation.id !==
              conversationId
          )
        );

        if (activeId === conversationId) {
          setActiveId(null);
        }
      },
      [activeId]
    );

  const handleRenameConversation =
    useCallback(
      (
        conversationId: string,
        newTitle: string
      ) => {
        const title =
          newTitle.trim() ||
          "New Conversation";

        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,
            title: title.slice(0, 80),
            updatedAt: Date.now(),
          })
        );
      },
      [updateConversation]
    );

  const handleTogglePin =
    useCallback(
      (conversationId: string) => {
        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,
            isPinned: !conversation.isPinned,
            updatedAt: Date.now(),
          })
        );
      },
      [updateConversation]
    );

  const handleClearAll = useCallback(() => {
    setConversations([]);
    setActiveId(null);
    setInputDraft("");
    storage.clearAllData();
  }, []);

  const handleResetApp = useCallback(() => {
    abortControllerRef.current?.abort();

    storage.clearAllData();

    setConversations([]);
    setActiveId(null);
    setInputDraft("");
    setTheme("dark");

    setSettings({
      ...DEFAULT_SETTINGS,
    });

    setIsSettingsOpen(false);
  }, []);

  const handleSelectConversation =
    useCallback((conversationId: string) => {
      setActiveId(conversationId);
      setSidebarOpen(false);
      setInputDraft("");
    }, []);

  const handleToggleTheme =
    useCallback(() => {
      setTheme((current) =>
        current === "dark"
          ? "light"
          : "dark"
      );
    }, []);

  const handleUpdateSettings =
    useCallback(
      (
        updates: Partial<AppSettings>
      ) => {
        setSettings((current) => ({
          ...current,
          ...updates,
        }));
      },
      []
    );

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "n"
      ) {
        event.preventDefault();
        handleNewChat();
      }

      if (
        event.key === "Escape" &&
        isSettingsOpen
      ) {
        setIsSettingsOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [
    handleNewChat,
    isSettingsOpen,
  ]);

  const activeChatTitle =
    activeConversation?.title ||
    "New Conversation";

  return (
    <div
      className="h-[100dvh] w-full overflow-hidden bg-[var(--app-bg)] text-white"
      style={{
        background:
          "var(--app-bg)",
      }}
    >
      <div className="flex h-[100dvh] w-full overflow-hidden">
        {/* SIDEBAR */}
        <Sidebar
          conversations={conversations}
          activeConversationId={activeId}
          onSelectConversation={
            handleSelectConversation
          }
          onNewChat={handleNewChat}
          onDeleteConversation={
            handleDeleteConversation
          }
          onRenameConversation={
            handleRenameConversation
          }
          onTogglePinConversation={
            handleTogglePin
          }
          onClearAll={handleClearAll}
          theme={theme}
          onToggleTheme={
            handleToggleTheme
          }
          isOpen={sidebarOpen}
          onCloseMobile={() =>
            setSidebarOpen(false)
          }
          modelName="Ahemad's AI"
          onOpenSettings={() =>
            setIsSettingsOpen(true)
          }
        />

        {/* MAIN APP */}
        <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
          {/* HEADER
              Fixed/sticky area.
              It does NOT belong to the message scroll area.
          */}
          <div className="relative z-50 shrink-0">
            <Header
              onToggleSidebar={() =>
                setSidebarOpen(
                  (current) => !current
                )
              }
              onNewChat={handleNewChat}
              theme={theme}
              onToggleTheme={
                handleToggleTheme
              }
              health={health}
              activeChatTitle={
                activeChatTitle
              }
              onOpenSettings={() =>
                setIsSettingsOpen(true)
              }
              activeMode={
                settings.activeMode
              }
            />
          </div>

          {/* ONLY THIS AREA SCROLLS */}
          <div
            ref={chatScrollRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain"
            style={{
              WebkitOverflowScrolling:
                "touch",
            }}
          >
            <div className="mx-auto w-full max-w-5xl px-3 pb-6 pt-4 sm:px-5 sm:pb-8 sm:pt-6">
              {!activeConversation ||
              activeConversation.messages.length ===
                0 ? (
                <div className="flex min-h-[calc(100dvh-9rem)] items-center justify-center">
                  <WelcomeScreen
                    onSelectPrompt={(
                      promptText
                    ) => {
                      setInputDraft(
                        promptText
                      );
                    }}
                  />
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {activeConversation.messages.map(
                    (
                      message,
                      index
                    ) => (
                      <ChatMessage
                        key={message.id}
                        message={message}
                        isLastAssistantMessage={
                          message.role ===
                            "assistant" &&
                          index ===
                            activeConversation
                              .messages
                              .length -
                              1
                        }
                        onRegenerate={
                          handleRegenerate
                        }
                        isLoading={
                          isLoading
                        }
                        onEditMessage={
                          handleEditMessage
                        }
                      />
                    )
                  )}

                  <div className="h-2" />
                </div>
              )}
            </div>
          </div>

          {/* FIXED COMPOSER AREA
              This is OUTSIDE the scrolling messages container.
          */}
          <div
            className="relative z-40 shrink-0 border-t border-white/10 bg-[var(--app-bg)]/95 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl sm:px-4 sm:pt-3"
          >
            <div className="mx-auto w-full max-w-5xl">
              <ChatInput
                value={inputDraft}
                onChange={setInputDraft}
                onSendMessage={
                  handleSendMessage
                }
                onStopGeneration={
                  handleStopGenerating
                }
                isLoading={isLoading}
                disabled={false}
              />
            </div>
          </div>
        </main>
      </div>

      {/* SETTINGS */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() =>
          setIsSettingsOpen(false)
        }
        settings={settings}
        onUpdateSettings={
          handleUpdateSettings
        }
        onResetApp={handleResetApp}
        onClearConversations={
          handleClearAll
        }
        health={health}
      />
    </div>
  );
};

export default App;

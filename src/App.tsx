import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';

import {
  Conversation,
  Message,
  ThemeMode,
  HealthStatus,
  Attachment,
  AppSettings,
} from './types';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  enterToSend: true,
  streamingEnabled: true,
  autoScroll: true,
  activeMode: 'general',
  appTheme: 'midnight',
  fontSize: 'medium',
  soundEnabled: true,
  voiceAutoPlay: false,
  notificationsEnabled: false,
};

const APP_THEME_CONFIG = {
  midnight: {
    background: '#080812',
    glow: 'rgba(139, 92, 246, 0.10)',
  },
  ocean: {
    background: '#06121A',
    glow: 'rgba(14, 165, 233, 0.12)',
  },
  lavender: {
    background: '#100A18',
    glow: 'rgba(192, 132, 252, 0.12)',
  },
  sage: {
    background: '#08130F',
    glow: 'rgba(74, 222, 128, 0.10)',
  },
  burgundy: {
    background: '#16080D',
    glow: 'rgba(244, 63, 94, 0.10)',
  },
  terracotta: {
    background: '#160D08',
    glow: 'rgba(251, 146, 60, 0.11)',
  },
  professional: {
    background: '#090C12',
    glow: 'rgba(96, 165, 250, 0.10)',
  },
  neon: {
    background: '#050B0B',
    glow: 'rgba(45, 212, 191, 0.12)',
  },
  pink: {
    background: '#160812',
    glow: 'rgba(236, 72, 153, 0.12)',
  },
} as const;

const FONT_SIZE_CONFIG = {
  small: '14px',
  medium: '16px',
  large: '18px',
  'extra-large': '20px',
} as const;

export default function App() {
  const [conversations, setConversations] = useState<
    Conversation[]
  >(() => storage.getConversations());

  const [activeId, setActiveId] = useState<string | null>(
    () => storage.getCurrentConversationId()
  );

  const [theme, setTheme] = useState<ThemeMode>(
    () => storage.getTheme()
  );

  const [settings, setSettings] = useState<AppSettings>(
    () => ({
      ...DEFAULT_SETTINGS,
      ...storage.getSettings(),
    })
  );

  const [isSettingsOpen, setIsSettingsOpen] =
    useState(false);

  const [inputDraft, setInputDraft] = useState('');

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [health, setHealth] =
    useState<HealthStatus | null>(null);

  const messagesEndRef =
    useRef<HTMLDivElement>(null);

  const abortControllerRef =
    useRef<AbortController | null>(null);

  /*
   * -------------------------------------------------------
   * THEME
   * -------------------------------------------------------
   */

  useEffect(() => {
    const applyTheme = () => {
      let resolvedTheme: 'light' | 'dark';

      if (theme === 'system') {
        resolvedTheme = window.matchMedia(
          '(prefers-color-scheme: dark)'
        ).matches
          ? 'dark'
          : 'light';
      } else {
        resolvedTheme = theme;
      }

      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove(
          'dark'
        );
      }

      document.documentElement.dataset.theme =
        resolvedTheme;

      storage.setTheme(theme);
    };

    applyTheme();

    if (theme !== 'system') {
      return;
    }

    const mediaQuery = window.matchMedia(
      '(prefers-color-scheme: dark)'
    );

    const handleSystemThemeChange = () => {
      applyTheme();
    };

    mediaQuery.addEventListener(
      'change',
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        'change',
        handleSystemThemeChange
      );
    };
  }, [theme]);

  /*
   * -------------------------------------------------------
   * APP THEME + FONT SIZE
   * -------------------------------------------------------
   */

  const activeAppTheme =
    settings.appTheme || 'midnight';

  const activeFontSize =
    settings.fontSize || 'medium';

  const themeConfig =
    APP_THEME_CONFIG[activeAppTheme];

  const fontSize =
    FONT_SIZE_CONFIG[activeFontSize];

  useEffect(() => {
    document.documentElement.dataset.appTheme =
      activeAppTheme;

    document.documentElement.style.setProperty(
      '--ahemad-ai-background',
      themeConfig.background
    );

    document.documentElement.style.setProperty(
      '--ahemad-ai-glow',
      themeConfig.glow
    );

    document.documentElement.style.setProperty(
      '--ahemad-ai-font-size',
      fontSize
    );

    return () => {
      delete document.documentElement.dataset
        .appTheme;

      document.documentElement.style.removeProperty(
        '--ahemad-ai-background'
      );

      document.documentElement.style.removeProperty(
        '--ahemad-ai-glow'
      );

      document.documentElement.style.removeProperty(
        '--ahemad-ai-font-size'
      );
    };
  }, [
    activeAppTheme,
    fontSize,
    themeConfig.background,
    themeConfig.glow,
  ]);

  /*
   * -------------------------------------------------------
   * SAVE CONVERSATIONS
   * -------------------------------------------------------
   */

  useEffect(() => {
    storage.saveConversations(
      conversations
    );
  }, [conversations]);

  /*
   * -------------------------------------------------------
   * SAVE ACTIVE CONVERSATION
   * -------------------------------------------------------
   */

  useEffect(() => {
    storage.setCurrentConversationId(
      activeId
    );
  }, [activeId]);

  /*
   * -------------------------------------------------------
   * HEALTH CHECK
   * -------------------------------------------------------
   */

  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(
          '/api/health'
        );

        if (!res.ok) {
          return;
        }

        const data =
          await res.json();

        setHealth(data);
      } catch (err) {
        console.warn(
          "Could not connect to Ahemad's AI server:",
          err
        );
      }
    }

    checkHealth();
  }, []);

  /*
   * -------------------------------------------------------
   * CURRENT CONVERSATION
   * -------------------------------------------------------
   */

  const currentConversation =
    conversations.find(
      (c) => c.id === activeId
    ) || null;

  /*
   * -------------------------------------------------------
   * SCROLL
   * -------------------------------------------------------
   */

  const scrollToBottom =
    useCallback(
      (
        behavior: ScrollBehavior = 'smooth'
      ) => {
        if (
          messagesEndRef.current
        ) {
          messagesEndRef.current.scrollIntoView(
            {
              behavior,
              block: 'end',
            }
          );
        }
      },
      []
    );

  useEffect(() => {
    if (
      settings.autoScroll !== false
    ) {
      scrollToBottom('smooth');
    }
  }, [
    currentConversation?.messages,
    scrollToBottom,
    settings.autoScroll,
  ]);

  /*
   * -------------------------------------------------------
   * NEW CHAT
   * -------------------------------------------------------
   */

  const handleNewChat =
    useCallback(() => {
      if (
        isLoading &&
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;

        setIsLoading(false);
      }

      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,

        title: 'New Chat',

        messages: [],

        createdAt: Date.now(),

        updatedAt: Date.now(),

        model:
          health?.model ||
          'internal-ai-engine',
      };

      setConversations(
        (prev) => [
          newConv,
          ...prev,
        ]
      );

      setActiveId(
        newConv.id
      );

      setSidebarOpen(false);

      setInputDraft('');
    }, [
      health,
      isLoading,
    ]);
    /*
   * -------------------------------------------------------
   * UPDATE SETTINGS
   * -------------------------------------------------------
   */

  const handleUpdateSettings =
    useCallback(
      (updates: Partial<AppSettings>) => {
        setSettings((prev) => {
          const next = {
            ...prev,
            ...updates,
          };

          storage.saveSettings(next);

          if (
            updates.theme &&
            updates.theme !== theme
          ) {
            setTheme(updates.theme);
          }

          return next;
        });
      },
      [theme]
    );

  /*
   * -------------------------------------------------------
   * UPDATE CONVERSATION
   * -------------------------------------------------------
   */

  const updateConversation =
    useCallback(
      (
        conversationId: string,
        updater:
          | Conversation
          | ((
              conversation: Conversation
            ) => Conversation)
      ) => {
        setConversations((prev) =>
          prev.map((conversation) => {
            if (
              conversation.id !==
              conversationId
            ) {
              return conversation;
            }

            if (
              typeof updater ===
              'function'
            ) {
              return updater(
                conversation
              );
            }

            return updater;
          })
        );
      },
      []
    );

  /*
   * -------------------------------------------------------
   * CREATE CONVERSATION IF NEEDED
   * -------------------------------------------------------
   */

  const ensureConversation =
    useCallback(() => {
      if (activeId) {
        const existing =
          conversations.find(
            (conversation) =>
              conversation.id ===
              activeId
          );

        if (existing) {
          return existing;
        }
      }

      const newConversation: Conversation =
        {
          id: `conv-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

          title: 'New Chat',

          messages: [],

          createdAt: Date.now(),

          updatedAt: Date.now(),

          model:
            health?.model ||
            'internal-ai-engine',
        };

      setConversations((prev) => [
        newConversation,
        ...prev,
      ]);

      setActiveId(
        newConversation.id
      );

      return newConversation;
    }, [
      activeId,
      conversations,
      health,
    ]);

  /*
   * -------------------------------------------------------
   * SEND MESSAGE
   * -------------------------------------------------------
   */

  const handleSendMessage =
    useCallback(
      async (
        text: string,
        attachments: Attachment[] = []
      ) => {
        const cleanText =
          text.trim();

        if (
          !cleanText &&
          attachments.length === 0
        ) {
          return;
        }

        if (isLoading) {
          return;
        }

        const conversation =
          ensureConversation();

        if (!conversation) {
          return;
        }

        const userMessage: Message = {
          id: `msg-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,

          role: 'user',

          content: cleanText,

          timestamp: Date.now(),

          status: 'complete',

          attachments:
            attachments.length > 0
              ? attachments
              : undefined,

          mode:
            settings.activeMode ||
            'general',
        };

        const assistantMessage: Message =
          {
            id: `msg-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

            role: 'assistant',

            content: '',

            timestamp: Date.now(),

            status: 'streaming',

            mode:
              settings.activeMode ||
              'general',
          };

        const nextMessages = [
          ...conversation.messages,
          userMessage,
          assistantMessage,
        ];

        let nextTitle =
          conversation.title;

        if (
          conversation.messages
            .length === 0
        ) {
          const titleSource =
            cleanText ||
            attachments[0]?.name ||
            'New Chat';

          nextTitle =
            titleSource.length > 45
              ? `${titleSource.slice(
                  0,
                  45
                )}…`
              : titleSource;
        }

        updateConversation(
          conversation.id,
          (current) => ({
            ...current,

            title: nextTitle,

            messages: nextMessages,

            updatedAt: Date.now(),
          })
        );

        setIsLoading(true);

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        try {
          const response =
            await fetch(
              '/api/chat',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                signal:
                  controller.signal,

                body: JSON.stringify({
                  message: cleanText,

                  messages:
                    conversation.messages.map(
                      (message) => ({
                        role:
                          message.role,
                        content:
                          message.content,
                      })
                    ),

                  attachments,

                  mode:
                    settings.activeMode ||
                    'general',
                }),
              }
            );

          if (!response.ok) {
            let errorMessage =
              `Request failed with status ${response.status}.`;

            try {
              const errorData =
                await response.json();

              if (
                errorData?.error
              ) {
                errorMessage =
                  errorData.error;
              }
            } catch {
              // Ignore invalid JSON
            }

            throw new Error(
              errorMessage
            );
          }

          if (!response.body) {
            throw new Error(
              'The AI server returned an empty response.'
            );
          }

          const reader =
            response.body.getReader();

          const decoder =
            new TextDecoder();

          let assistantText = '';

          while (true) {
            const {
              value,
              done,
            } = await reader.read();

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

            assistantText += chunk;

            updateConversation(
              conversation.id,
              (current) => ({
                ...current,

                messages:
                  current.messages.map(
                    (message) =>
                      message.id ===
                      assistantMessage.id
                        ? {
                            ...message,

                            content:
                              assistantText,

                            status:
                              'streaming',
                          }
                        : message
                  ),

                updatedAt: Date.now(),
              })
            );
          }

          const finalText =
            assistantText.trim();

          updateConversation(
            conversation.id,
            (current) => ({
              ...current,

              messages:
                current.messages.map(
                  (message) =>
                    message.id ===
                    assistantMessage.id
                      ? {
                          ...message,

                          content:
                            finalText ||
                            'I could not generate a response.',

                          status:
                            'complete',
                        }
                      : message
                ),

              updatedAt: Date.now(),
            })
          );
        } catch (error) {
          if (
            error instanceof
              DOMException &&
            error.name ===
              'AbortError'
          ) {
            updateConversation(
              conversation.id,
              (current) => ({
                ...current,

                messages:
                  current.messages.map(
                    (message) =>
                      message.id ===
                      assistantMessage.id
                        ? {
                            ...message,

                            content:
                              message.content ||
                              'Generation stopped.',

                            status:
                              'complete',
                          }
                        : message
                  ),

                updatedAt: Date.now(),
              })
            );

            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : 'Something went wrong while contacting Ahemad\'s AI.';

          updateConversation(
            conversation.id,
            (current) => ({
              ...current,

              messages:
                current.messages.map(
                  (item) =>
                    item.id ===
                    assistantMessage.id
                      ? {
                          ...item,

                          content:
                            item.content ||
                            message,

                          status:
                            'error',

                          error: message,
                        }
                      : item
                ),

              updatedAt: Date.now(),
            })
          );
        } finally {
          abortControllerRef.current =
            null;

          setIsLoading(false);
        }
      },
      [
        ensureConversation,
        isLoading,
        settings.activeMode,
        updateConversation,
      ]
    );

  /*
   * -------------------------------------------------------
   * STOP GENERATION
   * -------------------------------------------------------
   */

  const handleStopGeneration =
    useCallback(() => {
      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;
      }

      setIsLoading(false);
    }, []);

  /*
   * -------------------------------------------------------
   * REGENERATE LAST RESPONSE
   * -------------------------------------------------------
   */

  const handleRegenerate =
    useCallback(
      async (
        messageId: string
      ) => {
        if (isLoading) {
          return;
        }

        const conversation =
          conversations.find(
            (item) =>
              item.id === activeId
          );

        if (!conversation) {
          return;
        }

        const messageIndex =
          conversation.messages.findIndex(
            (item) =>
              item.id === messageId
          );

        if (
          messageIndex < 0
        ) {
          return;
        }

        const assistantMessage =
          conversation.messages[
            messageIndex
          ];

        if (
          assistantMessage.role !==
          'assistant'
        ) {
          return;
        }

        const userMessage =
          [...conversation.messages]
            .slice(
              0,
              messageIndex
            )
            .reverse()
            .find(
              (item) =>
                item.role ===
                'user'
            );

        if (!userMessage) {
          return;
        }

        const controller =
          new AbortController();

        abortControllerRef.current =
          controller;

        setIsLoading(true);

        updateConversation(
          conversation.id,
          (current) => ({
            ...current,

            messages:
              current.messages.map(
                (message) =>
                  message.id ===
                  messageId
                    ? {
                        ...message,

                        content: '',

                        status:
                          'streaming',

                        error:
                          undefined,

                        timestamp:
                          Date.now(),
                      }
                    : message
              ),

            updatedAt: Date.now(),
          })
        );

        try {
          const response =
            await fetch(
              '/api/chat',
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                signal:
                  controller.signal,

                body: JSON.stringify({
                  message:
                    userMessage.content,

                  messages:
                    conversation.messages
                      .slice(
                        0,
                        messageIndex
                      )
                      .map(
                        (message) => ({
                          role:
                            message.role,
                          content:
                            message.content,
                        })
                      ),

                  attachments:
                    userMessage.attachments ||
                    [],

                  mode:
                    settings.activeMode ||
                    'general',
                }),
              }
            );

          if (!response.ok) {
            throw new Error(
              `Request failed with status ${response.status}.`
            );
          }

          if (!response.body) {
            throw new Error(
              'The AI server returned an empty response.'
            );
          }

          const reader =
            response.body.getReader();

          const decoder =
            new TextDecoder();

          let regeneratedText =
            '';

          while (true) {
            const {
              value,
              done,
            } = await reader.read();

            if (done) {
              break;
            }

            regeneratedText +=
              decoder.decode(
                value,
                {
                  stream: true,
                }
              );

            updateConversation(
              conversation.id,
              (current) => ({
                ...current,

                messages:
                  current.messages.map(
                    (message) =>
                      message.id ===
                      messageId
                        ? {
                            ...message,

                            content:
                              regeneratedText,

                            status:
                              'streaming',
                          }
                        : message
                  ),

                updatedAt: Date.now(),
              })
            );
          }

          updateConversation(
            conversation.id,
            (current) => ({
              ...current,

              messages:
                current.messages.map(
                  (message) =>
                    message.id ===
                    messageId
                      ? {
                          ...message,

                          content:
                            regeneratedText.trim() ||
                            'I could not generate a response.',

                          status:
                            'complete',
                        }
                      : message
                ),

              updatedAt: Date.now(),
            })
          );
        } catch (error) {
          if (
            error instanceof
              DOMException &&
            error.name ===
              'AbortError'
          ) {
            return;
          }

          const errorText =
            error instanceof Error
              ? error.message
              : 'Failed to regenerate the response.';

          updateConversation(
            conversation.id,
            (current) => ({
              ...current,

              messages:
                current.messages.map(
                  (message) =>
                    message.id ===
                    messageId
                      ? {
                          ...message,

                          status:
                            'error',

                          error:
                            errorText,

                          content:
                            message.content ||
                            errorText,
                        }
                      : message
                ),

              updatedAt: Date.now(),
            })
          );
        } finally {
          abortControllerRef.current =
            null;

          setIsLoading(false);
        }
      },
      [
        activeId,
        conversations,
        isLoading,
        settings.activeMode,
        updateConversation,
      ]
    );
    /*
   * -------------------------------------------------------
   * EDIT / RESEND MESSAGE
   * -------------------------------------------------------
   */

  const handleEditMessage =
    useCallback(
      (
        messageId: string,
        newText: string
      ) => {
        if (!activeId) {
          return;
        }

        const cleanText =
          newText.trim();

        if (!cleanText) {
          return;
        }

        const conversation =
          conversations.find(
            (item) =>
              item.id === activeId
          );

        if (!conversation) {
          return;
        }

        const messageIndex =
          conversation.messages.findIndex(
            (item) =>
              item.id === messageId
          );

        if (
          messageIndex < 0
        ) {
          return;
        }

        const editedMessage =
          conversation.messages[
            messageIndex
          ];

        if (
          editedMessage.role !==
          'user'
        ) {
          return;
        }

        const updatedUserMessage: Message =
          {
            ...editedMessage,

            content: cleanText,

            timestamp: Date.now(),

            status: 'complete',
          };

        const trimmedMessages =
          conversation.messages
            .slice(0, messageIndex)
            .concat(
              updatedUserMessage
            );

        updateConversation(
          conversation.id,
          (current) => ({
            ...current,

            messages:
              trimmedMessages,

            updatedAt: Date.now(),
          })
        );

        setInputDraft('');

        /*
         * Automatically send the edited
         * message again after updating it.
         */
        setTimeout(() => {
          handleSendMessage(
            cleanText,
            editedMessage.attachments ||
              []
          );
        }, 0);
      },
      [
        activeId,
        conversations,
        handleSendMessage,
        updateConversation,
      ]
    );

  /*
   * -------------------------------------------------------
   * DELETE CONVERSATION
   * -------------------------------------------------------
   */

  const handleDeleteConversation =
    useCallback(
      (conversationId: string) => {
        setConversations(
          (prev) =>
            prev.filter(
              (conversation) =>
                conversation.id !==
                conversationId
            )
        );

        if (
          activeId ===
          conversationId
        ) {
          const remaining =
            conversations.filter(
              (conversation) =>
                conversation.id !==
                conversationId
            );

          if (
            remaining.length > 0
          ) {
            setActiveId(
              remaining[0].id
            );
          } else {
            setActiveId(null);
          }
        }
      },
      [
        activeId,
        conversations,
      ]
    );

  /*
   * -------------------------------------------------------
   * RENAME CONVERSATION
   * -------------------------------------------------------
   */

  const handleRenameConversation =
    useCallback(
      (
        conversationId: string,
        title: string
      ) => {
        const cleanTitle =
          title.trim();

        if (!cleanTitle) {
          return;
        }

        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,

            title:
              cleanTitle.length > 80
                ? `${cleanTitle.slice(
                    0,
                    80
                  )}…`
                : cleanTitle,

            updatedAt: Date.now(),
          })
        );
      },
      [updateConversation]
    );

  /*
   * -------------------------------------------------------
   * PIN / UNPIN CONVERSATION
   * -------------------------------------------------------
   */

  const handleTogglePin =
    useCallback(
      (conversationId: string) => {
        updateConversation(
          conversationId,
          (conversation) => ({
            ...conversation,

            isPinned:
              !conversation.isPinned,

            updatedAt: Date.now(),
          })
        );
      },
      [updateConversation]
    );

  /*
   * -------------------------------------------------------
   * CLEAR ALL CONVERSATIONS
   * -------------------------------------------------------
   */

  const handleClearAll =
    useCallback(() => {
      if (
        !window.confirm(
          'Clear all conversations? This cannot be undone.'
        )
      ) {
        return;
      }

      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;
      }

      setIsLoading(false);

      setConversations([]);

      setActiveId(null);

      setInputDraft('');
    }, []);

  /*
   * -------------------------------------------------------
   * RESET APP
   * -------------------------------------------------------
   */

  const handleResetApp =
    useCallback(() => {
      if (
        !window.confirm(
          'Reset Ahemad\'s AI? This will remove conversations and settings from this browser.'
        )
      ) {
        return;
      }

      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;
      }

      storage.clearAllData();

      setConversations([]);

      setActiveId(null);

      setSettings(
        DEFAULT_SETTINGS
      );

      setTheme('dark');

      setInputDraft('');

      setIsLoading(false);
    }, []);

  /*
   * -------------------------------------------------------
   * SELECT CONVERSATION
   * -------------------------------------------------------
   */

  const handleSelectConversation =
    useCallback(
      (conversationId: string) => {
        if (
          !conversations.some(
            (conversation) =>
              conversation.id ===
              conversationId
          )
        ) {
          return;
        }

        if (
          isLoading &&
          abortControllerRef.current
        ) {
          abortControllerRef.current.abort();

          abortControllerRef.current =
            null;

          setIsLoading(false);
        }

        setActiveId(
          conversationId
        );

        setSidebarOpen(false);

        setInputDraft('');
      },
      [
        conversations,
        isLoading,
      ]
    );

  /*
   * -------------------------------------------------------
   * THEME TOGGLE
   * -------------------------------------------------------
   */

  const handleToggleTheme =
    useCallback(() => {
      setTheme((current) => {
        if (current === 'dark') {
          return 'light';
        }

        if (current === 'light') {
          return 'dark';
        }

        return 'dark';
      });
    }, []);

  /*
   * -------------------------------------------------------
   * KEYBOARD SHORTCUTS
   * -------------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown =
      (event: KeyboardEvent) => {
        const isModifier =
          event.ctrlKey ||
          event.metaKey;

        if (
          isModifier &&
          event.key.toLowerCase() ===
            'k'
        ) {
          event.preventDefault();

          handleNewChat();

          return;
        }

        if (
          event.key === 'Escape' &&
          sidebarOpen
        ) {
          setSidebarOpen(false);
        }
      };

    window.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [
    handleNewChat,
    sidebarOpen,
  ]);

  /*
   * -------------------------------------------------------
   * CLEANUP ON UNMOUNT
   * -------------------------------------------------------
   */

  useEffect(() => {
    return () => {
      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /*
   * -------------------------------------------------------
   * ACTIVE CHAT TITLE
   * -------------------------------------------------------
   */

  const activeChatTitle =
    currentConversation?.title ||
    'New Chat';

  /*
   * -------------------------------------------------------
   * RENDER
   * -------------------------------------------------------
   */

  return (
    <div
      className="min-h-screen w-full flex overflow-hidden"
      style={{
        background:
          'var(--ahemad-ai-background, #080812)',
        fontSize:
          'var(--ahemad-ai-font-size, 16px)',
      }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={() =>
            setSidebarOpen(false)
          }
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed md:relative
          inset-y-0 left-0
          z-40
          transition-transform
          duration-300
          ease-out
          ${
            sidebarOpen
              ? 'translate-x-0'
              : '-translate-x-full md:translate-x-0'
          }
        `}
      >
        <Sidebar
          conversations={
            conversations
          }
          activeConversationId={
            activeId
          }
          onSelectConversation={
            handleSelectConversation
          }
          onNewChat={
            handleNewChat
          }
          onDeleteConversation={
            handleDeleteConversation
          }
          onRenameConversation={
            handleRenameConversation
          }
          onTogglePin={
            handleTogglePin
          }
          onClearAll={
            handleClearAll
          }
          theme={theme}
          onToggleTheme={
            handleToggleTheme
          }
          onOpenSettings={() =>
            setIsSettingsOpen(true)
          }
          modelName={
            health?.model ||
            "Ahemad's AI"
          }
        />
      </div>

      {/* Main application */}
      <main className="flex-1 min-w-0 flex flex-col relative">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(circle at 50% 0%, var(--ahemad-ai-glow, rgba(139,92,246,0.10)), transparent 45%)',
          }}
        />

        <Header
          onToggleSidebar={() =>
            setSidebarOpen(
              (open) => !open
            )
          }
          onNewChat={
            handleNewChat
          }
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

        <div className="flex-1 min-h-0 flex flex-col relative z-10">
          {currentConversation &&
          currentConversation.messages
            .length > 0 ? (
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              <div className="max-w-4xl mx-auto w-full px-4 py-6 md:px-6">
                {currentConversation.messages.map(
                  (
                    message,
                    index
                  ) => (
                    <ChatMessage
                      key={
                        message.id
                      }
                      message={
                        message
                      }
                      isLastAssistantMessage={
                        message.role ===
                          'assistant' &&
                        index ===
                          currentConversation
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

                <div
                  ref={
                    messagesEndRef
                  }
                />
              </div>
            </div>
          ) : (
            <WelcomeScreen
              onSelectPrompt={(
                prompt
              ) => {
                setInputDraft(
                  prompt
                );
              }}
            />
          )}

          <ChatInput
            onSendMessage={
              handleSendMessage
            }
            onStopGeneration={
              handleStopGeneration
            }
            isLoading={
              isLoading
            }
            disabled={
              !health?.hasApiKey &&
              health !== null
            }
            initialText={
              inputDraft
            }
          />
        </div>
      </main>

      {/* Settings */}
      <SettingsModal
        isOpen={
          isSettingsOpen
        }
        onClose={() =>
          setIsSettingsOpen(
            false
          )
        }
        settings={
          settings
        }
        onUpdateSettings={
          handleUpdateSettings
        }
        onResetApp={
          handleResetApp
        }
        onClearConversations={
          handleClearAll
        }
        health={health}
      />
    </div>
  );
}

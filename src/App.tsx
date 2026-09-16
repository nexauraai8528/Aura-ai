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
    accent: '#8B5CF6',
  },
  ocean: {
    background: '#06121A',
    glow: 'rgba(14, 165, 233, 0.12)',
    accent: '#0EA5E9',
  },
  lavender: {
    background: '#100A18',
    glow: 'rgba(192, 132, 252, 0.12)',
    accent: '#C084FC',
  },
  sage: {
    background: '#08130F',
    glow: 'rgba(74, 222, 128, 0.10)',
    accent: '#4ADE80',
  },
  burgundy: {
    background: '#16080D',
    glow: 'rgba(244, 63, 94, 0.10)',
    accent: '#F43F5E',
  },
  terracotta: {
    background: '#160D08',
    glow: 'rgba(251, 146, 60, 0.11)',
    accent: '#FB923C',
  },
  professional: {
    background: '#090C12',
    glow: 'rgba(96, 165, 250, 0.10)',
    accent: '#60A5FA',
  },
  neon: {
    background: '#050B0B',
    glow: 'rgba(45, 212, 191, 0.12)',
    accent: '#2DD4BF',
  },
  pink: {
    background: '#160812',
    glow: 'rgba(236, 72, 153, 0.12)',
    accent: '#EC4899',
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

  const [inputDraft, setInputDraft] =
    useState('');

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
   * APPEARANCE THEME
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

      document.documentElement.dataset.theme =
        resolvedTheme;

      if (resolvedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

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
   * APP COLOR THEME + FONT SIZE
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
    const root =
      document.documentElement;

    root.dataset.appTheme =
      activeAppTheme;

    root.style.setProperty(
      '--ahemad-ai-background',
      themeConfig.background
    );

    root.style.setProperty(
      '--ahemad-ai-glow',
      themeConfig.glow
    );

    root.style.setProperty(
      '--ahemad-ai-accent',
      themeConfig.accent
    );

    root.style.setProperty(
      '--ahemad-ai-font-size',
      fontSize
    );

    return () => {
      root.removeAttribute(
        'data-app-theme'
      );

      root.style.removeProperty(
        '--ahemad-ai-background'
      );

      root.style.removeProperty(
        '--ahemad-ai-glow'
      );

      root.style.removeProperty(
        '--ahemad-ai-accent'
      );

      root.style.removeProperty(
        '--ahemad-ai-font-size'
      );
    };
  }, [
    activeAppTheme,
    activeFontSize,
    themeConfig.background,
    themeConfig.glow,
    themeConfig.accent,
    fontSize,
  ]);

  /*
   * -------------------------------------------------------
   * SAVE SETTINGS
   * -------------------------------------------------------
   */

  useEffect(() => {
    storage.saveSettings(settings);
  }, [settings]);

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
    let cancelled = false;

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

        if (!cancelled) {
          setHealth(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn(
            "Could not connect to Ahemad's AI server:",
            err
          );
        }
      }
    }

    checkHealth();

    return () => {
      cancelled = true;
    };
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

        createdAt:
          Date.now(),

        updatedAt:
          Date.now(),

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
   * CTRL/CMD + K
   * -------------------------------------------------------
   */

  useEffect(() => {
    const handleKeyDown =
      (e: KeyboardEvent) => {
        if (
          (e.metaKey ||
            e.ctrlKey) &&
          e.key.toLowerCase() ===
            'k'
        ) {
          e.preventDefault();

          handleNewChat();
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
  }, [handleNewChat]);

  /*
   * -------------------------------------------------------
   * DARK / LIGHT TOGGLE
   * -------------------------------------------------------
   */

  const handleToggleTheme =
    () => {
      setTheme((prev) =>
        prev === 'dark'
          ? 'light'
          : 'dark'
      );
    };

  /*
   * -------------------------------------------------------
   * SETTINGS UPDATE
   * -------------------------------------------------------
   */

  const handleUpdateSettings =
    (
      updates: Partial<AppSettings>
    ) => {
      const updated: AppSettings = {
        ...settings,
        ...updates,
      };

      setSettings(updated);

      storage.saveSettings(
        updated
      );

      if (
        updates.theme
      ) {
        setTheme(
          updates.theme
        );
      }
    };

  /*
   * -------------------------------------------------------
   * PIN CHAT
   * -------------------------------------------------------
   */

  const handleTogglePin =
    (id: string) => {
      setConversations(
        (prev) =>
          prev.map(
            (c) =>
              c.id === id
                ? {
                    ...c,
                    isPinned:
                      !c.isPinned,
                    updatedAt:
                      Date.now(),
                  }
                : c
          )
      );
    };

  /*
   * -------------------------------------------------------
   * DELETE CHAT
   * -------------------------------------------------------
   */

  const handleDeleteConversation =
    (id: string) => {
      setConversations(
        (prev) => {
          const remaining =
            prev.filter(
              (c) =>
                c.id !== id
            );

          if (
            activeId === id
          ) {
            setActiveId(
              remaining.length >
                0
                ? remaining[0].id
                : null
            );
          }

          return remaining;
        }
      );
    };

  /*
   * -------------------------------------------------------
   * RENAME CHAT
   * -------------------------------------------------------
   */

  const handleRenameConversation =
    (
      id: string,
      newTitle: string
    ) => {
      setConversations(
        (prev) =>
          prev.map(
            (c) =>
              c.id === id
                ? {
                    ...c,
                    title:
                      newTitle,
                    updatedAt:
                      Date.now(),
                  }
                : c
          )
      );
    };

  /*
   * -------------------------------------------------------
   * CLEAR ALL
   * -------------------------------------------------------
   */

  const handleClearAll =
    () => {
      if (
        isLoading &&
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
    };

  /*
   * -------------------------------------------------------
   * RESET ALL DATA
   * -------------------------------------------------------
   */

  const handleResetAllData =
    () => {
      if (
        isLoading &&
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;
      }

      storage.clearAllData();

      setConversations([]);

      setActiveId(null);

      setTheme('dark');

      setSettings({
        ...DEFAULT_SETTINGS,
      });

      setInputDraft('');

      setIsLoading(false);
    };

  /*
   * -------------------------------------------------------
   * STOP GENERATION
   * -------------------------------------------------------
   */

  const handleStopGeneration =
    () => {
      if (
        abortControllerRef.current
      ) {
        abortControllerRef.current.abort();

        abortControllerRef.current =
          null;
      }

      setIsLoading(false);

      if (!activeId) {
        return;
      }

      setConversations(
        (prev) =>
          prev.map(
            (conv) => {
              if (
                conv.id !==
                activeId
              ) {
                return conv;
              }

              return {
                ...conv,

                messages:
                  conv.messages.map(
                    (m) => {
                      if (
                        m.status ===
                          'streaming' ||
                        m.status ===
                          'sending'
                      ) {
                        return {
                          ...m,
                          status:
                            'complete' as const,
                        };
                      }

                      return m;
                    }
                  ),

                updatedAt:
                  Date.now(),
              };
            }
          )
      );
    };

  /*
   * -------------------------------------------------------
   * REGENERATE RESPONSE
   * -------------------------------------------------------
   */

  const handleRegenerate =
    async () => {
      if (
        !currentConversation ||
        isLoading
      ) {
        return;
      }

      const messages =
        currentConversation.messages;

      const lastAssistantIndex =
        messages
          .map(
            (m) => m.role
          )
          .lastIndexOf(
            'assistant'
          );

      const lastUserIndex =
        lastAssistantIndex >
        0
          ? lastAssistantIndex -
            1
          : messages.length -
            1;

      const lastUserMessage =
        messages[
          lastUserIndex
        ];

      if (
        !lastUserMessage ||
        lastUserMessage.role !==
          'user'
      ) {
        return;
      }

      setConversations(
        (prev) =>
          prev.map(
            (conv) => {
              if (
                conv.id !==
                currentConversation.id
              ) {
                return conv;
              }

              const filtered =
                conv.messages.filter(
                  (m) =>
                    m.role !==
                    'assistant'
                );

              return {
                ...conv,

                messages:
                  filtered,

                updatedAt:
                  Date.now(),
              };
            }
          )
      );

      await handleSendMessage(
        lastUserMessage.content,
        lastUserMessage.attachments ||
          []
      );
    };

  /*
   * -------------------------------------------------------
   * EDIT USER MESSAGE
   * -------------------------------------------------------
   */

  const handleEditMessage =
    (content: string) => {
      setInputDraft(
        content
      );
    };

  /*
   * -------------------------------------------------------
   * SEND MESSAGE
   * -------------------------------------------------------
   */

  const handleSendMessage =
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

      let targetConvId =
        activeId;

      let isFirstMessage =
        false;

      /*
       * Create conversation
       */

      if (!targetConvId) {
        const newConv: Conversation =
          {
            id: `conv-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,

            title:
              cleanText
                ? cleanText.length >
                  28
                  ? `${cleanText.slice(
                      0,
                      28
                    )}...`
                  : cleanText
                : 'New Chat',

            messages: [],

            createdAt:
              Date.now(),

            updatedAt:
              Date.now(),

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

        targetConvId =
          newConv.id;

        isFirstMessage =
          true;
      } else {
        const conv =
          conversations.find(
            (c) =>
              c.id ===
              targetConvId
          );

        if (
          !conv ||
          conv.messages.length ===
            0
        ) {
          isFirstMessage =
            true;
        }
      }

      /*
       * User message
       */

      const userMessage: Message =
        {
          id: `msg-${Date.now()}-user`,

          role: 'user',

          content: cleanText,

          timestamp:
            Date.now(),

          status:
            'complete',

          attachments:
            attachments.length >
            0
              ? attachments
              : undefined,
        };

      /*
       * Assistant message
       */

      const assistantMessageId =
        `msg-${Date.now() + 1}-assistant`;

      const initialAssistantMessage: Message =
        {
          id: assistantMessageId,

          role: 'assistant',

          content: '',

          timestamp:
            Date.now(),

          status:
            'sending',

          mode:
            settings.activeMode,
        };

      /*
       * Add messages
       */

      setConversations(
        (prev) =>
          prev.map(
            (conv) => {
              if (
                conv.id !==
                targetConvId
              ) {
                return conv;
              }

              return {
                ...conv,

                messages: [
                  ...conv.messages,
                  userMessage,
                  initialAssistantMessage,
                ],

                updatedAt:
                  Date.now(),

                title:
                  isFirstMessage &&
                  cleanText
                    ? cleanText.length >
                      28
                      ? `${cleanText.slice(
   

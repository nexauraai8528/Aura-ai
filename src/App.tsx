import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Conversation,
  Message,
  ThemeMode,
  HealthStatus,
  Attachment,
  AppSettings,
  AssistantMode,
} from './types';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() =>
    storage.getConversations()
  );

  const [activeId, setActiveId] = useState<string | null>(() =>
    storage.getCurrentConversationId()
  );

  const [theme, setTheme] = useState<ThemeMode>(() => storage.getTheme());

  const [settings, setSettings] = useState<AppSettings>(() =>
    storage.getSettings()
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme with document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    storage.setTheme(theme);
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  // Persist active conversation
  useEffect(() => {
    storage.setCurrentConversationId(activeId);
  }, [activeId]);

  // Check Ahemad's AI server health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');

        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn(
          "Could not connect to Ahemad's AI server health endpoint:",
          err
        );
      }
    }

    checkHealth();
  }, []);

  // Ctrl/Cmd + K = New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Current conversation
  const currentConversation =
    conversations.find((c) => c.id === activeId) || null;

  // Scroll to bottom
  const scrollToBottom = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({
          behavior,
          block: 'end',
        });
      }
    },
    []
  );

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentConversation?.messages, scrollToBottom]);

  // Create new chat
  const handleNewChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }

    const newConv: Conversation = {
      id: `conv-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 6)}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: health?.model || 'internal-ai-engine',
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
  };

  // Toggle theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Select assistant mode
  const handleSelectMode = (newMode: AssistantMode) => {
    const updated = {
      ...settings,
      defaultMode: newMode,
    };

    setSettings(updated);
    storage.saveSettings(updated);
  };

  // Toggle pinned chat
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isPinned: !c.isPinned,
            }
          : c
      )
    );
  };

  // Delete conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter((c) => c.id !== id);

      if (activeId === id) {
        setActiveId(remaining.length > 0 ? remaining[0].id : null);
      }

      return remaining;
    });
  };

  // Rename conversation
  const handleRenameConversation = (
    id: string,
    newTitle: string
  ) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  // Clear all chats
  const handleClearAll = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }

    setConversations([]);
    setActiveId(null);
  };

  // Stop AI generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);

    if (activeId) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeId) return conv;

          const updatedMessages = conv.messages.map((m) => {
            if (
              m.status === 'streaming' ||
              m.status === 'sending'
            ) {
              return {
                ...m,
                status: 'complete' as const,
              };
            }

            return m;
          });

          return {
            ...conv,
            messages: updatedMessages,
          };
        })
      );
    }
  };

  // Send message
  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = []
  ) => {
    let targetConvId = activeId;
    let isFirstMessage = false;

    // Create conversation if none exists
    if (!targetConvId) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 6)}`,
        title: text
          ? text.length > 28
            ? `${text.slice(0, 28)}...`
            : text
          : 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: health?.model || 'internal-ai-engine',
      };

      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);

      targetConvId = newConv.id;
      isFirstMessage = true;
    } else {
      const conv = conversations.find(
        (c) => c.id === targetConvId
      );

      if (!conv || conv.messages.length === 0) {
        isFirstMessage = true;
      }
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      status: 'complete',
      attachments:
        attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId =
      `msg-${Date.now() + 1}-assistant`;

    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'sending',
      mode: settings.defaultMode,
    };

    // Add messages to conversation
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) return conv;

        return {
          ...conv,
          messages: [
            ...conv.messages,
            userMessage,
            initialAssistantMessage,
          ],
          updatedAt: Date.now(),
          title:
            isFirstMessage && text
              ? text.length > 28
                ? `${text.slice(0, 28)}...`
                : text
              : conv.title,
        };
      })
    );

    setIsLoading(true);

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Generate smart title
    if (isFirstMessage && text) {
      fetch('/api/chat/title', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text,
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (
            data.title &&
            data.title !== 'New Conversation'
          ) {
            setConversations((prev) =>
              prev.map((c) =>
                c.id === targetConvId
                  ? {
                      ...c,
                      title: data.title,
                    }
                  : c
              )
            );
          }
        })
        .catch((e) =>
          console.warn(
            "Could not auto-generate title:",
            e
          )
        );
    }

    try {
      // Prepare conversation history
      const existingMessages =
        conversations.find(
          (c) => c.id === targetConvId
        )?.messages || [];

      const historyToSend = [
        ...existingMessages,
        userMessage,
      ].map((m) => ({
        role:
          m.role === 'assistant'
            ? 'model'
            : 'user',
        text: m.content,
        attachments: m.attachments?.map((a) => ({
          data: a.data,
          mimeType: a.mimeType,
          name: a.name,
        })),
      }));

      const response = await fetch(
        '/api/chat/stream',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: historyToSend,
            mode: settings.defaultMode,

            // Send custom instructions using both names
            // for compatibility with the backend.
            systemInstruction:
              settings.customInstructions,
            customSystemInstruction:
              settings.customInstructions,

            creativity: settings.creativity,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned error ${response.status}: ${response.statusText}`
        );
      }

      if (!response.body) {
        throw new Error(
          'ReadableStream not supported by response'
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let accumulatedText = '';
      let buffer = '';

      // Read SSE stream
      while (true) {
        const { done, value } =
          await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (!trimmed.startsWith('data: ')) {
            continue;
          }

          try {
            const data = JSON.parse(
              trimmed.slice(6)
            );

            if (data.error) {
              throw new Error(data.error);
            }

            if (data.chunk) {
              accumulatedText += data.chunk;

              setConversations((prev) =>
                prev.map((conv) => {
                  if (conv.id !== targetConvId) {
                    return conv;
                  }

                  const updated = conv.messages.map(
                    (m) => {
                      if (
                        m.id === assistantMessageId
                      ) {
                        return {
                          ...m,
                          content: accumulatedText,
                          status:
                            'streaming' as const,
                        };
                      }

                      return m;
                    }
                  );

                  return {
                    ...conv,
                    messages: updated,
                  };
                })
              );
            }
          } catch (jsonErr: any) {
            if (
              jsonErr.message &&
              !jsonErr.message.includes('JSON')
            ) {
              throw jsonErr;
            }
          }
        }
      }

      // Mark response complete
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) {
            return conv;
          }

          const updated = conv.messages.map((m) => {
            if (m.id === assistantMessageId) {
              return {
                ...m,
                content:
                  accumulatedText ||
                  'No response received.',
                status: 'complete' as const,
              };
            }

            return m;
          });

         

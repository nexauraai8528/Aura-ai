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
  const [conversations, setConversations] = useState<Conversation[]>(
    () => storage.getConversations()
  );

  const [activeId, setActiveId] = useState<string | null>(
    () => storage.getCurrentConversationId()
  );

  const [theme, setTheme] = useState<ThemeMode>(
    () => storage.getTheme()
  );

  const [settings, setSettings] = useState<AppSettings>(
    () => storage.getSettings()
  );

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef =
    useRef<AbortController | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    storage.setTheme(theme);
  }, [theme]);

  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  useEffect(() => {
    storage.setCurrentConversationId(activeId);
  }, [activeId]);

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
          "Could not connect to Ahemad's AI server:",
          err
        );
      }
    }

    checkHealth();
  }, []);

  const currentConversation =
    conversations.find((c) => c.id === activeId) || null;

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
    if (settings.autoScroll !== false) {
      scrollToBottom('smooth');
    }
  }, [
    currentConversation?.messages,
    scrollToBottom,
    settings.autoScroll,
  ]);

  const handleNewChat = useCallback(() => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
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
      model: health?.model || 'internal-ai-engine',
    };

    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setSidebarOpen(false);
    setInputDraft('');
  }, [health, isLoading]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === 'k'
      ) {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, [handleNewChat]);

  const handleToggleTheme = () => {
    setTheme((prev) =>
      prev === 'dark' ? 'light' : 'dark'
    );
  };

  const handleUpdateSettings = (
    updates: Partial<AppSettings>
  ) => {
    const updated = {
      ...settings,
      ...updates,
    };

    setSettings(updated);
    storage.saveSettings(updated);

    if (updates.theme) {
      setTheme(updates.theme);
    }
  };

  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              isPinned: !c.isPinned,
              updatedAt: Date.now(),
            }
          : c
      )
    );
  };

  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => {
      const remaining = prev.filter(
        (c) => c.id !== id
      );

      if (activeId === id) {
        setActiveId(
          remaining.length > 0
            ? remaining[0].id
            : null
        );
      }

      return remaining;
    });
  };

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

  const handleClearAll = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);
    setConversations([]);
    setActiveId(null);
    setInputDraft('');
  };

  const handleResetAllData = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    storage.clearAllData();

    const defaultSettings: AppSettings = {
      theme: 'dark',
      enterToSend: true,
      streamingEnabled: true,
      autoScroll: true,
      activeMode: 'general',
    };

    setConversations([]);
    setActiveId(null);
    setTheme('dark');
    setSettings(defaultSettings);
    setInputDraft('');
    setIsLoading(false);
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setIsLoading(false);

    if (!activeId) return;

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== activeId) {
          return conv;
        }

        return {
          ...conv,
          messages: conv.messages.map((m) => {
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
          }),
          updatedAt: Date.now(),
        };
      })
    );
  };

  const handleRegenerate = async () => {
    if (!currentConversation || isLoading) {
      return;
    }

    const messages =
      currentConversation.messages;

    const lastAssistantIndex =
      messages
        .map((m) => m.role)
        .lastIndexOf('assistant');

    const lastUserIndex =
      lastAssistantIndex > 0
        ? lastAssistantIndex - 1
        : messages.length - 1;

    const lastUserMessage =
      messages[lastUserIndex];

    if (
      !lastUserMessage ||
      lastUserMessage.role !== 'user'
    ) {
      return;
    }

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== currentConversation.id) {
          return conv;
        }

        const filtered =
          conv.messages.filter(
            (m) => m.role !== 'assistant'
          );

        return {
          ...conv,
          messages: filtered,
          updatedAt: Date.now(),
        };
      })
    );

    await handleSendMessage(
      lastUserMessage.content,
      lastUserMessage.attachments || []
    );
  };

  const handleEditMessage = (content: string) => {
    setInputDraft(content);
  };

  const handleSendMessage = async (
    text: string,
    attachments: Attachment[] = []
  ) => {
    let targetConvId = activeId;
    let isFirstMessage = false;

    if (!targetConvId) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
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

      setConversations((prev) => [
        newConv,
        ...prev,
      ]);

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
        attachments.length > 0
          ? attachments
          : undefined,
    };

    const assistantMessageId =
      `msg-${Date.now() + 1}-assistant`;

    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'sending',
      mode: settings.activeMode,
    };

    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) {
          return conv;
        }

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

    const abortController =
      new AbortController();

    abortControllerRef.current =
      abortController;

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
        .catch(() => {});
    }

    try {
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
        attachments:
          m.attachments?.map((a) => ({
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
            mode: settings.activeMode,
          }),
          signal: abortController.signal,
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server returned error ${response.status}`
        );
      }

      if (!response.body) {
        throw new Error(
          'ReadableStream not supported by response'
        );
      }

      const reader =
        response.body.getReader();

      const decoder =
        new TextDecoder('utf-8');

      let accumulatedText = '';
      let buffer = '';

      while (true) {
        const { done, value } =
          await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const lines =
          buffer.split('\n');

        buffer =
          lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();

          if (
            !trimmed.startsWith('data: ')
          ) {
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
                  if (
                    conv.id !== targetConvId
                  ) {
                    return conv;
                  }

                  return {
                    ...conv,
                    messages:
                      conv.messages.map(
                        (m) =>
                          m.id ===
                          assistantMessageId
                            ? {
                                ...m,
                                content:
                                  accumulatedText,
                                status:
                                  'streaming' as const,
                              }
                            : m
                      ),
                    updatedAt: Date.now(),
                  };
                })
              );
            }
          } catch (err: any) {
            if (
              err?.message &&
              !err.message.includes('JSON')
            ) {
              throw err;
            }
          }
        }
      }

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) {
            return conv;
          }

          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content:
                      accumulatedText ||
                      'No response received.',
                    status: 'complete' as const,
                  }
                : m
            ),
            updatedAt: Date.now(),
          };
        })
      );
    } catch (error: any) {
      if (
        error?.name ===
        'AbortError'
      ) {
        return;
      }

      const errorMessage =
        error?.message ||
        "Ahemad's AI could not generate a response. Please try again.";

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) {
            return conv;
          }

          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === assistantMessageId
                ? {
                    ...m,
                    content: '',
                    status: 'error' as const,
                    error: errorMessage,
                  }
                : m
            ),
            updatedAt: Date.now(),
          };
        })
      );
    } finally {
      if (
        abortControllerRef.current ===
        abortController
      ) {
        abortControllerRef.current = null;
      }

      setIsLoading(false);
    }
  };

  const handleSelectConversation = (
    id: string
  ) => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }

    setActiveId(id);
    setSidebarOpen(false);
    setInputDraft('');
  };

  const handleSelectMode = (
    newMode: AssistantMode
  ) => {
    handleUpdateSettings({
      activeMode: newMode,
    });
  };

  return (
    <div className="h-screen w-full bg-[#080812] text-zinc-100 flex overflow-hidden">
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
        onToggleTheme={handleToggleTheme}
        isOpen={sidebarOpen}
        onCloseMobile={() =>
          setSidebarOpen(false)
        }
        onOpenSettings={() =>
          setIsSettingsOpen(true)
        }
      />

      <main className="flex-1 min-w-0 flex flex-col bg-gradient-to-b from-[#0B0B16] via-[#0B0B18] to-[#080812]">
        <Header
          onToggleSidebar={() =>
            setSidebarOpen((prev) => !prev)
          }
          onNewChat={handleNewChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          health={health}
          activeChatTitle={
            currentConversation?.title
          }
          onOpenSettings={() =>
            setIsSettingsOpen(true)
          }
          activeMode={settings.activeMode}
        />

        <div className="flex-1 min-h-0 relative">
          <div className="absolute inset-0 overflow-y-auto">
            <div className="min-h-full flex flex-col">
              {currentConversation &&
              currentConversation.messages.length >
                0 ? (
                <div className="flex-1">
                  {currentConversation.messages.map(
                    (message, index) => {
                      const isLastAssistant =
                        message.role ===
                          'assistant' &&
                        index ===
                          currentConversation.messages.length -
                            1;

                      return (
                        <ChatMessage
                          key={message.id}
                          message={message}
                          isLastAssistantMessage={
                            isLastAssistant
                          }
                          isLoading={isLoading}
                          onRegenerate={
                            isLastAssistant
                              ? handleRegenerate
                              : undefined
                          }
                          onEditMessage={
                            message.role ===
                            'user'
                              ? handleEditMessage
                              : undefined
                          }
                        />
                      );
                    }
                  )}

                  <div
                    ref={messagesEndRef}
                    className="h-2"
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <WelcomeScreen
                    onSuggestionClick={(
                      prompt: string
                    ) => {
                      handleSendMessage(prompt);
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="shrink-0">
          <ChatInput
            onSendMessage={
              handleSendMessage
            }
            onStopGeneration={
              handleStopGeneration
            }
            isLoading={isLoading}
            initialText={inputDraft}
          />
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() =>
          setIsSettingsOpen(false)
        }
        settings={settings}
        
              onUpdateSettings={
          handleUpdateSettings
        }
        health={health}
        onClearAllConversations={
          handleClearAll
        }
        onResetAllData={
          handleResetAllData
        }
      />
    </div>
  );
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, ThemeMode, HealthStatus, Attachment, AppSettings, AssistantMode } from './types';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeId, setActiveId] = useState<string | null>(() => storage.getCurrentConversationId());
  const [theme, setTheme] = useState<ThemeMode>(() => storage.getTheme());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme with document element
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

  // Persist active conversation ID
  useEffect(() => {
    storage.setCurrentConversationId(activeId);
  }, [activeId]);

  // Fetch API Health & Model status
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
        console.warn('Could not connect to Aura AI server health endpoint:', err);
      }
    }
    checkHealth();
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K to start New Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleNewChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Current active conversation
  const currentConversation = conversations.find((c) => c.id === activeId) || null;

  // Auto scroll to bottom
  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom('smooth');
  }, [currentConversation?.messages, scrollToBottom]);

  // Create or switch to a new chat
  const handleNewChat = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
    const newConv: Conversation = {
      id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: 'New Chat',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      model: health?.model || 'gemini-3.8-flash',
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
  };

  // Toggle Theme
  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Save Settings
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    storage.saveSettings(newSettings);
  };

  // Quick mode switch from header
  const handleSelectMode = (newMode: AssistantMode) => {
    const updated = { ...settings, defaultMode: newMode };
    setSettings(updated);
    storage.saveSettings(updated);
  };

  // Toggle Pin Conversation
  const handleTogglePin = (id: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isPinned: !c.isPinned } : c))
    );
  };

  // Export Conversation as Markdown
  const handleExportConversation = (id: string) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;

    let md = `# ${conv.title}\n\n*Created: ${new Date(conv.createdAt).toLocaleString()}*\n\n---\n\n`;
    conv.messages.forEach((m) => {
      const author = m.role === 'user' ? 'You' : 'Aura AI';
      md += `### ${author} (${new Date(m.timestamp).toLocaleTimeString()})\n\n${m.content}\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${conv.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'chat'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Delete a conversation
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      setActiveId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Rename a conversation
  const handleRenameConversation = (id: string, newTitle: string) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear all conversations
  const handleClearAll = () => {
    if (isLoading && abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsLoading(false);
    }
    setConversations([]);
    setActiveId(null);
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);

    // Mark current streaming message as complete
    if (activeId) {
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeId) return conv;
          const updatedMessages = conv.messages.map((m) => {
            if (m.status === 'streaming' || m.status === 'sending') {
              return { ...m, status: 'complete' as const };
            }
            return m;
          });
          return { ...conv, messages: updatedMessages };
        })
      );
    }
  };

  // Send message and trigger Gemini stream
  const handleSendMessage = async (text: string, attachments: Attachment[] = []) => {
    let targetConvId = activeId;
    let isFirstMessage = false;

    // If no active conversation exists, create one
    if (!targetConvId) {
      const newConv: Conversation = {
        id: `conv-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        title: text ? (text.length > 28 ? `${text.slice(0, 28)}...` : text) : 'New Chat',
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        model: health?.model || 'gemini-3.8-flash',
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv.id);
      targetConvId = newConv.id;
      isFirstMessage = true;
    } else {
      const conv = conversations.find((c) => c.id === targetConvId);
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
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const assistantMessageId = `msg-${Date.now() + 1}-assistant`;
    const initialAssistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      status: 'sending',
      mode: settings.defaultMode,
    };

    // Update conversation with user message and pending assistant message
    setConversations((prev) =>
      prev.map((conv) => {
        if (conv.id !== targetConvId) return conv;
        return {
          ...conv,
          messages: [...conv.messages, userMessage, initialAssistantMessage],
          updatedAt: Date.now(),
          title: isFirstMessage && text
            ? text.length > 28 ? `${text.slice(0, 28)}...` : text
            : conv.title,
        };
      })
    );

    setIsLoading(true);
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Asynchronously request smart title for first message
    if (isFirstMessage && text) {
      fetch('/api/chat/title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.title && data.title !== 'New Conversation') {
            setConversations((prev) =>
              prev.map((c) => (c.id === targetConvId ? { ...c, title: data.title } : c))
            );
          }
        })
        .catch((e) => console.warn('Could not auto-generate title:', e));
    }

    try {
      // Prepare history for multi-turn context
      const existingMessages =
        conversations.find((c) => c.id === targetConvId)?.messages || [];
      const historyToSend = [...existingMessages, userMessage].map((m) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content,
        attachments: m.attachments?.map((a) => ({
          data: a.data,
          mimeType: a.mimeType,
          name: a.name,
        })),
      }));

      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: historyToSend,
          mode: settings.defaultMode,
          systemInstruction: settings.customInstructions,
          creativity: settings.creativity,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned error ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by response');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let accumulatedText = '';
      let buffer = '';

      // Read SSE stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.error) {
                throw new Error(data.error);
              }
              if (data.chunk) {
                accumulatedText += data.chunk;
                setConversations((prev) =>
                  prev.map((conv) => {
                    if (conv.id !== targetConvId) return conv;
                    const updated = conv.messages.map((m) => {
                      if (m.id === assistantMessageId) {
                        return {
                          ...m,
                          content: accumulatedText,
                          status: 'streaming' as const,
                        };
                      }
                      return m;
                    });
                    return { ...conv, messages: updated };
                  })
                );
              }
            } catch (jsonErr: any) {
              if (jsonErr.message && !jsonErr.message.includes('JSON')) {
                throw jsonErr;
              }
            }
          }
        }
      }

      // Mark message complete
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) return conv;
          const updated = conv.messages.map((m) => {
            if (m.id === assistantMessageId) {
              return {
                ...m,
                content: accumulatedText || 'No response received from model.',
                status: 'complete' as const,
              };
            }
            return m;
          });
          return { ...conv, messages: updated };
        })
      );
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User aborted intentionally
        return;
      }
      console.error('Chat error:', err);
      let errorMessage =
        err?.message || 'Failed to connect to the Aura AI backend. Please check your Gemini API key.';
      try {
        const parsed = JSON.parse(errorMessage);
        if (parsed?.error?.message) {
          errorMessage = parsed.error.message;
        }
      } catch {}

      if (errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('quota') || errorMessage.includes('429')) {
        errorMessage = 'Gemini model free-tier quota was reached. Automatic model failover is active. Please try again.';
      }

      // Refresh health to check active model and rate limit state
      fetch('/api/health')
        .then((r) => r.ok && r.json())
        .then((data) => data && setHealth(data))
        .catch(() => {});

      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== targetConvId) return conv;
          const updated = conv.messages.map((m) => {
            if (m.id === assistantMessageId) {
              return {
                ...m,
                status: 'error' as const,
                error: errorMessage,
              };
            }
            return m;
          });
          return { ...conv, messages: updated };
        })
      );
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!currentConversation || isLoading) return;

    const messages = currentConversation.messages;
    if (messages.length === 0) return;

    // Find the last user message and remove subsequent assistant messages
    const lastUserIndex = [...messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserIndex === -1) return;

    const actualUserIndex = messages.length - 1 - lastUserIndex;
    const lastUserMsg = messages[actualUserIndex];

    // Truncate messages to just before the last assistant response
    const truncatedMessages = messages.slice(0, actualUserIndex);

    // Update conversation state to remove previous response
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversation.id ? { ...c, messages: truncatedMessages } : c
      )
    );

    // Resend the user message
    handleSendMessage(lastUserMsg.content, lastUserMsg.attachments);
  };

  const messages = currentConversation?.messages || [];
  const hasMessages = messages.length > 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#182622] text-[#F1E9D2] antialiased selection:bg-[#35574D] selection:text-[#F1E9D2] relative">
      {/* Ambient background glow & Sage Serenity curvature */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(36,59,53,0.6),transparent_70%)]" />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[550px] h-[550px] bg-[radial-gradient(circle,rgba(183,201,177,0.06),transparent_70%)]" />
      <div className="pointer-events-none absolute top-1/3 -left-32 w-80 h-80 bg-[radial-gradient(circle,rgba(107,142,123,0.08),transparent_70%)]" />

      {/* Sidebar Navigation */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeId}
        onSelectConversation={setActiveId}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onClearAll={handleClearAll}
        onTogglePinConversation={handleTogglePin}
        onExportConversation={handleExportConversation}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isOpen={sidebarOpen}
        onCloseMobile={() => setSidebarOpen(false)}
        modelName={health?.model || 'gemini-3.8-flash'}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Chat Workspace */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Top Header */}
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onNewChat={handleNewChat}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          health={health}
          activeChatTitle={currentConversation?.title}
          currentMode={settings.defaultMode}
          onSelectMode={handleSelectMode}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Chat Scroll Area */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col scrollbar-thin"
        >
          {!hasMessages ? (
            <WelcomeScreen onSelectPrompt={(prompt) => handleSendMessage(prompt, [])} />
          ) : (
            <div className="flex-1 py-4">
              {messages.map((msg, index) => {
                const isLastAssistant =
                  msg.role === 'assistant' &&
                  (index === messages.length - 1 ||
                    messages.slice(index + 1).every((m) => m.role !== 'assistant'));

                return (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isLastAssistantMessage={isLastAssistant}
                    onRegenerate={isLastAssistant ? handleRegenerate : undefined}
                    isLoading={isLoading}
                    onEditMessage={(content) => setInputDraft(content)}
                  />
                );
              })}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          )}
        </main>

        {/* Fixed Bottom Input Composer */}
        <footer className="shrink-0 bg-gradient-to-t from-[#182622] via-[#182622]/95 to-transparent pt-2">
          <ChatInput
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStopGeneration}
            isLoading={isLoading}
            initialText={inputDraft}
          />
        </footer>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={handleSaveSettings}
        activeModel={health?.model}
      />
    </div>
  );
}


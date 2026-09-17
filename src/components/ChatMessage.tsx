import React, { useMemo, useState } from 'react';
import {
  Copy,
  Check,
  RotateCcw,
  Pencil,
  X,
  User,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  onRegenerate?: (messageId: string) => void;
  isLoading?: boolean;
  onEditMessage?: (messageId: string, newText: string) => void;
}

export function ChatMessage({
  message,
  isLastAssistantMessage = false,
  onRegenerate,
  isLoading = false,
  onEditMessage,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const isStreaming = message.status === 'streaming';
  const isError = message.status === 'error';

  const formattedTime = useMemo(() => {
    try {
      return new Date(message.timestamp).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  }, [message.timestamp]);

  const copyMessage = async () => {
    if (!message.content) return;

    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      // Clipboard may be unavailable in some browsers.
    }
  };

  const speakMessage = () => {
    if (!message.content || !('speechSynthesis' in window)) return;

    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message.content);
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = () => {
      setSpeaking(false);
    };

    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const saveEdit = () => {
    const clean = editText.trim();

    if (!clean) return;

    onEditMessage?.(message.id, clean);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditText(message.content);
    setEditing(false);
  };

  return (
    <div
      className={`group w-full py-5 ${
        isUser ? 'flex justify-end' : 'flex justify-start'
      }`}
    >
      <div
        className={`flex w-full max-w-4xl gap-3 md:gap-4 ${
          isUser ? 'flex-row-reverse' : 'flex-row'
        }`}
      >
        {/* Avatar */}
        <div
          className={`shrink-0 flex items-center justify-center rounded-2xl ${
            isUser
              ? 'h-9 w-9 bg-zinc-800 border border-zinc-700'
              : 'h-10 w-10 bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 shadow-lg shadow-purple-900/20'
          }`}
        >
          {isUser ? (
            <User size={17} className="text-zinc-300" />
          ) : (
            <Sparkles size={18} className="text-white" />
          )}
        </div>

        {/* Message area */}
        <div
          className={`min-w-0 flex-1 ${
            isUser ? 'flex flex-col items-end' : ''
          }`}
        >
          {/* Name + time */}
          <div
            className={`mb-1.5 flex items-center gap-2 text-xs text-zinc-500 ${
              isUser ? 'justify-end' : 'justify-start'
            }`}
          >
            <span className="font-medium text-zinc-400">
              {isUser ? 'You' : "Ahemad's AI"}
            </span>

            {formattedTime && (
              <>
                <span>•</span>
                <span>{formattedTime}</span>
              </>
            )}
          </div>

          {/* Editing */}
          {editing ? (
            <div className="w-full max-w-2xl">
              <textarea
                value={editText}
                onChange={(event) => setEditText(event.target.value)}
                rows={4}
                autoFocus
                className="w-full resize-y rounded-2xl border border-violet-500/40 bg-zinc-900/90 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 placeholder:text-zinc-600 focus:border-violet-500/70"
              />

              <div className="mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 px-3 py-2 text-xs text-zinc-300 transition hover:bg-zinc-800"
                >
                  <X size={14} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
                >
                  <Check size={14} />
                  Save & Send
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Message bubble/content */}
              <div
                className={`relative ${
                  isUser
                    ? 'max-w-2xl rounded-3xl rounded-tr-md bg-violet-600/90 px-4 py-3 text-white shadow-lg shadow-violet-950/20'
                    : `max-w-3xl ${
                        isError
                          ? 'rounded-2xl border border-red-500/20 bg-red-500/5'
                          : ''
                      }`
                }`}
              >
                {message.content ? (
                  isUser ? (
                    <div
                      style={{
                        fontSize: 'var(--chat-message-size)',
                      }}
                      className="whitespace-pre-wrap break-words leading-7"
                    >
                      {message.content}
                    </div>
                  ) : (
                    <div
                      style={{
                        fontSize: 'var(--chat-message-size)',
                      }}
                      className={`prose prose-invert max-w-none break-words leading-7 ${
                        isError ? 'text-red-300' : 'text-zinc-200'
                      }`}
                    >
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ ...props }) => (
                            <a
                              {...props}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-violet-400 underline underline-offset-2 hover:text-violet-300"
                            />
                          ),

                          code: ({
                            className,
                            children,
                            ...props
                          }) => {
                            const inline = !className;

                            if (inline) {
                              return (
                                <code
                                  {...props}
                                  className="rounded-md bg-zinc-800 px-1.5 py-0.5 text-violet-300"
                                >
                                  {children}
                                </code>
                              );
                            }

                            return (
                              <code
                                {...props}
                                className={`${className || ''} block overflow-x-auto rounded-xl bg-black/50 p-4 text-sm`}
                              >
                                {children}
                              </code>
                            );
                          },

                          pre: ({ children }) => (
                            <pre className="my-3 overflow-x-auto rounded-xl border border-zinc-800 bg-black/50">
                              {children}
                            </pre>
                          ),

                          table: ({ children }) => (
                            <div className="my-4 overflow-x-auto">
                              <table className="min-w-full border-collapse text-sm">
                                {children}
                              </table>
                            </div>
                          ),

                          th: ({ children }) => (
                            <th className="border border-zinc-700 bg-zinc-900 px-3 py-2 text-left font-semibold">
                              {children}
                            </th>
                          ),

                          td: ({ children }) => (
                            <td className="border border-zinc-800 px-3 py-2">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  )
                ) : (
                  <div className="flex items-center gap-1.5 py-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" />
                  </div>
                )}
              </div>

              {/* Attachments */}
              {message.attachments &&
                message.attachments.length > 0 && (
                  <div
                    className={`mt-2 flex flex-wrap gap-2 ${
                      isUser ? 'justify-end' : ''
                    }`}
                  >
                    {message.attachments.map((attachment) => (
                      <div
                        key={attachment.id}
                        className="rounded-xl border border-zinc-800 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-400"
                      >
                        📎 {attachment.name}
                      </div>
                    ))}
                  </div>
                )}

              {/* Assistant actions */}
              {!isUser && message.content && (
                <div className="mt-2 flex items-center gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={copyMessage}
                    title="Copy response"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    {copied ? (
                      <Check size={15} />
                    ) : (
                      <Copy size={15} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={speakMessage}
                    title={
                      speaking
                        ? 'Stop speaking'
                        : 'Read response aloud'
                    }
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    {speaking ? (
                      <VolumeX size={15} />
                    ) : (
                      <Volume2 size={15} />
                    )}
                  </button>

                  {onRegenerate &&
                    isLastAssistantMessage && (
                      <button
                        type="button"
                        onClick={() =>
                          onRegenerate(message.id)
                        }
                        disabled={isLoading}
                        title="Regenerate response"
                        className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw size={15} />
                      </button>
                    )}

                  {message.status === 'error' &&
                    message.error && (
                      <span className="ml-2 text-xs text-red-400">
                        {message.error}
                      </span>
                    )}
                </div>
              )}

              {/* User edit */}
              {isUser && (
                <div className="mt-1 flex justify-end opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => {
                      setEditText(message.content);
                      setEditing(true);
                    }}
                    title="Edit message"
                    className="rounded-lg p-2 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              )}
            </>
          )}

          {/* Streaming indicator */}
          {isStreaming && message.content && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-violet-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
              Generating...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  User,
  Copy,
  Check,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Volume2,
  VolumeX,
  Edit3,
} from 'lucide-react';
import { Message } from '../types';
import { CodeBlock } from './CodeBlock';

interface ChatMessageProps {
  message: Message;
  isLastAssistantMessage?: boolean;
  onRegenerate?: () => void;
  isLoading?: boolean;
  onEditMessage?: (content: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isLastAssistantMessage,
  onRegenerate,
  isLoading,
  onEditMessage,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported by your browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      id={`message-${message.id}`}
      className="w-full py-3 px-3 sm:px-4 md:px-6 transition-colors"
    >
      <div className="max-w-3xl mx-auto flex gap-3 sm:gap-4 items-start">
        {/* Avatar */}
        <div className="shrink-0 pt-1">
          {isAssistant ? (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#243B35] via-[#35574D] to-[#6B8E7B] flex items-center justify-center text-[#F1E9D2] shadow-sm shadow-[#121E1B]/50 border border-[#B7C9B1]/30">
              <Sparkles className="w-4 h-4 text-[#B7C9B1]" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-[#243B35] text-[#F1E9D2] flex items-center justify-center font-medium text-xs border border-[#6B8E7B]/40">
              <User className="w-4 h-4 text-[#B7C9B1]" />
            </div>
          )}
        </div>

        {/* Content Container */}
        <div
          className={`flex-1 min-w-0 rounded-2xl p-4 md:p-5 transition-all ${
            isAssistant
              ? 'bg-[#1E312C]/90 backdrop-blur-md border border-[#6B8E7B]/25 text-[#F1E9D2] shadow-sm'
              : 'bg-[#243B35] border border-[#6B8E7B]/40 text-[#F1E9D2] shadow-sm'
          }`}
        >
          {/* Header info */}
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#6B8E7B]/20">
            <div className="flex items-center gap-2">
              <span className="font-luxury font-semibold text-sm tracking-wide text-[#F1E9D2]">
                {isAssistant ? 'Aura AI' : 'You'}
              </span>
              {isAssistant && message.mode && message.mode !== 'general' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#243B35] text-[#B7C9B1] border border-[#6B8E7B]/30 capitalize">
                  {message.mode}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!isAssistant && onEditMessage && message.content && (
                <button
                  type="button"
                  onClick={() => onEditMessage(message.content)}
                  className="p-1 rounded text-[#6B8E7B] hover:text-[#B7C9B1] transition cursor-pointer"
                  title="Edit and resend message"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              <span className="text-[11px] text-[#B7C9B1]/80 font-medium">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {/* User Attachments if any */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 py-1 mb-2">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="rounded-lg overflow-hidden border border-[#6B8E7B]/30 bg-[#182622]/80 max-w-[200px]"
                >
                  {att.mimeType.startsWith('image/') ? (
                    <img
                      src={att.data}
                      alt={att.name}
                      className="max-h-40 w-auto object-cover rounded"
                    />
                  ) : (
                    <div className="p-2 text-xs font-mono truncate text-[#F1E9D2]">
                      📄 {att.name}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Message Body */}
          {message.status === 'sending' && !message.content ? (
            <div className="flex items-center gap-2.5 py-2 text-[#B7C9B1] text-sm">
              <div className="flex gap-1.5 items-center">
                <span className="w-2 h-2 rounded-full bg-[#B7C9B1] animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#B7C9B1] animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-[#B7C9B1] animate-bounce"></span>
              </div>
              <span className="text-xs font-medium tracking-wide">Aura AI is thinking...</span>
            </div>
          ) : (
            <div className="text-[#F1E9D2] text-[15px] leading-relaxed break-words markdown-content">
              {isAssistant ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || '');
                      const codeString = String(children).replace(/\n$/, '');
                      const isInline = !match && !codeString.includes('\n');

                      if (isInline) {
                        return (
                          <code
                            className="px-1.5 py-0.5 rounded bg-[#182622] text-[#B7C9B1] border border-[#6B8E7B]/30 font-mono text-[13px]"
                            {...props}
                          >
                            {children}
                          </code>
                        );
                      }

                      return (
                        <CodeBlock
                          language={match ? match[1] : ''}
                          value={codeString}
                        />
                      );
                    },
                    p({ children }) {
                      return <p className="mb-3.5 last:mb-0 text-[#F1E9D2] leading-relaxed">{children}</p>;
                    },
                    h1({ children }) {
                      return <h1 className="font-luxury text-xl font-bold mt-5 mb-2.5 text-[#F1E9D2] tracking-wide">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="font-luxury text-lg font-bold mt-4 mb-2 text-[#F1E9D2] tracking-wide">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="font-luxury text-base font-semibold mt-3 mb-1.5 text-[#F1E9D2]">{children}</h3>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-6 mb-3 space-y-1.5 marker:text-[#B7C9B1] text-[#F1E9D2]/95">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-6 mb-3 space-y-1.5 marker:text-[#B7C9B1] text-[#F1E9D2]/95">{children}</ol>;
                    },
                    li({ children }) {
                      return <li className="pl-1 leading-normal">{children}</li>;
                    },
                    blockquote({ children }) {
                      return (
                        <blockquote className="border-l-2 border-[#B7C9B1] pl-4 italic text-[#F1E9D2]/85 bg-[#182622]/60 py-2 my-3 rounded-r-lg">
                          {children}
                        </blockquote>
                      );
                    },
                    table({ children }) {
                      return (
                        <div className="overflow-x-auto my-4 rounded-xl border border-[#6B8E7B]/25">
                          <table className="min-w-full divide-y divide-[#6B8E7B]/25 text-sm">
                            {children}
                          </table>
                        </div>
                      );
                    },
                    thead({ children }) {
                      return <thead className="bg-[#243B35] text-[#F1E9D2] font-semibold">{children}</thead>;
                    },
                    th({ children }) {
                      return <th className="px-3.5 py-2 text-left text-xs font-semibold uppercase tracking-wider text-[#B7C9B1]">{children}</th>;
                    },
                    td({ children }) {
                      return <td className="px-3.5 py-2 border-t border-[#6B8E7B]/20 text-[#F1E9D2]">{children}</td>;
                    },
                    a({ href, children }) {
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#B7C9B1] hover:text-[#F1E9D2] underline underline-offset-2 decoration-[#B7C9B1]/40 font-medium transition-colors"
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <div className="whitespace-pre-wrap text-[#F1E9D2] leading-relaxed">{message.content}</div>
              )}

              {/* Streaming Cursor */}
              {message.status === 'streaming' && (
                <span className="inline-block w-2 h-4 ml-1.5 bg-[#B7C9B1] animate-pulse align-middle" />
              )}
            </div>
          )}

          {/* Error Banner */}
          {message.error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs mt-3">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <div className="flex-1">
                <p className="font-semibold text-red-300">Generation error</p>
                <p className="mt-0.5">{message.error}</p>
                {onRegenerate && (
                  <button
                    onClick={onRegenerate}
                    type="button"
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#243B35] text-[#F1E9D2] font-medium hover:bg-[#35574D] border border-[#6B8E7B]/30 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" /> Retry
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Action Bar (Copy, Read Aloud, Regenerate) */}
          {isAssistant && message.status !== 'sending' && message.content && (
            <div className="flex items-center gap-1.5 pt-3 mt-1 border-t border-[#6B8E7B]/20 text-[#B7C9B1] text-xs">
              <button
                id={`copy-message-${message.id}`}
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#243B35] text-[#B7C9B1] hover:text-[#F1E9D2] border border-transparent hover:border-[#6B8E7B]/20 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#B7C9B1]" />
                    <span className="text-[#B7C9B1] font-medium">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                id={`speak-message-${message.id}`}
                type="button"
                onClick={handleToggleSpeech}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#243B35] border border-transparent hover:border-[#6B8E7B]/20 transition-colors cursor-pointer ${
                  isSpeaking ? 'text-[#F1E9D2] bg-[#243B35]' : 'text-[#B7C9B1] hover:text-[#F1E9D2]'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-amber-300" />
                    <span className="text-amber-300">Stop</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Read Aloud</span>
                  </>
                )}
              </button>

              {isLastAssistantMessage && onRegenerate && !isLoading && (
                <button
                  id="regenerate-message-btn"
                  type="button"
                  onClick={onRegenerate}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#243B35] text-[#B7C9B1] hover:text-[#F1E9D2] border border-transparent hover:border-[#6B8E7B]/20 transition-colors cursor-pointer"
                  title="Regenerate this response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


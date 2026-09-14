import React, { useState, useRef, useEffect } from 'react';
import { Send, Square, Paperclip, X, Mic, MicOff, Sparkles } from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (text: string, attachments: Attachment[]) => void;
  onStopGeneration?: () => void;
  isLoading: boolean;
  disabled?: boolean;
  initialText?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isLoading,
  disabled,
  initialText = '',
}) => {
  const [input, setInput] = useState(initialText);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Sync initialText if provided (e.g. when user edits message)
  useEffect(() => {
    if (initialText) {
      setInput(initialText);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialText]);

  // Auto resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;

    const trimmed = input.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments);
    setInput('');
    setAttachments([]);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      // Limit file size to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert('File size exceeds 10MB limit.');
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newAttachment: Attachment = {
            id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            mimeType: file.type || 'application/octet-stream',
          };
          setAttachments((prev) => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Speech Recognition (Dictation)
  const toggleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported by your browser.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition error:', err);
      setIsListening(false);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const canSubmit = (input.trim().length > 0 || attachments.length > 0) && !disabled;

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4">
      {/* Attachments preview tray */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2.5 bg-[#14211D]/85 backdrop-blur-md rounded-xl border border-[#6B8E7B]/30">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#243B35] border border-[#6B8E7B]/40 text-xs shadow-sm"
            >
              {att.mimeType.startsWith('image/') ? (
                <img
                  src={att.data}
                  alt={att.name}
                  className="w-7 h-7 object-cover rounded"
                />
              ) : (
                <span className="font-mono text-[#B7C9B1]">📄</span>
              )}
              <span className="max-w-[130px] truncate font-medium text-[#F1E9D2]">
                {att.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 rounded-full hover:bg-[#35574D] text-[#B7C9B1] hover:text-white cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input container */}
      <form
        onSubmit={handleSubmit}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col bg-[#1E312C]/90 backdrop-blur-xl rounded-2xl border transition-all ${
          isDragging
            ? 'border-[#B7C9B1] bg-[#243B35]/90 ring-2 ring-[#B7C9B1]/40'
            : 'border-[#6B8E7B]/35 shadow-[0_8px_32px_rgba(18,30,27,0.5)] focus-within:border-[#B7C9B1]/80 focus-within:shadow-[0_0_20px_rgba(183,201,177,0.18)]'
        }`}
      >
        <textarea
          id="chat-input-textarea"
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Aura AI anything... (Shift + Enter for new line)"
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent px-4 pt-3.5 pb-2 text-[15px] leading-relaxed text-[#F1E9D2] placeholder-[#6B8E7B] outline-none resize-none max-h-52 min-h-[48px]"
        />

        {/* Action toolbar inside input */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
          {/* Left tools: File attachment & Speech */}
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.txt,.md,.json,.js,.ts,.py"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              id="attach-file-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 p-2 rounded-xl text-[#B7C9B1] hover:text-[#F1E9D2] hover:bg-[#243B35] transition-colors cursor-pointer text-xs font-medium"
              title="Attach image or text document"
            >
              <Paperclip className="w-4 h-4" />
              <span className="hidden sm:inline">Attach</span>
            </button>

            <button
              id="voice-dictate-btn"
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                isListening
                  ? 'bg-amber-500/20 text-amber-300 animate-pulse border border-amber-500/40'
                  : 'text-[#B7C9B1] hover:text-[#F1E9D2] hover:bg-[#243B35]'
              }`}
              title={isListening ? 'Stop listening' : 'Voice dictation'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right tool: Send or Stop */}
          <div className="flex items-center gap-2">
            {isLoading ? (
              <button
                id="stop-generating-btn"
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#243B35] hover:bg-[#35574D] text-[#F1E9D2] border border-[#6B8E7B]/40 text-xs font-semibold hover:opacity-95 transition-all cursor-pointer shadow-sm"
              >
                <Square className="w-3.5 h-3.5 fill-current text-amber-300" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                id="send-message-btn"
                type="submit"
                disabled={!canSubmit}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  canSubmit
                    ? 'bg-[#243B35] hover:bg-[#35574D] text-[#F1E9D2] border border-[#B7C9B1]/50 shadow-md shadow-[#121E1B]/50 hover:shadow-[0_0_15px_rgba(183,201,177,0.25)] active:scale-95'
                    : 'bg-[#182622]/60 text-[#6B8E7B]/40 border border-[#6B8E7B]/15 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <Send className="w-4 h-4 text-[#B7C9B1]" />
              </button>
            )}
          </div>
        </div>
      </form>

      <div className="flex items-center justify-center gap-2 mt-2 text-[11px] text-[#6B8E7B] tracking-wide">
        <span>Aura AI can make mistakes. Verify important information.</span>
      </div>
    </div>
  );
};


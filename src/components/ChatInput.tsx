import React, {
  ChangeEvent,
  DragEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import { Attachment } from "../types";

interface ChatInputProps {
  value?: string;
  onChange?: (value: string) => void;

  onSendMessage: (
    text: string,
    attachments: Attachment[]
  ) => void;

  onStopGeneration?: () => void;

  isLoading: boolean;

  disabled?: boolean;

  initialText?: string;
}

export const ChatInput: React.FC<
  ChatInputProps
> = ({
  value,
  onChange,
  onSendMessage,
  onStopGeneration,
  isLoading,
  disabled = false,
  initialText = "",
}) => {
  const [internalInput, setInternalInput] =
    useState(initialText);

  const [attachments, setAttachments] =
    useState<Attachment[]>([]);

  const [isDragging, setIsDragging] =
    useState(false);

  const [isListening, setIsListening] =
    useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const recognitionRef =
    useRef<any>(null);

  const isControlled =
    value !== undefined;

  const input = isControlled
    ? value
    : internalInput;

  const setInput = (nextValue: string) => {
    if (!isControlled) {
      setInternalInput(nextValue);
    }

    onChange?.(nextValue);
  };

  useEffect(() => {
    if (
      !isControlled &&
      initialText
    ) {
      setInternalInput(initialText);
    }
  }, [
    initialText,
    isControlled,
  ]);

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "auto";

    const nextHeight = Math.min(
      Math.max(
        textarea.scrollHeight,
        48
      ),
      180
    );

    textarea.style.height =
      `${nextHeight}px`;
  }, [input]);

  const createAttachment =
    async (
      file: File
    ): Promise<Attachment | null> => {
      if (
        file.size >
        10 * 1024 * 1024
      ) {
        return null;
      }

      return new Promise(
        (resolve) => {
          const reader =
            new FileReader();

          reader.onload = () => {
            const result =
              String(
                reader.result || ""
              );

            resolve({
              id: `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2, 8)}`,
              name: file.name,
              mimeType:
                file.type ||
                "application/octet-stream",
              size: file.size,
              data: result,
            } as Attachment);
          };

          reader.onerror = () =>
            resolve(null);

          reader.readAsDataURL(file);
        }
      );
    };

  const addFiles = async (
    files: FileList | File[]
  ) => {
    const fileArray =
      Array.from(files);

    const created =
      await Promise.all(
        fileArray.map(
          createAttachment
        )
      );

    const valid =
      created.filter(
        Boolean
      ) as Attachment[];

    if (valid.length > 0) {
      setAttachments(
        (current) => [
          ...current,
          ...valid,
        ]
      );
    }
  };

  const handleFileChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      await addFiles(
        event.target.files
      );
    }

    event.target.value = "";
  };

  const handleDrop = async (
    event: DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setIsDragging(false);

    if (
      event.dataTransfer.files.length
    ) {
      await addFiles(
        event.dataTransfer.files
      );
    }
  };

  const handleSubmit = () => {
    if (isLoading) {
      onStopGeneration?.();
      return;
    }

    if (disabled) return;

    const trimmed =
      input.trim();

    if (
      !trimmed &&
      attachments.length === 0
    ) {
      return;
    }

    onSendMessage(
      trimmed,
      attachments
    );

    setInput("");
    setAttachments([]);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (!isLoading) {
        handleSubmit();
      }
    }
  };

  const removeAttachment = (
    id: string
  ) => {
    setAttachments(
      (current) =>
        current.filter(
          (attachment) =>
            attachment.id !== id
        )
    );
  };

  const startVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any)
        .SpeechRecognition ||
      (window as any)
        .webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang =
      navigator.language ||
      "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (
      event: any
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      setInput(
        transcript
      );
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current =
      recognition;

    recognition.start();
  };

  const canSubmit =
    (input.trim().length > 0 ||
      attachments.length > 0) &&
    !disabled;

  return (
    <div
      className={`w-full rounded-2xl border bg-black/20 shadow-2xl backdrop-blur-xl transition-all ${
        isDragging
          ? "border-[var(--app-accent)]"
          : "border-white/10"
      }`}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => {
        setIsDragging(false);
      }}
      onDrop={handleDrop}
    >
      {attachments.length > 0 && (
        <div className="flex gap-2 overflow-x-auto border-b border-white/10 p-2">
          {attachments.map(
            (attachment) => (
              <div
                key={attachment.id}
                className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs"
              >
                <span className="max-w-[160px] truncate">
                  {attachment.name}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeAttachment(
                      attachment.id
                    )
                  }
                  className="rounded-full px-1 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Remove attachment"
                >
                  ×
                </button>
              </div>
            )
          )}
        </div>
      )}

      <div className="flex items-end gap-2 p-2">
        {/* ATTACHMENT */}
        <button
          type="button"
          onClick={() =>
            fileInputRef.current?.click()
          }
          disabled={disabled || isLoading}
          className="mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
          aria-label="Attach file"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept="image/*,.pdf,.txt,.md,.json,.js,.ts,.py"
          onChange={handleFileChange}
        />

        {/* TEXTAREA */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(event) =>
            setInput(
              event.target.value
            )
          }
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={
            isLoading
              ? "Ahemad's AI is responding..."
              : "Message Ahemad's AI..."
          }
          rows={1}
          className="min-h-[48px] max-h-[180px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-2 py-3 text-[var(--chat-input-size)] leading-6 text-white outline-none placeholder:text-white/35"
        />

        {/* VOICE */}
        <button
          type="button"
          onClick={startVoiceInput}
          disabled={disabled || isLoading}
          className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            isListening
              ? "bg-[var(--app-accent)] text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          } disabled:opacity-40`}
          aria-label="Voice input"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect
              x="9"
              y="2"
              width="6"
              height="13"
              rx="3"
            />
            <path d="M5 10a7 7 0 0014 0" />
            <path d="M12 19v3" />
            <path d="M8 22h8" />
          </svg>
        </button>

        {/* SEND / STOP */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={
            !isLoading &&
            !canSubmit
          }
          className={`mb-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
            isLoading
              ? "bg-red-500 text-white hover:bg-red-600"
              : canSubmit
                ? "bg-[var(--app-accent)] text-white hover:opacity-90"
                : "bg-white/10 text-white/30"
          }`}
          aria-label={
            isLoading
              ? "Stop generating"
              : "Send message"
          }
        >
          {isLoading ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
              />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13" />
              <path d="M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          )}
        </button>
      </div>

      {/* SMALL FOOTER */}
      <div className="flex items-center justify-between px-3 pb-2 text-[10px] text-white/30">
        <span>
          Enter to send · Shift + Enter for new line
        </span>

        {isDragging && (
          <span className="text-[var(--app-accent)]">
            Drop file here
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatInput;

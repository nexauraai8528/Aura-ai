import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ language = 'text', value }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const displayLanguage = language.replace(/^language-/, '') || 'code';

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-[#6B8E7B]/30 bg-[#14211D] text-[#F1E9D2] shadow-md shadow-[#121E1B]/60 group">
      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1A2B26] border-b border-[#6B8E7B]/25 text-xs font-mono">
        <span className="uppercase tracking-wider font-semibold text-[#B7C9B1] text-[11px]">
          {displayLanguage}
        </span>
        <button
          id={`copy-code-btn-${displayLanguage}`}
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#243B35] hover:bg-[#2D4942] text-[#F1E9D2] border border-[#6B8E7B]/35 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#B7C9B1]" />
              <span className="text-[#B7C9B1] font-medium">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-[#B7C9B1]" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono">
        <pre className="text-[#F1E9D2]/95">
          <code>{value}</code>
        </pre>
      </div>
    </div>
  );
};


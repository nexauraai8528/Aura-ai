import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  language?: string;
  value: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  language = 'text',
  value,
}) => {
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

  const displayLanguage =
    language.replace(/^language-/, '') || 'code';

  return (
    <div className="relative my-4 rounded-xl overflow-hidden border border-purple-500/25 bg-[#0F0D1D] text-zinc-100 shadow-lg shadow-purple-950/20 group">

      {/* Code Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#17132A] border-b border-purple-500/20 text-xs font-mono">

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-purple-400 shadow-sm shadow-purple-400/60" />

          <span className="uppercase tracking-wider font-semibold text-purple-200 text-[11px]">
            {displayLanguage}
          </span>
        </div>

        <button
          id={`copy-code-btn-${displayLanguage}`}
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#211B3D] hover:bg-[#31205A] text-zinc-100 border border-purple-500/25 transition-colors cursor-pointer"
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-300" />
              <span className="text-green-300 font-medium">
                Copied
              </span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-purple-300" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto text-[13.5px] leading-relaxed font-mono scrollbar-thin">
        <pre className="text-zinc-200">
          <code>{value}</code>
        </pre>
      </div>

      {/* Small Branding */}
      <div className="px-4 py-1.5 border-t border-purple-500/10 bg-[#0C0A16]">
        <span className="text-[9px] text-purple-300/50 tracking-wide">
          Ahemad's AI • Powered by Nexaura Tech
        </span>
      </div>
    </div>
  );
};

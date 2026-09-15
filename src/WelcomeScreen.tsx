import React from 'react';
import {
  Sparkles,
  BookOpen,
  PenTool,
  Code2,
  FileText,
  AlignLeft,
  Lightbulb,
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectPrompt: (promptText: string) => void;
}

const SUGGESTED_PROMPTS = [
  {
    icon: BookOpen,
    category: 'Explain',
    title: 'Explain a topic to me',
    prompt: 'Explain the concept of quantum computing in beginner-friendly language with real-world analogies.',
  },
  {
    icon: PenTool,
    category: 'Writing',
    title: 'Help me write something',
    prompt: 'Help me write an elegant, persuasive product launch announcement email for a modern software tool.',
  },
  {
    icon: Code2,
    category: 'Programming',
    title: 'Help me learn programming',
    prompt: 'Help me learn how async/await and Promises work in JavaScript with clear, step-by-step examples.',
  },
  {
    icon: FileText,
    category: 'Analysis',
    title: 'Analyze this document',
    prompt: 'What are the key best practices for conducting deep analytical research on complex topics?',
  },
  {
    icon: AlignLeft,
    category: 'Summary',
    title: 'Summarize this text',
    prompt: 'Summarize the core principles of cognitive load theory and how they apply to user interface design.',
  },
  {
    icon: Lightbulb,
    category: 'Problem Solving',
    title: 'Help me solve a problem',
    prompt: 'Help me break down and solve a difficult technical trade-off between database speed and data consistency.',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectPrompt }) => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full text-center relative z-10">
      {/* Brand Icon & Welcome Title */}
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#243B35] via-[#35574D] to-[#6B8E7B] flex items-center justify-center text-[#F1E9D2] shadow-2xl shadow-[#121E1B]/70 border border-[#B7C9B1]/30 mx-auto">
          <Sparkles className="w-8 h-8 text-[#B7C9B1]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#B7C9B1] border-2 border-[#182622] flex items-center justify-center shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#243B35]" />
        </div>
      </div>

      <h1 className="font-luxury text-3xl md:text-5xl font-bold tracking-tight text-[#F1E9D2] mb-3">
        Welcome to <span className="italic text-[#B7C9B1]">Aura AI</span>
      </h1>
      <p className="text-sm md:text-base text-[#F1E9D2]/85 max-w-xl mx-auto mb-8 font-light leading-relaxed">
        Your intelligent AI assistant crafted with Sage Serenity. Grounded in calm precision and powered by Gemini. Ask anything, upload documents, or choose a prompt to begin.
      </p>

      {/* Suggestion Cards Grid (6 requested prompt cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 w-full text-left">
        {SUGGESTED_PROMPTS.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              id={`suggested-prompt-${index}`}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-4 rounded-2xl border border-[#6B8E7B]/25 bg-[#1E312C]/75 hover:bg-[#243B35]/90 hover:border-[#B7C9B1]/50 backdrop-blur-md shadow-sm hover:shadow-[0_0_16px_rgba(183,201,177,0.15)] transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg border border-[#6B8E7B]/30 bg-[#243B35] text-[#B7C9B1]">
                  <Icon className="w-4 h-4 text-[#B7C9B1]" />
                </div>
                <span className="text-[11px] font-semibold text-[#B7C9B1] uppercase tracking-wider">
                  {item.category}
                </span>
              </div>
              <h3 className="font-luxury text-sm font-semibold text-[#F1E9D2] group-hover:text-white transition-colors">
                {item.title}
              </h3>
              <p className="text-xs text-[#B7C9B1]/80 mt-1 line-clamp-2 leading-relaxed">
                "{item.prompt}"
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};


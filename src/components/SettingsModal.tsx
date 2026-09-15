import React from 'react';
import {
  X,
  Moon,
  Sun,
  Shield,
  Sparkles,
  Sliders,
  CheckCircle2,
  MessageSquare,
  Bot,
  Trash2,
  Zap,
} from 'lucide-react';
import {
  AppSettings,
  AssistantMode,
  HealthStatus,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  health: HealthStatus | null;
  onClearAllConversations: () => void;
  onResetAllData: () => void;
}

const MODES: {
  id: AssistantMode;
  title: string;
  desc: string;
  icon: string;
}[] = [
  {
    id: 'general',
    title: 'General Assistant',
    desc: 'Smart, friendly and versatile help for everyday questions.',
    icon: '🌟',
  },
  {
    id: 'coding',
    title: 'Coding Assistant',
    desc: 'Clean, reliable and production-ready programming assistance.',
    icon: '💻',
  },
  {
    id: 'tutor',
    title: 'Study Tutor',
    desc: 'Simple step-by-step explanations with practical examples.',
    icon: '📚',
  },
  {
    id: 'writing',
    title: 'Writing Assistant',
    desc: 'Improve writing, grammar, tone, clarity and structure.',
    icon: '✍️',
  },
  {
    id: 'research',
    title: 'Research Assistant',
    desc: 'Structured analysis, explanations and balanced viewpoints.',
    icon: '🔬',
  },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  health,
  onClearAllConversations,
  onResetAllData,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="settings-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        id="settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#100E1D] border border-purple-500/25 text-zinc-100 shadow-2xl shadow-purple-950/50 overflow-hidden"
      >

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-purple-500/15 bg-[#17132A]">
          <div className="flex items-center gap-2.5">

            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#4C2A85] to-[#4169E1] flex items-center justify-center text-white border border-purple-300/30 shadow-lg shadow-purple-950/30">
              <Sliders className="w-4 h-4" />
            </div>

            <div>
              <h2 className="font-luxury font-bold text-lg tracking-wide text-white">
                Ahemad's AI Settings
              </h2>

              <div className="flex flex-wrap items-center gap-1 text-[10px] text-purple-300/70 font-medium">
                <span>Founder &amp; Chief Architect</span>
                <span>•</span>
                <span>𝑬𝒓. 𝑨𝒉𝒆𝒎𝒂𝒅 𝑰𝒏𝒂𝒎𝒅𝒂𝒂𝒓</span>
              </div>
            </div>
          </div>

          <button
            id="close-settings-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-purple-300 hover:text-white hover:bg-purple-500/15 transition cursor-pointer"
            title="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-sm">

          {/* Appearance */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Appearance</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#17132A]/80 border border-purple-500/20 flex items-center justify-between">
              <div>
                <div className="font-medium text-white">
                  Ahemad's AI Theme
                </div>

                <div className="text-xs text-zinc-400">
                  {settings.theme === 'dark'
                    ? 'Futuristic Dark Canvas'
                    : 'Light Canvas'}
                </div>
              </div>

              <div className="flex items-center gap-1.5 p-1 bg-[#0D0B17] rounded-lg border border-purple-500/20">

                <button
                  id="theme-btn-dark"
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ theme: 'dark' })
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-gradient-to-r from-[#5B3FA7] to-[#4169E1] text-white shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>

                <button
                  id="theme-btn-light"
                  type="button"
                  onClick={() =>
                    onUpdateSettings({ theme: 'light' })
                  }
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-gradient-to-r from-[#5B3FA7] to-[#4169E1] text-white shadow-lg'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>
          </section>

          {/* Assistant Mode */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5" />
              <span>Assistant Mode</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {MODES.map((m) => {
                const isSelected =
                  settings.activeMode === m.id;

                return (
                  <button
                    key={m.id}
                    id={`settings-mode-${m.id}`}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        activeMode: m.id,
                      })
                    }
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#211B3D] border-purple-400/60 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                        : 'bg-[#17132A]/50 border-purple-500/15 hover:border-purple-500/35 hover:bg-[#211B3D]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">

                      <div className="flex items-center gap-2 font-medium text-white">
                        <span>{m.icon}</span>
                        <span>{m.title}</span>
                      </div>

                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-purple-300" />
                      )}
                    </div>

                    <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                      {m.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Chat Behavior */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat Behavior</span>
            </div>

            <div className="space-y-2 p-3.5 rounded-xl bg-[#17132A]/80 border border-purple-500/20">

              {/* Enter to Send */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-white">
                    Enter to Send
                  </div>
                  <div className="text-xs text-zinc-400">
                    Press Shift+Enter for new lines
                  </div>
                </div>

                <input
                  id="toggle-enter-to-send"
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) =>
                    onUpdateSettings({
                      enterToSend: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
              </label>

              <hr className="border-purple-500/10" />

              {/* Streaming */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-white">
                    Streaming Responses
                  </div>
                  <div className="text-xs text-zinc-400">
                    Display responses progressively
                  </div>
                </div>

                <input
                  id="toggle-streaming"
                  type="checkbox"
                  checked={settings.streamingEnabled}
                  onChange={(e) =>
                    onUpdateSettings({
                      streamingEnabled: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
              </label>

              <hr className="border-purple-500/10" />

              {/* Auto Scroll */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-white">
                    Auto-Scroll
                  </div>
                  <div className="text-xs text-zinc-400">
                    Follow new AI responses automatically
                  </div>
                </div>

                <input
                  id="toggle-auto-scroll"
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) =>
                    onUpdateSettings({
                      autoScroll: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-purple-500 rounded cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Intelligence */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" />
              <span>AI Intelligence</span>
            </div>

            <div className="p-4 rounded-xl bg-[#17132A]/80 border border-purple-500/20">

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#5B3FA7] to-[#4169E1] flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1">
                  <div className="font-semibold text-white">
                    Ahemad's AI Engine
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Intelligent responses powered by the secure
                    Ahemad's AI backend.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-medium border ${
                        health?.hasApiKey
                          ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-300 border-red-500/20'
                      }`}
                    >
                      {health?.hasApiKey
                        ? 'Engine Active'
                        : 'Engine Unavailable'}
                    </span>

                    {health?.isRateLimited && (
                      <span className="px-2 py-1 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20">
                        Temporarily Busy
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-purple-500/10 text-[10px] text-purple-300/50">
                Internal engine details are hidden from the
                user interface.
              </div>
            </div>
          </section>

          {/* Founder */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>About Ahemad's AI</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#211B3D] to-[#111022] border border-purple-500/20">

              <div className="text-center">
                <div className="text-xs text-purple-300/70">
                  Founder &amp; Chief Architect
                </div>

                <div className="font-luxury text-xl font-semibold text-white mt-1">
                  𝑬𝒓. 𝑨𝒉𝒆𝒎𝒂𝒅 𝑰𝒏𝒂𝒎𝒅𝒂𝒂𝒓
                </div>

                <div className="text-xs text-zinc-400 mt-1">
                  Full Name: Ahemad Rehan
                </div>

                <div className="text-xs text-purple-300/70 mt-2">
                  Powered by Nexaura Tech
                </div>
              </div>
            </div>
          </section>

          {/* Privacy & Storage */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-300 uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy &amp; Storage</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#17132A]/80 border border-purple-500/20 space-y-3">

              {/* Clear Chats */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-white">
                    Clear Chat History
                  </div>

                  <div className="text-xs text-zinc-400">
                    Remove all stored conversations
                  </div>
                </div>

                <button
                  id="clear-all-conversations-btn"
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'Are you sure you want to clear all conversation history?'
                      )
                    ) {
                      onClearAllConversations();
                      onClose();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-medium transition cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <hr className="border-purple-500/10" />

              {/* Reset Data */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-white">
                    Reset All Data
                  </div>

                  <div className="text-xs text-zinc-400">
                    Reset chats, settings and cached state
                  </div>
                </div>

                <button
                  id="reset-all-data-btn"
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        'This will wipe all conversations and reset all settings to defaults. Proceed?'
                      )
                    ) {
                      onResetAllData();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-medium transition cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-purple-500/15 bg-[#17132A] flex items-center justify-between">

          <div className="text-[9px] text-purple-300/50">
            Ahemad's AI • Nexaura Tech
          </div>

          <button
            id="done-settings-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#5B3FA7] to-[#4169E1] hover:from-[#6D4CC2] hover:to-[#4F7BFF] text-white font-semibold text-xs border border-purple-300/30 shadow-lg shadow-purple-950/30 transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

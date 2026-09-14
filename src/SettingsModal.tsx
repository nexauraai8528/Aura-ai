import React from 'react';
import { X, Moon, Sun, Cpu, Shield, Sparkles, Trash2, Sliders, CheckCircle2, MessageSquare, Bot } from 'lucide-react';
import { AppSettings, AssistantMode, HealthStatus, ThemeMode } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  health: HealthStatus | null;
  onClearAllConversations: () => void;
  onResetAllData: () => void;
}

const MODES: { id: AssistantMode; title: string; desc: string; icon: string }[] = [
  {
    id: 'general',
    title: 'General Assistant',
    desc: 'Calm, thoughtful, versatile companion for everyday queries.',
    icon: '🌟',
  },
  {
    id: 'coding',
    title: 'Coding Assistant',
    desc: 'Expert systems architect. Type-safe, production-ready code blocks.',
    icon: '💻',
  },
  {
    id: 'tutor',
    title: 'Study Tutor',
    desc: 'Patient, pedagogical breakdowns with intuitive analogies and checks.',
    icon: '📚',
  },
  {
    id: 'writing',
    title: 'Writing Assistant',
    desc: 'Polishes tone, rhythm, vocabulary, copy, and long-form narrative.',
    icon: '✍️',
  },
  {
    id: 'research',
    title: 'Research Assistant',
    desc: 'Rigorous analytical syntheses, methodologies, and counterpoints.',
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
      className="fixed inset-0 z-50 bg-[#121E1B]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn"
    >
      <div
        id="settings-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl bg-[#1E312C] border border-[#6B8E7B]/35 text-[#F1E9D2] shadow-2xl shadow-[#121E1B]/90 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#6B8E7B]/20 bg-[#243B35]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#243B35] to-[#6B8E7B] flex items-center justify-center text-[#F1E9D2] border border-[#B7C9B1]/30 shadow-xs">
              <Sliders className="w-4 h-4 text-[#B7C9B1]" />
            </div>
            <div>
              <h2 className="font-luxury font-bold text-lg tracking-wide text-[#F1E9D2]">
                Aura AI Settings
              </h2>
              <span className="text-[11px] text-[#B7C9B1]/80 font-medium">Sage Serenity System</span>
            </div>
          </div>
          <button
            id="close-settings-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#B7C9B1] hover:text-[#F1E9D2] hover:bg-[#6B8E7B]/20 transition cursor-pointer"
            title="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin text-sm">
          {/* Section: Appearance */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7C9B1] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Appearance</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#243B35]/70 border border-[#6B8E7B]/25 flex items-center justify-between">
              <div>
                <div className="font-medium text-[#F1E9D2]">Sage Serenity Theme</div>
                <div className="text-xs text-[#B7C9B1]/80">
                  {settings.theme === 'dark' ? 'Forest Slate Dark Canvas' : 'Warm Cream Light Canvas'}
                </div>
              </div>
              <div className="flex items-center gap-1.5 p-1 bg-[#182622] rounded-lg border border-[#6B8E7B]/30">
                <button
                  id="theme-btn-dark"
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'dark' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    settings.theme === 'dark'
                      ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-xs'
                      : 'text-[#B7C9B1]/70 hover:text-[#F1E9D2]'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Dark</span>
                </button>
                <button
                  id="theme-btn-light"
                  type="button"
                  onClick={() => onUpdateSettings({ theme: 'light' })}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition cursor-pointer ${
                    settings.theme === 'light'
                      ? 'bg-[#6B8E7B] text-[#F1E9D2] shadow-xs'
                      : 'text-[#B7C9B1]/70 hover:text-[#F1E9D2]'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Light</span>
                </button>
              </div>
            </div>
          </section>

          {/* Section: AI Assistant Mode */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7C9B1] uppercase tracking-wider">
              <Bot className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Assistant Mode</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {MODES.map((m) => {
                const isSelected = settings.activeMode === m.id;
                return (
                  <button
                    key={m.id}
                    id={`settings-mode-${m.id}`}
                    type="button"
                    onClick={() => onUpdateSettings({ activeMode: m.id })}
                    className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#243B35] border-[#B7C9B1] shadow-[0_0_12px_rgba(183,201,177,0.15)]'
                        : 'bg-[#243B35]/40 border-[#6B8E7B]/20 hover:border-[#6B8E7B]/40 hover:bg-[#243B35]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2 font-medium text-[#F1E9D2]">
                        <span>{m.icon}</span>
                        <span>{m.title}</span>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B7C9B1]" />}
                    </div>
                    <p className="text-xs text-[#B7C9B1]/80 pl-6 leading-relaxed">{m.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Section: Chat Behavior */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7C9B1] uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Chat Behavior</span>
            </div>
            <div className="space-y-2 p-3.5 rounded-xl bg-[#243B35]/70 border border-[#6B8E7B]/25">
              {/* Enter to send */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-[#F1E9D2]">Enter to Send</div>
                  <div className="text-xs text-[#B7C9B1]/80">Press Shift+Enter for new lines</div>
                </div>
                <input
                  id="toggle-enter-to-send"
                  type="checkbox"
                  checked={settings.enterToSend}
                  onChange={(e) => onUpdateSettings({ enterToSend: e.target.checked })}
                  className="w-4 h-4 accent-[#6B8E7B] rounded cursor-pointer"
                />
              </label>

              <hr className="border-[#6B8E7B]/20" />

              {/* Streaming */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-[#F1E9D2]">Streaming Responses</div>
                  <div className="text-xs text-[#B7C9B1]/80">Display text chunk-by-chunk in real time</div>
                </div>
                <input
                  id="toggle-streaming"
                  type="checkbox"
                  checked={settings.streamingEnabled}
                  onChange={(e) => onUpdateSettings({ streamingEnabled: e.target.checked })}
                  className="w-4 h-4 accent-[#6B8E7B] rounded cursor-pointer"
                />
              </label>

              <hr className="border-[#6B8E7B]/20" />

              {/* Auto Scroll */}
              <label className="flex items-center justify-between cursor-pointer py-1">
                <div>
                  <div className="font-medium text-[#F1E9D2]">Auto-Scroll</div>
                  <div className="text-xs text-[#B7C9B1]/80">Follow incoming AI responses automatically</div>
                </div>
                <input
                  id="toggle-auto-scroll"
                  type="checkbox"
                  checked={settings.autoScroll}
                  onChange={(e) => onUpdateSettings({ autoScroll: e.target.checked })}
                  className="w-4 h-4 accent-[#6B8E7B] rounded cursor-pointer"
                />
              </label>
            </div>
          </section>

          {/* Section: Engine / Model Info */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7C9B1] uppercase tracking-wider">
              <Cpu className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Model & Intelligence</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#243B35]/70 border border-[#6B8E7B]/25 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#B7C9B1]">AI Engine</span>
                <span className="font-medium text-[#F1E9D2]">Google Gemini</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B7C9B1]">Configured Model</span>
                <span className="font-mono text-[#F1E9D2]">{health?.model || 'gemini-3.8-flash'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B7C9B1]">Active Model</span>
                <span className="font-mono text-[#B7C9B1]">{health?.activeModel || health?.model || 'gemini-3.8-flash'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#B7C9B1]">API Key Status</span>
                <span className="text-emerald-400 font-medium">
                  {health?.hasApiKey ? 'Configured & Active' : 'Missing Key'}
                </span>
              </div>
            </div>
          </section>

          {/* Section: Privacy & Data Management */}
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B7C9B1] uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 text-[#6B8E7B]" />
              <span>Privacy & Storage</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#243B35]/70 border border-[#6B8E7B]/25 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#F1E9D2]">Clear Chat History</div>
                  <div className="text-xs text-[#B7C9B1]/80">Remove all stored conversations</div>
                </div>
                <button
                  id="clear-all-conversations-btn"
                  type="button"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all conversation history?')) {
                      onClearAllConversations();
                      onClose();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 text-red-300 border border-red-500/30 text-xs font-medium transition cursor-pointer"
                >
                  Clear Chats
                </button>
              </div>

              <hr className="border-[#6B8E7B]/20" />

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-[#F1E9D2]">Reset All Data</div>
                  <div className="text-xs text-[#B7C9B1]/80">Wipe chats, settings, and cached state</div>
                </div>
                <button
                  id="reset-all-data-btn"
                  type="button"
                  onClick={() => {
                    if (window.confirm('This will wipe all conversations and reset all settings to defaults. Proceed?')) {
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
        <div className="px-6 py-3 border-t border-[#6B8E7B]/20 bg-[#243B35] flex justify-end">
          <button
            id="done-settings-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#6B8E7B] hover:bg-[#7D9F8D] text-[#F1E9D2] font-semibold text-xs border border-[#B7C9B1]/40 shadow-sm transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

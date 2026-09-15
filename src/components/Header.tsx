import React from 'react';
import { Menu, Plus, Sparkles, Sun, Moon, CheckCircle2, AlertCircle, Settings as SettingsIcon } from 'lucide-react';
import { ThemeMode, HealthStatus, AssistantMode } from '../types';

interface HeaderProps {
  onToggleSidebar: () => void;
  onNewChat: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  health: HealthStatus | null;
  activeChatTitle?: string;
  onOpenSettings: () => void;
  activeMode?: AssistantMode;
}

const MODE_LABELS: Record<AssistantMode, { name: string; emoji: string }> = {
  general: { name: 'General', emoji: '🌟' },
  coding: { name: 'Coding', emoji: '💻' },
  tutor: { name: 'Tutor', emoji: '📚' },
  writing: { name: 'Writing', emoji: '✍️' },
  research: { name: 'Research', emoji: '🔬' },
};

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  theme,
  onToggleTheme,
  health,
  activeChatTitle,
  onOpenSettings,
  activeMode = 'general',
}) => {
  const currentModeInfo = MODE_LABELS[activeMode] || MODE_LABELS.general;

  return (
    <header className="h-14 border-b border-[#6B8E7B]/25 bg-[#1E312C]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 transition-colors">
      {/* Left items: Menu button & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="toggle-sidebar-btn"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-[#F1E9D2] hover:text-white hover:bg-[#243B35] border border-transparent hover:border-[#6B8E7B]/30 transition cursor-pointer"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#243B35] via-[#35574D] to-[#6B8E7B] flex items-center justify-center text-[#F1E9D2] border border-[#B7C9B1]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B7C9B1]" />
            </div>
            <span className="font-luxury font-bold text-base tracking-wide text-[#F1E9D2]">
              Aura AI
            </span>
          </div>

          {activeChatTitle && (
            <span className="hidden sm:inline-block text-xs font-medium text-[#B7C9B1] truncate max-w-[160px] md:max-w-[260px] lg:max-w-[340px] pl-2 border-l border-[#6B8E7B]/30">
              {activeChatTitle}
            </span>
          )}
        </div>
      </div>

      {/* Right items: Mode pill, model status, theme toggle, settings, new chat */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mode pill trigger */}
        <button
          id="header-mode-indicator-btn"
          type="button"
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#243B35] hover:bg-[#2D4740] border border-[#6B8E7B]/35 text-[11px] text-[#F1E9D2] transition cursor-pointer"
          title="Assistant Mode (Click to customize in Settings)"
        >
          <span>{currentModeInfo.emoji}</span>
          <span className="font-medium text-[#B7C9B1]">{currentModeInfo.name}</span>
        </button>

        {/* Model / Health Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#182622] border border-[#6B8E7B]/30 text-[11px] text-[#F1E9D2] font-mono shadow-xs">
          {health?.hasApiKey ? (
            <>
              <CheckCircle2 className={`w-3 h-3 ${health.isRateLimited ? 'text-amber-400' : 'text-[#B7C9B1]'}`} />
              <span className="text-[#F1E9D2]/90">
                {health.isRateLimited ? (health.activeModel || 'gemini-3.6-flash') : (health.model || 'gemini-3.8-flash')}
              </span>
              {health.isRateLimited && (
                <span className="text-[10px] text-amber-300 font-sans px-1 bg-amber-500/20 rounded">
                  failover
                </span>
              )}
            </>
          ) : (
            <>
              <AlertCircle className="w-3 h-3 text-[#B7C9B1]" />
              <span className="text-[#B7C9B1]">API Key Required</span>
            </>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-[#F1E9D2]/90 hover:text-[#F1E9D2] hover:bg-[#243B35] border border-transparent hover:border-[#6B8E7B]/30 transition cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#B7C9B1]" />
          ) : (
            <Moon className="w-4 h-4 text-[#B7C9B1]" />
          )}
        </button>

        {/* Settings button */}
        <button
          id="header-settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-[#F1E9D2]/90 hover:text-[#F1E9D2] hover:bg-[#243B35] border border-transparent hover:border-[#6B8E7B]/30 transition cursor-pointer"
          title="Open Settings"
        >
          <SettingsIcon className="w-4 h-4 text-[#B7C9B1]" />
        </button>

        {/* New Chat Quick Button */}
        <button
          id="header-new-chat-btn"
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6B8E7B] hover:bg-[#7D9F8D] text-[#F1E9D2] border border-[#B7C9B1]/30 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import {
  Menu,
  Plus,
  Sparkles,
  Sun,
  Moon,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  ThemeMode,
  HealthStatus,
  AssistantMode,
} from '../types';

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

const MODE_LABELS: Record<
  AssistantMode,
  { name: string; emoji: string }
> = {
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
  const currentModeInfo =
    MODE_LABELS[activeMode] || MODE_LABELS.general;

  return (
    <header className="h-14 border-b border-[#8B5CF6]/20 bg-[#0F0F1E]/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-30 transition-colors">

      {/* Left: Menu + Brand */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          id="toggle-sidebar-btn"
          type="button"
          onClick={onToggleSidebar}
          className="p-2 -ml-1 rounded-xl text-[#E4E4E7] hover:text-white hover:bg-[#211B40] border border-transparent hover:border-[#8B5CF6]/30 transition cursor-pointer"
          title="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-[#31215F] via-[#5B3AAE] to-[#4F8CFF] flex items-center justify-center text-white border border-[#A78BFA]/30 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
            </div>

            <span className="font-luxury font-bold text-base tracking-wide text-white">
              Ahemad's AI
            </span>
          </div>

          {activeChatTitle && (
            <span className="hidden sm:inline-block text-xs font-medium text-[#A1A1AA] truncate max-w-[160px] md:max-w-[260px] lg:max-w-[340px] pl-2 border-l border-[#8B5CF6]/30">
              {activeChatTitle}
            </span>
          )}
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* Assistant Mode */}
        <button
          id="header-mode-indicator-btn"
          type="button"
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#211B40] hover:bg-[#292149] border border-[#8B5CF6]/30 text-[11px] text-[#E4E4E7] transition cursor-pointer"
          title="Assistant Mode - Open Settings"
        >
          <span>{currentModeInfo.emoji}</span>
          <span className="font-medium text-[#C4B5FD]">
            {currentModeInfo.name}
          </span>
        </button>

        {/* Founder Branding - Gemini Model Hidden */}
        <div className="hidden sm:flex flex-col items-end justify-center px-2.5 py-1 rounded-full bg-[#0B0B16] border border-[#8B5CF6]/20 shadow-xs leading-tight">
          <span className="text-[9px] font-semibold text-[#C4B5FD] tracking-wide">
            Founder &amp; Chief Architect
          </span>

          <span className="text-[10px] font-semibold text-white">
            Er. Ahemad Inamdaar
          </span>

          <span className="text-[8px] text-[#A1A1AA]">
            Powered by Nexaura Tech
          </span>
        </div>

        {/* Theme Toggle */}
        <button
          id="header-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          className="p-2 rounded-xl text-[#D4D4D8] hover:text-white hover:bg-[#211B40] border border-transparent hover:border-[#8B5CF6]/30 transition cursor-pointer"
          title={`Switch to ${
            theme === 'dark' ? 'light' : 'dark'
          } mode`}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-[#C4B5FD]" />
          ) : (
            <Moon className="w-4 h-4 text-[#C4B5FD]" />
          )}
        </button>

        {/* Settings */}
        <button
          id="header-settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="p-2 rounded-xl text-[#D4D4D8] hover:text-white hover:bg-[#211B40] border border-transparent hover:border-[#8B5CF6]/30 transition cursor-pointer"
          title="Open Settings"
        >
          <SettingsIcon className="w-4 h-4 text-[#C4B5FD]" />
        </button>

        {/* New Chat */}
        <button
          id="header-new-chat-btn"
          type="button"
          onClick={onNewChat}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#5B3AAE] to-[#4F6FFF] hover:from-[#6D4BC7] hover:to-[#5E7DFF] text-white border border-[#A78BFA]/30 text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          title="Start new conversation"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">New</span>
        </button>
      </div>
    </header>
  );
};

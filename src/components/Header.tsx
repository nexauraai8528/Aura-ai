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
  image: { name: 'Image', emoji: '🖼️' },
  video: { name: 'Video', emoji: '🎬' },
  voice: { name: 'Voice', emoji: '🎙️' },
};

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNewChat,
  theme,
  onToggleTheme,
  activeChatTitle,
  onOpenSettings,
  activeMode = 'general',
}) => {
  const currentModeInfo =
    MODE_LABELS[activeMode] || MODE_LABELS.general;

  return (
    <header
      className="
        sticky top-0
        h-14 sm:h-16
        w-full
        shrink-0
        z-50
        flex items-center justify-between
        px-2.5 sm:px-4
        border-b border-white/10
        bg-[#080812]/90
        backdrop-blur-xl
        shadow-[0_8px_30px_rgba(0,0,0,0.20)]
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-1.5 sm:gap-3 min-w-0">
        {/* MENU */}
        <button
          id="toggle-sidebar-btn"
          type="button"
          onClick={onToggleSidebar}
          aria-label="Open chat history"
          title="Chat History"
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-xl
            text-zinc-300
            hover:text-white
            hover:bg-white/10
            border border-transparent
            hover:border-violet-400/20
            transition-all
            active:scale-95
          "
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* BRAND */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="
              w-8 h-8
              rounded-xl
              flex items-center justify-center
              shrink-0
              bg-gradient-to-br
              from-violet-600
              via-purple-600
              to-blue-500
              border border-violet-300/20
              shadow-[0_0_20px_rgba(139,92,246,0.25)]
            "
          >
            <Sparkles className="w-4 h-4 text-white" />
          </div>

          <div className="min-w-0">
            <div className="text-sm sm:text-base font-bold tracking-wide text-white truncate">
              Ahemad's AI
            </div>

            <div className="hidden sm:block text-[9px] text-zinc-500 truncate">
              Powered by Nexaura Tech
            </div>
          </div>
        </div>

        {/* CHAT TITLE */}
        {activeChatTitle && (
          <div className="hidden md:flex items-center min-w-0 ml-1">
            <span className="text-zinc-600 mr-2">/</span>

            <span
              className="
                text-xs
                text-zinc-400
                truncate
                max-w-[180px]
                lg:max-w-[300px]
              "
              title={activeChatTitle}
            >
              {activeChatTitle}
            </span>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">

        {/* MODE */}
        <button
          id="header-mode-indicator-btn"
          type="button"
          onClick={onOpenSettings}
          title="Assistant Mode"
          className="
            hidden lg:flex
            items-center gap-1.5
            px-3 py-1.5
            rounded-full
            bg-violet-500/10
            border border-violet-400/20
            hover:bg-violet-500/20
            text-xs
            transition-all
          "
        >
          <span>{currentModeInfo.emoji}</span>

          <span className="text-violet-200 font-medium">
            {currentModeInfo.name}
          </span>
        </button>

        {/* FOUNDER */}
        <div
          className="
            hidden xl:flex
            flex-col
            items-end
            justify-center
            px-3
            py-1
            rounded-xl
            bg-white/[0.03]
            border border-white/[0.08]
            leading-tight
          "
        >
          <span className="text-[8px] text-violet-300 font-semibold tracking-wide">
            Founder &amp; Chief Architect
          </span>

          <span className="text-[9px] text-white font-semibold">
            Er. Ahemad Inamdaar
          </span>

          <span className="text-[7px] text-zinc-500">
            Nexaura Tech
          </span>
        </div>

        {/* THEME */}
        <button
          id="header-theme-toggle"
          type="button"
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          title={
            theme === 'dark'
              ? 'Switch to light mode'
              : 'Switch to dark mode'
          }
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-xl
            text-zinc-300
            hover:text-white
            hover:bg-white/10
            transition-all
            active:scale-95
          "
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-violet-300" />
          ) : (
            <Moon className="w-4 h-4 text-violet-300" />
          )}
        </button>

        {/* SETTINGS — ALWAYS VISIBLE */}
        <button
          id="header-settings-btn"
          type="button"
          onClick={onOpenSettings}
          aria-label="Open Settings"
          title="Settings"
          className="
            flex items-center justify-center
            w-10 h-10
            rounded-xl
            text-zinc-300
            hover:text-white
            hover:bg-violet-500/15
            hover:border-violet-400/20
            border border-transparent
            transition-all
            active:scale-95
          "
        >
          <SettingsIcon className="w-4 h-4 text-violet-300" />
        </button>

        {/* NEW CHAT */}
        <button
          id="header-new-chat-btn"
          type="button"
          onClick={onNewChat}
          aria-label="New Chat"
          title="New Chat"
          className="
            flex items-center justify-center
            gap-1.5
            h-10
            px-3 sm:px-3.5
            rounded-xl
            bg-gradient-to-r
            from-violet-600
            to-blue-600
            hover:from-violet-500
            hover:to-blue-500
            text-white
            border border-white/10
            shadow-[0_0_18px_rgba(99,102,241,0.20)]
            text-xs
            font-semibold
            transition-all
            active:scale-95
          "
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">
            New Chat
          </span>
        </button>
      </div>
    </header>
  );
};

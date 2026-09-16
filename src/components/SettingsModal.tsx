import React, { useEffect, useState } from 'react';
import {
  X,
  Settings,
  Moon,
  Sun,
  Monitor,
  Palette,
  Type,
  MessageSquare,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  ShieldCheck,
  Database,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Zap,
} from 'lucide-react';

import {
  AppSettings,
  AppTheme,
  AssistantMode,
  FontSize,
  HealthStatus,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  health: HealthStatus | null;
  onClearConversations: () => void;
  onResetApp: () => void;
}

const THEMES: {
  id: AppTheme;
  name: string;
  description: string;
  preview: string;
}[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep purple',
    preview:
      'bg-gradient-to-br from-[#080812] via-[#31215F] to-[#4F8CFF]',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue',
    preview:
      'bg-gradient-to-br from-[#061826] via-[#075985] to-[#22D3EE]',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple',
    preview:
      'bg-gradient-to-br from-[#181225] via-[#7C3AED] to-[#C4B5FD]',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Natural green',
    preview:
      'bg-gradient-to-br from-[#0B1713] via-[#315C48] to-[#86A789]',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Rich red',
    preview:
      'bg-gradient-to-br from-[#16090D] via-[#701A31] to-[#BE123C]',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Warm orange',
    preview:
      'bg-gradient-to-br from-[#1B100A] via-[#9A3412] to-[#FB923C]',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean neutral',
    preview:
      'bg-gradient-to-br from-[#09090B] via-[#27272A] to-[#71717A]',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Cyber glow',
    preview:
      'bg-gradient-to-br from-[#050509] via-[#172554] to-[#22D3EE]',
  },
  {
    id: 'pink',
    name: 'Pink',
    description: 'Modern rose',
    preview:
      'bg-gradient-to-br from-[#190A12] via-[#9D174D] to-[#F472B6]',
  },
];

const FONT_SIZES: {
  id: FontSize;
  name: string;
  className: string;
}[] = [
  {
    id: 'small',
    name: 'Small',
    className: 'text-sm',
  },
  {
    id: 'medium',
    name: 'Medium',
    className: 'text-base',
  },
  {
    id: 'large',
    name: 'Large',
    className: 'text-lg',
  },
  {
    id: 'extra-large',
    name: 'Extra Large',
    className: 'text-xl',
  },
];

const ASSISTANT_MODES: {
  id: AssistantMode;
  name: string;
  description: string;
}[] = [
  {
    id: 'general',
    name: 'General',
    description:
      'Balanced answers for everyday questions and tasks.',
  },
  {
    id: 'coding',
    name: 'Coding',
    description:
      'Programming, debugging, code explanations and development.',
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description:
      'Beginner-friendly learning with step-by-step explanations.',
  },
  {
    id: 'writing',
    name: 'Writing',
    description:
      'Writing, rewriting, editing and creative content.',
  },
  {
    id: 'research',
    name: 'Research',
    description:
      'Structured analysis and research-oriented responses.',
  },
  {
    id: 'image',
    name: 'Image',
    description:
      'Image-related assistance when supported.',
  },
  {
    id: 'video',
    name: 'Video',
    description:
      'Video-related assistance when supported.',
  },
  {
    id: 'voice',
    name: 'Voice',
    description:
      'Voice and speech-related assistance.',
  },
];

type Section =
  | 'appearance'
  | 'assistant'
  | 'chat'
  | 'privacy';

const SettingToggle: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}> = ({
  icon,
  title,
  description,
  enabled,
  onChange,
}) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className="w-full flex items-center gap-3 rounded-2xl border border-purple-500/15 bg-[#151329] p-4 text-left hover:border-purple-400/35 transition cursor-pointer"
    >
      <div
        className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
          enabled
            ? 'bg-purple-500/10 border-purple-400/20 text-purple-300'
            : 'bg-white/[0.03] border-white/10 text-zinc-500'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-zinc-200">
          {title}
        </p>

        <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
          {description}
        </p>
      </div>

      <div
        className={`w-10 h-5 rounded-full p-0.5 transition shrink-0 ${
          enabled ? 'bg-purple-500' : 'bg-zinc-700'
        }`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </div>
    </button>
  );
};

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  health,
  onClearConversations,
  onResetApp,
}) => {
  const [activeSection, setActiveSection] =
    useState<Section>('appearance');

  const [showClearConfirm, setShowClearConfirm] =
    useState(false);

  const [showResetConfirm, setShowResetConfirm] =
    useState(false);

  useEffect(() => {
    if (!isOpen) {
      setShowClearConfirm(false);
      setShowResetConfirm(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const currentTheme: AppTheme =
    settings.appTheme || 'midnight';

  const currentFontSize: FontSize =
    settings.fontSize || 'medium';

  const handleThemeChange = (theme: AppTheme) => {
    onUpdateSettings({
      appTheme: theme,
    });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    onUpdateSettings({
      fontSize,
    });
  };

  const handleModeChange = (mode: AssistantMode) => {
    onUpdateSettings({
      activeMode: mode,
    });
  };

  const handleThemeModeChange = (
    theme: 'light' | 'dark' | 'system'
  ) => {
    onUpdateSettings({
      theme,
    });
  };

  const handleClearConversations = () => {
    onClearConversations();
    setShowClearConfirm(false);
  };

  const handleResetApplication = () => {
    onResetApp();
    setShowResetConfirm(false);
    onClose();
  };

  const sections: {
    id: Section;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="w-4 h-4" />,
    },
    {
      id: 'assistant',
      label: 'Assistant',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'chat',
      label: 'Chat',
      icon: <MessageSquare className="w-4 h-4" />,
    },
    {
      id: 'privacy',
      label: 'Privacy & Data',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-md"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-5xl h-[min(760px,94vh)] rounded-3xl border border-purple-500/20 bg-[#0C0B16] shadow-2xl shadow-black/60 overflow-hidden flex flex-col">

        {/* Header */}
        <div className="h-16 shrink-0 border-b border-white/10 flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
              <Settings className="w-4 h-4 text-purple-300" />
            </div>

            <div>
              <h2 className="text-sm sm:text-base font-semibold text-white">
                Ahemad's AI Settings
              </h2>

              <p className="text-[10px] sm:text-[11px] text-zinc-500">
                Customize your AI experience
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main */}
        <div className="flex-1 min-h-0 flex">

          {/* Sidebar */}
          <aside className="w-48 sm:w-56 shrink-0 border-r border-white/10 p-3 overflow-y-auto">
            <div className="space-y-1">
              {sections.map((section) => {
                const selected =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(section.id)
                    }
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition cursor-pointer ${
                      selected
                        ? 'bg-purple-500/10 text-purple-200 border border-purple-400/20'
                        : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent'
                    }`}
                  >
                    {section.icon}

                    <span className="text-xs font-medium">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 px-3">
              <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                Ahemad's AI
              </p>

              <p className="text-[10px] text-zinc-500 mt-2">
                Founder &amp; Chief Architect
              </p>

              <p className="text-[11px] text-purple-300 mt-0.5">
                𝑬𝒓. 𝑨𝒉𝒆𝒎𝒂𝒅 𝑰𝒏𝒂𝒎𝒅𝒂𝒂𝒓
              </p>

              <p className="text-[9px] text-zinc-600 mt-1">
                Powered by Nexaura Tech
              </p>
            </div>
          </aside>

          {/* Content */}
          <main className="flex-1 min-w-0 overflow-y-auto p-5 sm:p-7">

            {/* Appearance */}
            {activeSection === 'appearance' && (
              <section className="space-y-8">

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Appearance
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Change the look and feel of Ahemad's AI.
                  </p>
                </div>

                {/* Display mode */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 text-purple-300" />

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Display mode
                      </h4>

                      <p className="text-[11px] text-zinc-500">
                        Choose light, dark, or follow your device.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">

                    <button
                      type="button"
                      onClick={() =>
                        handleThemeModeChange('light')
                      }
                      className={`rounded-xl border p-3 transition cursor-pointer ${
                        settings.theme === 'light'
                          ? 'border-purple-400/60 bg-purple-500/10'
                          : 'border-white/10 bg-[#151329] hover:border-purple-400/30'
                      }`}
                    >
                      <Sun className="w-5 h-5 text-zinc-200 mb-2" />

                      <p className="text-xs font-semibold text-white">
                        Light
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleThemeModeChange('dark')
                      }
                      className={`rounded-xl border p-3 transition cursor-pointer ${
                        settings.theme === 'dark'
                          ? 'border-purple-400/60 bg-purple-500/10'
                          : 'border-white/10 bg-[#151329] hover:border-purple-400/30'
                      }`}
                    >
                      <Moon className="w-5 h-5 text-zinc-200 mb-2" />

                      <p className="text-xs font-semibold text-white">
                        Dark
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleThemeModeChange('system')
                      }
                      className={`rounded-xl border p-3 transition cursor-pointer ${
                        settings.theme === 'system'
                          ? 'border-purple-400/60 bg-purple-500/10'
                          : 'border-white/10 bg-[#151329] hover:border-purple-400/30'
                      }`}
                    >
                      <Monitor className="w-5 h-5 text-zinc-200 mb-2" />

                      <p className="text-xs font-semibold text-white">
                        System
                      </p>
                    </button>

                  </div>
                </div>

                {/* Color theme */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-purple-300" />

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Color theme
                      </h4>

                      <p className="text-[11px] text-zinc-500">
                        Choose your preferred accent style.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {THEMES.map((theme) => {
                      const selected =
                        currentTheme === theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() =>
                            handleThemeChange(theme.id)
                          }
                          className={`text-left rounded-2xl border overflow-hidden transition cursor-pointer ${
                            selected
                              ? 'border-purple-400/70 ring-2 ring-purple-400/20'
                              : 'border-purple-500/15 hover:border-purple-400/40'
                          }`}
                        >
                          <div
                            className={`h-16 ${theme.preview} relative`}
                          >
                            {selected && (
                              <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 backdrop-blur flex items-center justify-center">
                                <CheckCircle2 className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>

                          <div className="p-3 bg-[#151329]">
                            <p className="text-xs font-semibold text-white">
                              {theme.name}
                            </p>

                            <p className="text-[10px] text-zinc-500 mt-0.5">
                              {theme.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Font size */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-purple-300" />

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Font size
                      </h4>

                      <p className="text-[11px] text-zinc-500">
                        Adjust text size across the application.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {FONT_SIZES.map((size) => {
                      const selected =
                        currentFontSize === size.id;

                      return (
                        <button
                          key={size.id}
                          type="button"
                          onClick={() =>
                            handleFontSizeChange(size.id)
                          }
                          className={`rounded-xl border px-3 py-3 text-left transition cursor-pointer ${
                            selected
                              ? 'border-purple-400/60 bg-purple-500/10'
                              : 'border-purple-500/15 bg-[#151329] hover:border-purple-400/40'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`font-semibold text-zinc-100 ${size.className}`}
                            >
                              Aa
                            </span>

                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-purple-300" />
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 mt-1">
                            {size.name}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </section>
            )}

            {/* PART 2 YAHAN SE START HOGA */}
                        {/* Assistant */}
            {activeSection === 'assistant' && (
              <section className="space-y-7">

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Assistant
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Select the response style that fits your task.
                  </p>
                </div>

                {/* Assistant modes */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-purple-300" />

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Assistant mode
                      </h4>

                      <p className="text-[11px] text-zinc-500">
                        Choose how Ahemad's AI should respond.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ASSISTANT_MODES.map((mode) => {
                      const selected =
                        settings.activeMode === mode.id;

                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() =>
                            handleModeChange(mode.id)
                          }
                          className={`rounded-2xl border p-4 text-left transition cursor-pointer ${
                            selected
                              ? 'border-purple-400/60 bg-purple-500/10 ring-1 ring-purple-400/10'
                              : 'border-purple-500/15 bg-[#151329] hover:border-purple-400/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-white">
                                {mode.name}
                              </p>

                              <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                                {mode.description}
                              </p>
                            </div>

                            {selected && (
                              <CheckCircle2 className="w-4 h-4 text-purple-300 shrink-0" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AI engine */}
                <div className="rounded-2xl border border-purple-500/15 bg-[#151329] p-4">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-purple-300" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">
                        AI engine
                      </p>

                      <p className="text-[11px] text-zinc-500 truncate mt-1">
                        {health?.activeModel ||
                          health?.model ||
                          'Configured AI model'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          health?.hasApiKey
                            ? 'bg-emerald-400'
                            : 'bg-amber-400'
                        }`}
                      />

                      <span className="text-[11px] text-zinc-400 hidden sm:block">
                        {health?.hasApiKey
                          ? 'Connected'
                          : 'Check connection'}
                      </span>
                    </div>

                  </div>
                </div>

              </section>
            )}

            {/* Chat */}
            {activeSection === 'chat' && (
              <section className="space-y-3">

                <div className="mb-5">
                  <h3 className="text-lg font-semibold text-white">
                    Chat
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Control how messages and responses behave.
                  </p>
                </div>

                <SettingToggle
                  icon={<MessageSquare className="w-4 h-4" />}
                  title="Enter to send"
                  description="Press Enter to send a message. Use Shift + Enter for a new line."
                  enabled={settings.enterToSend}
                  onChange={(value) =>
                    onUpdateSettings({
                      enterToSend: value,
                    })
                  }
                />

                <SettingToggle
                  icon={<Zap className="w-4 h-4" />}
                  title="Streaming responses"
                  description="Show the AI response as it is generated."
                  enabled={settings.streamingEnabled}
                  onChange={(value) =>
                    onUpdateSettings({
                      streamingEnabled: value,
                    })
                  }
                />

                <SettingToggle
                  icon={<Sparkles className="w-4 h-4" />}
                  title="Auto-scroll"
                  description="Automatically follow the latest message while chatting."
                  enabled={settings.autoScroll}
                  onChange={(value) =>
                    onUpdateSettings({
                      autoScroll: value,
                    })
                  }
                />

                <SettingToggle
                  icon={
                    settings.soundEnabled ? (
                      <Volume2 className="w-4 h-4" />
                    ) : (
                      <VolumeX className="w-4 h-4" />
                    )
                  }
                  title="Sound effects"
                  description="Enable interface sound feedback where available."
                  enabled={settings.soundEnabled ?? false}
                  onChange={(value) =>
                    onUpdateSettings({
                      soundEnabled: value,
                    })
                  }
                />

                <SettingToggle
                  icon={<Volume2 className="w-4 h-4" />}
                  title="Voice auto-play"
                  description="Automatically play assistant voice responses when supported."
                  enabled={settings.voiceAutoPlay ?? false}
                  onChange={(value) =>
                    onUpdateSettings({
                      voiceAutoPlay: value,
                    })
                  }
                />

                <SettingToggle
                  icon={
                    settings.notificationsEnabled ? (
                      <Bell className="w-4 h-4" />
                    ) : (
                      <BellOff className="w-4 h-4" />
                    )
                  }
                  title="Notifications"
                  description="Allow supported browser notifications."
                  enabled={
                    settings.notificationsEnabled ?? false
                  }
                  onChange={(value) =>
                    onUpdateSettings({
                      notificationsEnabled: value,
                    })
                  }
                />

              </section>
            )}

            {/* Privacy & Data */}
            {activeSection === 'privacy' && (
              <section className="space-y-5">

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Privacy &amp; Data
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Manage conversations and locally stored application data.
                  </p>
                </div>

                {/* Browser storage */}
                <div className="rounded-2xl border border-purple-500/15 bg-[#151329] p-4">
                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                      <Database className="w-5 h-5 text-purple-300" />
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Browser storage
                      </h4>

                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Your chat history and app preferences are stored
                        locally in this browser. Clearing browser data can
                        remove locally saved conversations.
                      </p>
                    </div>

                  </div>
                </div>

                {/* Clear conversations */}
                <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-4">
                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center shrink-0">
                      <Trash2 className="w-5 h-5 text-red-300" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Clear all conversations
                      </h4>

                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Delete all saved chat conversations from this browser.
                      </p>

                      {!showClearConfirm ? (
                        <button
                          type="button"
                          onClick={() =>
                            setShowClearConfirm(true)
                          }
                          className="mt-3 px-3 py-2 rounded-lg border border-red-400/20 bg-red-500/10 text-xs font-medium text-red-300 hover:bg-red-500/15 transition cursor-pointer"
                        >
                          Clear conversations
                        </button>
                      ) : (
                        <div className="mt-3 rounded-xl border border-red-400/20 bg-black/20 p-3">

                          <p className="text-xs text-red-200">
                            Are you sure? This will delete all saved
                            conversations.
                          </p>

                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={
                                handleClearConversations
                              }
                              className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-400 transition cursor-pointer"
                            >
                              Yes, clear all
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setShowClearConfirm(false)
                              }
                              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-xs hover:bg-white/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Reset application */}
                <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.03] p-4">
                  <div className="flex items-start gap-3">

                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center shrink-0">
                      <RotateCcw className="w-5 h-5 text-orange-300" />
                    </div>

                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Reset application
                      </h4>

                      <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                        Restore the application to its default local settings
                        and remove locally saved app data.
                      </p>

                      {!showResetConfirm ? (
                        <button
                          type="button"
                          onClick={() =>
                            setShowResetConfirm(true)
                          }
                          className="mt-3 px-3 py-2 rounded-lg border border-orange-400/20 bg-orange-500/10 text-xs font-medium text-orange-300 hover:bg-orange-500/15 transition cursor-pointer"
                        >
                          Reset application
                        </button>
                      ) : (
                        <div className="mt-3 rounded-xl border border-orange-400/20 bg-black/20 p-3">

                          <p className="text-xs text-orange-200">
                            This will remove conversations and reset local
                            settings. Continue?
                          </p>

                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={
                                handleResetApplication
                              }
                              className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-400 transition cursor-pointer"
                            >
                              Yes, reset
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setShowResetConfirm(false)
                              }
                              className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-zinc-300 text-xs hover:bg-white/10 transition cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>

                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Founder information */}
                <div className="rounded-2xl border border-purple-500/15 bg-[#151329] p-4">
                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-purple-300" />
                    </div>

                    <div>
                      <p className="text-xs font-semibold text-white">
                        Ahemad's AI
                      </p>

                      <p className="text-[11px] text-purple-300">
                        Founder &amp; Chief Architect
                      </p>

                      <p className="text-[11px] text-zinc-400">
                        𝑬𝒓. 𝑨𝒉𝒆𝒎𝒂𝒅 𝑰𝒏𝒂𝒎𝒅𝒂𝒂𝒓
                      </p>

                      <p className="text-[10px] text-zinc-600 mt-0.5">
                        Powered by Nexaura Tech
                      </p>
                    </div>

                  </div>
                </div>

              </section>
            )}

          </main>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;

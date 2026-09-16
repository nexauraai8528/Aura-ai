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
  Play,
  Bell,
  BellOff,
  ShieldCheck,
  Database,
  Trash2,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
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
  onUpdateSettings: (
    updates: Partial<AppSettings>
  ) => void;
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
    description: 'Deep futuristic dark',
    preview:
      'bg-gradient-to-br from-[#090912] via-[#17122B] to-[#31205A]',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue atmosphere',
    preview:
      'bg-gradient-to-br from-[#07121C] via-[#12324A] to-[#1677A8]',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple glow',
    preview:
      'bg-gradient-to-br from-[#130D1E] via-[#35204E] to-[#8B5CF6]',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Calm green tone',
    preview:
      'bg-gradient-to-br from-[#0B1410] via-[#1C3024] to-[#5C8A68]',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Rich red atmosphere',
    preview:
      'bg-gradient-to-br from-[#16090D] via-[#401622] to-[#8F3048]',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Warm modern tone',
    preview:
      'bg-gradient-to-br from-[#180F0B] via-[#4B281C] to-[#C56B45]',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean business style',
    preview:
      'bg-gradient-to-br from-[#0C1118] via-[#202A38] to-[#526579]',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'High-energy futuristic',
    preview:
      'bg-gradient-to-br from-[#05080B] via-[#12272B] to-[#00A6A6]',
  },
  {
    id: 'pink',
    name: 'Pink',
    description: 'Modern vibrant style',
    preview:
      'bg-gradient-to-br from-[#180A14] via-[#45203A] to-[#D9468A]',
  },
];

const FONT_SIZES: {
  id: FontSize;
  name: string;
  sample: string;
}[] = [
  {
    id: 'small',
    name: 'Small',
    sample: 'Aa',
  },
  {
    id: 'medium',
    name: 'Medium',
    sample: 'Aa',
  },
  {
    id: 'large',
    name: 'Large',
    sample: 'Aa',
  },
  {
    id: 'extra-large',
    name: 'Extra Large',
    sample: 'Aa',
  },
];

const ASSISTANT_MODES: {
  id: AssistantMode;
  name: string;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'general',
    name: 'General',
    description:
      'Everyday questions and conversations',
    icon: Sparkles,
  },
  {
    id: 'coding',
    name: 'Coding',
    description:
      'Programming and technical help',
    icon: Zap,
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description:
      'Step-by-step learning',
    icon: MessageSquare,
  },
  {
    id: 'writing',
    name: 'Writing',
    description:
      'Writing, rewriting and editing',
    icon: Type,
  },
  {
    id: 'research',
    name: 'Research',
    description:
      'Analysis and detailed research',
    icon: Database,
  },
];

export const SettingsModal: React.FC<
  SettingsModalProps
> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  health,
  onClearConversations,
  onResetApp,
}) => {
  const [activeSection, setActiveSection] =
    useState<
      'appearance' |
      'assistant' |
      'chat' |
      'privacy'
    >('appearance');

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

  if (!isOpen) {
    return null;
  }

  const currentTheme =
    settings.appTheme || 'midnight';

  const currentFontSize =
    settings.fontSize || 'medium';

  const currentMode =
    settings.activeMode || 'general';

  const handleThemeChange = (
    theme: AppTheme
  ) => {
    onUpdateSettings({
      appTheme: theme,
    });
  };

  const handleFontSizeChange = (
    fontSize: FontSize
  ) => {
    onUpdateSettings({
      fontSize,
    });
  };

  const handleModeChange = (
    mode: AssistantMode
  ) => {
    onUpdateSettings({
      activeMode: mode,
    });
  };

  const handleThemeModeChange = (
    theme: 'dark' | 'light' | 'system'
  ) => {
    onUpdateSettings({
      theme,
    });
  };

  const handleClear = () => {
    onClearConversations();
    setShowClearConfirm(false);
    onClose();
  };

  const handleReset = () => {
    onResetApp();
    setShowResetConfirm(false);
    onClose();
  };

  const sections = [
    {
      id: 'appearance' as const,
      label: 'Appearance',
      icon: Palette,
    },
    {
      id: 'assistant' as const,
      label: 'Assistant',
      icon: Sparkles,
    },
    {
      id: 'chat' as const,
      label: 'Chat',
      icon: MessageSquare,
    },
    {
      id: 'privacy' as const,
      label: 'Privacy & Data',
      icon: ShieldCheck,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label="Ahemad's AI Settings"
    >
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
      />

      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-purple-500/25 bg-[#0D0B18]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-zinc-100">
        <div className="flex items-center justify-between gap-4 px-5 sm:px-7 py-4 border-b border-purple-500/15 bg-[#111022]/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#31205A] via-[#5B3AAE] to-[#4F8CFF] flex items-center justify-center border border-purple-300/25 shadow-lg shadow-purple-950/30">
              <Settings className="w-5 h-5 text-purple-100" />
            </div>

            <div>
              <h2 className="font-luxury text-lg sm:text-xl font-bold text-white">
                Settings
              </h2>

              <p className="text-xs text-zinc-400">
                Customize your Ahemad's AI experience
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-[#211B3D] border border-transparent hover:border-purple-500/20 transition cursor-pointer"
            title="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row max-h-[calc(92vh-80px)]">
          <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-purple-500/15 bg-[#0A0912]/70">
            <div className="flex md:flex-col gap-1 p-3 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;

                const selected =
                  activeSection ===
                  section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(
                        section.id
                      )
                    }
                    className={`shrink-0 flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                      selected
                        ? 'bg-[#211B3D] text-white border border-purple-500/25 shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-[#151329]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 ${
                        selected
                          ? 'text-purple-300'
                          : 'text-zinc-500'
                      }`}
                    />

                    <span>
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:block px-4 pb-5 mt-auto">
              <div className="pt-4 border-t border-purple-500/10">
                <p className="text-[10px] uppercase tracking-widest text-purple-400/70">
                  Ahemad's AI
                </p>

                <p className="text-[11px] text-zinc-500 mt-1">
                  Founder &amp; Chief Architect
                </p>

                <p className="text-xs text-purple-200/80 font-medium mt-0.5">
                  𝑬𝒓. 𝑨𝒉𝒆𝒎𝒂𝒅 𝑰𝒏𝒂𝒎𝒅𝒂𝒂𝒓
                </p>

                <p className="text-[10px] text-zinc-600 mt-1">
                  Powered by Nexaura Tech
                </p>
              </div>
            </div>
          </aside>

          <section className="flex-1 overflow-y-auto p-5 sm:p-7">
            {activeSection ===
              'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-luxury text-lg font-bold text-white">
                    Appearance
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Choose how Ahemad's AI looks on your device.
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="w-4 h-4 text-purple-300" />

                    <h4 className="text-sm font-semibold text-zinc-200">
                      Display mode
                    </h4>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        id: 'dark' as const,
                        label: 'Dark',
                        icon: Moon,
                      },
                      {
                        id: 'light' as const,
                        label: 'Light',
                        icon: Sun,
                      },
                      {
                        id: 'system' as const,
                        label: 'System',
                        icon: Monitor,
                      },
                    ].map((item) => {
                      const Icon =
                        item.icon;

                      const selected =
                        settings.theme ===
                        item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleThemeModeChange(
                              item.id
                            )
                          }
                          className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition cursor-pointer ${
                            selected
                              ? 'border-purple-400/60 bg-[#211B3D] text-white'
                              : 'border-purple-500/15 bg-[#111022]/60 text-zinc-400 hover:text-white hover:bg-[#151329]'
                          }`}
                        >
                          <Icon className="w-4 h-4" />

                          <span className="text-xs font-medium">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                        currentTheme ===
                        theme.id;

                      return (
                        <button
                          key={theme.id}
                          type="button"
                          onClick={() =>
                            handleThemeChange(
                              theme.id
                            )
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
              <div className="mt-8">
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
                      (settings.fontSize || 'medium') === size.id;

                    return (
                      <button
                        key={size.id}
                        type="button"
                        onClick={() => handleFontSizeChange(size.id)}
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

          {/* ================= ASSISTANT ================= */}
          {activeSection === 'assistant' && (
            <section className="space-y-7">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-300" />
                  <div>
                    <h3 className="text-base font-semibold text-white">
                      Assistant mode
                    </h3>
                    <p className="text-xs text-zinc-500">
                      Choose how Ahemad's AI should respond.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ASSISTANT_MODES.map((mode) => {
                    const selected =
                      (settings.activeMode || 'general') === mode.id;

                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => handleModeChange(mode.id)}
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

              {/* AI engine status */}
              <div className="rounded-2xl border border-purple-500/15 bg-[#151329] p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-purple-300" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">
                      AI engine
                    </p>

                    <p className="text-[11px] text-zinc-500 truncate">
                      {health?.activeModel ||
                        health?.model ||
                        'Configured AI model'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        health?.hasApiKey
                          ? 'bg-emerald-400'
                          : 'bg-amber-400'
                      }`}
                    />

                    <span className="text-[11px] text-zinc-400">
                      {health?.hasApiKey ? 'Connected' : 'Check connection'}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ================= CHAT ================= */}
          {activeSection === 'chat' && (
            <section className="space-y-3">
              <div className="mb-5">
                <h3 className="text-base font-semibold text-white">
                  Chat preferences
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
                  onUpdateSettings({ enterToSend: value })
                }
              />

              <SettingToggle
                icon={<Zap className="w-4 h-4" />}
                title="Streaming responses"
                description="Show the AI response as it is generated."
                enabled={settings.streamingEnabled}
                onChange={(value) =>
                  onUpdateSettings({ streamingEnabled: value })
                }
              />

              <SettingToggle
                icon={<Sparkles className="w-4 h-4" />}
                title="Auto-scroll"
                description="Automatically follow the latest message while chatting."
                enabled={settings.autoScroll}
                onChange={(value) =>
                  onUpdateSettings({ autoScroll: value })
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
                  onUpdateSettings({ soundEnabled: value })
                }
              />

              <SettingToggle
                icon={<Volume2 className="w-4 h-4" />}
                title="Voice auto-play"
                description="Automatically play assistant voice responses when supported."
                enabled={settings.voiceAutoPlay ?? false}
                onChange={(value) =>
                  onUpdateSettings({ voiceAutoPlay: value })
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
                description="Allow Ahemad's AI to show supported browser notifications."
                enabled={settings.notificationsEnabled ?? false}
                onChange={(value) =>
                  onUpdateSettings({ notificationsEnabled: value })
                }
              />
            </section>
          )}

          {/* ================= PRIVACY & DATA ================= */}
          {activeSection === 'privacy' && (
            <section className="space-y-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-purple-300" />
                  <h3 className="text-base font-semibold text-white">
                    Privacy &amp; data
                  </h3>
                </div>

                <p className="text-xs text-zinc-500">
                  Manage conversations and locally stored application settings.
                </p>
              </div>

              {/* Local storage */}
              <div className="rounded-2xl border border-purple-500/15 bg-[#151329] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-400/20 flex items-center justify-center shrink-0">
                    <Database className="w-4 h-4 text-purple-300" />
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-zinc-200">
                      Browser storage
                    </h4>

                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Your chat history and app preferences are stored in this
                      browser's local storage. Clearing browser data can remove
                      locally saved conversations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Clear conversations */}
              <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-400/20 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-red-300" />
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
                        onClick={() => setShowClearConfirm(true)}
                        className="mt-3 px-3 py-2 rounded-lg border border-red-400/20 bg-red-500/10 text-xs font-medium text-red-300 hover:bg-red-500/15 transition cursor-pointer"
                      >
                        Clear conversations
                      </button>
                    ) : (
                      <div className="mt-3 rounded-xl border border-red-400/20 bg-black/20 p-3">
                        <p className="text-xs text-red-200">
                          Are you sure? This will delete all saved conversations.
                        </p>

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={handleClearConversations}
                            className="px-3 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-400 transition cursor-pointer"
                          >
                            Yes, clear all
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowClearConfirm(false)}
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

              {/* Reset app */}
              <div className="rounded-2xl border border-orange-500/15 bg-orange-500/[0.03] p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-400/20 flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4 text-orange-300" />
                  </div>

                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-zinc-200">
                      Reset application
                    </h4>

                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                      Restore Ahemad's AI settings to their default values and
                      remove locally stored app data.
                    </p>

                    {!showResetConfirm ? (
                      <button
                        type="button"
                        onClick={() => setShowResetConfirm(true)}
                        className="mt-3 px-3 py-2 rounded-lg border border-orange-400/20 bg-orange-500/10 text-xs font-medium text-orange-300 hover:bg-orange-500/15 transition cursor-pointer"
                      >
                        Reset application
                      </button>
                    ) : (
                      <div className="mt-3 rounded-xl border border-orange-400/20 bg-black/20 p-3">
                        <p className="text-xs text-orange-200">
                          This will remove conversations and reset all local
                          settings. Continue?
                        </p>

                        <div className="flex gap-2 mt-3">
                          <button
                            type="button"
                            onClick={handleResetApplication}
                            className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold hover:bg-orange-400 transition cursor-pointer"
                          >
                            Yes, reset
                          </button>

                          <button
                            type="button"
                            onClick={() => setShowResetConfirm(false)}
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
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-300" />
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
        </div>
      </div>
    </div>
  );
};

interface SettingToggleProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
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

export default SettingsModal;

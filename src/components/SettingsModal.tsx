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
  Pause,
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
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  health: HealthStatus | null;
  onClearAllConversations: () => void;
  onResetAllData: () => void;
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
    preview: 'bg-gradient-to-br from-[#090912] via-[#17122B] to-[#31205A]',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue atmosphere',
    preview: 'bg-gradient-to-br from-[#07121C] via-[#12324A] to-[#1677A8]',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple glow',
    preview: 'bg-gradient-to-br from-[#130D1E] via-[#35204E] to-[#8B5CF6]',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Calm green tone',
    preview: 'bg-gradient-to-br from-[#0B1410] via-[#1C3024] to-[#5C8A68]',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Rich red atmosphere',
    preview: 'bg-gradient-to-br from-[#16090D] via-[#401622] to-[#8F3048]',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Warm modern tone',
    preview: 'bg-gradient-to-br from-[#180F0B] via-[#4B281C] to-[#C56B45]',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean business style',
    preview: 'bg-gradient-to-br from-[#0C1118] via-[#202A38] to-[#526579]',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'High-energy futuristic',
    preview: 'bg-gradient-to-br from-[#05080B] via-[#12272B] to-[#00A6A6]',
  },
  {
    id: 'pink',
    name: 'Pink',
    description: 'Modern vibrant style',
    preview: 'bg-gradient-to-br from-[#180A14] via-[#45203A] to-[#D9468A]',
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
    description: 'Everyday questions and conversations',
    icon: Sparkles,
  },
  {
    id: 'coding',
    name: 'Coding',
    description: 'Programming and technical help',
    icon: Zap,
  },
  {
    id: 'tutor',
    name: 'Tutor',
    description: 'Step-by-step learning',
    icon: MessageSquare,
  },
  {
    id: 'writing',
    name: 'Writing',
    description: 'Writing, rewriting and editing',
    icon: Type,
  },
  {
    id: 'research',
    name: 'Research',
    description: 'Analysis and detailed research',
    icon: Database,
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
  const [activeSection, setActiveSection] = useState<
    'appearance' | 'assistant' | 'chat' | 'privacy'
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

  const handleThemeChange = (theme: AppTheme) => {
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
    onClearAllConversations();
    setShowClearConfirm(false);
    onClose();
  };

  const handleReset = () => {
    onResetAllData();
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
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
      />

      {/* Modal */}
      <div className="relative w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-3xl border border-purple-500/25 bg-[#0D0B18]/95 shadow-[0_25px_100px_rgba(0,0,0,0.65)] backdrop-blur-2xl text-zinc-100">
        {/* Header */}
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

        {/* Main */}
        <div className="flex flex-col md:flex-row max-h-[calc(92vh-80px)]">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-purple-500/15 bg-[#0A0912]/70">
            <div className="flex md:flex-col gap-1 p-3 overflow-x-auto">
              {sections.map((section) => {
                const Icon = section.icon;
                const selected =
                  activeSection === section.id;

                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() =>
                      setActiveSection(section.id)
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

                    <span>{section.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Branding */}
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

          {/* Content */}
          <section className="flex-1 overflow-y-auto p-5 sm:p-7">
            {/* ================= APPEARANCE ================= */}
            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-luxury text-lg font-bold text-white">
                    Appearance
                  </h3>

                  <p className="text-xs text-zinc-500 mt-1">
                    Choose how Ahemad's AI looks on your device.
                  </p>
                </div>

                {/* Dark / Light / System */}
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
                      const Icon = item.icon;
                      const selected =
                        settings.theme === item.id;

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
                              ? 'border-purple-400/60 bg-[#211B3D] text-white shadow-[0_0_18px_rgba(139,92,246,0.12)]'
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

                {/* Themes */}
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

                {/* Font Size */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Type className="w-4 h-4 text-purple-300" />

                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">
                        Font size
                      </h4>

                      <p className="text-[11px] text-zinc-500">
                        Adjust text size for readability.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {FONT_SIZES.map((item) => {
                      const selected =
                        currentFontSize === item.id;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() =>
                            handleFontSizeChange(
                              item.id
                            )
                          }
                          className={`p-3 rounded-xl border transition cursor-pointer ${
                            selected
                              ? 'border-purple-400/60 bg-[#211B3D]'
                              : 'border-purple-500/15 bg-[#111022]/60 hover:bg-[#151329]'
                          }`}
                        >
                          <span
                            className={`block font-semibold text-white ${
                              item.id === 'small'
                                ? 'text-sm'
                                : item.id === 'medium'
                                ? 'text-base'
                                : item.id === 'large'
                                ? 'text-lg'
                                : 'text-xl'
                            }`}
                          >
                            {item.sample}
                          </span>

                          <span className="block text-[11px] text-zinc-400 mt-1">
                            {

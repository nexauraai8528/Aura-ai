import React from 'react';
import {
  X,
  Settings,
  Palette,
  Type,
  Volume2,
  Bell,
  Trash2,
  RotateCcw,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import {
  AppSettings,
  AppTheme,
  FontSize,
  HealthStatus,
  ThemeMode,
} from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onResetApp: () => void;
  onClearConversations: () => void;
  health?: HealthStatus | null;
}

const THEME_OPTIONS: {
  id: AppTheme;
  name: string;
  description: string;
}[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep dark purple',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blue tones',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    description: 'Soft purple glow',
  },
  {
    id: 'sage',
    name: 'Sage',
    description: 'Calm green tones',
  },
  {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Deep red tones',
  },
  {
    id: 'terracotta',
    name: 'Terracotta',
    description: 'Warm orange tones',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean business style',
  },
  {
    id: 'neon',
    name: 'Neon',
    description: 'Bright futuristic glow',
  },
  {
    id: 'pink',
    name: 'Pink',
    description: 'Modern pink glow',
  },
];

const FONT_OPTIONS: {
  id: FontSize;
  name: string;
  description: string;
}[] = [
  {
    id: 'small',
    name: 'Small',
    description: 'Compact text',
  },
  {
    id: 'medium',
    name: 'Medium',
    description: 'Recommended',
  },
  {
    id: 'large',
    name: 'Large',
    description: 'Easier to read',
  },
  {
    id: 'extra-large',
    name: 'Extra Large',
    description: 'Maximum readability',
  },
];

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetApp,
  onClearConversations,
  health,
}) => {
  if (!isOpen) return null;

  const currentTheme: AppTheme =
    settings.appTheme || 'midnight';

  const currentFontSize: FontSize =
    settings.fontSize || 'medium';

  const currentThemeMode: ThemeMode =
    settings.theme || 'dark';

  const handleClearConversations = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all conversations? This cannot be undone.'
    );

    if (confirmed) {
      onClearConversations();
    }
  };

  const handleResetApp = () => {
    const confirmed = window.confirm(
      'Reset Ahemad\'s AI to default settings and remove local app data?'
    );

    if (confirmed) {
      onResetApp();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close settings"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-default"
      />

      {/* Modal */}
      <div className="relative w-full max-w-3xl max-h-[92vh] overflow-hidden rounded-3xl border border-[#8B5CF6]/25 bg-[#0d0b18]/95 shadow-2xl shadow-black/60 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 sm:px-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#31215F] via-[#5B3AAE] to-[#4F8CFF] flex items-center justify-center border border-[#A78BFA]/30">
              <Settings className="w-5 h-5 text-[#DDD6FE]" />
            </div>

            <div>
              <h2
                id="settings-title"
                className="text-lg sm:text-xl font-semibold text-white"
              >
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
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(92vh-76px)] p-5 sm:p-6 space-y-6">
          {/* Appearance */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-[#C4B5FD]" />
              <h3 className="text-sm font-semibold text-white">
                Appearance
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-5">
              {/* Theme mode */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  Theme Mode
                </label>

                <div className="grid grid-cols-3 gap-2">
                  {(['dark', 'light', 'system'] as ThemeMode[]).map(
                    (mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() =>
                          onUpdateSettings({
                            theme: mode,
                          })
                        }
                        className={`rounded-xl border px-3 py-2.5 text-xs font-medium capitalize transition-all ${
                          currentThemeMode === mode
                            ? 'border-[#A78BFA]/60 bg-[#8B5CF6]/20 text-white shadow-[0_0_18px_rgba(139,92,246,0.15)]'
                            : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                        }`}
                      >
                        {mode}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* App theme */}
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-2">
                  App Color Theme
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {THEME_OPTIONS.map((theme) => (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          appTheme: theme.id,
                        })
                      }
                      className={`text-left rounded-xl border p-3 transition-all ${
                        currentTheme === theme.id
                          ? 'border-[#A78BFA]/60 bg-[#8B5CF6]/15'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">
                        {theme.name}
                      </div>

                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        {theme.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Font size */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Type className="w-4 h-4 text-[#C4B5FD]" />
                  <label className="text-xs font-medium text-zinc-300">
                    Font Size
                  </label>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {FONT_OPTIONS.map((font) => (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() =>
                        onUpdateSettings({
                          fontSize: font.id,
                        })
                      }
                      className={`rounded-xl border p-2.5 transition-all ${
                        currentFontSize === font.id
                          ? 'border-[#A78BFA]/60 bg-[#8B5CF6]/15'
                          : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-white">
                        {font.name}
                      </div>

                      <div className="text-[10px] text-zinc-500 mt-0.5">
                        {font.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Chat behaviour */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#C4B5FD]" />
              <h3 className="text-sm font-semibold text-white">
                Chat Behaviour
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
              <ToggleRow
                title="Enter to send"
                description="Press Enter to send a message."
                enabled={settings.enterToSend}
                onChange={(enabled) =>
                  onUpdateSettings({
                    enterToSend: enabled,
                  })
                }
              />

              <ToggleRow
                title="Streaming responses"
                description="Show AI responses as they are generated."
                enabled={settings.streamingEnabled}
                onChange={(enabled) =>
                  onUpdateSettings({
                    streamingEnabled: enabled,
                  })
                }
              />

              <ToggleRow
                title="Auto scroll"
                description="Automatically follow new messages."
                enabled={settings.autoScroll}
                onChange={(enabled) =>
                  onUpdateSettings({
                    autoScroll: enabled,
                  })
                }
              />
            </div>
          </section>

          {/* Audio & notifications */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Volume2 className="w-4 h-4 text-[#C4B5FD]" />
              <h3 className="text-sm font-semibold text-white">
                Audio & Notifications
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] divide-y divide-white/10">
              <ToggleRow
                title="Sound effects"
                description="Play interface sound effects."
                enabled={Boolean(settings.soundEnabled)}
                onChange={(enabled) =>
                  onUpdateSettings({
                    soundEnabled: enabled,
                  })
                }
              />

              <ToggleRow
                title="Voice auto-play"
                description="Automatically speak assistant responses."
                enabled={Boolean(settings.voiceAutoPlay)}
                onChange={(enabled) =>
                  onUpdateSettings({
                    voiceAutoPlay: enabled,
                  })
                }
              />

              <ToggleRow
                icon={<Bell className="w-4 h-4 text-zinc-400" />}
                title="Notifications"
                description="Allow Ahemad's AI notifications."
                enabled={Boolean(settings.notificationsEnabled)}
                onChange={(enabled) =>
                  onUpdateSettings({
                    notificationsEnabled: enabled,
                  })
                }
              />
            </div>
          </section>

          {/* System status */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-4 h-4 text-[#C4B5FD]" />
              <h3 className="text-sm font-semibold text-white">
                System Status
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              {health ? (
                <div className="space-y-3">
                  <StatusRow
                    label="Application"
                    value={health.appName || "Ahemad's AI"}
                    ok
                  />

                  <StatusRow
                    label="Server"
                    value={health.status || 'Unknown'}
                    ok={
                      health.status?.toLowerCase() === 'ok' ||
                      health.status?.toLowerCase() === 'healthy'
                    }
                  />

                  <StatusRow
                    label="AI Service"
                    value={
                      health.hasApiKey
                        ? 'Connected'
                        : 'Configuration required'
                    }
                    ok={health.hasApiKey}
                  />

                  <StatusRow
                    label="Model"
                    value={
                      health.activeModel ||
                      health.model ||
                      'Configured'
                    }
                    ok
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 text-sm text-zinc-400">
                  <Activity className="w-4 h-4" />
                  <span>System status unavailable.</span>
                </div>
              )}
            </div>
          </section>

          {/* Data management */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Trash2 className="w-4 h-4 text-[#C4B5FD]" />
              <h3 className="text-sm font-semibold text-white">
                Data Management
              </h3>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
              <button
                type="button"
                onClick={handleClearConversations}
                className="w-full flex items-center justify-between gap-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] px-4 py-3 text-left hover:bg-red-500/[0.10] transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-white">
                    Clear all conversations
                  </div>

                  <div className="text-[11px] text-zinc-500 mt-1">
                    Permanently remove locally saved conversations.
                  </div>
                </div>

                <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
              </button>

              <button
                type="button"
                onClick={handleResetApp}
                className="w-full flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/[0.05] px-4 py-3 text-left hover:bg-amber-500/[0.10] transition-colors"
              >
                <div>
                  <div className="text-sm font-medium text-white">
                    Reset app
                  </div>

                  <div className="text-[11px] text-zinc-500 mt-1">
                    Restore default settings and clear local app data.
                  </div>
                </div>

                <RotateCcw className="w-4 h-4 text-amber-400 shrink-0" />
              </button>
            </div>
          </section>

          {/* Privacy / branding */}
          <section>
            <div className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.05] p-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#C4B5FD] mt-0.5 shrink-0" />

                <div>
                  <div className="text-sm font-semibold text-white">
                    Ahemad's AI
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    Founder & Chief Architect: Er. Ahemad Inamdaar
                  </p>

                  <p className="text-[11px] text-zinc-500 mt-1">
                    Powered by Nexaura Tech
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Footer */}
          <div className="pt-1 pb-2 text-center">
            <p className="text-[10px] text-zinc-600">
              Ahemad's AI • Personal AI Assistant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ToggleRowProps {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  icon?: React.ReactNode;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  title,
  description,
  enabled,
  onChange,
  icon,
}) => {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="mt-0.5 shrink-0">
            {icon}
          </div>
        )}

        <div className="min-w-0">
          <div className="text-sm font-medium text-white">
            {title}
          </div>

          <div className="text-[11px] text-zinc-500 mt-0.5">
            {description}
          </div>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={() => onChange(!enabled)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors ${
          enabled
            ? 'bg-[#8B5CF6]'
            : 'bg-zinc-700'
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
            enabled
              ? 'translate-x-6'
              : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

interface StatusRowProps {
  label: string;
  value: string;
  ok: boolean;
}

const StatusRow: React.FC<StatusRowProps> = ({
  label,
  value,
  ok,
}) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-xs text-zinc-500">
        {label}
      </span>

      <div className="flex items-center gap-2 min-w-0">
        <span
          className={`w-2 h-2 rounded-full ${
            ok ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />

        <span className="text-xs text-zinc-300 truncate max-w-[190px]">
          {value}
        </span>
      </div>
    </div>
  );
};

export { SettingsModal };
export default SettingsModal;

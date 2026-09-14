import { Conversation, ThemeMode, AppSettings } from '../types';

const STORAGE_KEYS = {
  CONVERSATIONS: 'aura_ai_conversations',
  LEGACY_CONVERSATIONS: 'nexaura_ai_conversations',
  CURRENT_CONVERSATION_ID: 'aura_ai_current_id',
  LEGACY_CURRENT_ID: 'nexaura_ai_current_id',
  THEME: 'aura_ai_theme',
  LEGACY_THEME: 'nexaura_ai_theme',
  SETTINGS: 'aura_ai_settings',
};

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  enterToSend: true,
  streamingEnabled: true,
  autoScroll: true,
  activeMode: 'general',
};

export const storage = {
  getConversations(): Conversation[] {
    try {
      const data =
        localStorage.getItem(STORAGE_KEYS.CONVERSATIONS) ||
        localStorage.getItem(STORAGE_KEYS.LEGACY_CONVERSATIONS);
      if (!data) return [];
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load conversations from localStorage:', e);
      return [];
    }
  },

  saveConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversations)
      );
    } catch (e) {
      console.error('Failed to save conversations to localStorage:', e);
    }
  },

  getCurrentConversationId(): string | null {
    try {
      return (
        localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID) ||
        localStorage.getItem(STORAGE_KEYS.LEGACY_CURRENT_ID)
      );
    } catch {
      return null;
    }
  },

  setCurrentConversationId(id: string | null): void {
    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
      }
    } catch (e) {
      console.error('Failed to save active conversation id:', e);
    }
  },

  getTheme(): ThemeMode {
    try {
      const theme = (localStorage.getItem(STORAGE_KEYS.THEME) ||
        localStorage.getItem(STORAGE_KEYS.LEGACY_THEME)) as ThemeMode;

      if (theme === 'light' || theme === 'dark' || theme === 'system') {
        return theme;
      }

      return 'dark';
    } catch {
      return 'dark';
    }
  },

  setTheme(theme: ThemeMode): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.error('Failed to save theme to localStorage:', e);
    }
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;

      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(settings)
      );
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  },

  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach((k) =>
        localStorage.removeItem(k)
      );
    } catch (e) {
      console.error('Failed to clear app data:', e);
    }
  },
};

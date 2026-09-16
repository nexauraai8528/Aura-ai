export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // Base64 or Data URL
  mimeType: string;
  textContent?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  status?: 'sending' | 'streaming' | 'complete' | 'error';
  error?: string;
  attachments?: Attachment[];
  mode?: AssistantMode;

  // Optional generated media
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  isPinned?: boolean;

  // Group chat support
  isGroupChat?: boolean;
  groupId?: string;
  participants?: GroupParticipant[];
}

export interface GroupParticipant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  role?: 'owner' | 'admin' | 'member';
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  ownerId: string;
  participants: GroupParticipant[];
  conversationId: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type AssistantMode =
  | 'general'
  | 'coding'
  | 'tutor'
  | 'writing'
  | 'research'
  | 'image'
  | 'video'
  | 'voice';

export type AppTheme =
  | 'midnight'
  | 'ocean'
  | 'lavender'
  | 'sage'
  | 'burgundy'
  | 'terracotta'
  | 'professional'
  | 'neon'
  | 'pink';

export type FontSize = 'small' | 'medium' | 'large' | 'extra-large';

export interface AppSettings {
  theme: ThemeMode;
  enterToSend: boolean;
  streamingEnabled: boolean;
  autoScroll: boolean;
  activeMode: AssistantMode;

  // New customization options
  appTheme?: AppTheme;
  fontSize?: FontSize;

  // Future feature preferences
  soundEnabled?: boolean;
  voiceAutoPlay?: boolean;
  notificationsEnabled?: boolean;
}

export interface UsageLimits {
  chat: number;
  image: number;
  video: number;
  voice: number;
}

export interface DailyUsage {
  date: string;

  // Current usage
  chat: number;
  image: number;
  video: number;
  voice: number;

  // Daily limits
  limits: UsageLimits;
}

export interface HealthStatus {
  status: string;
  appName: string;
  model: string;
  activeModel?: string;
  isRateLimited?: boolean;
  hasApiKey: boolean;
  }

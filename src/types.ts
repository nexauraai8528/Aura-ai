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
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  model?: string;
  isPinned?: boolean;
}

export type ThemeMode = 'light' | 'dark' | 'system';

export type AssistantMode = 'general' | 'coding' | 'tutor' | 'writing' | 'research';

export interface AppSettings {
  theme: ThemeMode;
  enterToSend: boolean;
  streamingEnabled: boolean;
  autoScroll: boolean;
  activeMode: AssistantMode;
}

export interface HealthStatus {
  status: string;
  appName: string;
  model: string;
  activeModel?: string;
  isRateLimited?: boolean;
  hasApiKey: boolean;
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Conversation, Message, ThemeMode, HealthStatus, Attachment, AppSettings, AssistantMode } from './types';
import { storage } from './utils/storage';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { WelcomeScreen } from './components/WelcomeScreen';
import { SettingsModal } from './components/SettingsModal';

// API backend
const API_BASE =
  window.location.hostname.includes('netlify.app')
    ? 'https://aura-ai-a0uv.onrender.com'
    : '';

export default function App() {
  const [conversations, setConversations] = useState<Conversation[]>(() => storage.getConversations());
  const [activeId, setActiveId] = useState<string | null>(() => storage.getCurrentConversationId());
  const [theme, setTheme] = useState<ThemeMode>(() => storage.getTheme());
  const [settings, setSettings] = useState<AppSettings>(() => storage.getSettings());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputDraft, setInputDraft] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [health, setHealth] = useState<HealthStatus | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync theme with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    storage.setTheme(theme);
  }, [theme]);

  // Persist conversations
  useEffect(() => {
    storage.saveConversations(conversations);
  }, [conversations]);

  // Persist active conversation ID
  useEffect(() => {
    storage.setCurrentConversationId(activeId);
  }, [activeId]);

  // Fetch API Health & Model status
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch(`${API_BASE}/api/health`);
        if (res.ok) {
          const data = await res.json();
          setHealth(data);
        }
      } catch (err) {
       

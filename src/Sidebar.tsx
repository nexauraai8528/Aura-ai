import React, { useState, useMemo } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  Search,
  Sun,
  Moon,
  Sparkles,
  Cpu,
  Pin,
  Sliders,
} from 'lucide-react';
import { Conversation, ThemeMode } from '../types';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onTogglePinConversation?: (id: string) => void;
  onClearAll: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
  modelName: string;
  onOpenSettings?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onTogglePinConversation,
  onClearAll,
  theme,
  onToggleTheme,
  isOpen,
  onCloseMobile,
  modelName,
  onOpenSettings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    return conversations.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [conversations, searchQuery]);

  // Group conversations: Pinned first, then by date
  const { pinned, today, yesterday, last7Days, older } = useMemo(() => {
    const pinnedList: Conversation[] = [];
    const todayList: Conversation[] = [];
    const yesterdayList: Conversation[] = [];
    const last7DaysList: Conversation[] = [];
    const olderList: Conversation[] = [];

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const sevenDaysAgo = todayStart - 86400000 * 7;

    filteredConversations.forEach((conv) => {
      if (conv.isPinned) {
        pinnedList.push(conv);
        return;
      }

      const time = conv.updatedAt || conv.createdAt;
      if (time >= todayStart) {
        todayList.push(conv);
      } else if (time >= yesterdayStart) {
        yesterdayList.push(conv);
      } else if (time >= sevenDaysAgo) {
        last7DaysList.push(conv);
      } else {
        olderList.push(conv);
      }
    });

    return {
      pinned: pinnedList,
      today: todayList,
      yesterday: yesterdayList,
      last7Days: last7DaysList,
      older: olderList,
    };
  }, [filteredConversations]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
  };

  const handleSaveRename = (id: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const renderGroup = (title: string, items: Conversation[], isPinnedGroup: boolean = false) => {
    if (items.length === 0) return null;

    return (
      <div className="mb-4">
        <div className="flex items-center gap-1.5 px-3 mb-1.5">
          {isPinnedGroup && <Pin className="w-3 h-3 text-[#B7C9B1]" />}
          <h3 className="text-[11px] font-semibold text-[#B7C9B1] uppercase tracking-wider opacity-90">
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          {items.map((conv) => {
            const isActive = conv.id === activeConversationId;
            const isEditing = conv.id === editingId;

            return (
              <div
                key={conv.id}
                id={`conversation-item-${conv.id}`}
                onClick={() => {
                  onSelectConversation(conv.id);
                  onCloseMobile();
                }}
                className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#243B35] text-[#F1E9D2] font-semibold border border-[#6B8E7B] shadow-[0_0_12px_rgba(183,201,177,0.16)]'
                    : 'text-[#F1E9D2]/85 hover:bg-[#243B35]/40 hover:text-[#F1E9D2] border border-transparent hover:border-[#6B8E7B]/20'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <MessageSquare
                    className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#B7C9B1]' : 'text-[#6B8E7B]'}`}
                  />
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(conv.id, e)}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 flex-1 min-w-0"
                    >
                      <input
                        type="text"
                        autoFocus
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full bg-[#182622] px-2 py-0.5 rounded border border-[#B7C9B1] outline-none text-xs text-[#F1E9D2]"
                      />
                      <button
                        type="submit"
                        onClick={(e) => handleSaveRename(conv.id, e)}
                        className="p-1 text-[#B7C9B1] hover:text-white cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelRename}
                        className="p-1 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  ) : (
                    <span className="truncate">{conv.title}</span>
                  )}
                </div>

                {/* Actions: Pin, Rename, Delete */}
                {!isEditing && (
                  <div className="hidden group-hover:flex items-center gap-1 pl-1">
                    {onTogglePinConversation && (
                      <button
                        type="button"
                        title={conv.isPinned ? 'Unpin conversation' : 'Pin conversation'}
                        onClick={(e) => {
                          e.stopPropagation();
                          onTogglePinConversation(conv.id);
                        }}
                        className={`p-1 rounded transition cursor-pointer ${
                          conv.isPinned
                            ? 'text-[#B7C9B1] hover:text-white'
                            : 'text-[#6B8E7B] hover:text-[#B7C9B1]'
                        }`}
                      >
                        <Pin className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Rename conversation"
                      onClick={(e) => startEditing(conv, e)}
                      className="p-1 rounded text-[#6B8E7B] hover:text-[#F1E9D2] hover:bg-[#243B35] transition cursor-pointer"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      title="Delete conversation"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      className="p-1 rounded text-[#6B8E7B] hover:text-red-300 hover:bg-[#243B35] transition cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#121E1B]/80 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 flex flex-col bg-[#1A2C27]/95 md:bg-[#182823]/90 backdrop-blur-xl border-r border-[#6B8E7B]/25 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand & New Chat Top Bar */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#243B35] via-[#35574D] to-[#6B8E7B] flex items-center justify-center text-[#F1E9D2] shadow-md shadow-[#121E1B]/50 border border-[#B7C9B1]/30">
                <Sparkles className="w-4 h-4 text-[#B7C9B1]" />
              </div>
              <div>
                <span className="font-luxury font-bold text-base tracking-wide text-[#F1E9D2]">
                  Aura AI
                </span>
                <span className="block text-[10px] text-[#B7C9B1] font-medium tracking-wide">
                  Sage Serenity Assistant
                </span>
              </div>
            </div>

            {/* Close button on mobile */}
            <button
              onClick={onCloseMobile}
              type="button"
              className="md:hidden p-1.5 rounded-lg text-[#F1E9D2]/70 hover:text-[#F1E9D2] hover:bg-[#243B35]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* New Chat Button */}
          <button
            id="new-chat-btn"
            type="button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#6B8E7B] hover:bg-[#7D9F8D] text-[#F1E9D2] border border-[#B7C9B1]/30 text-xs font-semibold shadow-sm transition-all cursor-pointer active:scale-[0.99]"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search Box */}
          {conversations.length > 2 && (
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#B7C9B1]/70" />
              <input
                id="search-chats-input"
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#243B35]/70 border border-[#6B8E7B]/30 focus:border-[#B7C9B1] outline-none text-xs text-[#F1E9D2] placeholder-[#B7C9B1]/60 transition-colors"
              />
            </div>
          )}
        </div>

        {/* Scrollable Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-[#B7C9B1]">
              <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-40 text-[#6B8E7B]" />
              <p className="font-medium text-[#F1E9D2]/90">No conversations yet.</p>
              <p className="mt-1 text-[11px] text-[#B7C9B1]/80">Start a new chat to begin!</p>
            </div>
          ) : (
            <>
              {renderGroup('Pinned', pinned, true)}
              {renderGroup('Today', today)}
              {renderGroup('Yesterday', yesterday)}
              {renderGroup('Previous 7 Days', last7Days)}
              {renderGroup('Older', older)}
            </>
          )}
        </div>

        {/* Bottom Bar: Model info, Settings trigger, Theme toggle & Clear data */}
        <div className="p-3 border-t border-[#6B8E7B]/20 bg-[#121E1B]/70 space-y-2">
          {/* Model Status Pill */}
          <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#243B35]/70 border border-[#6B8E7B]/25 text-[11px] text-[#F1E9D2]/90">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#B7C9B1] animate-pulse" />
              <Cpu className="w-3 h-3 text-[#B7C9B1]" />
              <span className="font-mono truncate max-w-[120px]">{modelName}</span>
            </div>
            <span className="text-[10px] font-semibold text-[#B7C9B1] uppercase tracking-wider">
              Gemini
            </span>
          </div>

          {/* Controls: Settings, Theme & Clear */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                id="sidebar-theme-toggle-btn"
                type="button"
                onClick={onToggleTheme}
                className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#243B35] text-[#F1E9D2]/80 hover:text-[#F1E9D2] text-xs font-medium transition cursor-pointer"
                title="Toggle theme"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-[#B7C9B1]" />
                    <span>Light</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-[#B7C9B1]" />
                    <span>Dark</span>
                  </>
                )}
              </button>

              {onOpenSettings && (
                <button
                  id="sidebar-settings-btn"
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-[#243B35] text-[#F1E9D2]/80 hover:text-[#F1E9D2] text-xs font-medium transition cursor-pointer"
                  title="Settings"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#B7C9B1]" />
                  <span>Settings</span>
                </button>
              )}
            </div>

            {conversations.length > 0 && (
              <button
                id="clear-chats-btn"
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all chat history?')) {
                    onClearAll();
                  }
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-500/20 text-[#B7C9B1] hover:text-red-300 text-xs transition cursor-pointer"
                title="Clear all conversations"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};


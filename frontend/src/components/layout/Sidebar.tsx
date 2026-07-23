import React, { useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Menu, X, BrainCircuit } from 'lucide-react';
import { cn } from '../../lib/utils';
import { formatDate, truncate } from '../../lib/utils';
import { Button } from '../ui/button';
import { useChatStore } from '../../stores/chat-store';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { conversations, loadHistory, loadConversation, newConversation, currentConversationId } = useChatStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onToggle} />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-full w-72 flex-col bg-[#131b2e] border-r border-zinc-800/80 transition-transform duration-300 lg:relative lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#4F46E5]/20">
              <BrainCircuit className="h-4 w-4 text-[#c3c0ff]" />
            </div>
            <span className="text-sm font-semibold text-[#dae2fd]">Synthetic Intel.</span>
          </div>
          <button
            onClick={onToggle}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-800/50 lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <Button
            onClick={newConversation}
            variant="secondary"
            className="w-full justify-start gap-2 border-zinc-700/50 bg-[#171f33] text-zinc-300 hover:bg-[#222a3d]"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto px-3">
          {conversations.length === 0 ? (
            <div className="mt-8 text-center text-sm text-zinc-500">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-1">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    loadConversation(conv.id);
                    onToggle();
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors',
                    currentConversationId === conv.id
                      ? 'bg-[#222a3d] text-[#dae2fd]'
                      : 'text-zinc-400 hover:bg-[#171f33]'
                  )}
                >
                  <MessageSquare className="h-4 w-4 shrink-0 text-zinc-500" />
                  <div className="flex-1 overflow-hidden">
                    <div className="truncate font-medium">
                      {truncate(conv.title, 30)}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {formatDate(conv.updatedAt)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800/80 p-3 text-center text-xs text-zinc-500">
          Multi-Agent Research Platform v1.0
        </div>
      </aside>
    </>
  );
}
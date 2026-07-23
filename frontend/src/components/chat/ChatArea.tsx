import React, { useEffect, useRef } from 'react';
import { Bot, Menu, ArrowLeft } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { useChatStore } from '../../stores/chat-store';
import { Button } from '../ui/button';

interface ChatAreaProps {
  onToggleSidebar: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onBackToLanding?: () => void;
}

export function ChatArea({ onToggleSidebar, isDark, onToggleDark, onBackToLanding }: ChatAreaProps) {
  const { messages, sendMessage, isProcessing, newConversation } = useChatStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-[#0b1326]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 bg-[#131b2e] px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/15">
              <Bot className="h-3.5 w-3.5 text-[#4CD7F6]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#dae2fd]">Programming Agent</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Software Development Assistant
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div ref={scrollContainerRef} className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex flex-1 flex-col items-center justify-center px-6">
            <div className="flex w-full max-w-lg flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-zinc-700/50 bg-[#171f33]">
                <Bot className="h-8 w-8 text-[#4CD7F6]" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-[#dae2fd]">
                Programming Agent Ready
              </h2>
              <p className="max-w-md text-center text-sm leading-relaxed text-zinc-400">
                Ask me anything about programming, debugging, algorithms, code optimization,
                architecture, or any software development topic.
              </p>
              <div className="mt-8 grid w-full grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  className="justify-start border border-zinc-700/50 bg-[#171f33] px-4 py-3 text-left text-xs text-zinc-300 hover:bg-[#222a3d]"
                  onClick={() => sendMessage("Debug this React component that's not rendering")}
                >
                  Debug a component
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start border border-zinc-700/50 bg-[#171f33] px-4 py-3 text-left text-xs text-zinc-300 hover:bg-[#222a3d]"
                  onClick={() => sendMessage("Explain the time complexity of binary search")}
                >
                  Explain an algorithm
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start border border-zinc-700/50 bg-[#171f33] px-4 py-3 text-left text-xs text-zinc-300 hover:bg-[#222a3d]"
                  onClick={() => sendMessage("Generate a REST API in Node.js with Express")}
                >
                  Generate a REST API
                </Button>
                <Button
                  variant="secondary"
                  className="justify-start border border-zinc-700/50 bg-[#171f33] px-4 py-3 text-left text-xs text-zinc-300 hover:bg-[#222a3d]"
                  onClick={() => sendMessage("What are the best practices for React performance?")}
                >
                  Performance tips
                </Button>
              </div>
            </div>
          </div>
        ) : (
          /* Message List */
          <div className="mx-auto flex w-full max-w-4xl flex-col px-6 py-6">
            <div className="flex flex-col">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isProcessing && (
                <div className="flex items-center gap-3 py-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4CD7F6]/20">
                    <Bot className="h-4 w-4 text-[#4CD7F6]" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-500" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isProcessing} />
    </div>
  );
}
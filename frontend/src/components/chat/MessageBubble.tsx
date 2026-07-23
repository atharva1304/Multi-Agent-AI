import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, User, Bot, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Message, Reference } from '../../types';
import { Button } from '../ui/button';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showCitations, setShowCitations] = useState(false);
  const isUser = message.role === 'user';
  const confidenceScore = message.confidenceScore;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex w-full gap-4 py-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[#4CD7F6]/20">
          <Bot className="h-4 w-4 text-[#4CD7F6]" />
        </div>
      )}

      <div className={cn('flex max-w-[85%] flex-col gap-2', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-[#4F46E5]/15 text-[#dae2fd] border border-[#4F46E5]/20'
              : 'bg-[#171f33] text-[#dae2fd] border border-zinc-700/50'
          )}
        >
          <div className="prose prose-sm max-w-none prose-code:rounded prose-code:bg-zinc-800 prose-code:px-1 prose-code:py-0.5 prose-code:text-[#4CD7F6] prose-pre:bg-[#060e20] prose-pre:border prose-pre:border-zinc-700/50 prose-pre:text-zinc-200">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content || ''}
            </ReactMarkdown>
          </div>
        </div>

        {/* Confidence Score */}
        {!isUser && confidenceScore !== undefined && confidenceScore !== null && (
          <div className="flex items-center gap-2 px-1">
            <span
              className={cn(
                'text-[10px] font-medium uppercase tracking-wider',
                confidenceScore >= 0.8
                  ? 'text-[#4EDEA3]'
                  : confidenceScore >= 0.5
                    ? 'text-[#FBBF24]'
                    : 'text-red-400'
              )}
            >
              Confidence • {(confidenceScore * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {/* Citations */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="w-full">
            <button
              onClick={() => setShowCitations(!showCitations)}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300"
            >
              {showCitations ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {message.citations.length} {message.citations.length === 1 ? 'Reference' : 'References'}
            </button>

            {showCitations && (
              <div className="mt-2 space-y-1 rounded-lg border border-zinc-800/50 bg-[#131b2e] p-2">
                {message.citations.map((citation, idx) => (
                  <a
                    key={idx}
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded px-2 py-1 text-xs text-zinc-400 hover:bg-[#222a3d] hover:text-zinc-200"
                  >
                    <ExternalLink className="h-3 w-3 shrink-0" />
                    <span className="flex-1 truncate">{citation.title}</span>
                    <span className="shrink-0 text-zinc-500">
                      {citation.source.replace('_', ' ')}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {!isUser && (
          <div className="flex items-center gap-1 px-1">
            <button
              onClick={handleCopy}
              className="rounded p-1 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
              title="Copy response"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#4EDEA3]" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-full bg-[#4F46E5]/20 border border-[#4F46E5]/30">
          <User className="h-4 w-4 text-[#c3c0ff]" />
        </div>
      )}
    </div>
  );
}
import React from 'react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import { Sparkles, Clock, type LucideIcon } from 'lucide-react';

interface AgentCardProps {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  gradient: string;
  status: 'active' | 'coming-soon';
  capabilities: string[];
  metrics?: { label: string; value: string }[];
  onSelect?: (id: string) => void;
}

export function AgentCard({
  id,
  name,
  description,
  icon: Icon,
  color,
  gradient,
  status,
  capabilities,
  metrics,
  onSelect,
}: AgentCardProps) {
  const isActive = status === 'active';

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border transition-all duration-300',
        isActive
          ? 'border-zinc-700/80 bg-[#171f33] hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(76,215,246,0.08)]'
          : 'border-zinc-700/50 bg-[#171f33]/60 opacity-70 hover:opacity-80',
      )}
    >
      {/* Subtle gradient background */}
      <div className={cn('absolute inset-0 bg-gradient-to-b opacity-[0.03]', gradient)} />

      {/* Status indicator bar */}
      <div
        className="absolute left-0 top-0 h-full w-[3px]"
        style={{
          background: isActive
            ? `linear-gradient(to bottom, ${color}, ${color}88)`
            : 'linear-gradient(to bottom, #52525b, #3f3f46)',
        }}
      />

      {/* Content */}
      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Icon with glow */}
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg border',
                isActive ? 'border-zinc-600' : 'border-zinc-700',
              )}
              style={{
                background: isActive ? `${color}15` : 'transparent',
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: isActive ? color : '#71717a' }}
              />
            </div>
            <div>
              <h3
                className="text-sm font-semibold tracking-tight"
                style={{ color: isActive ? '#e2e8f0' : '#a1a1aa' }}
              >
                {name}
              </h3>
              {metrics && metrics.length > 0 && (
                <div className="mt-1 flex items-center gap-3">
                  {metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-1">
                      <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        {metric.label}
                      </span>
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color }}
                      >
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider',
              isActive
                ? 'bg-cyan-500/10 text-cyan-400'
                : 'bg-zinc-700/40 text-zinc-400',
            )}
          >
            {isActive ? (
              <>
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan-400" />
                </span>
                Active
              </>
            ) : (
              <>
                <Clock className="h-2.5 w-2.5" />
                Coming Soon
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="mt-3 text-xs leading-relaxed text-zinc-400">
          {description}
        </p>

        {/* Capabilities */}
        <div className="mt-4 flex flex-wrap gap-1.5">
          {capabilities.slice(0, 3).map((cap, idx) => (
            <span
              key={idx}
              className={cn(
                'rounded-md px-2 py-0.5 text-[10px] font-medium',
                isActive
                  ? 'bg-zinc-700/50 text-zinc-300'
                  : 'bg-zinc-800/50 text-zinc-500',
              )}
            >
              {cap}
            </span>
          ))}
          {capabilities.length > 3 && (
            <span className="rounded-md bg-zinc-800/30 px-2 py-0.5 text-[10px] text-zinc-500">
              +{capabilities.length - 3} more
            </span>
          )}
        </div>

        {/* Action button */}
        <div className="mt-5">
          <Button
            onClick={() => isActive && onSelect?.(id)}
            disabled={!isActive}
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            className={cn(
              'w-full text-xs font-medium transition-all',
              isActive
                ? 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300'
                : 'cursor-not-allowed text-zinc-600',
            )}
          >
            {isActive ? (
              <>
                <Sparkles className="mr-1.5 h-3 w-3" />
                Launch Agent
              </>
            ) : (
              'Unavailable'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
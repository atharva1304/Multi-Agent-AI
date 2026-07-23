import React from 'react';
import { BrainCircuit, Menu, Moon, Sun, ChevronRight } from 'lucide-react';
import { AgentCard } from './AgentCard';
import { agents } from '../../data/agents';
import { cn } from '../../lib/utils';

interface LandingPageProps {
  onSelectAgent: (agentId: string) => void;
  isDark: boolean;
  onToggleDark: () => void;
  onToggleSidebar: () => void;
}

export function LandingPage({ onSelectAgent, isDark, onToggleDark, onToggleSidebar }: LandingPageProps) {
  return (
    <div className="flex h-full flex-col bg-[#0b1326]">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800/50 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#4F46E5]/20">
              <BrainCircuit className="h-5 w-5 text-[#c3c0ff]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#dae2fd]">Synthetic Intelligence</h1>
              <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                Autonomous Research Network
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleDark}
            className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800/50"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-10">
          {/* Hero Section */}
          <div className="mb-12 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 px-4 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>
              <span className="text-[11px] font-medium text-zinc-400">
                Multi-Agent System v2.0 — 1 Agent Active
              </span>
            </div>
            <h2 className="mb-3 text-[32px] font-bold leading-tight tracking-tight text-[#dae2fd]">
              Research Intelligence
              <br />
              <span className="bg-gradient-to-r from-[#c3c0ff] to-[#4CD7F6] bg-clip-text text-transparent">
                Powered by Multi-Agent AI
              </span>
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-zinc-400">
              Deploy specialized AI agents for deep research across biomedical, legal, market,
              academic, and software domains. Each agent is purpose-built for its domain expertise.
            </p>
          </div>

          {/* Agent Grid */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent, idx) => (
              <div
                key={agent.id}
                className={cn(
                  idx === agents.length - 1 && agents.length % 3 === 2
                    ? 'sm:col-span-2 lg:col-span-1'
                    : '',
                )}
              >
                <AgentCard
                  {...agent}
                  onSelect={onSelectAgent}
                />
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-6 rounded-xl border border-zinc-800/50 bg-zinc-800/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20">
                  <div className="h-2 w-2 rounded-full bg-emerald-400" />
                </div>
                <span className="text-xs text-zinc-400">Programming Agent — Active</span>
              </div>
              <div className="h-4 w-px bg-zinc-700/50" />
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-700/40">
                  <div className="h-2 w-2 rounded-full bg-zinc-500" />
                </div>
                <span className="text-xs text-zinc-500">4 Agents — In Development</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
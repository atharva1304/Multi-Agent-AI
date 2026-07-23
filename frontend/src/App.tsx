import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { ChatArea } from './components/chat/ChatArea';
import { LandingPage } from './components/agents/LandingPage';

const queryClient = new QueryClient();

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true); // Dark mode first as per DESIGN.md

  // Lock dark mode always on
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const handleSelectAgent = (agentId: string) => {
    setSelectedAgent(agentId);
    setSidebarOpen(false);
  };

  const handleBackToLanding = () => {
    setSelectedAgent(null);
  };

  // Only show chat interface for the programming agent
  const showChat = selectedAgent === 'programming';

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex h-screen bg-[#0b1326] text-[#dae2fd]">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex flex-1 flex-col overflow-hidden">
          {showChat ? (
            <ChatArea
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              isDark={true}
              onToggleDark={() => {}} // No-op: locked to dark
              onBackToLanding={handleBackToLanding}
            />
          ) : (
            <LandingPage
              onSelectAgent={handleSelectAgent}
              isDark={true}
              onToggleDark={() => {}}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
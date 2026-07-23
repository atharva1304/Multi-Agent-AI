import React, { useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = React.useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput('');
    }
  };

  return (
    <div className="border-t border-zinc-800/80 bg-[#131b2e] p-4">
      <div className="mx-auto max-w-4xl">
        <div className="relative flex items-end gap-2">
          <div className="relative flex-1">
            <Input
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSend={handleSend}
              placeholder={placeholder || "Ask a programming question..."}
              disabled={disabled}
              className="pr-12 bg-[#060e20] border-zinc-700/50 text-zinc-200 placeholder:text-zinc-500 focus:ring-[#4CD7F6] focus:border-[#4CD7F6]/50"
            />
            <div className="absolute bottom-2 right-3">
              <Sparkles className="h-4 w-4 text-zinc-500" />
            </div>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || disabled}
            size="md"
            className="shrink-0 bg-[#4CD7F6]/10 text-[#4CD7F6] hover:bg-[#4CD7F6]/20 enabled:hover:text-[#4CD7F6]"
          >
            {disabled ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#4CD7F6] border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="mt-2 text-center text-xs text-zinc-500">
          Programming Agent • Powered by AI • Responses are validated and cited
        </p>
      </div>
    </div>
  );
}
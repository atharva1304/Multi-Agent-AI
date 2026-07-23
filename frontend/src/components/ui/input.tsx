import * as React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onSend?: () => void;
}

const Input = React.forwardRef<HTMLTextAreaElement, InputProps>(
  ({ className, onSend, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend?.();
      }
    };

    return (
      <textarea
        className={cn(
          'flex w-full resize-none rounded-xl border bg-[#060e20] px-4 py-3 text-sm placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#4CD7F6] focus:border-transparent border-zinc-700/50 text-zinc-200',
          'min-h-[52px] max-h-[200px]',
          className
        )}
        ref={ref}
        onKeyDown={handleKeyDown}
        rows={1}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
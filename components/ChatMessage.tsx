import React from 'react';
import { useEffect, useRef } from 'react';
import { cn } from '../utils/cn';

export interface MessageProps {
  content: string;
  isUser: boolean;
  timestamp?: Date | null;
}

export function ChatMessage({ content, isUser, timestamp }: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to this message when it's added
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [content]);

  return (
    <div
      ref={messageRef}
      className={cn(
        'flex w-full mb-4 last:mb-0',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3 shadow-sm',
          isUser 
            ? 'bg-blue-600 text-white rounded-br-none' 
            : 'bg-gray-100 text-gray-800 rounded-bl-none'
        )}
      >
        <div className="whitespace-pre-wrap">{content}</div>
        {timestamp && (
          <div 
            className={cn(
              'text-xs mt-1 text-right', 
              isUser ? 'text-blue-100' : 'text-gray-500'
            )}
          >
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  );
}

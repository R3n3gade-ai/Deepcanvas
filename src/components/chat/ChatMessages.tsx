import React, { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage } from '../../features/ai-chat/types';

interface ChatMessagesProps {
  messages: ChatMessage[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">Welcome to AI Chat</h3>
          <p className="text-gray-600 mb-4">
            Ask me anything about your business, projects, or get help with tasks.
            I can assist with planning, analysis, content creation, and more.
          </p>
          <div className="grid grid-cols-2 gap-2 mt-6">
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <p className="font-medium text-sm">Analyze my customer data</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <p className="font-medium text-sm">Draft a marketing email</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <p className="font-medium text-sm">Help me plan a project</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <p className="font-medium text-sm">Generate content ideas</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-white">
      <div className="max-w-3xl mx-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}
          >
            <div
              className={`inline-block max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.role === 'assistant' ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}

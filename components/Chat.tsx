import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ChatMessage } from './ChatMessage';
import { useChatStore, ChatMessage as ChatMessageType } from '../utils/chatStore';
import { Timestamp } from 'firebase/firestore';

export interface ChatProps {
  conversationId?: string;
}

export function Chat({ conversationId }: ChatProps) {
  const {
    conversations,
    currentConversationId,
    isLoading,
    isSending,
    error,
    loadConversation,
    createNewConversation,
    sendMessage,
    setCurrentConversation
  } = useChatStore();

  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation when component mounts or conversationId changes
  useEffect(() => {
    const init = async () => {
      if (conversationId) {
        await loadConversation(conversationId);
      } else if (currentConversationId) {
        await loadConversation(currentConversationId);
      } else {
        // Create a new conversation if none is provided
        const newId = await createNewConversation();
        if (newId) setCurrentConversation(newId);
      }
    };

    init();
  }, [conversationId, currentConversationId]);

  // Get current conversation messages
  const currentConversation = conversations.find(
    (conv) => conv.id === currentConversationId
  );
  const messages = currentConversation?.messages || [];

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    await sendMessage(inputValue.trim());
    setInputValue('');
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Convert Firebase Timestamp to Date
  const convertTimestamp = (timestamp: Timestamp | null | undefined): Date | null => {
    if (!timestamp) return null;
    return timestamp.toDate();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-full text-center text-gray-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-lg font-medium mb-1">No messages yet</h3>
            <p className="text-sm max-w-md">
              Start a conversation with Gemini AI. Ask a question or share what you need help with.
            </p>
          </div>
        ) : (
          <>
            {messages.map((message: ChatMessageType, index: number) => (
              <ChatMessage
                key={message.id || index}
                content={message.content}
                isUser={message.role === 'user'}
                timestamp={convertTimestamp(message.timestamp)}
              />
            ))}
            {isSending && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-100 rounded-lg px-4 py-3 text-gray-800 rounded-bl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t p-4 bg-white">
        {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
        <div className="flex space-x-2">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="flex-1 resize-none min-h-[60px] max-h-[120px]"
            disabled={isSending || isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isSending || isLoading}
            className="self-end"
          >
            <span className="sr-only">Send</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

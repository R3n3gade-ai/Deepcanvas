import React, { useState, useEffect } from 'react';
import { useCurrentUser } from 'app/auth/useCurrentUser';
import { AIChatService } from '../features/ai-chat/services/chatService';
import { ChatSession } from '../features/ai-chat/types';

export default function AIChat() {
  const { user } = useCurrentUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 1000,
    streamResponse: true,
    enableRAG: true
  });

  const handleSendMessage = async (content: string) => {
    setStreaming(true);
    try {
      await chatService.streamChat(
        content,
        currentSession,
        userContext,
        (token) => {
          // Handle streaming response
          setMessages(prev => {
            const lastMessage = prev[prev.length - 1];
            if (lastMessage?.role === 'assistant') {
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: lastMessage.content + token }
              ];
            }
            return [...prev, { role: 'assistant', content: token }];
          });
        }
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatSidebar 
        settings={settings} 
        onSettingsChange={setSettings}
      />
      <div className="flex-1 flex flex-col">
        <ChatMessages messages={messages} />
        <ChatInput 
          onSendMessage={handleSendMessage} 
          disabled={streaming} 
        />
      </div>
    </div>
  );
}
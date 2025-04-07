import React, { useState, useEffect } from 'react';
import { ChatInput } from '../components/chat/ChatInput';
import { ChatMessages } from '../components/chat/ChatMessages';
import { ChatSidebar } from '../components/chat/ChatSidebar';
import { ChatMessage, ChatSettings } from '../features/ai-chat/types';

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    model: 'gemini-pro',
    temperature: 0.7,
    maxTokens: 2000,
    streamResponse: true,
    enableRAG: false
  });

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: ChatMessage = { role: 'user', content };
    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Simulate AI response
      const aiResponse: ChatMessage = {
        role: 'assistant',
        content: `This is a simulated response to: "${content}"\n\nIn a real implementation, this would connect to the Gemini API or other AI services. The response would be generated based on your settings:\n\n- Model: ${settings.model}\n- Temperature: ${settings.temperature}\n- Max Tokens: ${settings.maxTokens}\n- Stream Response: ${settings.streamResponse ? 'Enabled' : 'Disabled'}\n- RAG: ${settings.enableRAG ? 'Enabled' : 'Disabled'}`
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error processing message:', error);

      // Add error message
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please try again.'
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-full">
      <ChatSidebar
        settings={settings}
        onSettingsChange={setSettings}
      />
      <div className="flex-1 flex flex-col h-full">
        <ChatMessages messages={messages} />
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}
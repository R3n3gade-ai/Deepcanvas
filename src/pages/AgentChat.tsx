import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'agent';
  content: string;
}

export default function AgentChat() {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Add user message
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');

    // Simulate agent response
    setTimeout(() => {
      setMessages([
        ...newMessages,
        {
          role: 'agent',
          content: 'I\'m a simulated AI response. In a real implementation, this would connect to Vertex AI/Gemini.'
        }
      ]);
    }, 1000);
  };

  return (
    <div className="overflow-hidden flex flex-col h-full">
        <div className="border-b bg-white p-4">
          <div className="container mx-auto max-w-4xl">
            <h1 className="font-medium">Agent Chat</h1>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="container mx-auto max-w-4xl space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t bg-white p-4">
          <div className="container mx-auto max-w-4xl flex gap-2">
            <input
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              onClick={handleSendMessage}
            >
              Send
            </button>
          </div>
        </div>
    </div>
  );
}

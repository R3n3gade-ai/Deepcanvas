import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Chat } from '../components/Chat';
import { useChatStore } from '../utils/chatStore';
import { Button } from '@/components/ui/button';

export default function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('id');
  
  const { 
    conversations, 
    loadConversations, 
    createNewConversation,
    currentConversationId
  } = useChatStore();

  // Load conversations when component mounts
  useEffect(() => {
    loadConversations();
  }, []);

  // Handle creating a new conversation
  const handleNewConversation = async () => {
    const newId = await createNewConversation();
    if (newId) {
      navigate(`/chat?id=${newId}`);
    }
  };

  // Switch to a different conversation
  const handleConversationClick = (id: string) => {
    navigate(`/chat?id=${id}`);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Conversations List */}
        <div className="w-64 border-r bg-white overflow-y-auto flex flex-col">
          <div className="p-4 border-b">
            <Button 
              onClick={handleNewConversation} 
              className="w-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
                <path fillRule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
              </svg>
              New Chat
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${conversation.id === (conversationId || currentConversationId) ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
              >
                <div className="truncate font-medium">{conversation.title}</div>
                <div className="text-xs text-gray-500 truncate mt-1">
                  {conversation.lastUpdated ? (
                    new Date(conversation.lastUpdated.toDate()).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  ) : 'Just now'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col bg-white">
          <Chat conversationId={conversationId || undefined} />
        </div>
      </div>
    </div>
  );
}

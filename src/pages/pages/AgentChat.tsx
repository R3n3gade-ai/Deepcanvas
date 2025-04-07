import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "components/Sidebar";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Bot,
  User,
  Send,
  ArrowLeft,
  Edit,
  Loader2,
  RefreshCw,
  Copy,
  Check,
  Info,
  X
} from "lucide-react";

import agentService from "../utils/agentService";
import { Agent, AgentMessage, AgentSession } from "../utils/agentTypes";

export default function AgentChat() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [session, setSession] = useState<AgentSession | null>(null);
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  
  // Load agent and create a session
  useEffect(() => {
    const loadAgentAndSession = async () => {
      if (!agentId) {
        navigate("/agents");
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Load agent
        const loadedAgent = agentService.getAgent(agentId);
        
        if (!loadedAgent) {
          toast.error("Agent not found");
          navigate("/agents");
          return;
        }
        
        setAgent(loadedAgent);
        
        // Create or load a session
        const sessions = agentService.loadAgentSessions(agentId, 'user-123');
        let currentSession;
        
        if (sessions.length > 0) {
          // Use the most recent session
          currentSession = sessions.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )[0];
        } else {
          // Create a new session
          currentSession = agentService.createAgentSession(agentId, 'user-123');
        }
        
        setSession(currentSession);
        
        // Load messages for this session
        const sessionMessages = agentService.loadAgentMessages(currentSession.id);
        setMessages(sessionMessages);
        
        // If no messages, add a welcome message
        if (sessionMessages.length === 0) {
          const welcomeMessage = agentService.addAgentMessage(
            agentId,
            currentSession.id,
            'agent',
            `Hello! I'm ${loadedAgent.name}. ${loadedAgent.description} How can I help you today?`
          );
          
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error("Error loading agent and session:", error);
        toast.error("Failed to load agent");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAgentAndSession();
  }, [agentId, navigate]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Handle send message
  const handleSendMessage = async () => {
    if (!input.trim() || !agent || !session) return;
    
    const userMessage = input;
    setInput("");
    setIsProcessing(true);
    
    // Add user message to UI immediately
    const newUserMessage = agentService.addAgentMessage(
      agent.id,
      session.id,
      'user',
      userMessage
    );
    
    setMessages(prev => [...prev, newUserMessage]);
    
    try {
      // Execute the agent
      const result = await agentService.executeAgent(agent.id, session.id, userMessage);
      
      if (result.success && result.response) {
        // Load the updated messages
        const updatedMessages = agentService.loadAgentMessages(session.id);
        setMessages(updatedMessages);
      } else {
        // Add error message
        const errorMessage = agentService.addAgentMessage(
          agent.id,
          session.id,
          'system',
          `Error: ${result.error || "Failed to generate a response"}`
        );
        
        setMessages(prev => [...prev, errorMessage]);
        toast.error("Failed to generate a response");
      }
    } catch (error) {
      console.error("Error executing agent:", error);
      toast.error("Failed to process your message");
      
      // Add error message
      const errorMessage = agentService.addAgentMessage(
        agent.id,
        session.id,
        'system',
        `Error: ${error instanceof Error ? error.message : "An unknown error occurred"}`
      );
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  // Copy message to clipboard
  const handleCopyMessage = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    
    // Reset copied state after 2 seconds
    setTimeout(() => {
      setCopiedMessageId(null);
    }, 2000);
  };
  
  // Format message content
  const formatMessageContent = (content: string) => {
    // Simple markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => <div key={i}>{line || <br />}</div>);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!agent || !session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <X className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2">Agent Not Found</h2>
          <p className="text-gray-500 mb-4">
            The agent you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate("/agents")}>
            Go Back to Agents
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b bg-white p-4">
          <div className="container mx-auto max-w-4xl flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate("/agents")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                
                <div>
                  <h1 className="font-medium">{agent.name}</h1>
                  <p className="text-xs text-gray-500">{agent.personality.name}</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/agent-builder/${agent.id}`)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Agent
            </Button>
          </div>
        </div>
        
        {/* Chat area */}
        <ScrollArea className="flex-1 p-4">
          <div className="container mx-auto max-w-4xl space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`flex max-w-[80%] ${
                    message.role === 'user'
                      ? 'flex-row-reverse'
                      : message.role === 'system'
                      ? 'items-center'
                      : ''
                  }`}
                >
                  {message.role !== 'system' && (
                    <div className="flex-shrink-0 mx-2">
                      <Avatar className="h-8 w-8">
                        {message.role === 'user' ? (
                          <AvatarFallback>
                            <User className="h-4 w-4" />
                          </AvatarFallback>
                        ) : (
                          <AvatarFallback>
                            <Bot className="h-4 w-4" />
                          </AvatarFallback>
                        )}
                      </Avatar>
                    </div>
                  )}
                  
                  <div
                    className={`relative p-4 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-yellow-100 text-yellow-800 flex items-center'
                        : 'bg-gray-100'
                    }`}
                  >
                    {message.role === 'system' && (
                      <Info className="h-4 w-4 mr-2 flex-shrink-0" />
                    )}
                    
                    <div className="whitespace-pre-wrap">
                      {formatMessageContent(message.content)}
                    </div>
                    
                    {message.role !== 'user' && message.role !== 'system' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                        onClick={() => handleCopyMessage(message.content, message.id)}
                      >
                        {copiedMessageId === message.id ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex max-w-[80%]">
                  <div className="flex-shrink-0 mx-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-gray-100">
                    <div className="flex items-center">
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        {/* Input area */}
        <div className="border-t bg-white p-4">
          <div className="container mx-auto max-w-4xl">
            <div className="flex items-end gap-2">
              <Textarea
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                className="flex-1 min-h-[60px] max-h-[200px]"
                disabled={isProcessing}
              />
              
              <Button
                size="icon"
                className="h-10 w-10"
                onClick={handleSendMessage}
                disabled={!input.trim() || isProcessing}
              >
                {isProcessing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-gray-500 text-center">
              {agent.tools.length > 0 ? (
                <span>
                  This agent has access to {agent.tools.length} tools and can help with various tasks.
                </span>
              ) : (
                <span>
                  This agent doesn't have any tools yet. You can add tools in the agent builder.
                </span>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

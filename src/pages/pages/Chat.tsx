import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Send, Settings, Bot, User, Sparkles, Loader2, Paperclip, Trash, Download, Save, AlertCircle, FileText, Image, MessageSquare, Code, Database } from "lucide-react";
import { Message, ChatSettings, ChatSession, FileAttachment } from "../types/chat";
import { saveChatHistory, loadChatHistory, deleteChatHistory, clearAllChatHistory, generateSystemPrompt, processFileForRAG } from "../utils/chatService";
import { getConnectedApis } from "../utils/apiHubService";
import brainService from "../utils/brainService";
import { BrainInfluenceIndicator } from "../components/brain";
import * as unifiedAiService from "../utils/unifiedAiService";
import { AIProvider } from "../utils/unifiedAiService";

export default function Chat() {
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Chat state
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [chatSessions, setChatSessions] = useState<Record<string, ChatSession>>({});
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState<string | null>(null);

  // File attachments
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ChatSettings>({
    model: "gemini-pro",
    temperature: 0.7,
    maxTokens: 1024,
    streamResponse: true,
    enableRAG: false,
  });

  // API key status
  const [hasApiKey, setHasApiKey] = useState(false);
  const [availableModels, setAvailableModels] = useState<{id: string, name: string, provider: string}[]>([]);

  // Load chat history and check API key on mount
  useEffect(() => {
    // Check if API key is set
    setHasApiKey(unifiedAiService.isProviderApiKeySet(AIProvider.GEMINI));

    // Load available models based on connected APIs
    const loadModels = async () => {
      try {
        const models = await unifiedAiService.getAvailableModels(AIProvider.GEMINI);
        setAvailableModels(models.map(model => ({
          ...model,
          provider: 'google-ai'
        })));
      } catch (error) {
        console.error('Error loading models:', error);
        setAvailableModels([{ id: 'gemini-pro', name: 'Gemini Pro', provider: 'google-ai' }]);
      }
    };
    loadModels();

    // Load chat history
    const history = loadChatHistory();
    const sessions: Record<string, ChatSession> = {};

    Object.entries(history).forEach(([id, data]) => {
      sessions[id] = {
        id,
        name: data.messages.length > 0 ? data.messages[0].content.substring(0, 30) + "..." : "New Chat",
        messages: data.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })),
        lastUpdated: new Date(data.lastUpdated)
      };
    });

    setChatSessions(sessions);

    // If there are sessions, set the most recent one as active
    const sortedIds = Object.keys(sessions).sort((a, b) =>
      sessions[b].lastUpdated.getTime() - sessions[a].lastUpdated.getTime()
    );

    if (sortedIds.length > 0) {
      const mostRecentId = sortedIds[0];
      setActiveChatId(mostRecentId);
      setMessages(sessions[mostRecentId].messages);
    }
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingResponse]);

  // Create a new chat session
  const createNewChat = () => {
    const newChatId = Date.now().toString();
    const systemMessage: Message = {
      id: `system-${newChatId}`,
      role: "system",
      content: generateSystemPrompt(settings.enableRAG),
      timestamp: new Date(),
    };

    const newSession: ChatSession = {
      id: newChatId,
      name: "New Chat",
      messages: [systemMessage],
      lastUpdated: new Date(),
    };

    setChatSessions(prev => ({
      ...prev,
      [newChatId]: newSession,
    }));

    setActiveChatId(newChatId);
    setMessages([systemMessage]);
    setAttachments([]);
    setStreamingResponse(null);

    return newChatId;
  };

  // Update chat session
  const updateChatSession = (chatId: string, updatedMessages: Message[]) => {
    setChatSessions(prev => {
      const session = prev[chatId];
      if (!session) return prev;

      // Update the chat name based on the first user message
      const firstUserMessage = updatedMessages.find(msg => msg.role === "user");
      const name = firstUserMessage
        ? firstUserMessage.content.substring(0, 30) + (firstUserMessage.content.length > 30 ? "..." : "")
        : "New Chat";

      const updatedSession: ChatSession = {
        ...session,
        name,
        messages: updatedMessages,
        lastUpdated: new Date(),
      };

      return {
        ...prev,
        [chatId]: updatedSession,
      };
    });

    // Save to local storage
    saveChatHistory(chatId, updatedMessages);
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Check if API key is set
    if (!hasApiKey) {
      toast.error("Please set your Gemini API key in the Studio settings");
      return;
    }

    // Create a new chat if none is active
    const chatId = activeChatId || createNewChat();

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    updateChatSession(chatId, updatedMessages);
    setInputMessage("");
    setIsLoading(true);
    setStreamingResponse("");

    // Update settings to include knowledge base integration
    const settingsWithBrain = {
      ...settings,
      useKnowledgeBase: settings.enableRAG, // Use the enableRAG setting
      userId: 'user-123', // Replace with actual user ID in production
      systemPrompt: await generateSystemPrompt(settings.enableRAG)
    };

    // Get brain context for the query
    let brainContext = "";
    if (settings.enableRAG) {
      try {
        brainContext = await brainService.generateContext('user-123', inputMessage);
      } catch (error) {
        console.error('Error getting brain context:', error);
      }
    }

    // Determine which AI provider to use
    const provider = AIProvider.GEMINI; // Default to Gemini

    try {
      if (settings.streamResponse) {
        // Stream the response
        await unifiedAiService.streamChatResponse(
          updatedMessages,
          settingsWithBrain,
          provider,
          (chunk) => {
            setStreamingResponse(chunk);
          },
          (fullResponse) => {
            const assistantMessage: Message = {
              id: (Date.now() + 1).toString(),
              role: "assistant",
              content: fullResponse,
              timestamp: new Date(),
              brainContext: settings.enableRAG ? brainContext : undefined,
            };

            const newMessages = [...updatedMessages, assistantMessage];
            setMessages(newMessages);
            updateChatSession(chatId, newMessages);
            setStreamingResponse(null);
            setIsLoading(false);

            // Log this interaction to the Brain for future reference
            try {
              brainService.logActivity({
                type: 'chat',
                action: 'chat_completed',
                details: {
                  chatId: chatId,
                  userMessage: inputMessage,
                  aiResponse: fullResponse.substring(0, 200) + (fullResponse.length > 200 ? '...' : '') // Store a preview
                },
                userId: 'user-123' // Replace with actual user ID in production
              });
            } catch (error) {
              console.error('Error logging chat to Brain:', error);
            }
          },
          (error) => {
            toast.error(error.message);
            setIsLoading(false);
            setStreamingResponse(null);
          }
        );
      } else {
        // Get the full response at once
        const response = await unifiedAiService.generateChatResponse(updatedMessages, settingsWithBrain, provider);

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
          timestamp: new Date(),
          brainContext: settings.enableRAG ? brainContext : undefined,
        };

        const newMessages = [...updatedMessages, assistantMessage];
        setMessages(newMessages);
        updateChatSession(chatId, newMessages);
        setIsLoading(false);

        // Log this interaction to the Brain for future reference
        try {
          brainService.logActivity({
            type: 'chat',
            action: 'chat_completed',
            details: {
              chatId: chatId,
              userMessage: inputMessage,
              aiResponse: response.substring(0, 200) + (response.length > 200 ? '...' : '') // Store a preview
            },
            userId: 'user-123' // Replace with actual user ID in production
          });
        } catch (error) {
          console.error('Error logging chat to Brain:', error);
        }
      }
    } catch (error) {
      console.error("Error generating response:", error);
      toast.error("Failed to generate response. Please try again.");
      setIsLoading(false);
      setStreamingResponse(null);
    }
  };

  // Handle clearing the current chat
  const handleClearChat = () => {
    if (messages.length === 0) return;

    const confirmed = window.confirm("Are you sure you want to clear the chat history?");
    if (confirmed) {
      if (activeChatId) {
        deleteChatHistory(activeChatId);
        setChatSessions(prev => {
          const newSessions = { ...prev };
          delete newSessions[activeChatId];
          return newSessions;
        });
      }

      setMessages([]);
      setActiveChatId("");
      setAttachments([]);
      toast.success("Chat history cleared");
    }
  };

  // Handle deleting all chats
  const handleDeleteAllChats = () => {
    const confirmed = window.confirm("Are you sure you want to delete all chats? This cannot be undone.");
    if (confirmed) {
      clearAllChatHistory();
      setChatSessions({});
      setMessages([]);
      setActiveChatId("");
      setAttachments([]);
      toast.success("All chats deleted");
    }
  };

  // Handle selecting a chat
  const handleSelectChat = (chatId: string) => {
    if (chatId === activeChatId) return;

    const session = chatSessions[chatId];
    if (session) {
      setActiveChatId(chatId);
      setMessages(session.messages);
      setAttachments([]);
      setStreamingResponse(null);
    }
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingFile(true);

    try {
      const newAttachments: FileAttachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = Date.now() + i.toString();

        // Process file for RAG if enabled
        if (settings.enableRAG) {
          await processFileForRAG(file);
        }

        newAttachments.push({
          id: fileId,
          name: file.name,
          type: file.type,
          size: file.size,
        });
      }

      setAttachments(prev => [...prev, ...newAttachments]);
      toast.success(`${newAttachments.length} file(s) uploaded`);

      // Add a message about the uploaded files
      if (newAttachments.length > 0) {
        const fileNames = newAttachments.map(a => a.name).join(", ");
        setInputMessage(prev =>
          prev + (prev ? "\n" : "") + `I've uploaded the following files: ${fileNames}. Please help me analyze them.`
        );
      }
    } catch (error) {
      console.error("Error processing files:", error);
      toast.error("Failed to process files. Please try again.");
    } finally {
      setIsProcessingFile(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Handle removing an attachment
  const handleRemoveAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Handle settings changes
  const handleSettingsChange = (key: keyof ChatSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Chat Sidebar */}
      <div className="w-64 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">AI Chat</h2>
        </div>

        <div className="p-4">
          <Button className="w-full" onClick={() => {
            setMessages([]);
            toast.success("Started new chat");
          }}>
            New Chat
          </Button>
        </div>

        <div className="px-4 py-2">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Chats</h3>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start text-gray-700" disabled>
              <span className="truncate">No recent chats</span>
            </Button>
          </div>
        </div>

        <div className="mt-auto p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full flex items-center justify-between"
            onClick={() => setShowSettings(!showSettings)}
          >
            <span>Settings</span>
            <Settings size={16} />
          </Button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Bot size={32} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Welcome to AI Chat</h2>
              <p className="text-gray-500 max-w-md mb-8">
                Ask me anything about your business, projects, or get help with tasks.
                I can assist with planning, analysis, content creation, and more.
              </p>

              <div className="grid grid-cols-2 gap-3 max-w-lg">
                <Button
                  variant="outline"
                  className="flex flex-col items-start p-4 h-auto"
                  onClick={() => setInputMessage("Help me create a marketing plan for my new product")}
                >
                  <Sparkles size={18} className="mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Create a marketing plan</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-start p-4 h-auto"
                  onClick={() => setInputMessage("Write a professional email to a client about project delays")}
                >
                  <Sparkles size={18} className="mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Draft a professional email</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-start p-4 h-auto"
                  onClick={() => setInputMessage("Analyze these sales numbers and give me insights: Q1: $10k, Q2: $15k, Q3: $12k, Q4: $20k")}
                >
                  <Sparkles size={18} className="mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Analyze sales data</span>
                </Button>
                <Button
                  variant="outline"
                  className="flex flex-col items-start p-4 h-auto"
                  onClick={() => setInputMessage("Help me brainstorm names for my new tech startup focused on AI productivity tools")}
                >
                  <Sparkles size={18} className="mb-2 text-blue-500" />
                  <span className="text-sm font-medium">Brainstorm business names</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-3xl rounded-lg p-4 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      {message.role === "user" ? (
                        <User size={16} className="mr-2" />
                      ) : (
                        <Bot size={16} className="mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </span>
                      <span className="text-xs ml-2 opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </span>

                      {message.role === 'assistant' && settings.enableRAG && (
                        <BrainInfluenceIndicator
                          response={message.content}
                          brainContext={message.brainContext}
                          userQuery={messages.find(m => m.role === 'user' &&
                            new Date(m.timestamp).getTime() < new Date(message.timestamp).getTime())?.content || ''}
                          className="ml-2"
                        />
                      )}
                    </div>
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg p-4 max-w-3xl">
                    <div className="flex items-center">
                      <Bot size={16} className="mr-2" />
                      <span className="text-sm font-medium">AI Assistant</span>
                    </div>
                    <div className="mt-2 flex items-center">
                      <Loader2 size={16} className="animate-spin mr-2" />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="min-h-[80px] resize-none pr-12"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2"
                disabled
              >
                <Paperclip size={16} />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={handleClearChat}
                disabled={messages.length === 0}
                title="Clear chat"
              >
                <Trash size={16} />
              </Button>
              <Button onClick={handleSendMessage} disabled={!inputMessage.trim() || isLoading}>
                {isLoading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Send size={16} className="mr-2" />}
                Send
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="w-80 border-l border-gray-200 bg-gray-50 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Chat Settings</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(false)}
            >
              <Settings size={16} />
            </Button>
          </div>

          <div className="p-4 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => handleSettingsChange("model", value)}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? (
                    availableModels.map(model => (
                      <SelectItem key={model.id} value={model.id}>{model.name}</SelectItem>
                    ))
                  ) : (
                    <>
                      <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                      <div className="px-2 py-2 text-xs text-gray-500 border-t mt-2">
                        <a
                          href="/api-hub"
                          className="text-blue-600 hover:underline flex items-center"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = '/api-hub';
                          }}
                        >
                          Connect more AI models in API Hub
                        </a>
                      </div>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="temperature">Temperature: {settings.temperature}</Label>
              </div>
              <Slider
                id="temperature"
                min={0}
                max={1}
                step={0.1}
                value={[settings.temperature]}
                onValueChange={(value) => handleSettingsChange("temperature", value[0])}
              />
              <p className="text-xs text-gray-500">
                Lower values make responses more focused and deterministic.
                Higher values make responses more creative and varied.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="maxTokens">Max Tokens: {settings.maxTokens}</Label>
              </div>
              <Slider
                id="maxTokens"
                min={256}
                max={4096}
                step={256}
                value={[settings.maxTokens]}
                onValueChange={(value) => handleSettingsChange("maxTokens", value[0])}
              />
              <p className="text-xs text-gray-500">
                Maximum number of tokens to generate in the response.
              </p>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="streamResponse">Stream Response</Label>
                <p className="text-xs text-gray-500">
                  Show responses as they're being generated
                </p>
              </div>
              <Switch
                id="streamResponse"
                checked={settings.streamResponse}
                onCheckedChange={(checked) => handleSettingsChange("streamResponse", checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="enableRAG">Enable RAG</Label>
                <p className="text-xs text-gray-500">
                  Use Retrieval Augmented Generation with your data
                </p>
              </div>
              <Switch
                id="enableRAG"
                checked={settings.enableRAG}
                onCheckedChange={(checked) => handleSettingsChange("enableRAG", checked)}
              />
            </div>

            <Separator />

            <div className="pt-2 flex justify-between">
              <Button variant="outline" onClick={() => {
                setSettings({
                  model: "gemini-pro",
                  temperature: 0.7,
                  maxTokens: 1024,
                  streamResponse: true,
                  enableRAG: false,
                });
                toast.success("Settings reset to defaults");
              }}>
                Reset Defaults
              </Button>
              <Button onClick={() => {
                setShowSettings(false);
                toast.success("Settings saved");
              }}>
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

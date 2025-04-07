import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Globe,
  Database,
  Key,
  Trash,
  Edit,
  Check,
  X,
  RefreshCw,
  Loader2,
  Cloud,
  Code,
  Zap,
  MessageSquare,
  Image,
  FileText,
  Sparkles,
  Lock,
  Unlock,
  ExternalLink
} from "lucide-react";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";

// Define types
interface ApiProvider {
  id: string;
  name: string;
  description: string;
  category: "ai" | "data" | "communication" | "payment" | "storage" | "other";
  icon: string;
  status: "available" | "coming-soon" | "beta";
  isPopular: boolean;
  isConnected: boolean;
  connectionDetails?: ConnectionDetails;
}

interface ConnectionDetails {
  apiKey?: string;
  authType: "api_key" | "oauth" | "basic" | "custom";
  isConfigured: boolean;
  lastUsed?: string;
  usageCount?: number;
  quotaLimit?: number;
  quotaUsed?: number;
}

interface UserConnection {
  id: string;
  providerId: string;
  name: string;
  description: string;
  createdAt: string;
  lastUsed?: string;
  status: "active" | "inactive" | "error";
  config: Record<string, any>;
}

// Sample data for API providers
const API_PROVIDERS: ApiProvider[] = [
  {
    id: "google-ai",
    name: "Google AI (Gemini)",
    description: "Access Google's Gemini models for text, chat, and image generation",
    category: "ai",
    icon: "/icons/google-ai.png",
    status: "available",
    isPopular: true,
    isConnected: true,
    connectionDetails: {
      authType: "api_key",
      isConfigured: true,
      lastUsed: new Date().toISOString(),
      usageCount: 128,
      quotaLimit: 1000,
      quotaUsed: 128
    }
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Integrate with GPT-4o, GPT-4 Turbo, DALL-E, and other OpenAI services",
    category: "ai",
    icon: "/icons/openai.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false,
      quotaLimit: 5000,
      quotaUsed: 0
    }
  },
  {
    id: "anthropic",
    name: "Anthropic (Claude)",
    description: "Access Claude 3 Opus, Sonnet, and Haiku models for advanced natural language processing",
    category: "ai",
    icon: "/icons/anthropic.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false,
      quotaLimit: 5000,
      quotaUsed: 0
    }
  },
  {
    id: "stability-ai",
    name: "Stability AI",
    description: "Image generation with Stable Diffusion XL and other state-of-the-art models",
    category: "ai",
    icon: "/icons/stability.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false,
      quotaLimit: 1000,
      quotaUsed: 0
    }
  },
  {
    id: "vertex-ai",
    name: "Google Vertex AI",
    description: "Enterprise AI platform with Gemini Pro, PaLM 2, and custom model training",
    category: "ai",
    icon: "/icons/vertex.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "custom",
      isConfigured: false,
      quotaLimit: 10000,
      quotaUsed: 0
    }
  },
  {
    id: "huggingface",
    name: "Hugging Face",
    description: "Access thousands of open-source ML models",
    category: "ai",
    icon: "/icons/huggingface.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "cohere",
    name: "Cohere",
    description: "NLP models for text generation, embeddings, and more",
    category: "ai",
    icon: "/icons/cohere.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "replicate",
    name: "Replicate",
    description: "Run open-source models with a simple API",
    category: "ai",
    icon: "/icons/replicate.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "airtable",
    name: "Airtable",
    description: "Connect to Airtable bases for data storage and retrieval",
    category: "data",
    icon: "/icons/airtable.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "notion",
    name: "Notion",
    description: "Integrate with Notion databases and pages",
    category: "data",
    icon: "/icons/notion.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "oauth",
      isConfigured: false
    }
  },
  {
    id: "google-sheets",
    name: "Google Sheets",
    description: "Read and write data to Google Sheets",
    category: "data",
    icon: "/icons/google-sheets.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "oauth",
      isConfigured: false
    }
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    description: "Connect to PostgreSQL databases",
    category: "data",
    icon: "/icons/postgres.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "basic",
      isConfigured: false
    }
  },
  {
    id: "mongodb",
    name: "MongoDB",
    description: "Connect to MongoDB databases",
    category: "data",
    icon: "/icons/mongodb.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "basic",
      isConfigured: false
    }
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Process payments and manage subscriptions",
    category: "payment",
    icon: "/icons/stripe.png",
    status: "available",
    isPopular: true,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Send SMS, make calls, and more",
    category: "communication",
    icon: "/icons/twilio.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "sendgrid",
    name: "SendGrid",
    description: "Send emails and manage contacts",
    category: "communication",
    icon: "/icons/sendgrid.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  },
  {
    id: "s3",
    name: "Amazon S3",
    description: "Store and retrieve files in the cloud",
    category: "storage",
    icon: "/icons/s3.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "custom",
      isConfigured: false
    }
  },
  {
    id: "github",
    name: "GitHub",
    description: "Integrate with GitHub repositories and issues",
    category: "other",
    icon: "/icons/github.png",
    status: "available",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "oauth",
      isConfigured: false
    }
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect with thousands of apps through Zapier",
    category: "other",
    icon: "/icons/zapier.png",
    status: "coming-soon",
    isPopular: false,
    isConnected: false,
    connectionDetails: {
      authType: "api_key",
      isConfigured: false
    }
  }
];

// Sample user connections
const USER_CONNECTIONS: UserConnection[] = [
  {
    id: "conn-1",
    providerId: "google-ai",
    name: "Gemini API",
    description: "Main Gemini API connection for AI features",
    createdAt: "2023-05-10T14:20:00Z",
    lastUsed: "2023-06-15T10:30:00Z",
    status: "active",
    config: {
      apiKey: "••••••••••••••••••••••",
      model: "gemini-pro"
    }
  }
];

function ApiMcpContent() {
  // State
  const [providers, setProviders] = useState<ApiProvider[]>(API_PROVIDERS);
  const [userConnections, setUserConnections] = useState<UserConnection[]>(USER_CONNECTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ApiProvider | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Filter providers based on search term and active tab
  const filteredProviders = providers.filter((provider) => {
    const matchesSearch =
      provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      provider.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "all") return matchesSearch;
    if (activeTab === "connected") return matchesSearch && provider.isConnected;
    if (activeTab === "ai") return matchesSearch && provider.category === "ai";
    if (activeTab === "data") return matchesSearch && provider.category === "data";
    if (activeTab === "other") return matchesSearch &&
      !["ai", "data"].includes(provider.category);

    return matchesSearch;
  });

  // Handle connecting to a provider
  const handleConnect = (provider: ApiProvider) => {
    setSelectedProvider(provider);
    setApiKey("");
    setShowConnectDialog(true);
  };

  // Handle saving connection
  const handleSaveConnection = async () => {
    if (!selectedProvider) return;

    if (!apiKey.trim()) {
      toast.error("API key is required");
      return;
    }

    setIsConfiguring(true);

    try {
      // Test the API key with a simple request based on provider
      let isValid = false;

      switch (selectedProvider.id) {
        case 'google-ai':
          // Test Gemini API key
          try {
            const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey);
            isValid = response.ok;
          } catch (error) {
            console.error('Error testing Gemini API key:', error);
            isValid = false;
          }
          break;

        case 'openai':
          // Test OpenAI API key
          try {
            const response = await fetch('https://api.openai.com/v1/models', {
              headers: {
                'Authorization': `Bearer ${apiKey}`
              }
            });
            isValid = response.ok;
          } catch (error) {
            console.error('Error testing OpenAI API key:', error);
            isValid = false;
          }
          break;

        case 'anthropic':
          // Test Anthropic API key
          try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 10,
                messages: [{ role: 'user', content: 'Hello' }]
              })
            });
            isValid = response.ok;
          } catch (error) {
            console.error('Error testing Anthropic API key:', error);
            isValid = false;
          }
          break;

        case 'stability-ai':
          // Test Stability AI API key
          try {
            const response = await fetch('https://api.stability.ai/v1/engines/list', {
              headers: {
                'Authorization': `Bearer ${apiKey}`
              }
            });
            isValid = response.ok;
          } catch (error) {
            console.error('Error testing Stability AI API key:', error);
            isValid = false;
          }
          break;

        default:
          // For other providers, assume valid for now
          isValid = true;
      }

      if (!isValid) {
        toast.error(`Invalid API key for ${selectedProvider.name}. Please check and try again.`);
        setIsConfiguring(false);
        return;
      }

      // Update provider
      const updatedProviders = providers.map(p =>
        p.id === selectedProvider.id
          ? {
              ...p,
              isConnected: true,
              connectionDetails: {
                ...p.connectionDetails,
                apiKey: apiKey,
                isConfigured: true,
                lastUsed: new Date().toISOString()
              }
            }
          : p
      );

      // Create user connection
      const newConnection: UserConnection = {
        id: `conn-${Date.now()}`,
        providerId: selectedProvider.id,
        name: `${selectedProvider.name} Connection`,
        description: `Connection to ${selectedProvider.name}`,
        createdAt: new Date().toISOString(),
        status: "active",
        config: {
          apiKey: "••••••••••••••••••••••",
          provider: selectedProvider.id
        }
      };

      setProviders(updatedProviders);
      setUserConnections([...userConnections, newConnection]);

      // Save API key to local storage
      localStorage.setItem(`api-key-${selectedProvider.id}`, apiKey);

      setShowConnectDialog(false);
      setIsConfiguring(false);

      toast.success(`Connected to ${selectedProvider.name} successfully`);
    } catch (error) {
      console.error('Error connecting to provider:', error);
      toast.error(`Failed to connect to ${selectedProvider?.name}. Please try again.`);
      setIsConfiguring(false);
    }
  };

  // Handle disconnecting from a provider
  const handleDisconnect = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (!provider) return;

    const confirmed = window.confirm(`Are you sure you want to disconnect from ${provider.name}?`);
    if (!confirmed) return;

    // Update provider
    const updatedProviders = providers.map(p =>
      p.id === providerId
        ? {
            ...p,
            isConnected: false,
            connectionDetails: {
              ...p.connectionDetails,
              isConfigured: false
            }
          }
        : p
    );

    // Remove user connections
    const updatedConnections = userConnections.filter(c => c.providerId !== providerId);

    // Remove API key from local storage
    localStorage.removeItem(`api-key-${providerId}`);

    setProviders(updatedProviders);
    setUserConnections(updatedConnections);

    toast.success(`Disconnected from ${provider.name}`);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "ai":
        return <Sparkles size={16} className="text-purple-500" />;
      case "data":
        return <Database size={16} className="text-blue-500" />;
      case "communication":
        return <MessageSquare size={16} className="text-green-500" />;
      case "payment":
        return <Zap size={16} className="text-yellow-500" />;
      case "storage":
        return <Cloud size={16} className="text-cyan-500" />;
      default:
        return <Code size={16} className="text-gray-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">API & Connection Hub</h1>
              <p className="text-gray-500 mt-1">
                Connect your apps and services to enhance your workflows
              </p>
            </div>
          </div>

          {/* User Connections Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Your Connections</h2>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus size={14} />
                Add Connection
              </Button>
            </div>

            {userConnections.length === 0 ? (
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="py-8 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                    <Globe className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                  <p className="text-gray-500 mb-4 max-w-md mx-auto">
                    Connect to APIs and services to enhance your workflows and applications
                  </p>
                  <Button className="gap-1">
                    <Plus size={16} />
                    Connect Your First API
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {userConnections.map((connection) => {
                  const provider = providers.find(p => p.id === connection.providerId);
                  return (
                    <Card key={connection.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center">
                              {connection.name}
                              <Badge
                                variant={connection.status === "active" ? "default" : "destructive"}
                                className="ml-2"
                              >
                                {connection.status}
                              </Badge>
                            </CardTitle>
                            <CardDescription>
                              {new Date(connection.createdAt).toLocaleDateString()}
                              {connection.lastUsed && (
                                <> · Last used {new Date(connection.lastUsed).toLocaleDateString()}</>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex">
                            {provider && getCategoryIcon(provider.category)}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {connection.description}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1"
                          >
                            <Edit size={14} />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-1 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDisconnect(connection.providerId)}
                          >
                            <Trash size={14} />
                          </Button>
                        </div>
                        <Button
                          variant={connection.status === "active" ? "default" : "destructive"}
                          size="sm"
                          className="gap-1"
                        >
                          {connection.status === "active" ? (
                            <>
                              <Check size={14} />
                              Connected
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Reconnect
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          <Separator className="my-8" />

          {/* Available APIs Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Available APIs & Services</h2>

              <div className="flex gap-4">
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search APIs..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[500px]">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="connected">Connected</TabsTrigger>
                    <TabsTrigger value="ai">AI</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="other">Other</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProviders.map((provider) => (
                <Card key={provider.id} className={provider.status === "coming-soon" ? "opacity-70" : ""}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-md bg-gray-100 flex items-center justify-center mr-3">
                          {/* Placeholder for provider icon */}
                          {getCategoryIcon(provider.category)}
                        </div>
                        <div>
                          <CardTitle className="flex items-center text-lg">
                            {provider.name}
                            {provider.isPopular && (
                              <Badge variant="secondary" className="ml-2">Popular</Badge>
                            )}
                            {provider.status === "coming-soon" && (
                              <Badge variant="outline" className="ml-2">Coming Soon</Badge>
                            )}
                            {provider.status === "beta" && (
                              <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">Beta</Badge>
                            )}
                          </CardTitle>
                          <CardDescription>
                            {provider.category.charAt(0).toUpperCase() + provider.category.slice(1)}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {provider.description}
                    </p>

                    {provider.isConnected && provider.connectionDetails?.lastUsed && (
                      <div className="mt-2 text-xs text-gray-500">
                        Last used: {new Date(provider.connectionDetails.lastUsed).toLocaleDateString()}
                      </div>
                    )}

                    {provider.isConnected && provider.connectionDetails?.quotaLimit && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Usage: {provider.connectionDetails.quotaUsed} / {provider.connectionDetails.quotaLimit}</span>
                          <span>{Math.round((provider.connectionDetails.quotaUsed / provider.connectionDetails.quotaLimit) * 100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full"
                            style={{ width: `${(provider.connectionDetails.quotaUsed / provider.connectionDetails.quotaLimit) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-2">
                    {provider.isConnected ? (
                      <div className="flex w-full justify-between">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1"
                          onClick={() => handleDisconnect(provider.id)}
                        >
                          <X size={14} />
                          Disconnect
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-1"
                        >
                          <ExternalLink size={14} />
                          Manage
                        </Button>
                      </div>
                    ) : (
                      <Button
                        className="w-full gap-1"
                        disabled={provider.status === "coming-soon"}
                        onClick={() => handleConnect(provider)}
                      >
                        <Plus size={14} />
                        Connect
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect to {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              Enter your API credentials to connect to {selectedProvider?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {selectedProvider?.connectionDetails?.authType === "api_key" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="apiKey" className="text-right">
                  API Key
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showApiKey ? <Lock size={16} /> : <Unlock size={16} />}
                  </button>
                </div>
              </div>
            )}

            {selectedProvider?.connectionDetails?.authType === "oauth" && (
              <div className="text-center py-4">
                <p className="mb-4 text-sm text-gray-500">
                  You'll be redirected to {selectedProvider.name} to authorize access.
                </p>
                <Button className="gap-1">
                  <ExternalLink size={16} />
                  Authorize with {selectedProvider.name}
                </Button>
              </div>
            )}

            {selectedProvider?.connectionDetails?.authType === "basic" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    placeholder="Enter username"
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="password" className="text-right">
                    Password
                  </Label>
                  <div className="col-span-3 relative">
                    <Input
                      id="password"
                      type={showApiKey ? "text" : "password"}
                      placeholder="Enter password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                    >
                      {showApiKey ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {selectedProvider?.connectionDetails?.authType === "custom" && (
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="config" className="text-right pt-2">
                  Configuration
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="config"
                    placeholder="Enter configuration JSON"
                    className="font-mono text-sm"
                    rows={6}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the connection configuration in JSON format
                  </p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveConnection}
              disabled={isConfiguring}
              className="gap-1"
            >
              {isConfiguring ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Check size={16} />
                  Connect
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ApiMcp() {
  return (
    <AppProvider>
      <ApiMcpContent />
    </AppProvider>
  );
}

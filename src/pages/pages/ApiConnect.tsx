import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sidebar } from "components/Sidebar";
import { toast } from "sonner";
import {
  Search,
  Plus,
  Trash,
  Edit,
  ExternalLink,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  ChevronRight,
  Key,
  Lock,
  Globe,
  Zap,
  ArrowRight,
  Code,
  Settings,
  MoreHorizontal,
  Filter
} from "lucide-react";
import { AppProvider } from "utils/AppProvider";
import apiConnectService, { Connection, ConnectionStatus, AuthType } from "../utils/apiConnectService";
import { API_CATEGORIES, API_PROVIDERS, getProvidersByCategory, getProviderById, getPopularProviders, searchProviders } from "../utils/apiProviders";

// Define the main component
export default function ApiConnect() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <ApiConnectContent />
      </main>
    </div>
  );
}

// Main content component
function ApiConnectContent() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"connections" | "explore">("connections");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [connections, setConnections] = useState<Connection[]>([]);
  const [filteredProviders, setFilteredProviders] = useState(API_PROVIDERS);
  const [selectedProvider, setSelectedProvider] = useState<any>(null);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [customFields, setCustomFields] = useState<Record<string, string>>({});
  const [showConnectionDetails, setShowConnectionDetails] = useState<string | null>(null);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  // Load user connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  // Filter providers when search query or category changes
  useEffect(() => {
    filterProviders();
  }, [searchQuery, selectedCategory]);

  // Load user connections
  const loadConnections = () => {
    const userConnections = apiConnectService.loadConnections('user-123'); // In a real app, this would be the actual user ID
    setConnections(userConnections);
  };

  // Filter providers based on search query and category
  const filterProviders = () => {
    let filtered = API_PROVIDERS;
    
    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(provider => provider.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = searchProviders(searchQuery);
      
      // If category is selected, apply that filter too
      if (selectedCategory !== "all") {
        filtered = filtered.filter(provider => provider.category === selectedCategory);
      }
    }
    
    setFilteredProviders(filtered);
  };

  // Handle connecting to a provider
  const handleConnect = (provider: any) => {
    setSelectedProvider(provider);
    setApiKey("");
    setCustomFields({});
    setShowConnectDialog(true);
  };

  // Handle OAuth connection
  const handleOAuthConnect = (provider: any) => {
    try {
      // Generate OAuth URL
      const oauthUrl = apiConnectService.initiateOAuth(provider);
      
      // Open OAuth popup
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popup = window.open(
        `${oauthUrl}&provider_id=${provider.id}`,
        `Connect to ${provider.name}`,
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Listen for messages from the popup
      const messageHandler = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data.type === 'oauth-success') {
          // Close the popup
          if (popup) popup.close();
          
          // Remove the event listener
          window.removeEventListener('message', messageHandler);
          
          // Reload connections
          loadConnections();
          
          // Show success message
          toast.success(`Connected to ${provider.name} successfully`);
        }
      };
      
      window.addEventListener('message', messageHandler);
    } catch (error) {
      console.error('Error initiating OAuth flow:', error);
      toast.error('Failed to connect. Please try again.');
    }
  };

  // Handle saving API key connection
  const handleSaveConnection = async () => {
    if (!selectedProvider) return;

    // Validate required fields
    if (selectedProvider.authType === AuthType.API_KEY) {
      if (!apiKey.trim()) {
        toast.error("API key is required");
        return;
      }
    }

    setIsConfiguring(true);

    try {
      // Test the connection
      let isValid = false;
      
      if (selectedProvider.authType === AuthType.API_KEY) {
        isValid = await apiConnectService.testConnection(selectedProvider, { apiKey });
      } else {
        // For other auth types, assume valid for now
        isValid = true;
      }
      
      if (!isValid) {
        toast.error(`Invalid credentials for ${selectedProvider.name}. Please check and try again.`);
        setIsConfiguring(false);
        return;
      }
      
      // Create a new connection
      const credentials: Record<string, any> = {};
      
      if (selectedProvider.authType === AuthType.API_KEY) {
        credentials.apiKey = apiKey;
      } else if (selectedProvider.authType === AuthType.BASIC) {
        credentials.username = customFields.username;
        credentials.password = customFields.password;
      }
      
      const newConnection = apiConnectService.createConnection({
        providerId: selectedProvider.id,
        userId: 'user-123', // In a real app, this would be the actual user ID
        name: `${selectedProvider.name} Connection`,
        status: ConnectionStatus.ACTIVE,
        credentials
      });
      
      // Reload connections
      loadConnections();
      
      // Close dialog and reset state
      setShowConnectDialog(false);
      setIsConfiguring(false);
      setApiKey("");
      setCustomFields({});
      
      toast.success(`Connected to ${selectedProvider.name} successfully`);
    } catch (error) {
      console.error('Error connecting to provider:', error);
      toast.error(`Failed to connect to ${selectedProvider?.name}. Please try again.`);
      setIsConfiguring(false);
    }
  };

  // Handle disconnecting a provider
  const handleDisconnect = (connectionId: string) => {
    try {
      const connection = apiConnectService.getConnection(connectionId);
      if (!connection) return;
      
      const provider = getProviderById(connection.providerId);
      if (!provider) return;
      
      const confirmed = window.confirm(`Are you sure you want to disconnect from ${provider.name}?`);
      if (!confirmed) return;
      
      apiConnectService.deleteConnection(connectionId);
      loadConnections();
      
      toast.success(`Disconnected from ${provider.name}`);
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast.error('Failed to disconnect. Please try again.');
    }
  };

  // Handle testing a connection
  const handleTestConnection = async (connectionId: string) => {
    try {
      setIsTestingConnection(true);
      
      const connection = apiConnectService.getConnection(connectionId);
      if (!connection) {
        toast.error('Connection not found');
        setIsTestingConnection(false);
        return;
      }
      
      const provider = getProviderById(connection.providerId);
      if (!provider) {
        toast.error('Provider not found');
        setIsTestingConnection(false);
        return;
      }
      
      const isValid = await apiConnectService.testConnection(provider, connection.credentials);
      
      if (isValid) {
        toast.success(`Connection to ${provider.name} is working`);
        
        // Update connection status
        apiConnectService.updateConnection(connectionId, {
          status: ConnectionStatus.ACTIVE,
          error: undefined
        });
        
        loadConnections();
      } else {
        toast.error(`Connection to ${provider.name} is not working`);
        
        // Update connection status
        apiConnectService.updateConnection(connectionId, {
          status: ConnectionStatus.ERROR,
          error: 'Connection test failed'
        });
        
        loadConnections();
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast.error('Failed to test connection. Please try again.');
    } finally {
      setIsTestingConnection(false);
    }
  };

  // Handle refreshing OAuth token
  const handleRefreshToken = async (connectionId: string) => {
    try {
      setIsRefreshingToken(true);
      
      const connection = apiConnectService.getConnection(connectionId);
      if (!connection) {
        toast.error('Connection not found');
        setIsRefreshingToken(false);
        return;
      }
      
      const provider = getProviderById(connection.providerId);
      if (!provider) {
        toast.error('Provider not found');
        setIsRefreshingToken(false);
        return;
      }
      
      if (!connection.credentials.refreshToken) {
        toast.error('No refresh token available');
        setIsRefreshingToken(false);
        return;
      }
      
      const tokenResponse = await apiConnectService.refreshOAuthToken(
        provider,
        connection.credentials.refreshToken
      );
      
      // Update connection credentials
      apiConnectService.updateConnection(connectionId, {
        credentials: {
          ...connection.credentials,
          accessToken: tokenResponse.accessToken,
          refreshToken: tokenResponse.refreshToken || connection.credentials.refreshToken,
          expiresIn: tokenResponse.expiresIn,
          tokenType: tokenResponse.tokenType,
          scope: tokenResponse.scope,
          receivedAt: tokenResponse.receivedAt
        },
        status: ConnectionStatus.ACTIVE,
        error: undefined
      });
      
      loadConnections();
      toast.success(`Token refreshed for ${provider.name}`);
    } catch (error) {
      console.error('Error refreshing token:', error);
      toast.error('Failed to refresh token. Please try again.');
    } finally {
      setIsRefreshingToken(false);
    }
  };

  // Get connection status badge
  const getConnectionStatusBadge = (status: ConnectionStatus) => {
    switch (status) {
      case ConnectionStatus.ACTIVE:
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case ConnectionStatus.INACTIVE:
        return <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
      case ConnectionStatus.ERROR:
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case ConnectionStatus.PENDING:
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Get auth type badge
  const getAuthTypeBadge = (authType: AuthType) => {
    switch (authType) {
      case AuthType.API_KEY:
        return <Badge className="bg-blue-100 text-blue-800">API Key</Badge>;
      case AuthType.OAUTH:
        return <Badge className="bg-purple-100 text-purple-800">OAuth</Badge>;
      case AuthType.BASIC:
        return <Badge className="bg-gray-100 text-gray-800">Basic Auth</Badge>;
      case AuthType.CUSTOM:
        return <Badge className="bg-orange-100 text-orange-800">Custom</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">API Connect</h1>
          <p className="text-gray-500 mt-1">
            Connect your apps and services to enhance your workflows
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "connections" | "explore")}>
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="connections">Your Connections</TabsTrigger>
            <TabsTrigger value="explore">Explore APIs</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search APIs..."
                className="pl-10 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {activeTab === "explore" && (
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {API_CATEGORIES.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <TabsContent value="connections" className="mt-0">
          {connections.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-4">
                  <Globe className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">No connections yet</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  Connect to APIs and services to enhance your workflows and applications
                </p>
                <Button className="gap-1" onClick={() => setActiveTab("explore")}>
                  <Plus size={16} />
                  Connect Your First API
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connections.map((connection) => {
                const provider = getProviderById(connection.providerId);
                return (
                  <Card key={connection.id} className={connection.status === ConnectionStatus.ERROR ? 'border-red-200' : ''}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          {provider && (
                            <img
                              src={provider.icon}
                              alt={provider.name}
                              className="w-8 h-8 mr-2 rounded"
                            />
                          )}
                          <div>
                            <CardTitle className="text-lg">
                              {provider ? provider.name : connection.providerId}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              {getConnectionStatusBadge(connection.status)}
                              {provider && getAuthTypeBadge(provider.authType)}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setShowConnectionDetails(connection.id === showConnectionDetails ? null : connection.id)}
                        >
                          <ChevronRight
                            className={`h-4 w-4 transition-transform ${
                              connection.id === showConnectionDetails ? 'rotate-90' : ''
                            }`}
                          />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    {connection.id === showConnectionDetails && (
                      <CardContent>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-500">Status:</span>
                            <span>{connection.status}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Connected:</span>
                            <span>{formatDate(connection.createdAt)}</span>
                          </div>
                          {connection.lastUsed && (
                            <div className="flex justify-between">
                              <span className="text-gray-500">Last used:</span>
                              <span>{formatDate(connection.lastUsed)}</span>
                            </div>
                          )}
                          {connection.error && (
                            <div className="flex justify-between text-red-500">
                              <span>Error:</span>
                              <span>{connection.error}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    )}
                    
                    <CardFooter className="pt-0">
                      <div className="flex justify-between w-full">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTestConnection(connection.id)}
                            disabled={isTestingConnection}
                          >
                            {isTestingConnection ? (
                              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                            ) : (
                              <Zap className="h-4 w-4 mr-1" />
                            )}
                            Test
                          </Button>
                          
                          {provider && provider.authType === AuthType.OAUTH && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRefreshToken(connection.id)}
                              disabled={isRefreshingToken}
                            >
                              {isRefreshingToken ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4 mr-1" />
                              )}
                              Refresh
                            </Button>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDisconnect(connection.id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="explore" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProviders.map((provider) => {
              const isConnected = connections.some(conn => conn.providerId === provider.id);
              return (
                <Card key={provider.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <img
                          src={provider.icon}
                          alt={provider.name}
                          className="w-8 h-8 mr-2 rounded"
                        />
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                      </div>
                      {provider.status === 'beta' && (
                        <Badge className="bg-yellow-100 text-yellow-800">Beta</Badge>
                      )}
                      {provider.status === 'coming-soon' && (
                        <Badge className="bg-gray-100 text-gray-800">Coming Soon</Badge>
                      )}
                    </div>
                    <CardDescription>{provider.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 mb-4">
                      {getAuthTypeBadge(provider.authType)}
                      <Badge className="bg-gray-100 text-gray-800 capitalize">
                        {provider.category}
                      </Badge>
                      {provider.isPopular && (
                        <Badge className="bg-blue-100 text-blue-800">Popular</Badge>
                      )}
                    </div>
                    
                    {provider.longDescription && (
                      <p className="text-sm text-gray-500 mb-4">{provider.longDescription}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <div className="flex gap-2">
                      {provider.docsUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={provider.docsUrl} target="_blank" rel="noopener noreferrer">
                            <Code className="h-4 w-4 mr-1" />
                            Docs
                          </a>
                        </Button>
                      )}
                      
                      {provider.websiteUrl && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={provider.websiteUrl} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                    
                    {provider.status === 'available' && (
                      isConnected ? (
                        <Button variant="outline" size="sm" disabled>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                          Connected
                        </Button>
                      ) : (
                        provider.authType === AuthType.OAUTH ? (
                          <Button onClick={() => handleOAuthConnect(provider)}>
                            <Lock className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        ) : (
                          <Button onClick={() => handleConnect(provider)}>
                            <Key className="h-4 w-4 mr-1" />
                            Connect
                          </Button>
                        )
                      )
                    )}
                    
                    {provider.status === 'coming-soon' && (
                      <Button variant="outline" size="sm" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Connect to {selectedProvider?.name}</DialogTitle>
            <DialogDescription>
              {selectedProvider?.authConfig?.instructions || `Enter your ${selectedProvider?.name} credentials to connect.`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedProvider?.authType === AuthType.API_KEY && (
              <div className="grid gap-2">
                <Label htmlFor="apiKey">
                  {selectedProvider?.authConfig?.fields?.[0]?.label || "API Key"}
                </Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={selectedProvider?.authConfig?.fields?.[0]?.placeholder || "Enter your API key"}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                {selectedProvider?.authConfig?.fields?.[0]?.description && (
                  <p className="text-xs text-gray-500">
                    {selectedProvider.authConfig.fields[0].description}
                  </p>
                )}
              </div>
            )}
            
            {selectedProvider?.authType === AuthType.BASIC && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="Enter your username"
                    value={customFields.username || ""}
                    onChange={(e) => setCustomFields({...customFields, username: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={customFields.password || ""}
                    onChange={(e) => setCustomFields({...customFields, password: e.target.value})}
                  />
                </div>
              </>
            )}
            
            {selectedProvider?.authConfig?.fields?.slice(1).map((field) => (
              <div key={field.key} className="grid gap-2">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder || `Enter your ${field.label}`}
                  value={customFields[field.key] || ""}
                  onChange={(e) => setCustomFields({...customFields, [field.key]: e.target.value})}
                  required={field.required}
                />
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection} disabled={isConfiguring}>
              {isConfiguring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Key className="h-4 w-4 mr-2" />
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

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Search, Globe, Database, Key, Trash, Edit, Check, X, RefreshCw, Loader2 } from "lucide-react";

interface Connection {
  id: string;
  name: string;
  type: string;
  description: string;
  status: "active" | "inactive" | "error";
  lastUsed?: string;
  createdAt: string;
}

const DEMO_CONNECTIONS: Connection[] = [
  {
    id: "conn-1",
    name: "Google Sheets API",
    type: "rest",
    description: "Connection to Google Sheets for data import/export",
    status: "active",
    lastUsed: "2023-06-15T10:30:00Z",
    createdAt: "2023-05-10T14:20:00Z",
  },
  {
    id: "conn-2",
    name: "OpenAI API",
    type: "rest",
    description: "Connection to OpenAI for AI models",
    status: "active",
    lastUsed: "2023-06-18T09:15:00Z",
    createdAt: "2023-04-22T11:45:00Z",
  },
  {
    id: "conn-3",
    name: "PostgreSQL Database",
    type: "database",
    description: "Main application database",
    status: "active",
    lastUsed: "2023-06-17T16:20:00Z",
    createdAt: "2023-03-05T08:30:00Z",
  },
  {
    id: "conn-4",
    name: "Twitter API",
    type: "oauth2",
    description: "Connection to Twitter for social media integration",
    status: "error",
    lastUsed: "2023-06-10T13:45:00Z",
    createdAt: "2023-05-18T10:15:00Z",
  },
];

export default function Connections() {
  const [connections, setConnections] = useState<Connection[]>(DEMO_CONNECTIONS);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  
  // Form state for new connection
  const [newConnection, setNewConnection] = useState({
    name: "",
    type: "rest",
    description: "",
    config: "{\n  \"baseUrl\": \"https://api.example.com\",\n  \"headers\": {\n    \"Authorization\": \"Bearer YOUR_API_KEY\"\n  }\n}",
  });
  
  const handleCreateConnection = () => {
    if (!newConnection.name.trim()) {
      toast.error("Connection name is required");
      return;
    }
    
    try {
      // Validate JSON config
      JSON.parse(newConnection.config);
      
      // Create new connection
      const newConn: Connection = {
        id: `conn-${Date.now()}`,
        name: newConnection.name,
        type: newConnection.type,
        description: newConnection.description,
        status: "active",
        createdAt: new Date().toISOString(),
      };
      
      setConnections([newConn, ...connections]);
      setShowCreateDialog(false);
      
      // Reset form
      setNewConnection({
        name: "",
        type: "rest",
        description: "",
        config: "{\n  \"baseUrl\": \"https://api.example.com\",\n  \"headers\": {\n    \"Authorization\": \"Bearer YOUR_API_KEY\"\n  }\n}",
      });
      
      toast.success("Connection created successfully");
    } catch (error) {
      toast.error("Invalid JSON configuration");
    }
  };
  
  const handleDeleteConnection = (id: string, name: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (confirmed) {
      setConnections(connections.filter((conn) => conn.id !== id));
      toast.success(`"${name}" deleted successfully`);
    }
  };
  
  const handleTestConnection = () => {
    setIsTestingConnection(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsTestingConnection(false);
      toast.success("Connection test successful");
    }, 1500);
  };
  
  // Filter connections based on search term and active tab
  const filteredConnections = connections.filter((connection) => {
    const matchesSearch = 
      connection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      connection.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "rest") return matchesSearch && connection.type === "rest";
    if (activeTab === "database") return matchesSearch && connection.type === "database";
    if (activeTab === "oauth2") return matchesSearch && connection.type === "oauth2";
    
    return matchesSearch;
  });
  
  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">API Connections</h1>
          <p className="text-gray-500 mt-1">
            Manage your external API connections and integrations
          </p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-1">
              <Plus size={16} />
              New Connection
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Connection</DialogTitle>
              <DialogDescription>
                Configure a new API or database connection.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newConnection.name}
                  onChange={(e) => setNewConnection({ ...newConnection, name: e.target.value })}
                  placeholder="My API Connection"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Type
                </Label>
                <Select
                  value={newConnection.type}
                  onValueChange={(value) => setNewConnection({ ...newConnection, type: value })}
                >
                  <SelectTrigger id="type" className="col-span-3">
                    <SelectValue placeholder="Select connection type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest">REST API</SelectItem>
                    <SelectItem value="graphql">GraphQL</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="oauth2">OAuth 2.0</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  id="description"
                  value={newConnection.description}
                  onChange={(e) => setNewConnection({ ...newConnection, description: e.target.value })}
                  placeholder="What this connection is used for"
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                <Label htmlFor="config" className="text-right pt-2">
                  Configuration
                </Label>
                <div className="col-span-3">
                  <Textarea
                    id="config"
                    value={newConnection.config}
                    onChange={(e) => setNewConnection({ ...newConnection, config: e.target.value })}
                    placeholder="JSON configuration"
                    className="font-mono text-sm"
                    rows={10}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter the connection configuration in JSON format
                  </p>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button 
                variant="outline" 
                onClick={handleTestConnection}
                disabled={isTestingConnection}
                className="gap-1"
              >
                {isTestingConnection ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <RefreshCw size={16} />
                )}
                Test Connection
              </Button>
              <Button onClick={handleCreateConnection}>Create Connection</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search connections..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="rest">REST</TabsTrigger>
              <TabsTrigger value="database">Database</TabsTrigger>
              <TabsTrigger value="oauth2">OAuth</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {filteredConnections.length === 0 ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <Globe className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">No connections found</h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? `No connections matching "${searchTerm}"` 
              : "You haven't created any connections yet"}
          </p>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-1">
            <Plus size={16} />
            Create Your First Connection
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => (
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
                    {connection.type === "rest" && <Globe size={16} className="text-blue-500" />}
                    {connection.type === "database" && <Database size={16} className="text-green-500" />}
                    {connection.type === "oauth2" && <Key size={16} className="text-purple-500" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500">
                  {connection.description}
                </p>
                <div className="mt-4">
                  <Badge variant="outline" className="mr-2">
                    {connection.type === "rest" && "REST API"}
                    {connection.type === "database" && "Database"}
                    {connection.type === "oauth2" && "OAuth 2.0"}
                  </Badge>
                </div>
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
                    onClick={() => handleDeleteConnection(connection.id, connection.name)}
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
          ))}
          
          {/* Create New Connection Card */}
          <Card className="border-dashed border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer" onClick={() => setShowCreateDialog(true)}>
            <div className="flex flex-col items-center justify-center h-full py-12">
              <div className="rounded-full bg-white p-3 mb-4 shadow-sm">
                <Plus size={24} className="text-blue-500" />
              </div>
              <h3 className="text-lg font-medium mb-1">Add New Connection</h3>
              <p className="text-sm text-gray-500 text-center max-w-xs">
                Connect to APIs, databases, and other services
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

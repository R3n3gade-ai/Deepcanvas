import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Bot,
  Plus,
  Search,
  MoreVertical,
  MessageSquare,
  Edit,
  Trash,
  Zap,
  Brain,
  Workflow,
  Check,
  X,
  Clock
} from "lucide-react";

import agentService from "../utils/agentService";
import { Agent, AgentStatus } from "../utils/agentTypes";

export default function Agents() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Load agents
  useEffect(() => {
    const loadAgents = () => {
      setIsLoading(true);
      
      try {
        const userAgents = agentService.loadAgents('user-123'); // In a real app, this would be the actual user ID
        setAgents(userAgents);
      } catch (error) {
        console.error("Error loading agents:", error);
        toast.error("Failed to load agents");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAgents();
  }, []);
  
  // Filter agents based on search query
  const filteredAgents = agents.filter(agent => 
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Handle create new agent
  const handleCreateAgent = () => {
    navigate("/agent-builder");
  };
  
  // Handle edit agent
  const handleEditAgent = (agentId: string) => {
    navigate(`/agent-builder/${agentId}`);
  };
  
  // Handle delete agent
  const handleDeleteAgent = async (agentId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this agent?");
    if (!confirmed) return;
    
    try {
      agentService.deleteAgent(agentId);
      
      // Update the agents list
      setAgents(agents.filter(agent => agent.id !== agentId));
      
      toast.success("Agent deleted successfully");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    }
  };
  
  // Handle chat with agent
  const handleChatWithAgent = (agentId: string) => {
    navigate(`/agent/${agentId}`);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">AI Agents</h1>
              <p className="text-gray-500">
                Create and manage your custom AI agents
              </p>
            </div>
            
            <Button onClick={handleCreateAgent}>
              <Plus className="h-4 w-4 mr-2" />
              Create Agent
            </Button>
          </div>
          
          {/* Search and filters */}
          <div className="flex items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search agents..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          {/* Agents list */}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredAgents.length === 0 ? (
            <Card className="bg-gray-50 border-dashed">
              <CardContent className="py-8 text-center">
                <Bot className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No agents found</h3>
                <p className="text-gray-500 mb-4 max-w-md mx-auto">
                  {searchQuery
                    ? "No agents match your search query. Try a different search term."
                    : "You haven't created any agents yet. Create your first agent to get started."}
                </p>
                {!searchQuery && (
                  <Button onClick={handleCreateAgent}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Agent
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAgents.map((agent) => (
                <Card key={agent.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleChatWithAgent(agent.id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Chat with Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditAgent(agent.id)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Agent
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteAgent(agent.id)}
                          >
                            <Trash className="h-4 w-4 mr-2" />
                            Delete Agent
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <CardDescription>{agent.description}</CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Badge
                        variant={agent.status === AgentStatus.ACTIVE ? "success" : "secondary"}
                        className="text-xs"
                      >
                        {agent.status === AgentStatus.ACTIVE ? (
                          <Check className="h-3 w-3 mr-1" />
                        ) : (
                          <X className="h-3 w-3 mr-1" />
                        )}
                        {agent.status === AgentStatus.ACTIVE ? "Active" : "Draft"}
                      </Badge>
                      
                      <Badge variant="outline" className="text-xs">
                        <Bot className="h-3 w-3 mr-1" />
                        {agent.personality.name}
                      </Badge>
                      
                      {agent.tools.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          {agent.tools.length} Tools
                        </Badge>
                      )}
                    </div>
                    
                    <div className="text-xs text-gray-500 flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Updated {formatDate(agent.updatedAt)}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pt-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleChatWithAgent(agent.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Chat with Agent
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

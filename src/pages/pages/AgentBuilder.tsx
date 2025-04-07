import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Bot,
  Save,
  Trash,
  Plus,
  Settings,
  MessageSquare,
  Zap,
  Brain,
  Workflow,
  Globe,
  Code,
  ArrowLeft,
  Loader2,
  Check,
  X
} from "lucide-react";

import agentService from "../utils/agentService";
import { Agent, AgentStatus, AgentPersonality, ToolType, DEFAULT_AGENT_PERSONALITIES } from "../utils/agentTypes";
import apiConnectService from "../utils/apiConnectService";
import { getProviderById } from "../utils/apiProviders";
import brainService from "../utils/brainService";
import useWorkflowStore from "../utils/workflowStore";

export default function AgentBuilder() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("personality");
  
  // Form state
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedPersonality, setSelectedPersonality] = useState<string>("");
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>("");
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(1000);
  const [defaultModel, setDefaultModel] = useState<string>("gpt-4o");
  
  // Load agent data
  useEffect(() => {
    const loadAgentData = () => {
      setIsLoading(true);
      
      if (agentId) {
        // Load existing agent
        const existingAgent = agentService.getAgent(agentId);
        
        if (existingAgent) {
          setAgent(existingAgent);
          setName(existingAgent.name);
          setDescription(existingAgent.description);
          setSelectedPersonality(existingAgent.personality.name);
          setCustomSystemPrompt(existingAgent.personality.systemPrompt);
          setTemperature(existingAgent.temperature);
          setMaxTokens(existingAgent.maxTokens);
          setDefaultModel(existingAgent.defaultModel);
        } else {
          toast.error("Agent not found");
          navigate("/agents");
        }
      } else {
        // New agent, set defaults
        setName("");
        setDescription("");
        setSelectedPersonality(DEFAULT_AGENT_PERSONALITIES[0].name);
        setCustomSystemPrompt(DEFAULT_AGENT_PERSONALITIES[0].systemPrompt);
        setTemperature(0.7);
        setMaxTokens(1000);
        setDefaultModel("gpt-4o");
      }
      
      setIsLoading(false);
    };
    
    loadAgentData();
  }, [agentId, navigate]);
  
  // Handle personality change
  const handlePersonalityChange = (value: string) => {
    setSelectedPersonality(value);
    
    // Update system prompt based on selected personality
    const personality = DEFAULT_AGENT_PERSONALITIES.find(p => p.name === value);
    if (personality) {
      setCustomSystemPrompt(personality.systemPrompt);
    }
  };
  
  // Handle save
  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your agent");
      return;
    }
    
    setIsSaving(true);
    
    try {
      // Find the selected personality
      const personalityTemplate = DEFAULT_AGENT_PERSONALITIES.find(
        p => p.name === selectedPersonality
      ) || DEFAULT_AGENT_PERSONALITIES[0];
      
      // Create personality object
      const personality: AgentPersonality = {
        name: selectedPersonality,
        description: personalityTemplate.description,
        systemPrompt: customSystemPrompt
      };
      
      if (agentId && agent) {
        // Update existing agent
        const updatedAgent = agentService.updateAgent(agentId, {
          name,
          description,
          personality,
          temperature,
          maxTokens,
          defaultModel
        });
        
        setAgent(updatedAgent);
        toast.success("Agent updated successfully");
      } else {
        // Create new agent
        const newAgent = agentService.createAgent('user-123', name, description);
        
        // Update with additional properties
        const updatedAgent = agentService.updateAgent(newAgent.id, {
          personality,
          temperature,
          maxTokens,
          defaultModel
        });
        
        setAgent(updatedAgent);
        toast.success("Agent created successfully");
        
        // Navigate to the new agent's page
        navigate(`/agent-builder/${updatedAgent.id}`);
      }
    } catch (error) {
      console.error("Error saving agent:", error);
      toast.error("Failed to save agent");
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle delete
  const handleDelete = async () => {
    if (!agentId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this agent?");
    if (!confirmed) return;
    
    try {
      agentService.deleteAgent(agentId);
      toast.success("Agent deleted successfully");
      navigate("/agents");
    } catch (error) {
      console.error("Error deleting agent:", error);
      toast.error("Failed to delete agent");
    }
  };
  
  // Handle test agent
  const handleTestAgent = async () => {
    if (!agent) return;
    
    navigate(`/agent/${agent.id}`);
  };
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => navigate("/agents")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">
                  {agentId ? "Edit Agent" : "Create New Agent"}
                </h1>
                <p className="text-gray-500">
                  {agentId
                    ? "Modify your existing AI agent"
                    : "Build a new AI agent with custom capabilities"}
                </p>
              </div>
            </div>
            
            <div className="flex gap-2">
              {agentId && (
                <>
                  <Button variant="outline" onClick={handleTestAgent}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Test Agent
                  </Button>
                  <Button variant="outline" className="text-red-500" onClick={handleDelete}>
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Agent
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {/* Basic Info Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Define the core details of your AI agent
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter a name for your agent"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what your agent does"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                {agent && (
                  <div className="flex items-center gap-2">
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
                    
                    <span className="text-xs text-gray-500">
                      Created: {new Date(agent.createdAt).toLocaleDateString()}
                    </span>
                    
                    <span className="text-xs text-gray-500">
                      Updated: {new Date(agent.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          {/* Tabs for different sections */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="personality">
                <Settings className="h-4 w-4 mr-2" />
                Personality & Behavior
              </TabsTrigger>
              <TabsTrigger value="tools">
                <Zap className="h-4 w-4 mr-2" />
                Tools & Capabilities
              </TabsTrigger>
              <TabsTrigger value="advanced">
                <Code className="h-4 w-4 mr-2" />
                Advanced Settings
              </TabsTrigger>
            </TabsList>
            
            {/* Personality Tab */}
            <TabsContent value="personality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Personality</CardTitle>
                  <CardDescription>
                    Define how your agent behaves and communicates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="personality-template">Personality Template</Label>
                    <Select
                      value={selectedPersonality}
                      onValueChange={handlePersonalityChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a personality template" />
                      </SelectTrigger>
                      <SelectContent>
                        {DEFAULT_AGENT_PERSONALITIES.map((personality) => (
                          <SelectItem key={personality.name} value={personality.name}>
                            {personality.name} - {personality.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="system-prompt">System Prompt</Label>
                    <Textarea
                      id="system-prompt"
                      value={customSystemPrompt}
                      onChange={(e) => setCustomSystemPrompt(e.target.value)}
                      rows={6}
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-gray-500">
                      This is the instruction that defines your agent's behavior. You can customize it to change how your agent responds.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Tools Tab */}
            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tools & Capabilities</CardTitle>
                  <CardDescription>
                    Add tools that your agent can use to perform tasks
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Brain className="h-8 w-8 mb-2 text-primary" />
                        <h3 className="font-medium">Knowledge Base</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Connect your agent to your knowledge base
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Knowledge Base
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Workflow className="h-8 w-8 mb-2 text-primary" />
                        <h3 className="font-medium">Workflows</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Let your agent execute custom workflows
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Workflow
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Globe className="h-8 w-8 mb-2 text-primary" />
                        <h3 className="font-medium">Web Search</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Allow your agent to search the web for information
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add Web Search
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                        <Zap className="h-8 w-8 mb-2 text-primary" />
                        <h3 className="font-medium">API Connections</h3>
                        <p className="text-sm text-gray-500 mb-4">
                          Connect your agent to external APIs
                        </p>
                        <Button variant="outline" size="sm">
                          <Plus className="h-4 w-4 mr-1" />
                          Add API Connection
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Model Settings</CardTitle>
                  <CardDescription>
                    Configure the AI model and generation parameters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="model">Default Model</Label>
                    <Select value={defaultModel} onValueChange={setDefaultModel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-4o">GPT-4o (OpenAI)</SelectItem>
                        <SelectItem value="claude-3-opus-20240229">Claude 3 Opus (Anthropic)</SelectItem>
                        <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro (Google)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      This will be replaced with Vertex AI/Gemini models when available
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="temperature">Temperature: {temperature}</Label>
                      <span className="text-sm text-gray-500">
                        {temperature <= 0.3 ? "More precise" : temperature >= 0.7 ? "More creative" : "Balanced"}
                      </span>
                    </div>
                    <Slider
                      id="temperature"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[temperature]}
                      onValueChange={(value) => setTemperature(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Lower values make responses more deterministic, higher values make them more creative
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-tokens">Max Output Tokens: {maxTokens}</Label>
                    <Slider
                      id="max-tokens"
                      min={100}
                      max={4000}
                      step={100}
                      value={[maxTokens]}
                      onValueChange={(value) => setMaxTokens(value[0])}
                    />
                    <p className="text-xs text-gray-500">
                      Maximum number of tokens the agent can generate in a response
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

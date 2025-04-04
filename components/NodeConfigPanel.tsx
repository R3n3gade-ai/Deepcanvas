import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Node } from '@xyflow/react';
import useWorkflowStore from '../utils/workflowStore';
import { toast } from 'sonner';
import { formatNodeType, nodeTypeToColor } from '../utils/workflowUtils';
import { Trash2, Save, X } from 'lucide-react';

interface NodeConfigPanelProps {
  onClose: () => void;
}

interface NodeData {
  label: string;
  type: string;
  inputs?: { id: string; label: string; type: string }[];
  outputs?: { id: string; label: string; type: string }[];
  properties?: Record<string, any>;
  [key: string]: any;
}

export function NodeConfigPanel({ onClose }: NodeConfigPanelProps) {
  const { nodes, selectedNodeId, updateNode, removeNode } = useWorkflowStore();
  const selectedNode = nodes.find(node => node.id === selectedNodeId);
  const [updatedData, setUpdatedData] = useState<NodeData | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const dragStartPosition = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement | null>(null);
  
  // Set initial position in the top-right corner
  useEffect(() => {
    // Use window dimensions to position the panel in the top-right corner with some margin
    if (selectedNode) {
      setPosition({ 
        x: window.innerWidth - 350, 
        y: 20 
      });
    }
  }, [selectedNode]);
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    dragStartPosition.current = { 
      x: e.clientX - position.x, 
      y: e.clientY - position.y 
    };
    
    // Add event listeners for drag and drag end
    window.addEventListener('mousemove', handleDrag);
    window.addEventListener('mouseup', handleDragEnd);
  };
  
  // Handle dragging
  const handleDrag = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragStartPosition.current.x;
      const newY = e.clientY - dragStartPosition.current.y;
      setPosition({ x: newX, y: newY });
    }
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    window.removeEventListener('mousemove', handleDrag);
    window.removeEventListener('mouseup', handleDragEnd);
  };
  
  useEffect(() => {
    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('mousemove', handleDrag);
      window.removeEventListener('mouseup', handleDragEnd);
    };
  }, []);
  
  useEffect(() => {
    if (selectedNode) {
      // Initialize with current node data
      setUpdatedData(selectedNode.data as NodeData);
      
      // Add a visual effect to the selected node in the canvas
      document.getElementById(selectedNode.id)?.classList.add('ring-2', 'ring-offset-2');
      
      // Cleanup function to remove the effect when closing
      return () => {
        document.getElementById(selectedNode.id)?.classList.remove('ring-2', 'ring-offset-2');
      };
    } else {
      setUpdatedData(null);
    }
  }, [selectedNode]);
  
  if (!selectedNode || !updatedData) {
    return null;
  }
  
  const nodeType = updatedData.type || 'default';
  const nodeColor = nodeTypeToColor(nodeType);
  const typeName = formatNodeType(nodeType);
  
  const handleInputChange = (key: string, value: any) => {
    setUpdatedData(prev => {
      if (!prev) return null;
      return { ...prev, [key]: value };
    });
  };
  
  const handlePropertyChange = (key: string, value: any) => {
    setUpdatedData(prev => {
      if (!prev) return null;
      const properties = { ...(prev.properties || {}), [key]: value };
      return { ...prev, properties };
    });
  };
  
  const handleSave = () => {
    if (selectedNode && updatedData) {
      updateNode(selectedNode.id, { ...selectedNode, data: updatedData });
      toast.success('Node configuration saved');
      
      // Add a visual feedback of the update
      const nodeElement = document.getElementById(selectedNode.id);
      if (nodeElement) {
        nodeElement.classList.add('scale-105', 'border-primary');
        setTimeout(() => {
          nodeElement.classList.remove('scale-105', 'border-primary');
        }, 300);
      }
    }
  };
  
  const handleDelete = () => {
    if (selectedNode) {
      // Show confirmation message
      const nodeElement = document.getElementById(selectedNode.id);
      if (nodeElement) {
        nodeElement.classList.add('scale-95', 'opacity-50');
        setTimeout(() => {
          removeNode(selectedNode.id);
          toast.success(`${updatedData?.label || 'Node'} deleted`);
          onClose();
        }, 300);
      } else {
        removeNode(selectedNode.id);
        toast.success(`${updatedData?.label || 'Node'} deleted`);
        onClose();
      }
    }
  };
  
  // Render configuration panel based on node type
  return (
    <div 
      ref={panelRef}
      className="absolute" 
      style={{ 
        top: position.y, 
        left: position.x,
        zIndex: 100,
        touchAction: 'none',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}
    >
      <div 
        className="handle flex items-center justify-between bg-muted rounded-t-md p-1 px-2 cursor-move" 
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-1">
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <div className="h-2 w-2 rounded-full bg-gray-400" />
          <div className="h-2 w-2 rounded-full bg-gray-400" />
        </div>
        <span className="text-xs text-muted-foreground">Drag to move</span>
      </div>
      <Card className="w-full max-w-xs border-t-0 rounded-t-none shadow-md animate-in slide-in-from-right-10 transition-all duration-300" style={{ borderTopColor: nodeColor }}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: nodeColor }} />
              {typeName} Configuration
            </CardTitle>
            <CardDescription>Configure the parameters for this node</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
        <Tabs defaultValue="basic">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="connections">Connections</TabsTrigger>
          </TabsList>
          
          {/* Basic Configuration Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="node-label">Node Label</Label>
              <Input 
                id="node-label"
                value={updatedData.label || typeName}
                onChange={(e) => handleInputChange('label', e.target.value)}
                placeholder={`${typeName} Node`}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="node-description">Description (Optional)</Label>
              <Textarea
                id="node-description"
                value={updatedData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this node does..."
                rows={2}
              />
            </div>
            
            {/* Specific node type configuration */}
            {renderNodeSpecificConfig(nodeType, updatedData, handlePropertyChange)}
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-4">
            {Object.entries(updatedData.properties || {}).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(updatedData.properties || {}).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`property-${key}`}>{formatPropertyName(key)}</Label>
                    {typeof value === 'boolean' ? (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id={`property-${key}`}
                          checked={value}
                          onCheckedChange={(checked) => handlePropertyChange(key, checked)}
                        />
                        <Label htmlFor={`property-${key}`}>{value ? 'Enabled' : 'Disabled'}</Label>
                      </div>
                    ) : typeof value === 'number' ? (
                      <Input
                        id={`property-${key}`}
                        type="number"
                        value={value}
                        onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value) || 0)}
                      />
                    ) : (
                      <Input
                        id={`property-${key}`}
                        value={value}
                        onChange={(e) => handlePropertyChange(key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No additional properties available for this node.</p>
                <p className="text-sm mt-1">Properties will appear here when added in the Basic tab.</p>
              </div>
            )}
          </TabsContent>
          
          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Input Connections</h3>
              {(updatedData.inputs && updatedData.inputs.length > 0) ? (
                <div className="space-y-2">
                  {updatedData.inputs.map((input, idx) => (
                    <div key={input.id} className="flex items-center p-2 rounded-md border border-muted bg-muted/30">
                      <div className="h-2 w-2 rounded-full bg-blue-400 mr-2" />
                      <div>
                        <p className="text-sm font-medium">{input.label}</p>
                        <p className="text-xs text-muted-foreground">Type: {input.type}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This node has no input connections.</p>
              )}
              
              <Separator className="my-3" />
              
              <h3 className="text-sm font-medium">Output Connections</h3>
              {(updatedData.outputs && updatedData.outputs.length > 0) ? (
                <div className="space-y-2">
                  {updatedData.outputs.map((output, idx) => (
                    <div key={output.id} className="flex items-center justify-between p-2 rounded-md border border-muted bg-muted/30">
                      <div>
                        <p className="text-sm font-medium">{output.label}</p>
                        <p className="text-xs text-muted-foreground">Type: {output.type}</p>
                      </div>
                      <div className="h-2 w-2 rounded-full bg-purple-400 ml-2" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">This node has no output connections.</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex items-center justify-between pt-2">
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            <Trash2 size={16} className="mr-1" /> Delete
          </Button>
          <Button onClick={handleSave}>
            <Save size={16} className="mr-1" /> Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}

function formatPropertyName(key: string): string {
  return key.split(/(?=[A-Z])/).join(' ').replace(/^./, (str) => str.toUpperCase());
}

function renderNodeSpecificConfig(
  nodeType: string, 
  data: NodeData, 
  onChange: (key: string, value: any) => void
) {
  switch (nodeType) {
    case 'input':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-type">Input Type</Label>
            <Select 
              value={data.properties?.inputType || 'text'}
              onValueChange={(value) => onChange('inputType', value)}
            >
              <SelectTrigger id="input-type">
                <SelectValue placeholder="Select input type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="file">File</SelectItem>
                <SelectItem value="number">Number</SelectItem>
                <SelectItem value="boolean">Boolean</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="input-prompt">Prompt Text</Label>
            <Textarea
              id="input-prompt"
              value={data.properties?.prompt || ''}
              onChange={(e) => onChange('prompt', e.target.value)}
              placeholder="Enter your question..."
              rows={2}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="required"
              checked={data.properties?.required || false}
              onCheckedChange={(checked) => onChange('required', checked)}
            />
            <Label htmlFor="required">Required Input</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="remember"
              checked={data.properties?.rememberValue || false}
              onCheckedChange={(checked) => onChange('rememberValue', checked)}
            />
            <Label htmlFor="remember">Remember Last Value</Label>
          </div>
        </div>
      );
      
    case 'output':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="output-format">Output Format</Label>
            <Select 
              value={data.properties?.outputFormat || 'text'}
              onValueChange={(value) => onChange('outputFormat', value)}
            >
              <SelectTrigger id="output-format">
                <SelectValue placeholder="Select output format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="output-template">Output Template (Optional)</Label>
            <Textarea
              id="output-template"
              value={data.properties?.template || ''}
              onChange={(e) => onChange('template', e.target.value)}
              placeholder="{result}"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">Use {result} as placeholder for output</p>
          </div>
        </div>
      );
      
    case 'llm':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="llm-model">Model</Label>
            <Select 
              value={data.properties?.model || 'gpt-4o-mini'}
              onValueChange={(value) => onChange('model', value)}
            >
              <SelectTrigger id="llm-model">
                <SelectValue placeholder="Select AI model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="llm-system">System Prompt</Label>
            <Textarea
              id="llm-system"
              value={data.properties?.systemPrompt || ''}
              onChange={(e) => onChange('systemPrompt', e.target.value)}
              placeholder="You are a helpful assistant..."
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="llm-temperature">Temperature</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="llm-temperature"
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={data.properties?.temperature || 0.7}
                onChange={(e) => onChange('temperature', parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="text-sm w-8">{data.properties?.temperature || 0.7}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="llm-max-tokens">Max Tokens</Label>
            <Input
              id="llm-max-tokens"
              type="number"
              value={data.properties?.maxTokens || 1000}
              onChange={(e) => onChange('maxTokens', parseInt(e.target.value, 10) || 1000)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="llm-streaming"
              checked={data.properties?.streaming || true}
              onCheckedChange={(checked) => onChange('streaming', checked)}
            />
            <Label htmlFor="llm-streaming">Enable Streaming</Label>
          </div>
        </div>
      );
    
    case 'filter':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filter-condition">Filter Condition</Label>
            <Textarea
              id="filter-condition"
              value={data.properties?.condition || ''}
              onChange={(e) => onChange('condition', e.target.value)}
              placeholder="item.status === 'active'"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">JavaScript expression to filter items</p>
          </div>
        </div>
      );
      
    case 'transform':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="transform-expression">Transform Expression</Label>
            <Textarea
              id="transform-expression"
              value={data.properties?.expression || ''}
              onChange={(e) => onChange('expression', e.target.value)}
              placeholder="item => ({ ...item, processed: true })"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">JavaScript expression to transform data</p>
          </div>
        </div>
      );
    
    case 'api':
    case 'http':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-url">API Endpoint URL</Label>
            <Input
              id="api-url"
              value={data.properties?.url || ''}
              onChange={(e) => onChange('url', e.target.value)}
              placeholder="https://api.example.com/data"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-method">HTTP Method</Label>
            <Select 
              value={data.properties?.method || 'GET'}
              onValueChange={(value) => onChange('method', value)}
            >
              <SelectTrigger id="api-method">
                <SelectValue placeholder="Select HTTP method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GET">GET</SelectItem>
                <SelectItem value="POST">POST</SelectItem>
                <SelectItem value="PUT">PUT</SelectItem>
                <SelectItem value="DELETE">DELETE</SelectItem>
                <SelectItem value="PATCH">PATCH</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="api-headers">Headers (JSON)</Label>
            <Textarea
              id="api-headers"
              value={data.properties?.headers || '{"Content-Type": "application/json"}'}
              onChange={(e) => onChange('headers', e.target.value)}
              placeholder='{"Content-Type": "application/json"}'
              rows={2}
            />
          </div>
        </div>
      );
  
    case 'code':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code-function">JavaScript Function</Label>
            <Textarea
              id="code-function"
              value={data.properties?.code || 'function execute(input) {\n  // Your code here\n  return input;\n}'}
              onChange={(e) => onChange('code', e.target.value)}
              placeholder="function execute(input) {\n  // Your code here\n  return input;\n}"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        </div>
      );
      
    case 'switch':
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="switch-condition">Condition Expression</Label>
            <Textarea
              id="switch-condition"
              value={data.properties?.condition || ''}
              onChange={(e) => onChange('condition', e.target.value)}
              placeholder="input > 10"
              rows={2}
            />
            <p className="text-xs text-muted-foreground">JavaScript expression that evaluates to true/false</p>
          </div>
        </div>
      );
      
    default:
      return (
        <div className="p-4 border rounded-md bg-muted/50">
          <p className="text-sm text-center text-muted-foreground">Basic configuration options are available for this node type.</p>
        </div>
      );
  }
}

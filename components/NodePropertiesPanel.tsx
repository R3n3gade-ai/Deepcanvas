import { useState, useEffect } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function NodePropertiesPanel() {
  const { 
    nodes, 
    selectedNode: selectedNodeId, 
    updateNodeData, 
    removeNode,
    clearSelection,
    selectNode
  } = useWorkflowStore();
  
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");
  
  const selectedNode = selectedNodeId ? nodes.find(node => node.id === selectedNodeId) : null;
  const selectedNodeData = selectedNode?.data || null;
  const selectedNodeType = selectedNode?.type || null;
  
  useEffect(() => {
    if (selectedNodeData) {
      setFormValues(selectedNodeData);
      setIsValid(true);
      setValidationMessage("");
    } else {
      setFormValues({});
    }
  }, [selectedNodeData, selectedNodeId]);
  
  const handleChange = (key: string, value: any) => {
    setFormValues(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // Reset validation state when user makes changes
    if (!isValid) {
      setIsValid(true);
      setValidationMessage("");
    }
  };
  
  const handleSave = () => {
    if (!selectedNodeId) return;
    
    try {
      // Validate JSON fields
      const validatedValues = { ...formValues };
      
      // Perform any necessary validation here
      // For example, ensuring inputs/outputs are in the right format
      
      // Update the node data
      updateNodeData(selectedNodeId, validatedValues);
      
      setIsValid(true);
      setValidationMessage("");
    } catch (error) {
      setIsValid(false);
      setValidationMessage(error instanceof Error ? error.message : "Invalid input");
    }
  };
  
  const handleDelete = () => {
    if (!selectedNodeId) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this node?");
    if (!confirmed) return;
    
    removeNode(selectedNodeId);
    clearSelection();
  };

  if (!selectedNodeId || !selectedNodeData) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center border-l border-gray-200 bg-white p-4 text-center text-gray-400">
        <p>Select a node to edit its properties</p>
      </div>
    );
  }

  const nodeColor = nodeTypeToColor(selectedNodeType || 'default');

  return (
    <div className="h-full w-full overflow-auto border-l border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium text-gray-900">
          <div 
            className="h-3 w-3 rounded-full" 
            style={{ backgroundColor: nodeColor }} 
          />
          <span>
            {formatNodeType(selectedNodeType || 'default')} Properties
          </span>
        </h3>
        <button 
          onClick={clearSelection}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      <div className="mt-4 space-y-4">
        {/* Node Label */}
        <div className="space-y-1">
          <Label htmlFor="node-label">Label</Label>
          <Input
            id="node-label"
            value={formValues.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Node Label"
          />
        </div>

        {/* Node Type Configuration Section */}
      <div className="space-y-4 mt-4">
        <h4 className="text-sm font-medium text-gray-700">Configuration</h4>
        
        {/* Node Type-specific Input Fields */}
        {selectedNodeType === 'llm' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="model">Model</Label>
              <Select
                value={formValues.model || 'gpt-4o-mini'}
                onValueChange={(value) => handleChange('model', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                  <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="prompt">System Prompt</Label>
              <Textarea
                id="prompt"
                value={formValues.prompt || ''}
                onChange={(e) => handleChange('prompt', e.target.value)}
                placeholder="You are a helpful assistant..."
                rows={4}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={formValues.temperature || 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}
        
        {selectedNodeType === 'api' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="url">API URL</Label>
              <Input
                id="url"
                value={formValues.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="method">Method</Label>
              <Select
                value={formValues.method || 'GET'}
                onValueChange={(value) => handleChange('method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="headers">Headers</Label>
              <Textarea
                id="headers"
                value={JSON.stringify(formValues.headers || {}, null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('headers', JSON.parse(e.target.value));
                  } catch (err) {
                    // Allow invalid JSON during editing, will be validated on save
                  }
                }}
                placeholder='{ "Content-Type": "application/json" }'
                rows={3}
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}
        
        {selectedNodeType === 'database' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="query">Query</Label>
              <Textarea
                id="query"
                value={formValues.query || ''}
                onChange={(e) => handleChange('query', e.target.value)}
                placeholder="SELECT * FROM users WHERE id = $1"
                rows={3}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="parameters">Parameters</Label>
              <Textarea
                id="parameters"
                value={JSON.stringify(formValues.parameters || [], null, 2)}
                onChange={(e) => {
                  try {
                    handleChange('parameters', JSON.parse(e.target.value));
                  } catch (err) {
                    // Allow invalid JSON during editing, will be validated on save
                  }
                }}
                placeholder='["value1", "value2"]'
                rows={2}
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}
        
        {selectedNodeType === 'code' && (
          <div className="space-y-1">
            <Label htmlFor="code">Custom Code</Label>
            <Textarea
              id="code"
              value={formValues.code || ''}
              onChange={(e) => handleChange('code', e.target.value)}
              placeholder="// Write your JavaScript code here\nreturn input * 2;"
              rows={8}
              className="font-mono text-xs"
            />
          </div>
        )}
        
        {selectedNodeType === 'transform' && (
          <div className="space-y-1">
            <Label htmlFor="transformCode">Transform Code</Label>
            <Textarea
              id="transformCode"
              value={formValues.transformCode || '// Example: return input.map(x => x * 2);'}
              onChange={(e) => handleChange('transformCode', e.target.value)}
              placeholder="// Input is available as 'input' variable\nreturn input;"
              rows={5}
              className="font-mono text-xs"
            />
          </div>
        )}
        
        {selectedNodeType === 'filter' && (
          <div className="space-y-1">
            <Label htmlFor="filterCondition">Filter Condition</Label>
            <Textarea
              id="filterCondition"
              value={formValues.filterCondition || '// Return true to keep item, false to filter out\nreturn item.value > 10;'}
              onChange={(e) => handleChange('filterCondition', e.target.value)}
              placeholder="// Each item is available as 'item' variable\nreturn true;  // keep all by default"
              rows={5}
              className="font-mono text-xs"
            />
          </div>
        )}
        
        {selectedNodeType === 'switch' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="condition">Condition Expression</Label>
              <Textarea
                id="condition"
                value={formValues.condition || '// Return a boolean value\nreturn input.value > 10;'}
                onChange={(e) => handleChange('condition', e.target.value)}
                placeholder="// Input is available as 'input' variable\nreturn true;  // send to 'true' output by default"
                rows={4}
                className="font-mono text-xs"
              />
            </div>
          </div>
        )}
        
        {selectedNodeType === 'loop' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="loopType">Loop Type</Label>
              <Select
                value={formValues.loopType || 'foreach'}
                onValueChange={(value) => handleChange('loopType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select loop type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="foreach">For Each (iterate array)</SelectItem>
                  <SelectItem value="while">While (condition-based)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formValues.loopType === 'while' && (
              <div className="space-y-1">
                <Label htmlFor="whileCondition">While Condition</Label>
                <Textarea
                  id="whileCondition"
                  value={formValues.whileCondition || '// Continue loop while this returns true\nreturn count < 10;'}
                  onChange={(e) => handleChange('whileCondition', e.target.value)}
                  placeholder="// Return boolean to continue or stop loop\nreturn count < 10;  // loop 10 times"
                  rows={4}
                  className="font-mono text-xs"
                />
              </div>
            )}
          </div>
        )}
        
        {selectedNodeType === 'http' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="url">URL</Label>
              <Input
                id="url"
                value={formValues.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="method">Method</Label>
              <Select
                value={formValues.method || 'GET'}
                onValueChange={(value) => handleChange('method', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {selectedNodeType === 'embedding' && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="model">Embedding Model</Label>
              <Select
                value={formValues.model || 'text-embedding-ada-002'}
                onValueChange={(value) => handleChange('model', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-embedding-ada-002">OpenAI Ada 002</SelectItem>
                  <SelectItem value="text-embedding-3-small">OpenAI Embedding 3 Small</SelectItem>
                  <SelectItem value="text-embedding-3-large">OpenAI Embedding 3 Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        
        {/* Generic Properties Section */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Custom Properties</h4>
          
          {Object.entries(selectedNodeData)
            .filter(([key]) => !['inputs', 'outputs', 'type', 'label'].includes(key) && 
                             !(selectedNodeType === 'llm' && ['model', 'prompt', 'temperature'].includes(key)) &&
                             !(selectedNodeType === 'api' && ['url', 'method', 'headers'].includes(key)) &&
                             !(selectedNodeType === 'database' && ['query', 'parameters'].includes(key)) &&
                             !(selectedNodeType === 'code' && ['code'].includes(key)) &&
                             !(selectedNodeType === 'transform' && ['transformCode'].includes(key)) &&
                             !(selectedNodeType === 'filter' && ['filterCondition'].includes(key)) &&
                             !(selectedNodeType === 'switch' && ['condition'].includes(key)) &&
                             !(selectedNodeType === 'loop' && ['loopType', 'whileCondition'].includes(key)) &&
                             !(selectedNodeType === 'http' && ['url', 'method'].includes(key)) &&
                             !(selectedNodeType === 'embedding' && ['model'].includes(key)))
            .map(([key, value]) => {
              // Render different inputs based on value type
              const valueType = typeof value;
              
              if (valueType === 'string' && value.length > 100) {
                return (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`node-${key}`}>{key}</Label>
                    <Textarea
                      id={`node-${key}`}
                      value={formValues[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={key}
                      rows={4}
                    />
                  </div>
                );
              }
              
              if (valueType === 'boolean') {
                return (
                  <div key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`node-${key}`}
                      checked={formValues[key] || false}
                      onChange={(e) => handleChange(key, e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor={`node-${key}`}>{key}</Label>
                  </div>
                );
              }
              
              if (valueType === 'number') {
                return (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`node-${key}`}>{key}</Label>
                    <Input
                      id={`node-${key}`}
                      type="number"
                      value={formValues[key] || 0}
                      onChange={(e) => handleChange(key, parseFloat(e.target.value))}
                      placeholder={key}
                    />
                  </div>
                );
              }
              
              if (valueType === 'object') {
                return (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`node-${key}`}>{key}</Label>
                    <Textarea
                      id={`node-${key}`}
                      value={JSON.stringify(formValues[key] || {}, null, 2)}
                      onChange={(e) => {
                        try {
                          handleChange(key, JSON.parse(e.target.value));
                        } catch (err) {
                          // Allow invalid JSON during editing, will be validated on save
                        }
                      }}
                      placeholder={`{ "${key}": "value" }`}
                      rows={4}
                      className="font-mono text-xs"
                    />
                  </div>
                );
              }
              
              // Default to text input for other types
              return (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`node-${key}`}>{key}</Label>
                  <Input
                    id={`node-${key}`}
                    value={formValues[key] || ''}
                    onChange={(e) => handleChange(key, e.target.value)}
                    placeholder={key}
                  />
                </div>
              );
            })}
        </div>
      </div>
        
        {!isValid && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {validationMessage || "There was an error with your input. Please check and try again."}
            </AlertDescription>
          </Alert>
        )}
        
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button 
            onClick={handleDelete} 
            variant="destructive" 
            className="flex-1"
          >
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  );
}
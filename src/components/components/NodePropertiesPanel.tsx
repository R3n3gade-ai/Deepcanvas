import { useState, useEffect } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { nodeTypeToColor, formatNodeType, cn } from "../utils/workflowUtils";
import { getNodeTypeDefinition } from "../utils/nodeTypes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { AlertCircle, X, ExternalLink } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ConnectionSelector } from "./ConnectionSelector";

export function NodePropertiesPanel() {
  const {
    nodes,
    selectedNodeId,
    updateNodeData,
    removeNode,
    selectNode
  } = useWorkflowStore();

  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [isValid, setIsValid] = useState(true);
  const [validationMessage, setValidationMessage] = useState("");

  const selectedNode = selectedNodeId
    ? nodes.find(node => node.id === selectedNodeId)
    : null;

  const selectedNodeData = selectedNode?.data || null;
  const selectedNodeType = selectedNode?.type || null;

  // Get node type definition
  const nodeTypeDefinition = selectedNodeType
    ? getNodeTypeDefinition(selectedNodeType)
    : null;

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

      toast.success("Node properties saved");
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
  };

  if (!selectedNodeId || !selectedNodeData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center text-gray-500">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2">Select a node to edit its properties</h3>
        <p className="text-sm">Click on any node in the canvas to configure it</p>
      </div>
    );
  }

  const nodeColor = nodeTypeToColor(selectedNodeType || 'default');
  const configFields = nodeTypeDefinition?.configFields || [];

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white border-l border-gray-200">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className={cn("w-3 h-10 rounded-sm mr-3", nodeColor.split(' ')[0])} />
          <div>
            <h3 className="text-lg font-semibold">
              {formatNodeType(selectedNodeType || 'default')} Properties
            </h3>
            <p className="text-sm text-gray-500">ID: {selectedNodeId}</p>
          </div>
        </div>
        <button
          onClick={() => selectNode(null)}
          className="text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
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
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Configuration</h4>

            {/* Render config fields based on node type definition */}
            {configFields.map((field) => {
              // Check if field should be shown based on conditional display
              if (field.showIf && formValues[field.showIf.field] !== field.showIf.value) {
                return null;
              }

              // Render different field types
              switch (field.type) {
                case 'text':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Input
                        id={`node-${field.id}`}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ''}
                      />
                    </div>
                  );

                case 'textarea':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Textarea
                        id={`node-${field.id}`}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ''}
                        rows={4}
                      />
                    </div>
                  );

                case 'number':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>
                        {field.label}: {formValues[field.id] || field.defaultValue || 0}
                      </Label>
                      {field.min !== undefined && field.max !== undefined ? (
                        <Slider
                          id={`node-${field.id}`}
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          value={[formValues[field.id] || field.defaultValue || 0]}
                          onValueChange={(value) => handleChange(field.id, value[0])}
                        />
                      ) : (
                        <Input
                          id={`node-${field.id}`}
                          type="number"
                          min={field.min}
                          max={field.max}
                          step={field.step || 1}
                          value={formValues[field.id] || field.defaultValue || 0}
                          onChange={(e) => handleChange(field.id, parseFloat(e.target.value))}
                        />
                      )}
                    </div>
                  );

                case 'select':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Select
                        value={formValues[field.id] || field.defaultValue || ''}
                        onValueChange={(value) => handleChange(field.id, value)}
                      >
                        <SelectTrigger id={`node-${field.id}`}>
                          <SelectValue placeholder="Select option" />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  );

                case 'checkbox':
                  return (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`node-${field.id}`}
                        checked={formValues[field.id] || false}
                        onCheckedChange={(checked) => handleChange(field.id, checked)}
                      />
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                    </div>
                  );

                case 'json':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Textarea
                        id={`node-${field.id}`}
                        value={typeof formValues[field.id] === 'object'
                          ? JSON.stringify(formValues[field.id] || {}, null, 2)
                          : formValues[field.id] || ''
                        }
                        onChange={(e) => {
                          try {
                            handleChange(field.id, JSON.parse(e.target.value));
                          } catch (err) {
                            // Allow invalid JSON during editing, will be validated on save
                            handleChange(field.id, e.target.value);
                          }
                        }}
                        placeholder={field.placeholder || '{}'}
                        rows={4}
                        className="font-mono text-xs"
                      />
                    </div>
                  );

                case 'code':
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Textarea
                        id={`node-${field.id}`}
                        value={formValues[field.id] || field.placeholder || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder || '// Write code here'}
                        rows={8}
                        className="font-mono text-xs"
                      />
                    </div>
                  );

                case 'connection':
                  return (
                    <div key={field.id} className="space-y-1">
                      <ConnectionSelector
                        value={formValues[field.id] || ''}
                        onChange={(value) => handleChange(field.id, value)}
                        connectionType={field.connectionType}
                        placeholder={field.placeholder}
                        label={field.label}
                      />
                    </div>
                  );

                default:
                  return (
                    <div key={field.id} className="space-y-1">
                      <Label htmlFor={`node-${field.id}`}>{field.label}</Label>
                      <Input
                        id={`node-${field.id}`}
                        value={formValues[field.id] || ''}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder || ''}
                      />
                    </div>
                  );
              }
            })}
          </div>

          {/* Custom Properties Section */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700 border-b pb-2">Custom Properties</h4>

            {/* Filter out properties that are already handled by config fields */}
            {Object.entries(selectedNodeData)
              .filter(([key]) =>
                !['inputs', 'outputs', 'type', 'label', 'executionResult'].includes(key) &&
                !configFields.some(field => field.id === key)
              )
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
                      <Checkbox
                        id={`node-${key}`}
                        checked={formValues[key] || false}
                        onCheckedChange={(checked) => handleChange(key, checked)}
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
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">
            Save Changes
          </Button>
          <Button onClick={handleDelete} variant="destructive" className="flex-1">
            Delete Node
          </Button>
        </div>
      </div>
    </div>
  );
}

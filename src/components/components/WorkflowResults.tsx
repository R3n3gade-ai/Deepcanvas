import { useState } from "react";
import useWorkflowStore from "../utils/workflowStore";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, ChevronDown, ChevronRight, Clock, Copy } from "lucide-react";
import { toast } from "sonner";

export function WorkflowResults() {
  const { executionResults, nodes } = useWorkflowStore();
  const [activeTab, setActiveTab] = useState<string>("outputs");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  if (!executionResults) {
    return null;
  }

  const { success, outputs, error, executedNodes } = executionResults;
  
  // Toggle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    setExpandedNodes({
      ...expandedNodes,
      [nodeId]: !expandedNodes[nodeId]
    });
  };
  
  // Format value for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return "null";
    }
    
    if (typeof value === "object") {
      return JSON.stringify(value, null, 2);
    }
    
    return String(value);
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  // Get node label by ID
  const getNodeLabel = (nodeId: string): string => {
    const node = nodes.find(n => n.id === nodeId);
    return node ? (node.data.label || node.type) : nodeId;
  };
  
  // Get executed node IDs in order
  const executedNodeIds = Object.keys(executedNodes);
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">Workflow Results</CardTitle>
            {success ? (
              <Badge variant="success" className="bg-green-100 text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Success
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-red-100 text-red-800 flex items-center gap-1">
                <XCircle className="h-3 w-3" />
                Failed
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleTimeString()}
          </div>
        </div>
        {error && (
          <CardDescription className="text-red-500">
            {error}
          </CardDescription>
        )}
      </CardHeader>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="px-6">
          <TabsList className="w-full">
            <TabsTrigger value="outputs" className="flex-1">Outputs</TabsTrigger>
            <TabsTrigger value="execution" className="flex-1">Execution Flow</TabsTrigger>
          </TabsList>
        </div>
        
        <CardContent className="pt-3">
          <TabsContent value="outputs" className="m-0">
            {Object.keys(outputs).length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No outputs available
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(outputs).map(([key, value]) => (
                  <div key={key} className="rounded-md border p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{key}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0" 
                        onClick={() => copyToClipboard(formatValue(value))}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <ScrollArea className="h-[100px]">
                      <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto">
                        {formatValue(value)}
                      </pre>
                    </ScrollArea>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="execution" className="m-0">
            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {executedNodeIds.length === 0 ? (
                  <div className="py-4 text-center text-gray-500">
                    No execution data available
                  </div>
                ) : (
                  executedNodeIds.map((nodeId) => (
                    <Collapsible
                      key={nodeId}
                      open={expandedNodes[nodeId]}
                      onOpenChange={() => toggleNodeExpansion(nodeId)}
                      className="border rounded-md"
                    >
                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 text-left">
                        <div className="flex items-center">
                          {expandedNodes[nodeId] ? (
                            <ChevronDown className="h-4 w-4 mr-2" />
                          ) : (
                            <ChevronRight className="h-4 w-4 mr-2" />
                          )}
                          <span className="font-medium">{getNodeLabel(nodeId)}</span>
                          <span className="text-xs text-gray-500 ml-2">({nodeId})</span>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-3 pb-3">
                        <ScrollArea className="h-[150px]">
                          <pre className="text-xs font-mono bg-gray-50 p-2 rounded overflow-auto">
                            {formatValue(executedNodes[nodeId])}
                          </pre>
                        </ScrollArea>
                      </CollapsibleContent>
                    </Collapsible>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </CardContent>
      </Tabs>
      
      <CardFooter className="border-t pt-3 flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => useWorkflowStore.setState({ executionResults: null })}
        >
          Close
        </Button>
      </CardFooter>
    </Card>
  );
}

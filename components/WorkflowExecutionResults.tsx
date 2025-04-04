import { useEffect, useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, CheckCircle, Clock, Info, XCircle } from "lucide-react";
import useWorkflowStore from "../utils/workflowStore";

interface WorkflowExecutionResultsProps {
  executionResults: any;
  onClear: () => void;
}

export function WorkflowExecutionResults({ executionResults, onClear }: WorkflowExecutionResultsProps) {
  const { currentWorkflow } = useWorkflowStore();
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);

  // Find node info by ID
  const getNodeInfo = (nodeId: string) => {
    if (!currentWorkflow) return { label: nodeId, type: "unknown" };
    const node = currentWorkflow.nodes.find(n => n.id === nodeId);
    return {
      label: node?.data?.label || nodeId,
      type: node?.type || "unknown"
    };
  };

  if (!executionResults) return null;

  return (
    <div className="space-y-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Execution Results</h3>
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Results
        </Button>
      </div>

      {/* Overall Status */}
      <Alert
        variant={executionResults.status === "completed" ? "default" : "destructive"}
      >
        {executionResults.status === "completed" ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <XCircle className="h-5 w-5" />
        )}
        <AlertTitle className="capitalize">
          Workflow {executionResults.status}
        </AlertTitle>
        <AlertDescription className="text-xs">
          Execution ID: {executionResults.executionId || "N/A"}
          {executionResults.timestamp && (
            <span className="ml-2">
              Timestamp: {new Date(executionResults.timestamp).toLocaleString()}
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Execution Metrics */}
      {executionResults.metrics && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-md bg-blue-50 p-3 transition-all hover:shadow-md">
            <div className="text-xs text-blue-600">Execution Time</div>
            <div className="text-lg font-medium">{executionResults.metrics.executionTime}ms</div>
          </div>
          <div className="rounded-md bg-green-50 p-3 transition-all hover:shadow-md">
            <div className="text-xs text-green-600">Success Rate</div>
            <div className="text-lg font-medium">{executionResults.metrics.successRate}</div>
          </div>
          <div className="rounded-md bg-purple-50 p-3 transition-all hover:shadow-md">
            <div className="text-xs text-purple-600">Nodes Processed</div>
            <div className="text-lg font-medium">
              {executionResults.metrics.completedNodes}/{executionResults.metrics.totalNodes}
            </div>
          </div>
          <div className="rounded-md bg-red-50 p-3 transition-all hover:shadow-md">
            <div className="text-xs text-red-600">Failed Nodes</div>
            <div className="text-lg font-medium">{executionResults.metrics.failedNodes}</div>
          </div>
        </div>
      )}

      {/* Node Results */}
      {executionResults.nodeResults && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Node Execution Details</h4>
          <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
            {Object.values(executionResults.nodeResults)
              .sort((a: any, b: any) => a.executionTime - b.executionTime)
              .map((nodeResult: any) => {
                const nodeInfo = getNodeInfo(nodeResult.id);
                const isExpanded = expandedNodeId === nodeResult.id;

                return (
                  <Card
                    key={nodeResult.id}
                    className={`overflow-hidden border transition-all hover:shadow-md ${nodeResult.status === "completed"
                      ? "border-green-200"
                      : "border-red-200"
                      }`}
                  >
                    <div
                      className={`flex cursor-pointer items-center justify-between p-3 ${nodeResult.status === "completed"
                        ? "bg-green-50"
                        : "bg-red-50"
                        }`}
                      onClick={() => setExpandedNodeId(isExpanded ? null : nodeResult.id)}
                    >
                      <div className="flex items-center space-x-3">
                        {nodeResult.status === "completed" ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <div className="font-medium">{nodeInfo.label}</div>
                          <div className="text-xs text-gray-500">
                            Type: {nodeInfo.type}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge
                          variant="outline"
                          className={`flex items-center space-x-1 ${nodeResult.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                            }`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>{nodeResult.executionTime}ms</span>
                        </Badge>
                        <span className="text-gray-400">
                          {isExpanded ? "▲" : "▼"}
                        </span>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-gray-100 p-3">
                        {nodeResult.error ? (
                          <Alert variant="destructive" className="mb-3">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>
                              {nodeResult.error}
                            </AlertDescription>
                          </Alert>
                        ) : null}

                        {nodeResult.output && (
                          <div>
                            <div className="mb-1 flex items-center">
                              <Info className="mr-1 h-3 w-3 text-blue-500" />
                              <span className="text-xs font-medium text-blue-500">
                                Output
                              </span>
                            </div>
                            <pre className="max-h-[250px] overflow-auto rounded-md bg-gray-50 p-3 text-xs">
                              {JSON.stringify(nodeResult.output, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}
                  </Card>
                );
              })}
          </div>
        </div>
      )}

      {/* Final Output */}
      {executionResults.output && (
        <div>
          <h4 className="mb-2 text-sm font-medium text-gray-700">Final Workflow Output</h4>
          <pre className="max-h-[200px] overflow-auto rounded-md bg-gray-50 p-3 text-xs">
            {JSON.stringify(executionResults.output, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

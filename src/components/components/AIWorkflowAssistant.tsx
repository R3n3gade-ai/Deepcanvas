import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import useWorkflowStore from '../utils/workflowStore';
import { generateWorkflowFromDescription } from '../utils/aiWorkflowGenerator';

interface AIWorkflowAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onWorkflowCreated: (workflowId: string) => void;
}

export function AIWorkflowAssistant({ isOpen, onClose, onWorkflowCreated }: AIWorkflowAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const { createWorkflow } = useWorkflowStore();

  // Examples to help users understand what they can create
  const examples = [
    "Create a workflow that processes customer feedback from a CSV file, analyzes sentiment, and sends alerts for negative reviews.",
    "Build a workflow that monitors Twitter for mentions of my brand, analyzes the sentiment, and sends a daily summary report.",
    "Create a workflow that takes a list of product descriptions and generates marketing copy and images for each product.",
    "Build a workflow that extracts data from PDFs, transforms it into a structured format, and uploads it to a database."
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description of the workflow you want to create");
      return;
    }

    if (!workflowName.trim()) {
      toast.error("Please enter a name for your workflow");
      return;
    }

    setIsGenerating(true);

    try {
      // Generate workflow using AI
      const workflowData = await generateWorkflowFromDescription(prompt, workflowName);
      
      // Create the workflow
      const workflowId = await createWorkflow({
        name: workflowName,
        description: prompt,
        nodes: workflowData.nodes,
        edges: workflowData.edges,
      });
      
      toast.success("Workflow created successfully!");
      onWorkflowCreated(workflowId);
      onClose();
    } catch (error) {
      console.error("Error generating workflow:", error);
      toast.error("Failed to generate workflow. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseExample = (example: string) => {
    setPrompt(example);
    setWorkflowName(example.split(' ').slice(1, 4).join(' '));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Sparkles className="h-5 w-5 text-purple-500 mr-2" />
            AI Workflow Assistant
          </DialogTitle>
          <DialogDescription>
            Describe the workflow you want to create in natural language, and our AI will generate it for you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium mb-1">Workflow Name</label>
            <input
              type="text"
              value={workflowName}
              onChange={(e) => setWorkflowName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Enter a name for your workflow"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Describe Your Workflow</label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want your workflow to do..."
              className="min-h-[120px]"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about inputs, processing steps, and desired outputs.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Examples</label>
            <div className="space-y-2">
              {examples.map((example, index) => (
                <div 
                  key={index}
                  className="p-2 bg-gray-50 border border-gray-200 rounded-md text-sm cursor-pointer hover:bg-gray-100"
                  onClick={() => handleUseExample(example)}
                >
                  {example}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim() || !workflowName.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Workflow
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

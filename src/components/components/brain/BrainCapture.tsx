import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Brain, Maximize2, Minimize2 } from "lucide-react";
import { SaveToBrainButton } from "./SaveToBrainButton";

interface BrainCaptureProps {
  // The content to save to the brain
  pageTitle: string;
  pageContent?: string;
  pageUrl?: string;
  // Optional position
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
  // Optional callback after saving
  onSaved?: () => void;
}

export function BrainCapture({
  pageTitle,
  pageContent = "",
  pageUrl = window.location.href,
  position = "bottom-right",
  onSaved
}: BrainCaptureProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Position classes
  const positionClasses = {
    "top-right": "top-4 right-4",
    "bottom-right": "bottom-4 right-4",
    "top-left": "top-4 left-4",
    "bottom-left": "bottom-4 left-4"
  };
  
  return (
    <div className={`fixed ${positionClasses[position]} z-50`}>
      {isExpanded ? (
        <div className="bg-white rounded-lg shadow-lg p-4 flex flex-col space-y-3 border border-gray-200">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Brain className="h-5 w-5 text-purple-600 mr-2" />
              <span className="font-medium">Brain Capture</span>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setIsExpanded(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-sm text-gray-500">
            Save this page to your knowledge base
          </p>
          
          <SaveToBrainButton
            pageTitle={pageTitle}
            pageContent={pageContent}
            pageUrl={pageUrl}
            variant="default"
            size="default"
            className="w-full"
            onSaved={onSaved}
          />
        </div>
      ) : (
        <Button
          variant="default"
          size="icon"
          className="h-10 w-10 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
          onClick={() => setIsExpanded(true)}
          title="Save to Brain"
        >
          <Brain className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Brain } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface BrainInfluenceIndicatorProps {
  // The AI response to analyze
  response: string;
  // The brain context that was used (if available)
  brainContext?: string;
  // The user query that triggered the response
  userQuery: string;
  // Optional className for styling
  className?: string;
}

export function BrainInfluenceIndicator({
  response,
  brainContext,
  userQuery,
  className = ""
}: BrainInfluenceIndicatorProps) {
  const [influenceLevel, setInfluenceLevel] = useState<"none" | "low" | "medium" | "high">("none");
  const [influenceScore, setInfluenceScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const [sourcesFound, setSourcesFound] = useState<string[]>([]);
  
  // Analyze the response to determine brain influence
  useEffect(() => {
    if (!brainContext || !response) {
      setInfluenceLevel("none");
      setInfluenceScore(0);
      return;
    }
    
    // Extract document titles from brain context
    const titleRegex = /#### (.*?) \(/g;
    const titles: string[] = [];
    let match;
    while ((match = titleRegex.exec(brainContext)) !== null) {
      titles.push(match[1]);
    }
    setSourcesFound(titles);
    
    // Check if any titles are mentioned in the response
    const mentionedTitles = titles.filter(title => 
      response.includes(title) || 
      response.includes(title.replace(/[^\w\s]/gi, ''))
    );
    
    // Check for citation patterns
    const hasCitations = response.includes("according to") || 
                         response.includes("as mentioned in") || 
                         response.includes("from your") ||
                         response.includes("based on your") ||
                         response.includes("your document") ||
                         response.includes("your knowledge base");
    
    // Calculate influence score (0-100)
    let score = 0;
    
    // If we have sources and they're mentioned
    if (titles.length > 0 && mentionedTitles.length > 0) {
      score += (mentionedTitles.length / titles.length) * 50;
    }
    
    // If there are citation patterns
    if (hasCitations) {
      score += 30;
    }
    
    // Check for content similarity (simple implementation)
    // In a real app, you'd use more sophisticated text comparison
    const brainContextWords = new Set(brainContext.toLowerCase().split(/\W+/));
    const responseWords = response.toLowerCase().split(/\W+/);
    const matchingWords = responseWords.filter(word => 
      word.length > 4 && brainContextWords.has(word)
    );
    
    if (responseWords.length > 0) {
      const matchRatio = matchingWords.length / responseWords.length;
      score += matchRatio * 20;
    }
    
    // Cap at 100
    score = Math.min(100, score);
    setInfluenceScore(Math.round(score));
    
    // Set influence level based on score
    if (score < 20) {
      setInfluenceLevel("none");
    } else if (score < 50) {
      setInfluenceLevel("low");
    } else if (score < 80) {
      setInfluenceLevel("medium");
    } else {
      setInfluenceLevel("high");
    }
  }, [response, brainContext]);
  
  // If no brain context was used, don't show the indicator
  if (influenceLevel === "none" && !brainContext) {
    return null;
  }
  
  // Get color based on influence level
  const getColor = () => {
    switch (influenceLevel) {
      case "high": return "bg-green-100 text-green-800 hover:bg-green-200";
      case "medium": return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "low": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "none": return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge 
              variant="outline" 
              className={`cursor-pointer ${getColor()} ${className}`}
              onClick={() => setShowDetails(true)}
            >
              <Brain className="h-3 w-3 mr-1" />
              {influenceLevel === "none" ? "No Brain influence" : `${influenceScore}% Brain influence`}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to see how your knowledge base influenced this response</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Knowledge Base Influence</DialogTitle>
            <DialogDescription>
              How your Brain knowledge influenced this AI response
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <div className="font-medium">Influence Score: {influenceScore}%</div>
              <Badge className={getColor()}>
                {influenceLevel.charAt(0).toUpperCase() + influenceLevel.slice(1)}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Your Question:</h3>
              <div className="text-sm bg-gray-50 p-3 rounded-md">
                {userQuery}
              </div>
            </div>
            
            {sourcesFound.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Knowledge Sources Used:</h3>
                <ul className="text-sm space-y-1">
                  {sourcesFound.map((source, index) => (
                    <li key={index} className="flex items-start">
                      <div className="h-5 w-5 text-green-500 mr-2">•</div>
                      <span>{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {brainContext && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Context Provided to AI:</h3>
                <div className="text-xs bg-gray-50 p-3 rounded-md max-h-40 overflow-y-auto">
                  <pre className="whitespace-pre-wrap font-sans">{brainContext}</pre>
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => setShowDetails(false)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

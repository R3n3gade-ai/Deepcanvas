import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Brain } from "lucide-react";
import { useBrainCapture } from "../../utils/BrainCaptureProvider";

interface GlobalBrainButtonProps {
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
  offset?: number;
}

export function GlobalBrainButton({
  position = "bottom-right",
  offset = 20
}: GlobalBrainButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { enableCapture } = useBrainCapture();
  
  // Position classes
  const positionClasses = {
    "top-right": `top-${offset} right-${offset}`,
    "bottom-right": `bottom-${offset} right-${offset}`,
    "top-left": `top-${offset} left-${offset}`,
    "bottom-left": `bottom-${offset} left-${offset}`
  };
  
  // Show button after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle click
  const handleCapture = () => {
    // Get page title
    const pageTitle = document.title || window.location.pathname;
    
    // Get page content - this is a simple implementation
    // In a real app, you might want to be more selective about what content to capture
    const mainContent = document.querySelector('main');
    let pageContent = '';
    
    if (mainContent) {
      // Get text content from main element
      pageContent = mainContent.textContent || '';
      
      // Clean up the content (remove excessive whitespace)
      pageContent = pageContent
        .replace(/\\s+/g, ' ')
        .trim()
        .substring(0, 5000); // Limit to 5000 chars
    }
    
    // Enable capture
    enableCapture(pageTitle, pageContent);
  };
  
  if (!isVisible) return null;
  
  return (
    <Button
      variant="default"
      size="icon"
      className={`fixed ${positionClasses[position]} z-50 h-10 w-10 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700 transition-all duration-300 ease-in-out`}
      onClick={handleCapture}
      title="Save to Brain"
    >
      <Brain className="h-5 w-5" />
    </Button>
  );
}

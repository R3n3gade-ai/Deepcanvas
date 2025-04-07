import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Brain, Save, Loader2 } from "lucide-react";
import brainService, { BrainCollection } from "../../utils/brainService";

interface SaveToBrainButtonProps {
  // The content to save to the brain
  pageTitle: string;
  pageContent?: string;
  pageUrl?: string;
  // Optional custom button props
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  // Optional callback after saving
  onSaved?: () => void;
}

export function SaveToBrainButton({
  pageTitle,
  pageContent = "",
  pageUrl = window.location.href,
  variant = "outline",
  size = "sm",
  className = "",
  onSaved
}: SaveToBrainButtonProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState<BrainCollection[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [title, setTitle] = useState(pageTitle);
  const [content, setContent] = useState(pageContent);
  const [tags, setTags] = useState("");
  
  // Mock user ID - in a real app, get this from authentication
  const userId = "user-123";
  
  // Load collections when dialog opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      loadCollections();
    }
    setOpen(open);
  };
  
  // Load user collections
  const loadCollections = () => {
    const userCollections = brainService.getUserCollections(userId);
    setCollections(userCollections);
  };
  
  // Handle saving to brain
  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Process tags
      const tagsList = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
      
      // Create document
      const documentId = await brainService.addDocument({
        title: title.trim(),
        content: content.trim() || `Content from ${pageUrl}`,
        contentType: "text",
        metadata: {
          source: pageUrl,
          dateAdded: new Date().toISOString(),
          userId,
          tags: tagsList
        }
      });
      
      // Add to collection if selected
      if (selectedCollection) {
        brainService.addDocumentToCollection(documentId, selectedCollection);
      }
      
      toast.success("Saved to Brain successfully");
      
      // Call onSaved callback if provided
      if (onSaved) {
        onSaved();
      }
      
      // Close dialog
      setOpen(false);
    } catch (error) {
      console.error("Error saving to Brain:", error);
      toast.error("Failed to save to Brain. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={className}
          title="Save to Brain"
        >
          <Brain className="h-4 w-4 mr-2" />
          <span>Save to Brain</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save to Knowledge Brain</DialogTitle>
          <DialogDescription>
            Save this content to your knowledge base for future reference and AI assistance
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a title for this knowledge"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter or edit the content to save"
              rows={5}
            />
            <p className="text-xs text-gray-500">
              Edit the content above to save only what's important
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="collection">Add to Collection (Optional)</Label>
            <Select value={selectedCollection} onValueChange={setSelectedCollection}>
              <SelectTrigger id="collection">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {collections.map(collection => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (Optional)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Enter tags separated by commas"
            />
            <p className="text-xs text-gray-500">
              Example: dashboard, metrics, important
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save to Brain
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

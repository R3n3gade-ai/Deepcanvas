import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import brainService, { BrainCollection } from "../../utils/brainService";

interface CollectionDialogProps {
  userId: string;
  existingCollection?: BrainCollection;
  onCollectionSaved: () => void;
  trigger?: React.ReactNode;
}

export function CollectionDialog({ userId, existingCollection, onCollectionSaved, trigger }: CollectionDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(existingCollection?.name || "");
  const [description, setDescription] = useState(existingCollection?.description || "");
  const [isLoading, setIsLoading] = useState(false);
  
  const isEditing = !!existingCollection;
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error("Collection name is required");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (isEditing) {
        // Update existing collection
        brainService.updateCollection(existingCollection.id, {
          name: name.trim(),
          description: description.trim()
        });
        toast.success("Collection updated successfully");
      } else {
        // Create new collection
        brainService.createCollection({
          name: name.trim(),
          description: description.trim(),
          documents: [],
          userId,
          isPrivate: true
        });
        toast.success("Collection created successfully");
      }
      
      onCollectionSaved();
      setOpen(false);
    } catch (error) {
      console.error("Error saving collection:", error);
      toast.error("Failed to save collection. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>Create Collection</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Collection" : "Create New Collection"}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update your knowledge collection details" 
                : "Create a new collection to organize your knowledge base"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Collection Name</Label>
              <Input
                id="name"
                placeholder="e.g., Marketing Resources"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this collection"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditing ? "Update Collection" : "Create Collection"}</>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

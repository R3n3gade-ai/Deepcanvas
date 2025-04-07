import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileUploader } from "./FileUploader";
import { UrlForm } from "./UrlForm";
import { TextForm } from "./TextForm";
import brainService, { BrainCollection } from "../../utils/brainService";

interface AddKnowledgeDialogProps {
  userId: string;
  collections: BrainCollection[];
  onKnowledgeAdded: () => void;
  trigger?: React.ReactNode;
}

export function AddKnowledgeDialog({ userId, collections, onKnowledgeAdded, trigger }: AddKnowledgeDialogProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("file");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string>("");

  // Handle file upload
  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      for (const file of files) {
        await brainService.processFile(file, userId, selectedCollection || undefined);
      }

      toast.success(`${files.length} file(s) added to your knowledge base`);
      onKnowledgeAdded();
      setOpen(false);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload files. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle URL submission
  const handleUrlSubmit = async (url: string, title: string, description: string) => {
    if (!url) return;

    setIsLoading(true);
    try {
      await brainService.processUrl(url, userId, selectedCollection || undefined);

      toast.success("URL added to your knowledge base");
      onKnowledgeAdded();
      setOpen(false);
    } catch (error) {
      console.error("Error processing URL:", error);
      toast.error("Failed to process URL. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle text submission
  const handleTextSubmit = async (title: string, content: string, tags: string[]) => {
    if (!title || !content) return;

    setIsLoading(true);
    try {
      await brainService.addDocument({
        title,
        content,
        contentType: "text",
        metadata: {
          source: "manual",
          dateAdded: new Date().toISOString(),
          userId,
          tags
        }
      });

      if (selectedCollection) {
        // Add to collection if selected
        // Note: This would need to be updated to get the document ID from addDocument
      }

      toast.success("Text added to your knowledge base");
      onKnowledgeAdded();
      setOpen(false);
    } catch (error) {
      console.error("Error adding text:", error);
      toast.error("Failed to add text. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <span>Add Knowledge</span>
            <span>+</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add to Knowledge Base</DialogTitle>
          <DialogDescription>
            Add documents, links, or text to your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
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

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="file">File Upload</TabsTrigger>
              <TabsTrigger value="url">URL / Link</TabsTrigger>
              <TabsTrigger value="text">Text</TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="py-4">
              <FileUploader onFilesSelected={handleFileUpload} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="url" className="py-4">
              <UrlForm onSubmit={handleUrlSubmit} isLoading={isLoading} />
            </TabsContent>

            <TabsContent value="text" className="py-4">
              <TextForm onSubmit={handleTextSubmit} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

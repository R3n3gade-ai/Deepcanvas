import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import brainService, { BrainCollection } from "../../utils/brainService";
import * as unifiedAiService from "../../utils/unifiedAiService";
import { AIProvider } from "../../utils/unifiedAiService";

interface GenerateContentDialogProps {
  userId: string;
  collections: BrainCollection[];
  onContentGenerated: () => void;
  trigger: React.ReactNode;
}

export function GenerateContentDialog({
  userId,
  collections,
  onContentGenerated,
  trigger
}: GenerateContentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [title, setTitle] = useState("");
  const [prompt, setPrompt] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [contentType, setContentType] = useState<"text" | "code" | "summary">("text");

  // Handle content generation
  const handleGenerateContent = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title for your content");
      return;
    }

    if (!prompt.trim()) {
      toast.error("Please enter a prompt for the AI");
      return;
    }

    setIsGenerating(true);

    try {
      // Determine which AI provider to use
      const provider = unifiedAiService.getDefaultProviderForTask(contentType === "code" ? "code" : "chat");
      
      // Create a system prompt based on content type
      let systemPrompt = "";
      switch (contentType) {
        case "code":
          systemPrompt = "You are an expert programmer. Provide clean, well-documented code with explanations. Focus on best practices and efficiency.";
          break;
        case "summary":
          systemPrompt = "You are a summarization expert. Create concise, accurate summaries that capture the key points while maintaining clarity.";
          break;
        default:
          systemPrompt = "You are a knowledgeable assistant that generates high-quality, informative content. Your responses should be well-structured, factual, and comprehensive.";
      }

      // Generate content
      const content = await unifiedAiService.generateChatResponse(
        [
          {
            id: 'user-1',
            role: 'user',
            content: prompt,
            timestamp: new Date()
          }
        ],
        {
          model: provider === AIProvider.OPENAI ? 'gpt-4o' : 
                 provider === AIProvider.ANTHROPIC ? 'claude-3-opus-20240229' : 'gemini-1.5-pro',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt
        },
        provider
      );

      // Add the generated content to the brain
      await brainService.addDocument({
        title,
        content,
        contentType: "text",
        metadata: {
          source: 'ai-generated',
          dateAdded: new Date().toISOString(),
          userId,
          tags: ['ai-generated', contentType],
          ...(selectedCollection ? { collectionId: selectedCollection } : {})
        }
      });

      // Add to collection if selected
      if (selectedCollection) {
        const documentIds = brainService.getUserDocuments(userId)
          .filter(doc => doc.title === title && doc.metadata.source === 'ai-generated')
          .map(doc => doc.id);
        
        if (documentIds.length > 0) {
          brainService.addDocumentToCollection(documentIds[0], selectedCollection);
        }
      }

      toast.success("Content generated and added to your brain");
      onContentGenerated();
      setOpen(false);
      
      // Reset form
      setTitle("");
      setPrompt("");
      setSelectedCollection(null);
      setContentType("text");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Content with AI</DialogTitle>
          <DialogDescription>
            Use AI to generate content for your knowledge base
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter a title for this content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="content-type">Content Type</Label>
            <Select
              value={contentType}
              onValueChange={(value) => setContentType(value as "text" | "code" | "summary")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">General Text</SelectItem>
                <SelectItem value="code">Code & Documentation</SelectItem>
                <SelectItem value="summary">Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="prompt">Prompt for AI</Label>
            <Textarea
              id="prompt"
              placeholder="Describe what you want the AI to generate..."
              rows={5}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="collection">Add to Collection (Optional)</Label>
            <Select
              value={selectedCollection || ""}
              onValueChange={setSelectedCollection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {collections.map((collection) => (
                  <SelectItem key={collection.id} value={collection.id}>
                    {collection.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateContent} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Content
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

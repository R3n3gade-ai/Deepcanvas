import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "components/Sidebar";
import { AppProvider } from "utils/AppProvider";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  FileText,
  Image,
  Film,
  Music,
  Link,
  File,
  Trash,
  Edit,
  FolderPlus,
  Brain as BrainIcon,
  Video,
  FileAudio,
  MoreVertical,
  Share,
  Download,
  Tag,
  Calendar,
  Clock,
  ChevronDown,
  Upload,
  Globe,
  Folder,
  FileIcon,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import brainService, { BrainDocument, BrainCollection } from "../utils/brainService";
import { AddKnowledgeDialog } from "../components/brain/AddKnowledgeDialog";
import { CollectionDialog } from "../components/brain/CollectionDialog";
import { KnowledgeGraph } from "../components/brain/KnowledgeGraph";
import { GenerateContentDialog } from "../components/brain/GenerateContentDialog";
import { ProcessUrlDialog } from "../components/brain/ProcessUrlDialog";
import * as unifiedAiService from "../utils/unifiedAiService";
import { AIProvider } from "../utils/unifiedAiService";

export default function Brain() {
  return (
    <AppProvider>
      <BrainContent />
    </AppProvider>
  );
}

function BrainContent() {
  const [activeTab, setActiveTab] = useState("collections");
  const [collections, setCollections] = useState<BrainCollection[]>([]);
  const [documents, setDocuments] = useState<BrainDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);

  // Mock user ID - in a real app, get this from authentication
  const userId = "user-123";

  // Load initial data
  const loadData = () => {
    setIsLoading(true);

    // Initialize brain service if needed
    if (!brainService.isInitialized()) {
      // In a real app, get this from your API keys
      brainService.initialize("mock-api-key");
    }

    // Load collections and documents
    const userCollections = brainService.getUserCollections(userId);
    const userDocuments = brainService.getUserDocuments(userId);

    setCollections(userCollections);
    setDocuments(userDocuments);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter documents based on search query and selected collection
  const filteredDocuments = documents.filter(doc => {
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!doc.title.toLowerCase().includes(query) &&
          !doc.content.toLowerCase().includes(query)) {
        return false;
      }
    }

    // Filter by selected collection
    if (selectedCollection) {
      const collection = collections.find(c => c.id === selectedCollection);
      if (!collection || !collection.documents.includes(doc.id)) {
        return false;
      }
    }

    return true;
  });

  // Get content type icon
  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Image className="h-4 w-4 text-purple-500" />;
      case 'video':
        return <Film className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-green-500" />;
      case 'url':
        return <Link className="h-4 w-4 text-cyan-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-orange-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  // Handle document deletion
  const handleDeleteDocument = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this document?");
    if (confirmed) {
      brainService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully");
    }
  };

  // Handle collection deletion
  const handleDeleteCollection = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this collection?");
    if (confirmed) {
      brainService.deleteCollection(id);
      setCollections(prev => prev.filter(collection => collection.id !== id));
      toast.success("Collection deleted successfully");
    }
  };

  // View collection documents
  const handleViewCollection = (id: string) => {
    setSelectedCollection(id);
    setActiveTab("documents");
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4 max-w-7xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Knowledge Brain</h1>
              <p className="text-gray-500 mt-1">
                Build your knowledge base with documents, links, and more
              </p>
            </div>

            <div className="flex gap-2">
              <CollectionDialog
                userId={userId}
                onCollectionSaved={loadData}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <FolderPlus size={16} />
                    <span>New Collection</span>
                  </Button>
                }
              />

              <AddKnowledgeDialog
                userId={userId}
                collections={collections}
                onKnowledgeAdded={loadData}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Plus size={16} />
                    <span>Add Files</span>
                  </Button>
                }
              />

              <ProcessUrlDialog
                userId={userId}
                collections={collections}
                onUrlProcessed={loadData}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Globe size={16} />
                    <span>Add URL</span>
                  </Button>
                }
              />

              <GenerateContentDialog
                userId={userId}
                collections={collections}
                onContentGenerated={loadData}
                trigger={
                  <Button className="gap-2">
                    <Sparkles size={16} />
                    <span>Generate with AI</span>
                  </Button>
                }
              />
            </div>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search your knowledge base..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {selectedCollection && (
            <div className="mb-4 flex items-center">
              <Badge variant="outline" className="px-3 py-1 text-sm">
                Collection: {collections.find(c => c.id === selectedCollection)?.name}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-7 text-xs"
                onClick={() => setSelectedCollection(null)}
              >
                Clear
              </Button>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="documents">All Documents</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="collections" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center">
                      <p>Loading collections...</p>
                    </CardContent>
                  </Card>
                ) : collections.length === 0 ? (
                  <Card className="col-span-full bg-gray-50 border-dashed">
                    <CardContent className="py-8 text-center">
                      <h3 className="text-lg font-medium mb-2">No collections yet</h3>
                      <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        Create collections to organize your knowledge base
                      </p>
                      <CollectionDialog
                        userId={userId}
                        onCollectionSaved={loadData}
                        trigger={<Button>Create Your First Collection</Button>}
                      />
                    </CardContent>
                  </Card>
                ) : (
                  collections.map(collection => (
                    <Card key={collection.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{collection.name}</CardTitle>
                          <Badge variant="secondary">
                            {collection.documents.length} docs
                          </Badge>
                        </div>
                        <CardDescription>
                          Created {new Date(collection.dateCreated).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">
                          {collection.description || "No description"}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewCollection(collection.id)}
                          >
                            View
                          </Button>
                          <CollectionDialog
                            userId={userId}
                            existingCollection={collection}
                            onCollectionSaved={loadData}
                            trigger={
                              <Button variant="outline" size="sm">
                                <Edit size={14} className="mr-1" />
                                Edit
                              </Button>
                            }
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteCollection(collection.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                  <Card className="col-span-full">
                    <CardContent className="py-8 text-center">
                      <p>Loading documents...</p>
                    </CardContent>
                  </Card>
                ) : filteredDocuments.length === 0 ? (
                  <Card className="col-span-full bg-gray-50 border-dashed">
                    <CardContent className="py-8 text-center">
                      <h3 className="text-lg font-medium mb-2">
                        {searchQuery || selectedCollection ? "No matching documents" : "No documents yet"}
                      </h3>
                      <p className="text-gray-500 mb-4 max-w-md mx-auto">
                        {searchQuery || selectedCollection
                          ? "Try adjusting your search or filters"
                          : "Add documents to your knowledge base"}
                      </p>
                      {!searchQuery && !selectedCollection && (
                        <AddKnowledgeDialog
                          userId={userId}
                          collections={collections}
                          onKnowledgeAdded={loadData}
                        />
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  filteredDocuments.map(document => (
                    <Card key={document.id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="flex items-center gap-2">
                            {getContentTypeIcon(document.contentType)}
                            <span className="truncate">{document.title}</span>
                          </CardTitle>
                        </div>
                        <CardDescription className="flex justify-between">
                          <span>{new Date(document.metadata.dateAdded).toLocaleDateString()}</span>
                          <Badge variant="outline">
                            {document.contentType}
                          </Badge>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500 line-clamp-3">
                          {document.content}
                        </p>
                        {document.metadata.tags && document.metadata.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {document.metadata.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDeleteDocument(document.id)}
                        >
                          <Trash size={14} className="mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-0">
              <div className="grid grid-cols-1 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Knowledge Insights</CardTitle>
                    <CardDescription>
                      Analytics and insights about your knowledge base
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{documents.length}</div>
                          <p className="text-sm text-gray-500">Total Documents</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">{collections.length}</div>
                          <p className="text-sm text-gray-500">Collections</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-2xl font-bold">
                            {Object.values(documents.reduce((acc, doc) => {
                              acc[doc.contentType] = (acc[doc.contentType] || 0) + 1;
                              return acc;
                            }, {} as Record<string, number>)).length}
                          </div>
                          <p className="text-sm text-gray-500">Content Types</p>
                        </CardContent>
                      </Card>
                    </div>

                    <h3 className="text-lg font-medium mb-4">Content Type Distribution</h3>
                    <div className="space-y-3">
                      {Object.entries(documents.reduce((acc, doc) => {
                        acc[doc.contentType] = (acc[doc.contentType] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)).map(([type, count]) => (
                        <div key={type} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center">
                              {getContentTypeIcon(type)}
                              <span className="ml-2 capitalize">{type}</span>
                            </div>
                            <span>{count} documents</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${(count / documents.length) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Knowledge Graph Visualization */}
                <KnowledgeGraph
                  userId={userId}
                  documents={documents}
                  collections={collections}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

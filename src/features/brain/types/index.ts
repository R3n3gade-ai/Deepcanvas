// Types for the brain feature

export interface BrainDocument {
  id: string;
  title: string;
  content: string;
  contentType: 'text' | 'pdf' | 'image' | 'video' | 'audio' | 'url' | 'activity';
  metadata: {
    source: string;
    dateAdded: string;
    lastAccessed?: string;
    tags?: string[];
    embedding?: number[];
    thumbnailUrl?: string;
    fileSize?: number;
    mimeType?: string;
    originalFileName?: string;
    pageCount?: number;
    duration?: number;
    dimensions?: { width: number; height: number };
    userId: string;
    workspaceId?: string;
    relatedDocuments?: string[];
    activityType?: string;
    activityContext?: Record<string, any>;
    // Additional metadata for URLs
    originalUrl?: string;
    favicon?: string;
    siteName?: string;
    description?: string;
  };
  collectionIds: string[];
}

export interface BrainCollection {
  id: string;
  name: string;
  description: string;
  documentIds: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  isDefault?: boolean;
  icon?: string;
  color?: string;
}

export interface BrainQuery {
  query: string;
  topK?: number;
  filters?: {
    contentTypes?: string[];
    collections?: string[];
    tags?: string[];
    dateRange?: {
      start?: string;
      end?: string;
    };
  };
}

export interface BrainQueryResult {
  documentId: string;
  score: number;
  content: string;
  metadata: {
    title: string;
    source: string;
    contentType: string;
    [key: string]: any;
  };
}

export interface BrainStore {
  documents: BrainDocument[];
  collections: BrainCollection[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDocuments: () => Promise<void>;
  fetchCollections: () => Promise<void>;
  addDocument: (document: Omit<BrainDocument, 'id'>) => Promise<string>;
  updateDocument: (document: BrainDocument) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  addCollection: (collection: Omit<BrainCollection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateCollection: (collection: BrainCollection) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  searchDocuments: (query: BrainQuery) => Promise<BrainQueryResult[]>;
  addDocumentToCollection: (documentId: string, collectionId: string) => Promise<void>;
  removeDocumentFromCollection: (documentId: string, collectionId: string) => Promise<void>;
}

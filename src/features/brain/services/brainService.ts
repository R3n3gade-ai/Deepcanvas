import { v4 as uuidv4 } from 'uuid';
import { BrainDocument, BrainCollection, BrainQuery, BrainQueryResult } from '../types';

// Mock data for demonstration
const mockDocuments: BrainDocument[] = [
  {
    id: '1',
    title: 'Introduction to AI',
    content: 'Artificial Intelligence (AI) is the simulation of human intelligence processes by machines, especially computer systems.',
    contentType: 'text',
    metadata: {
      source: 'Manual Entry',
      dateAdded: new Date().toISOString(),
      tags: ['AI', 'Introduction', 'Technology'],
      userId: 'user-123',
      thumbnailUrl: 'https://via.placeholder.com/150',
    },
    collectionIds: ['1'],
  },
  {
    id: '2',
    title: 'Machine Learning Basics',
    content: 'Machine learning is a method of data analysis that automates analytical model building.',
    contentType: 'text',
    metadata: {
      source: 'Manual Entry',
      dateAdded: new Date().toISOString(),
      tags: ['Machine Learning', 'AI', 'Data Science'],
      userId: 'user-123',
      thumbnailUrl: 'https://via.placeholder.com/150',
    },
    collectionIds: ['1'],
  },
  {
    id: '3',
    title: 'Deep Learning Tutorial',
    content: 'Deep learning is a subset of machine learning that uses neural networks with many layers.',
    contentType: 'pdf',
    metadata: {
      source: 'Uploaded File',
      dateAdded: new Date().toISOString(),
      tags: ['Deep Learning', 'Neural Networks', 'AI'],
      userId: 'user-123',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      originalFileName: 'deep_learning_tutorial.pdf',
      pageCount: 15,
      thumbnailUrl: 'https://via.placeholder.com/150',
    },
    collectionIds: ['1', '2'],
  },
  {
    id: '4',
    title: 'AI Ethics Considerations',
    content: 'Ethics in AI involves ensuring that AI systems are designed and deployed in ways that are fair, transparent, and accountable.',
    contentType: 'url',
    metadata: {
      source: 'Web',
      dateAdded: new Date().toISOString(),
      tags: ['AI', 'Ethics', 'Technology'],
      userId: 'user-123',
      originalUrl: 'https://example.com/ai-ethics',
      favicon: 'https://example.com/favicon.ico',
      siteName: 'Example AI Blog',
      description: 'A blog about AI ethics and considerations',
      thumbnailUrl: 'https://via.placeholder.com/150',
    },
    collectionIds: ['2'],
  },
];

const mockCollections: BrainCollection[] = [
  {
    id: '1',
    name: 'AI Fundamentals',
    description: 'Basic concepts and introductions to artificial intelligence',
    documentIds: ['1', '2', '3'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-123',
    isDefault: true,
    icon: 'brain',
    color: '#3b82f6',
  },
  {
    id: '2',
    name: 'Advanced AI Topics',
    description: 'More advanced topics in AI and machine learning',
    documentIds: ['3', '4'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userId: 'user-123',
    icon: 'sparkles',
    color: '#10b981',
  },
];

class BrainService {
  private documents: BrainDocument[] = [];
  private collections: BrainCollection[] = [];
  private apiKey: string | null = null;
  private initialized: boolean = false;

  // Initialize the service
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    this.documents = [...mockDocuments];
    this.collections = [...mockCollections];
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  // Document operations
  getUserDocuments(userId: string): BrainDocument[] {
    return this.documents.filter(doc => doc.metadata.userId === userId);
  }

  getDocumentById(id: string): BrainDocument | undefined {
    return this.documents.find(doc => doc.id === id);
  }

  async addDocument(document: Omit<BrainDocument, 'id'>): Promise<string> {
    const id = uuidv4();
    const newDocument: BrainDocument = {
      ...document,
      id,
    };
    this.documents.push(newDocument);
    return id;
  }

  async updateDocument(document: BrainDocument): Promise<void> {
    const index = this.documents.findIndex(doc => doc.id === document.id);
    if (index !== -1) {
      this.documents[index] = document;
    }
  }

  async deleteDocument(id: string): Promise<void> {
    this.documents = this.documents.filter(doc => doc.id !== id);
    
    // Also remove from collections
    this.collections.forEach(collection => {
      collection.documentIds = collection.documentIds.filter(docId => docId !== id);
    });
  }

  // Collection operations
  getUserCollections(userId: string): BrainCollection[] {
    return this.collections.filter(collection => collection.userId === userId);
  }

  getCollectionById(id: string): BrainCollection | undefined {
    return this.collections.find(collection => collection.id === id);
  }

  async addCollection(collection: Omit<BrainCollection, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newCollection: BrainCollection = {
      ...collection,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.collections.push(newCollection);
    return id;
  }

  async updateCollection(collection: BrainCollection): Promise<void> {
    const index = this.collections.findIndex(coll => coll.id === collection.id);
    if (index !== -1) {
      this.collections[index] = {
        ...collection,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  async deleteCollection(id: string): Promise<void> {
    this.collections = this.collections.filter(collection => collection.id !== id);
    
    // Update documents to remove this collection
    this.documents.forEach(doc => {
      doc.collectionIds = doc.collectionIds.filter(collId => collId !== id);
    });
  }

  // Document-Collection relationship
  async addDocumentToCollection(documentId: string, collectionId: string): Promise<void> {
    // Update document
    const document = this.getDocumentById(documentId);
    if (document && !document.collectionIds.includes(collectionId)) {
      document.collectionIds.push(collectionId);
    }
    
    // Update collection
    const collection = this.getCollectionById(collectionId);
    if (collection && !collection.documentIds.includes(documentId)) {
      collection.documentIds.push(documentId);
      collection.updatedAt = new Date().toISOString();
    }
  }

  async removeDocumentFromCollection(documentId: string, collectionId: string): Promise<void> {
    // Update document
    const document = this.getDocumentById(documentId);
    if (document) {
      document.collectionIds = document.collectionIds.filter(id => id !== collectionId);
    }
    
    // Update collection
    const collection = this.getCollectionById(collectionId);
    if (collection) {
      collection.documentIds = collection.documentIds.filter(id => id !== documentId);
      collection.updatedAt = new Date().toISOString();
    }
  }

  // Search operations
  async searchDocuments(query: BrainQuery): Promise<BrainQueryResult[]> {
    // In a real implementation, this would use vector search or other advanced techniques
    // For this mock, we'll just do a simple text search
    const results: BrainQueryResult[] = [];
    const lowerQuery = query.query.toLowerCase();
    
    // Filter documents based on query filters
    let filteredDocs = [...this.documents];
    
    if (query.filters) {
      if (query.filters.contentTypes && query.filters.contentTypes.length > 0) {
        filteredDocs = filteredDocs.filter(doc => 
          query.filters?.contentTypes?.includes(doc.contentType)
        );
      }
      
      if (query.filters.collections && query.filters.collections.length > 0) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.collectionIds.some(id => query.filters?.collections?.includes(id))
        );
      }
      
      if (query.filters.tags && query.filters.tags.length > 0) {
        filteredDocs = filteredDocs.filter(doc => 
          doc.metadata.tags?.some(tag => 
            query.filters?.tags?.includes(tag)
          )
        );
      }
      
      if (query.filters.dateRange) {
        if (query.filters.dateRange.start) {
          filteredDocs = filteredDocs.filter(doc => 
            doc.metadata.dateAdded >= (query.filters?.dateRange?.start || '')
          );
        }
        if (query.filters.dateRange.end) {
          filteredDocs = filteredDocs.filter(doc => 
            doc.metadata.dateAdded <= (query.filters?.dateRange?.end || '')
          );
        }
      }
    }
    
    // Search through filtered documents
    for (const doc of filteredDocs) {
      const titleMatch = doc.title.toLowerCase().includes(lowerQuery);
      const contentMatch = doc.content.toLowerCase().includes(lowerQuery);
      const tagMatch = doc.metadata.tags?.some(tag => tag.toLowerCase().includes(lowerQuery));
      
      if (titleMatch || contentMatch || tagMatch) {
        // Calculate a simple score based on where the match was found
        let score = 0;
        if (titleMatch) score += 0.6;
        if (contentMatch) score += 0.3;
        if (tagMatch) score += 0.1;
        
        results.push({
          documentId: doc.id,
          score,
          content: doc.content,
          metadata: {
            title: doc.title,
            source: doc.metadata.source,
            contentType: doc.contentType,
            ...doc.metadata,
          },
        });
      }
    }
    
    // Sort by score and limit results
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, query.topK || 10);
  }
}

// Create and export a singleton instance
const brainService = new BrainService();
export default brainService;

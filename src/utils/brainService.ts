import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

// Types
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
    description?: string;
  };
}

export interface BrainCollection {
  id: string;
  name: string;
  description: string;
  documents: string[]; // Document IDs
  dateCreated: string;
  lastModified: string;
  userId: string;
  isPrivate: boolean;
  icon?: string;
  color?: string;
}

export interface BrainQuery {
  query: string;
  filters?: {
    collections?: string[];
    contentTypes?: string[];
    dateRange?: { start: string; end: string };
    tags?: string[];
  };
  limit?: number;
  userId: string;
}

export interface BrainQueryResult {
  documents: BrainDocument[];
  relevanceScores: number[];
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  type: string;
  action: string;
  details: Record<string, any>;
  userId: string;
}

// Local storage keys
const BRAIN_DOCUMENTS_KEY = 'brain_documents';
const BRAIN_COLLECTIONS_KEY = 'brain_collections';
const BRAIN_ACTIVITY_LOG_KEY = 'brain_activity_log';

// Brain Service Class
class BrainService {
  private documents: Map<string, BrainDocument>;
  private collections: Map<string, BrainCollection>;
  private activityLog: ActivityLog[];
  private embeddings: Map<string, number[]>;
  private apiKey: string | null;
  private apiEndpoint: string;

  constructor() {
    this.documents = new Map();
    this.collections = new Map();
    this.activityLog = [];
    this.embeddings = new Map();
    this.apiKey = null;
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1';

    this.loadFromStorage();
  }

  // Check if the Brain service is initialized
  isInitialized(): boolean {
    return !!this.apiKey;
  }

  // Initialize the Brain with API key
  initialize(apiKey: string): void {
    this.apiKey = apiKey;
    console.log('Brain service initialized with API key');
  }

  // Load data from local storage
  private loadFromStorage(): void {
    try {
      // Load documents
      const documentsJson = localStorage.getItem(BRAIN_DOCUMENTS_KEY);
      if (documentsJson) {
        const documents = JSON.parse(documentsJson);
        Object.entries(documents).forEach(([id, doc]) => {
          this.documents.set(id, doc as BrainDocument);
        });
      }

      // Load collections
      const collectionsJson = localStorage.getItem(BRAIN_COLLECTIONS_KEY);
      if (collectionsJson) {
        const collections = JSON.parse(collectionsJson);
        Object.entries(collections).forEach(([id, collection]) => {
          this.collections.set(id, collection as BrainCollection);
        });
      }

      // Load activity log
      const activityLogJson = localStorage.getItem(BRAIN_ACTIVITY_LOG_KEY);
      if (activityLogJson) {
        this.activityLog = JSON.parse(activityLogJson);
      }

      console.log(`Brain loaded: ${this.documents.size} documents, ${this.collections.size} collections`);
    } catch (error) {
      console.error('Error loading brain data from storage:', error);
    }
  }

  // Save data to local storage
  private saveToStorage(): void {
    try {
      // Save documents
      const documentsObj = Object.fromEntries(this.documents.entries());
      localStorage.setItem(BRAIN_DOCUMENTS_KEY, JSON.stringify(documentsObj));

      // Save collections
      const collectionsObj = Object.fromEntries(this.collections.entries());
      localStorage.setItem(BRAIN_COLLECTIONS_KEY, JSON.stringify(collectionsObj));

      // Save activity log (limit to last 1000 entries)
      const recentActivity = this.activityLog.slice(-1000);
      localStorage.setItem(BRAIN_ACTIVITY_LOG_KEY, JSON.stringify(recentActivity));
    } catch (error) {
      console.error('Error saving brain data to storage:', error);
    }
  }

  // Generate embeddings for text content
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.apiKey) {
      throw new Error('API key not set. Please initialize the Brain service with an API key.');
    }

    try {
      // Check if we already have an embedding for this text
      const textHash = this.hashText(text);
      const cachedEmbedding = this.embeddings.get(textHash);

      if (cachedEmbedding) {
        return cachedEmbedding;
      }

      // If not cached, generate a new embedding
      const response = await axios.post(
        `${this.apiEndpoint}/models/embedding-001:embedText?key=${this.apiKey}`,
        {
          text: text
        }
      );

      const embedding = response.data.embedding.values;

      // Cache the embedding
      this.embeddings.set(textHash, embedding);

      return embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      // Return empty embedding as fallback
      return new Array(768).fill(0);
    }
  }

  // Simple hash function for text
  private hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  }

  // Add a document to the brain
  async addDocument(document: Omit<BrainDocument, 'id'>): Promise<string> {
    const id = uuidv4();
    const newDocument: BrainDocument = {
      ...document,
      id
    };

    // Generate embedding if not provided
    if (!newDocument.metadata.embedding && newDocument.contentType === 'text') {
      try {
        newDocument.metadata.embedding = await this.generateEmbedding(newDocument.content);
      } catch (error) {
        console.warn('Could not generate embedding for document:', error);
      }
    }

    this.documents.set(id, newDocument);
    this.saveToStorage();

    return id;
  }

  // Get a document by ID
  getDocument(id: string): BrainDocument | undefined {
    return this.documents.get(id);
  }

  // Update a document
  updateDocument(id: string, updates: Partial<BrainDocument>): boolean {
    const document = this.documents.get(id);
    if (!document) return false;

    const updatedDocument = { ...document, ...updates };
    this.documents.set(id, updatedDocument);
    this.saveToStorage();

    return true;
  }

  // Delete a document
  deleteDocument(id: string): boolean {
    const result = this.documents.delete(id);

    // Also remove from any collections
    this.collections.forEach(collection => {
      const index = collection.documents.indexOf(id);
      if (index !== -1) {
        collection.documents.splice(index, 1);
      }
    });

    this.saveToStorage();
    return result;
  }

  // Create a collection
  createCollection(collection: Omit<BrainCollection, 'id' | 'dateCreated' | 'lastModified'>): string {
    const id = uuidv4();
    const newCollection: BrainCollection = {
      ...collection,
      id,
      dateCreated: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    this.collections.set(id, newCollection);
    this.saveToStorage();

    return id;
  }

  // Get a collection by ID
  getCollection(id: string): BrainCollection | undefined {
    return this.collections.get(id);
  }

  // Update a collection
  updateCollection(id: string, updates: Partial<BrainCollection>): boolean {
    const collection = this.collections.get(id);
    if (!collection) return false;

    const updatedCollection = {
      ...collection,
      ...updates,
      lastModified: new Date().toISOString()
    };

    this.collections.set(id, updatedCollection);
    this.saveToStorage();

    return true;
  }

  // Delete a collection
  deleteCollection(id: string): boolean {
    const result = this.collections.delete(id);
    this.saveToStorage();
    return result;
  }

  // Add a document to a collection
  addDocumentToCollection(documentId: string, collectionId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;

    if (!collection.documents.includes(documentId)) {
      collection.documents.push(documentId);
      collection.lastModified = new Date().toISOString();
      this.saveToStorage();
    }

    return true;
  }

  // Remove a document from a collection
  removeDocumentFromCollection(documentId: string, collectionId: string): boolean {
    const collection = this.collections.get(collectionId);
    if (!collection) return false;

    const index = collection.documents.indexOf(documentId);
    if (index !== -1) {
      collection.documents.splice(index, 1);
      collection.lastModified = new Date().toISOString();
      this.saveToStorage();
      return true;
    }

    return false;
  }

  // Log user activity
  logActivity(activity: Omit<ActivityLog, 'id' | 'timestamp'>): string {
    const id = uuidv4();
    const newActivity: ActivityLog = {
      ...activity,
      id,
      timestamp: new Date().toISOString()
    };

    this.activityLog.push(newActivity);

    // Also add as a document if it's significant
    if (['workflow_created', 'app_created', 'chat_completed', 'document_uploaded'].includes(activity.action)) {
      this.addDocument({
        title: `Activity: ${activity.action}`,
        content: JSON.stringify(activity.details),
        contentType: 'activity',
        metadata: {
          source: 'system',
          dateAdded: new Date().toISOString(),
          userId: activity.userId,
          activityType: activity.type,
          activityContext: activity.details
        }
      });
    }

    this.saveToStorage();
    return id;
  }

  // Get recent activity for a user
  getRecentActivity(userId: string, limit: number = 50): ActivityLog[] {
    return this.activityLog
      .filter(activity => activity.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }



  // Calculate similarity between two embeddings (cosine similarity)
  private calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    if (!embedding1 || !embedding2 || embedding1.length !== embedding2.length) {
      return 0;
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < embedding1.length; i++) {
      dotProduct += embedding1[i] * embedding2[i];
      magnitude1 += embedding1[i] * embedding1[i];
      magnitude2 += embedding2[i] * embedding2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  // Search documents by semantic similarity
  async semanticSearch(query: BrainQuery): Promise<BrainQueryResult> {
    // Generate embedding for the query
    let queryEmbedding: number[];
    try {
      queryEmbedding = await this.generateEmbedding(query.query);
    } catch (error) {
      console.error('Error generating query embedding:', error);
      return { documents: [], relevanceScores: [] };
    }

    // Filter documents based on query filters
    let filteredDocuments = Array.from(this.documents.values()).filter(doc => {
      // Filter by user ID
      if (doc.metadata.userId !== query.userId) {
        return false;
      }

      // Filter by collections
      if (query.filters?.collections && query.filters.collections.length > 0) {
        let inCollection = false;
        for (const collectionId of query.filters.collections) {
          const collection = this.collections.get(collectionId);
          if (collection && collection.documents.includes(doc.id)) {
            inCollection = true;
            break;
          }
        }
        if (!inCollection) return false;
      }

      // Filter by content types
      if (query.filters?.contentTypes && query.filters.contentTypes.length > 0) {
        if (!query.filters.contentTypes.includes(doc.contentType)) {
          return false;
        }
      }

      // Filter by date range
      if (query.filters?.dateRange) {
        const docDate = new Date(doc.metadata.dateAdded);
        const startDate = new Date(query.filters.dateRange.start);
        const endDate = new Date(query.filters.dateRange.end);

        if (docDate < startDate || docDate > endDate) {
          return false;
        }
      }

      // Filter by tags
      if (query.filters?.tags && query.filters.tags.length > 0) {
        if (!doc.metadata.tags || !query.filters.tags.some(tag => doc.metadata.tags?.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    // Calculate similarity scores
    const documentsWithScores = filteredDocuments.map(doc => {
      const embedding = doc.metadata.embedding;
      let score = 0;

      if (embedding) {
        score = this.calculateSimilarity(queryEmbedding, embedding);
      } else {
        // Fallback to keyword matching for documents without embeddings
        const queryTerms = query.query.toLowerCase().split(/\s+/);
        const docContent = doc.content.toLowerCase();
        const docTitle = doc.title.toLowerCase();

        // Count matching terms in content and title
        let matches = 0;
        for (const term of queryTerms) {
          if (docContent.includes(term)) matches++;
          if (docTitle.includes(term)) matches += 2; // Title matches are weighted higher
        }

        score = matches / (queryTerms.length * 3); // Normalize to 0-1 range
      }

      return { document: doc, score };
    });

    // Sort by relevance score
    documentsWithScores.sort((a, b) => b.score - a.score);

    // Apply limit
    const limit = query.limit || 10;
    const topResults = documentsWithScores.slice(0, limit);

    // Update last accessed timestamp for retrieved documents
    topResults.forEach(({ document }) => {
      document.metadata.lastAccessed = new Date().toISOString();
      this.documents.set(document.id, document);
    });

    this.saveToStorage();

    return {
      documents: topResults.map(r => r.document),
      relevanceScores: topResults.map(r => r.score)
    };
  }

  // Process a file for RAG
  async processFile(file: File, userId: string, collectionId?: string): Promise<string> {
    // Extract text content based on file type
    let content = '';
    let contentType: BrainDocument['contentType'] = 'text';
    let metadata: BrainDocument['metadata'] = {
      source: 'upload',
      dateAdded: new Date().toISOString(),
      userId,
      mimeType: file.type,
      fileSize: file.size,
      originalFileName: file.name
    };

    try {
      if (file.type.startsWith('image/')) {
        // Process image file
        contentType = 'image';
        content = await this.extractImageContent(file);

        // Add image-specific metadata
        try {
          const img = new Image();
          img.src = URL.createObjectURL(file);
          await new Promise(resolve => {
            img.onload = () => {
              metadata.dimensions = {
                width: img.width,
                height: img.height
              };
              URL.revokeObjectURL(img.src);
              resolve(null);
            };
            img.onerror = () => resolve(null);
          });
        } catch (e) {
          console.warn('Could not extract image dimensions:', e);
        }

        // Generate a thumbnail URL
        try {
          metadata.thumbnailUrl = await this.generateThumbnail(file);
        } catch (e) {
          console.warn('Could not generate thumbnail:', e);
        }
      } else if (file.type === 'application/pdf') {
        // Process PDF file
        contentType = 'pdf';
        content = await this.extractPdfContent(file);

        // Try to estimate page count
        const textLength = content.length;
        const estimatedPageCount = Math.max(1, Math.floor(textLength / 3000)); // Rough estimate
        metadata.pageCount = estimatedPageCount;
      } else if (file.type.startsWith('video/')) {
        // Process video file
        contentType = 'video';
        content = await this.extractVideoMetadata(file);

        // Try to get video duration
        try {
          const video = document.createElement('video');
          video.preload = 'metadata';
          video.src = URL.createObjectURL(file);
          await new Promise(resolve => {
            video.onloadedmetadata = () => {
              metadata.duration = video.duration;
              URL.revokeObjectURL(video.src);
              resolve(null);
            };
            video.onerror = () => resolve(null);
          });
        } catch (e) {
          console.warn('Could not extract video duration:', e);
        }
      } else if (file.type.startsWith('audio/')) {
        // Process audio file
        contentType = 'audio';
        content = await this.extractAudioMetadata(file);

        // Try to get audio duration
        try {
          const audio = new Audio();
          audio.preload = 'metadata';
          audio.src = URL.createObjectURL(file);
          await new Promise(resolve => {
            audio.onloadedmetadata = () => {
              metadata.duration = audio.duration;
              URL.revokeObjectURL(audio.src);
              resolve(null);
            };
            audio.onerror = () => resolve(null);
          });
        } catch (e) {
          console.warn('Could not extract audio duration:', e);
        }
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                 file.type === 'application/msword') {
        // Process Word document
        contentType = 'text';
        content = await this.extractDocxContent(file);
      } else if (file.type === 'text/html' || file.type === 'application/xhtml+xml') {
        // Process HTML file
        contentType = 'text';
        content = await this.extractHtmlContent(file);
      } else if (file.type === 'application/json') {
        // Process JSON file
        contentType = 'text';
        content = await this.extractJsonContent(file);
      } else {
        // For text files and other types, read the content directly
        contentType = 'text';
        content = await file.text();
      }

      // Create document
      const documentId = await this.addDocument({
        title: file.name,
        content,
        contentType,
        metadata
      });

      // Add to collection if specified
      if (collectionId) {
        this.addDocumentToCollection(documentId, collectionId);
      }

      // Log activity
      this.logActivity({
        type: 'document',
        action: 'document_uploaded',
        details: {
          documentId,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          contentType
        },
        userId
      });

      return documentId;
    } catch (error) {
      console.error('Error processing file:', error);
      throw new Error(`Failed to process file: ${file.name}`);
    }
  }

  // Extract content from an image file
  private async extractImageContent(file: File): Promise<string> {
    // In a real implementation, you would use OCR or image analysis
    // For now, we'll just return basic metadata
    return `Image file: ${file.name}\n` +
           `Type: ${file.type}\n` +
           `Size: ${(file.size / 1024).toFixed(2)} KB\n` +
           `Last modified: ${new Date(file.lastModified).toLocaleString()}\n\n` +
           `[This is a placeholder for image content. In a production environment, ` +
           `this would contain text extracted from the image using OCR.]`;
  }

  // Extract content from a PDF file
  private async extractPdfContent(file: File): Promise<string> {
    // In a real implementation, you would use a PDF parsing library
    // For now, we'll just return a placeholder
    return `PDF file: ${file.name}\n` +
           `Size: ${(file.size / 1024).toFixed(2)} KB\n` +
           `Last modified: ${new Date(file.lastModified).toLocaleString()}\n\n` +
           `[This is a placeholder for PDF content. In a production environment, ` +
           `this would contain text extracted from the PDF document.]`;
  }

  // Extract metadata from a video file
  private async extractVideoMetadata(file: File): Promise<string> {
    // In a real implementation, you would extract more metadata and possibly transcribe
    return `Video file: ${file.name}\n` +
           `Type: ${file.type}\n` +
           `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
           `Last modified: ${new Date(file.lastModified).toLocaleString()}\n\n` +
           `[This is a placeholder for video content. In a production environment, ` +
           `this would contain metadata and possibly a transcript of the video.]`;
  }

  // Extract metadata from an audio file
  private async extractAudioMetadata(file: File): Promise<string> {
    // In a real implementation, you would transcribe the audio
    return `Audio file: ${file.name}\n` +
           `Type: ${file.type}\n` +
           `Size: ${(file.size / 1024 / 1024).toFixed(2)} MB\n` +
           `Last modified: ${new Date(file.lastModified).toLocaleString()}\n\n` +
           `[This is a placeholder for audio content. In a production environment, ` +
           `this would contain a transcript of the audio file.]`;
  }

  // Extract content from a Word document
  private async extractDocxContent(file: File): Promise<string> {
    // In a real implementation, you would use a DOCX parsing library
    // For now, we'll just return a placeholder
    return `Word document: ${file.name}\n` +
           `Size: ${(file.size / 1024).toFixed(2)} KB\n` +
           `Last modified: ${new Date(file.lastModified).toLocaleString()}\n\n` +
           `[This is a placeholder for Word document content. In a production environment, ` +
           `this would contain text extracted from the document.]`;
  }

  // Extract content from an HTML file
  private async extractHtmlContent(file: File): Promise<string> {
    try {
      const text = await file.text();
      // Simple HTML to text conversion
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = text;

      // Extract text content and remove excessive whitespace
      let content = tempDiv.textContent || tempDiv.innerText || '';
      content = content.replace(/\s+/g, ' ').trim();

      return content;
    } catch (error) {
      console.error('Error extracting HTML content:', error);
      return `HTML file: ${file.name}\n` +
             `[Could not extract content from HTML file.]`;
    }
  }

  // Extract content from a JSON file
  private async extractJsonContent(file: File): Promise<string> {
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      // Convert JSON to a readable format
      return `JSON file: ${file.name}\n\n` +
             JSON.stringify(json, null, 2);
    } catch (error) {
      console.error('Error extracting JSON content:', error);
      return `JSON file: ${file.name}\n` +
             `[Could not parse JSON file.]`;
    }
  }

  // Generate a thumbnail for an image
  private async generateThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
          // Create a canvas element
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set thumbnail dimensions (max 200px)
          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = Math.round(height * (maxSize / width));
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = Math.round(width * (maxSize / height));
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw the image on the canvas
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);

          // Clean up
          URL.revokeObjectURL(img.src);

          resolve(dataUrl);
        };

        img.onerror = () => {
          URL.revokeObjectURL(img.src);
          reject(new Error('Failed to load image for thumbnail generation'));
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  // Process a URL for RAG
  async processUrl(url: string, userId: string, collectionId?: string, title?: string, description?: string): Promise<string> {
    try {
      // In a real implementation, you'd fetch and parse the URL content
      // Here we'll simulate fetching content from the URL
      const content = await this.fetchUrlContent(url, title, description);
      const extractedTitle = title || this.extractTitleFromUrl(url);

      // Create metadata
      const metadata: BrainDocument['metadata'] = {
        source: url,
        dateAdded: new Date().toISOString(),
        userId,
        originalUrl: url
      };

      // Add description to metadata if provided
      if (description) {
        metadata.description = description;
      }

      // Try to extract favicon
      try {
        const domain = new URL(url).hostname;
        metadata.favicon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      } catch (e) {
        console.warn('Could not extract favicon:', e);
      }

      // Create document
      const documentId = await this.addDocument({
        title: extractedTitle,
        content,
        contentType: 'url',
        metadata
      });

      // Add to collection if specified
      if (collectionId) {
        this.addDocumentToCollection(documentId, collectionId);
      }

      // Log activity
      this.logActivity({
        type: 'document',
        action: 'url_added',
        details: {
          documentId,
          url,
          title: extractedTitle
        },
        userId
      });

      return documentId;
    } catch (error) {
      console.error('Error processing URL:', error);
      throw new Error(`Failed to process URL: ${url}`);
    }
  }

  // Extract title from URL
  private extractTitleFromUrl(url: string): string {
    try {
      // Try to extract a meaningful title from the URL
      const urlObj = new URL(url);

      // Remove www. if present
      let hostname = urlObj.hostname.replace(/^www\./, '');

      // Get the last part of the path (if any)
      let pathPart = '';
      if (urlObj.pathname && urlObj.pathname !== '/' && urlObj.pathname !== '') {
        const pathSegments = urlObj.pathname.split('/');
        pathPart = pathSegments[pathSegments.length - 1];

        // Clean up the path part
        pathPart = pathPart
          .replace(/[-_]/g, ' ')
          .replace(/\.(html|htm|php|aspx|jsp)$/, '')
          .trim();

        // Capitalize first letter of each word
        pathPart = pathPart.split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      // Combine hostname and path part
      if (pathPart) {
        return `${hostname} - ${pathPart}`;
      } else {
        return hostname;
      }
    } catch (error) {
      // If URL parsing fails, just return the URL as is
      console.warn('Error extracting title from URL:', error);
      return url;
    }
  }

  // Fetch content from a URL
  private async fetchUrlContent(url: string, title?: string, description?: string): Promise<string> {
    // In a real implementation, you would use a server-side API to fetch and parse the URL
    // For now, we'll simulate fetching content from the URL

    try {
      // Try to extract domain and path for a more realistic simulation
      const urlObj = new URL(url);
      const domain = urlObj.hostname;
      const path = urlObj.pathname;

      // Create a simulated content based on the URL
      let content = `URL: ${url}\n\n`;

      if (title) {
        content += `Title: ${title}\n\n`;
      }

      if (description) {
        content += `Description: ${description}\n\n`;
      }

      content += `Domain: ${domain}\n`;
      content += `Path: ${path}\n\n`;
      content += `Date Added: ${new Date().toLocaleString()}\n\n`;

      // Add simulated content based on the domain
      if (domain.includes('github')) {
        content += `[This appears to be a GitHub repository or page. In a production environment, ` +
                  `this would contain the actual content from the GitHub page, including README, ` +
                  `code snippets, issues, or other relevant information.]`;
      } else if (domain.includes('docs.') || path.includes('/docs/')) {
        content += `[This appears to be a documentation page. In a production environment, ` +
                  `this would contain the actual documentation content, including headings, ` +
                  `paragraphs, code examples, and other relevant information.]`;
      } else if (domain.includes('blog') || path.includes('/blog/')) {
        content += `[This appears to be a blog post. In a production environment, ` +
                  `this would contain the actual blog content, including the article text, ` +
                  `author information, publication date, and other relevant information.]`;
      } else if (domain.includes('youtube') || domain.includes('vimeo')) {
        content += `[This appears to be a video. In a production environment, ` +
                  `this would contain the video transcript, title, description, ` +
                  `and other relevant information.]`;
      } else {
        content += `[This is a placeholder for the content from ${url}. In a production environment, ` +
                  `this would contain the actual content from the webpage, including text, ` +
                  `headings, and other relevant information.]`;
      }

      // Simulate a delay to mimic network request
      await new Promise(resolve => setTimeout(resolve, 500));

      return content;
    } catch (error) {
      console.error('Error fetching URL content:', error);
      return `URL: ${url}\n\n[Could not fetch content from this URL. In a production environment, ` +
             `this would be handled by a server-side API that can fetch and parse web pages.]`;
    }
  }

  // Get all collections for a user
  getUserCollections(userId: string): BrainCollection[] {
    return Array.from(this.collections.values())
      .filter(collection => collection.userId === userId);
  }

  // Get all documents for a user
  getUserDocuments(userId: string): BrainDocument[] {
    return Array.from(this.documents.values())
      .filter(doc => doc.metadata.userId === userId);
  }

  // Get documents in a collection
  getCollectionDocuments(collectionId: string): BrainDocument[] {
    const collection = this.collections.get(collectionId);
    if (!collection) return [];

    return collection.documents
      .map(id => this.documents.get(id))
      .filter((doc): doc is BrainDocument => !!doc);
  }

  // Generate context for AI from the user's knowledge base
  async generateContext(userId: string, query: string, maxResults: number = 5): Promise<string> {
    try {
      // Search for relevant documents
      const searchResults = await this.semanticSearch({
        query,
        userId,
        filters: {
          // No specific filters by default, but could be added
        }
      });

      if (searchResults.documents.length === 0) {
        return "";
      }

      // Format the context
      let context = "### Relevant information from your knowledge base:\n\n";

      // Add the most relevant documents
      const relevantDocs = searchResults.documents.slice(0, maxResults);
      const relevantScores = searchResults.relevanceScores.slice(0, maxResults);

      for (let i = 0; i < relevantDocs.length; i++) {
        const doc = relevantDocs[i];
        const score = relevantScores[i];

        // Only include documents with reasonable relevance
        if (score < 0.5) continue;

        // Format based on content type
        context += `#### ${doc.title} (${doc.contentType})\n`;

        // Add source information if available
        if (doc.metadata.source && doc.metadata.source !== 'upload') {
          context += `Source: ${doc.metadata.source}\n`;
        }

        // Add date information
        context += `Date: ${new Date(doc.metadata.dateAdded).toLocaleDateString()}\n\n`;

        // Add content (truncated if too long)
        const maxContentLength = 1000;
        let content = doc.content;
        if (content.length > maxContentLength) {
          content = content.substring(0, maxContentLength) + "...";
        }
        context += `${content}\n\n`;
      }

      // Add recent activity context if relevant
      const recentActivity = this.getRecentActivity(userId, 3);
      if (recentActivity.length > 0) {
        context += "### Recent activity:\n\n";
        for (const activity of recentActivity) {
          context += `- ${activity.action} (${new Date(activity.timestamp).toLocaleString()})\n`;
        }
        context += "\n";
      }

      // Add instructions for the AI
      context += "When using this information in your response:\n";
      context += "1. Cite the specific document when referencing information\n";
      context += "2. If the information doesn't fully answer the query, acknowledge what you know and what you don't\n";
      context += "3. If the information seems outdated or contradictory, note this to the user\n";

      return context;
    } catch (error) {
      console.error('Error generating context:', error);
      return "";
    }
  }
}

// Create and export singleton instance
const brainService = new BrainService();
export default brainService;

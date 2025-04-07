import { create } from 'zustand';
import { BrainDocument, BrainCollection, BrainQuery, BrainQueryResult, BrainStore } from '../types';
import brainService from '../services/brainService';

// Create the store
const useBrainStore = create<BrainStore>((set, get) => ({
  documents: [],
  collections: [],
  isLoading: false,
  error: null,

  // Fetch all documents for the current user
  fetchDocuments: async () => {
    set({ isLoading: true, error: null });
    try {
      // Initialize brain service if needed
      if (!brainService.isInitialized()) {
        brainService.initialize('mock-api-key');
      }
      
      // In a real app, get the user ID from authentication
      const userId = 'user-123';
      const documents = brainService.getUserDocuments(userId);
      set({ documents, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch documents', isLoading: false });
    }
  },

  // Fetch all collections for the current user
  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    try {
      // Initialize brain service if needed
      if (!brainService.isInitialized()) {
        brainService.initialize('mock-api-key');
      }
      
      // In a real app, get the user ID from authentication
      const userId = 'user-123';
      const collections = brainService.getUserCollections(userId);
      set({ collections, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch collections', isLoading: false });
    }
  },

  // Add a new document
  addDocument: async (document: Omit<BrainDocument, 'id'>) => {
    set({ isLoading: true, error: null });
    try {
      const documentId = await brainService.addDocument(document);
      
      // Refresh documents
      const userId = 'user-123';
      const documents = brainService.getUserDocuments(userId);
      set({ documents, isLoading: false });
      
      return documentId;
    } catch (error) {
      set({ error: 'Failed to add document', isLoading: false });
      return '';
    }
  },

  // Update an existing document
  updateDocument: async (document: BrainDocument) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.updateDocument(document);
      
      // Update the document in the store
      set(state => ({
        documents: state.documents.map(doc => 
          doc.id === document.id ? document : doc
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update document', isLoading: false });
    }
  },

  // Delete a document
  deleteDocument: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.deleteDocument(id);
      
      // Remove the document from the store
      set(state => ({
        documents: state.documents.filter(doc => doc.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete document', isLoading: false });
    }
  },

  // Add a new collection
  addCollection: async (collection: Omit<BrainCollection, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ isLoading: true, error: null });
    try {
      const collectionId = await brainService.addCollection(collection);
      
      // Refresh collections
      const userId = 'user-123';
      const collections = brainService.getUserCollections(userId);
      set({ collections, isLoading: false });
      
      return collectionId;
    } catch (error) {
      set({ error: 'Failed to add collection', isLoading: false });
      return '';
    }
  },

  // Update an existing collection
  updateCollection: async (collection: BrainCollection) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.updateCollection(collection);
      
      // Update the collection in the store
      set(state => ({
        collections: state.collections.map(coll => 
          coll.id === collection.id ? collection : coll
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update collection', isLoading: false });
    }
  },

  // Delete a collection
  deleteCollection: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.deleteCollection(id);
      
      // Remove the collection from the store
      set(state => ({
        collections: state.collections.filter(coll => coll.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete collection', isLoading: false });
    }
  },

  // Search documents
  searchDocuments: async (query: BrainQuery) => {
    set({ isLoading: true, error: null });
    try {
      const results = await brainService.searchDocuments(query);
      set({ isLoading: false });
      return results;
    } catch (error) {
      set({ error: 'Failed to search documents', isLoading: false });
      return [];
    }
  },

  // Add a document to a collection
  addDocumentToCollection: async (documentId: string, collectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.addDocumentToCollection(documentId, collectionId);
      
      // Refresh documents and collections
      const userId = 'user-123';
      const documents = brainService.getUserDocuments(userId);
      const collections = brainService.getUserCollections(userId);
      set({ documents, collections, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add document to collection', isLoading: false });
    }
  },

  // Remove a document from a collection
  removeDocumentFromCollection: async (documentId: string, collectionId: string) => {
    set({ isLoading: true, error: null });
    try {
      await brainService.removeDocumentFromCollection(documentId, collectionId);
      
      // Refresh documents and collections
      const userId = 'user-123';
      const documents = brainService.getUserDocuments(userId);
      const collections = brainService.getUserCollections(userId);
      set({ documents, collections, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to remove document from collection', isLoading: false });
    }
  },
}));

export default useBrainStore;

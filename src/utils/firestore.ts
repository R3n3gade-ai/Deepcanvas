import { getCurrentFirebaseApp } from "./firebaseConfig";
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs, 
  DocumentData,
  CollectionReference,
  DocumentReference,
  updateDoc,
  deleteDoc,
  addDoc,
  WhereFilterOp,
  Firestore
} from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

// Initialize Firestore from the current Firebase app
let firestoreService: FirestoreService;

try {
  // Get current Firebase app
  const currentApp = getCurrentFirebaseApp();
  if (!currentApp) {
    throw new Error("No Firebase app available for Firestore initialization");
  }
  
  // Get Firestore instance
  const db = getFirestore(currentApp);
  console.log('Firestore initialized successfully:', !!db);
  
  /**
   * FirestoreService provides a unified API for interacting with Firestore
   */
  class FirestoreService {
    private db: Firestore;
    
    constructor(firestoreInstance: Firestore) {
      if (!firestoreInstance) {
        console.error('Firestore instance is undefined');
        throw new Error('Invalid Firestore instance provided to FirestoreService');
      }
      this.db = firestoreInstance;
      console.log('FirestoreService initialized with Firestore instance');
    }
  
    /**
     * Get a reference to a Firestore collection
     */
    getCollection<T = DocumentData>(collectionPath: string): CollectionReference<T> {
      if (!this.db) {
        console.error('Firestore DB instance is not initialized');
        throw new Error('Firestore DB instance is not initialized');
      }
      return collection(this.db, collectionPath) as CollectionReference<T>;
    }


    /**
     * Get a reference to a Firestore document
     */
    getDocRef<T = DocumentData>(collectionPath: string, docId: string): DocumentReference<T> {
      return doc(this.getCollection(collectionPath), docId) as DocumentReference<T>;
    }

    /**
     * Create or update a document in Firestore
     */
    async setDocument<T>(collectionPath: string, docId: string, data: T): Promise<void> {
      try {
        await setDoc(this.getDocRef(collectionPath, docId), data as DocumentData);
        console.log(`Document written to ${collectionPath}/${docId}`);
      } catch (error) {
        console.error(`Error writing document to ${collectionPath}/${docId}:`, error);
        throw error;
      }
    }

    /**
     * Add a new document with auto-generated ID
     */
    async addDocument<T>(collectionPath: string, data: T): Promise<string> {
      try {
        // Sanitize the data to ensure all empty strings and undefined values are converted to null for numeric fields
        const sanitizedData = { ...data };
        Object.entries(sanitizedData).forEach(([key, value]) => {
          // Handle numeric fields - empty strings or undefined values should be null
          if (typeof value === 'number' || value === undefined || value === '') {
            if (value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
              (sanitizedData as any)[key] = null;
            }
          }
        });
        
        console.log('Adding document to Firestore with sanitized data:', sanitizedData);
        const docRef = await addDoc(this.getCollection(collectionPath), sanitizedData as DocumentData);
        console.log(`Document added to ${collectionPath} with ID: ${docRef.id}`);
        return docRef.id;
      } catch (error) {
        console.error(`Error adding document to ${collectionPath}:`, error);
        throw error;
      }
    }

    /**
     * Update an existing document
     */
    async updateDocument<T>(collectionPath: string, docId: string, data: Partial<T>): Promise<void> {
      try {
        // Sanitize the data to ensure all empty strings and undefined values are converted to null for numeric fields
        const sanitizedData = { ...data };
        Object.entries(sanitizedData).forEach(([key, value]) => {
          // Handle numeric fields - empty strings or undefined values should be null
          if (typeof value === 'number' || value === undefined || value === '') {
            if (value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
              (sanitizedData as any)[key] = null;
            }
          }
        });
        
        console.log(`Updating document at ${collectionPath}/${docId} with sanitized data:`, sanitizedData);
        await updateDoc(this.getDocRef(collectionPath, docId), sanitizedData as DocumentData);
        console.log(`Document updated at ${collectionPath}/${docId}`);
      } catch (error) {
        console.error(`Error updating document at ${collectionPath}/${docId}:`, error);
        throw error;
      }
    }

    /**
     * Delete a document
     */
    async deleteDocument(collectionPath: string, docId: string): Promise<void> {
      try {
        if (!docId) {
          throw new Error('Function doc() cannot be called with an empty path. Document ID is required for deletion.');
        }
        
        console.log(`Deleting document at ${collectionPath}/${docId}`);
        await deleteDoc(this.getDocRef(collectionPath, docId));
        console.log(`Document deleted successfully at ${collectionPath}/${docId}`);
      } catch (error) {
        console.error(`Error deleting document at ${collectionPath}/${docId}:`, error);
        throw error;
      }
    }

    /**
     * Get a document by ID
     */
    async getDocument<T>(collectionPath: string, docId: string): Promise<T | null> {
      try {
        const docSnap = await getDoc(this.getDocRef<T>(collectionPath, docId));
        
        if (docSnap.exists()) {
          return docSnap.data() as T;
        } else {
          console.log(`No document exists at ${collectionPath}/${docId}`);
          return null;
        }
      } catch (error) {
        console.error(`Error getting document at ${collectionPath}/${docId}:`, error);
        throw error;
      }
    }

    /**
     * Query documents in a collection
     */
    async queryDocuments<T>(
      collectionPath: string, 
      conditions: [string, WhereFilterOp, any][]
    ): Promise<T[]> {
      try {
        const collectionRef = this.getCollection<T>(collectionPath);
        let queryRef = query(collectionRef);
        
        // Add conditions to query
        conditions.forEach(([field, operator, value]) => {
          queryRef = query(queryRef, where(field, operator, value));
        });
        
        const querySnapshot = await getDocs(queryRef);
        const results: T[] = [];
        
        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        
        return results;
      } catch (error) {
        console.error(`Error querying documents in ${collectionPath}:`, error);
        throw error;
      }
    }

    /**
     * Get all documents from a collection
     */
    async getDocs<T>(collectionRef: CollectionReference<T>): Promise<any> {
      try {
        return await getDocs(collectionRef);
      } catch (error) {
        console.error('Error getting documents:', error);
        throw error;
      }
    }

    /**
     * Set up a real-time listener on a collection
     * Returns an unsubscribe function
     */
    onCollectionSnapshot<T>(
      collectionPath: string, 
      onNext: (data: T[]) => void,
      onError?: (error: Error) => void
    ): () => void {
      const collectionRef = this.getCollection(collectionPath);
      
      return onSnapshot(
        collectionRef,
        (querySnapshot) => {
          const data: any[] = [];
          querySnapshot.forEach((doc) => {
            data.push({ id: doc.id, ...doc.data() });
          });
          onNext(data as T[]);
        },
        (error) => {
          console.error(`Error in collection listener at ${collectionPath}:`, error);
          if (onError) onError(error);
        }
      );
    }
    /**
     * Set up a real-time listener on a document
     * Returns an unsubscribe function
     */
    listenToDocument<T>(
      collectionPath: string, 
      docId: string, 
      onNext: (data: T | null) => void,
      onError?: (error: Error) => void
    ): () => void {
      const docRef = this.getDocRef<T>(collectionPath, docId);
      
      return onSnapshot(
        docRef,
        (docSnapshot) => {
          if (docSnapshot.exists()) {
            onNext(docSnapshot.data() as T);
          } else {
            onNext(null);
          }
        },
        (error) => {
          console.error(`Error in document listener at ${collectionPath}/${docId}:`, error);
          if (onError) onError(error);
        }
      );
    }
  }

  // Create and initiate a singleton instance
  firestoreService = new FirestoreService(db);
} catch (error) {
  console.error('Error initializing Firestore:', error);
  throw new Error(`Failed to initialize Firestore: ${error instanceof Error ? error.message : String(error)}`);
}

// Export the singleton instance
export default firestoreService;
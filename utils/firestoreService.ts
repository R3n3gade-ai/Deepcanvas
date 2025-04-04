import { getFirestore, collection, getDocs, getDoc, doc, addDoc, setDoc, updateDoc, deleteDoc, query, where, onSnapshot, QueryConstraint, Query, CollectionReference, DocumentReference, DocumentData, Firestore } from "firebase/firestore";
import { getCurrentFirebaseApp } from "./firebaseConfig";

// Get the Firestore database instance for the current Firebase app
export const getFirestoreDb = (): Firestore => {
  const app = getCurrentFirebaseApp();
  if (!app) {
    throw new Error("Firebase app is not initialized. Cannot access Firestore.");
  }
  return getFirestore(app);
};

// Get a reference to a collection
export const getCollection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
  const db = getFirestoreDb();
  return collection(db, collectionName) as CollectionReference<T>;
};

// Get all documents from a collection
export const getAllDocs = async <T = DocumentData>(collectionRef: CollectionReference<T>) => {
  try {
    return await getDocs(collectionRef);
  } catch (error) {
    console.error("Error getting documents:", error);
    throw error;
  }
};

// Get a query from a collection with constraints
export const getQuery = <T = DocumentData>(collectionRef: CollectionReference<T>, ...queryConstraints: QueryConstraint[]): Query<T> => {
  return query(collectionRef, ...queryConstraints);
};

// Get a reference to a document
export const getDocRef = <T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> => {
  const db = getFirestoreDb();
  return doc(db, collectionName, docId) as DocumentReference<T>;
};

// Get a document by ID
export const getDocument = async <T = DocumentData>(collectionName: string, docId: string) => {
  const docRef = getDocRef<T>(collectionName, docId);
  return await getDoc(docRef);
};

// Add a new document to a collection
export const addDocument = async <T = DocumentData>(collectionRef: CollectionReference<T>, data: Partial<T>) => {
  return await addDoc(collectionRef, data as DocumentData);
};

// Set a document (will create if doesn't exist, or replace if it does)
export const setDocument = async <T = DocumentData>(collectionName: string, docId: string, data: Partial<T>, merge = true) => {
  const docRef = getDocRef<T>(collectionName, docId);
  return await setDoc(docRef, data as DocumentData, { merge });
};

// Update an existing document
export const updateDocument = async <T = DocumentData>(collectionName: string, docId: string, data: Partial<T>) => {
  const docRef = getDocRef<T>(collectionName, docId);
  return await updateDoc(docRef, data as DocumentData);
};

// Delete a document
export const deleteDocument = async <T = DocumentData>(collectionName: string, docId: string) => {
  const docRef = getDocRef<T>(collectionName, docId);
  return await deleteDoc(docRef);
};

// Subscribe to a collection
export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  errorCallback?: (error: Error) => void,
  ...queryConstraints: QueryConstraint[]
) => {
  try {
    const db = getFirestoreDb();
    const collectionRef = collection(db, collectionName);
    const q = queryConstraints.length > 0 ? query(collectionRef, ...queryConstraints) : collectionRef;
    
    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as T[];
      callback(data);
    }, (error) => {
      console.error(`Error in collection listener for ${collectionName}:`, error);
      if (errorCallback) {
        errorCallback(error);
      }
    });
  } catch (error) {
    console.error(`Error setting up subscription for ${collectionName}:`, error);
    if (errorCallback) {
      errorCallback(error as Error);
    }
    // Return a no-op unsubscribe function
    return () => {};
  }
};

// Subscribe to a document
export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void,
  errorCallback?: (error: Error) => void
) => {
  try {
    const db = getFirestoreDb();
    const docRef = doc(db, collectionName, docId);
    
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = { id: snapshot.id, ...snapshot.data() } as T;
        callback(data);
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in document listener for ${collectionName}/${docId}:`, error);
      if (errorCallback) {
        errorCallback(error);
      }
    });
  } catch (error) {
    console.error(`Error setting up document subscription for ${collectionName}/${docId}:`, error);
    if (errorCallback) {
      errorCallback(error as Error);
    }
    // Return a no-op unsubscribe function
    return () => {};
  }
};

// Export as a single object for easy destructuring
const firestoreService = {
  getFirestoreDb,
  getCollection,
  getQuery,
  getDocRef,
  getDocument,
  addDocument,
  setDocument,
  updateDocument,
  deleteDocument,
  subscribeToCollection,
  subscribeToDocument,
  // Named exports for more explicit API
  getAllDocs,
  // Aliases for compatibility with firestore naming conventions
  getDocs: getAllDocs,
  addDoc: addDocument,
  updateDoc: updateDocument,
  deleteDoc: deleteDocument
};

export default firestoreService;
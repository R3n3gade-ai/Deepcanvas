import { create } from 'zustand';
import { User } from 'firebase/auth';
import firestoreService from './firestoreService';
import { logActivity } from './activityTracking';
import { Contact } from './types';

// Collection names in Firestore
export const CONTACTS_COLLECTION = 'contacts';
export const ACTIVITIES_COLLECTION = 'activities';

// Types for the store state
interface ContactsState {
  contacts: Contact[];
  loading: boolean;
  error: Error | null;
  unsubscribe?: () => void;
  fetchContacts: () => Promise<void>;
  getContactById: (id: string) => Contact | undefined;
  createContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>, user?: User) => Promise<Contact>;
  updateContact: (id: string, updatedFields: Partial<Contact>, user?: User) => Promise<void>;
  deleteContact: (id: string, user?: User) => Promise<void>;
  setupRealtimeSync: () => () => void;
}

/**
 * Contacts store using Zustand
 * Manages the state of contacts and provides functions to interact with Firestore
 */
export const useContactsStore = create<ContactsState>((set, get) => ({
  contacts: [],
  loading: false,
  error: null,
  unsubscribe: undefined,

  fetchContacts: async () => {
    set({ loading: true, error: null });
    try {
      // Check if there's data in Firestore
      const contactsCollection = firestoreService.getCollection<Contact>(CONTACTS_COLLECTION);
      const querySnapshot = await firestoreService.getAllDocs(contactsCollection);

      // Map the documents to Contact objects
      const contacts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Contact[];

      set({ contacts, loading: false });
    } catch (error) {
      console.error('Error fetching contacts:', error);
      set({ error: error as Error, loading: false });
    }
  },

  getContactById: (id: string) => {
    return get().contacts.find(contact => contact.id === id);
  },

  createContact: async (contactData, user) => {
    try {
      // Add timestamps
      const now = new Date().toISOString();
      const data = {
        ...contactData,
        created_at: now,
        updated_at: now
      };

      // Add to Firestore
      const id = await firestoreService.addDocument(CONTACTS_COLLECTION, data);

      // Construct the new contact with ID
      const newContact = {
        id,
        ...data
      } as Contact;

      // Update the local state
      const contacts = [...get().contacts, newContact];
      set({ contacts });

      // Log activity if user is provided
      if (user) {
        await logActivity(user, 'create', CONTACTS_COLLECTION, newContact.id, {
          name: newContact.first_name + ' ' + newContact.last_name,
          action: "contact_created"
        });
      }

      return newContact;
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  updateContact: async (id, updates, user) => {
    try {
      // Find the contact
      const contact = get().contacts.find(c => c.id === id);
      if (!contact) throw new Error(`Contact with ID ${id} not found`);

      // Add timestamp
      const data = {
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Update in Firestore
      await firestoreService.updateDocument(CONTACTS_COLLECTION, id, data);

      // Update the local state
      const contacts = get().contacts.map(c =>
        c.id === id ? { ...c, ...data } : c
      );
      set({ contacts });

      // Log activity if user is provided
      if (user) {
        await logActivity(user, 'update', CONTACTS_COLLECTION, id, {
          name: contact.first_name + ' ' + contact.last_name,
          updates: Object.keys(updates).join(', '),
          action: "contact_updated"
        });
      }
    } catch (error) {
      console.error('Error updating contact:', error);
      throw error;
    }
  },

  deleteContact: async (id, user) => {
    try {
      // Find the contact
      const contact = get().contacts.find(c => c.id === id);
      if (!contact) throw new Error(`Contact with ID ${id} not found`);

      // Delete from Firestore
      await firestoreService.deleteDocument(CONTACTS_COLLECTION, id);

      // Update the local state
      const contacts = get().contacts.filter(c => c.id !== id);
      set({ contacts });

      // Log activity if user is provided
      if (user) {
        await logActivity(user, 'delete', CONTACTS_COLLECTION, id, {
          name: contact.first_name + ' ' + contact.last_name,
          action: "contact_deleted"
        });
      }
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  },

  setupRealtimeSync: () => {
    try {
      // Clean up any existing subscription
      if (get().unsubscribe) {
        get().unsubscribe();
      }

      set({ loading: true, error: null });
      
      // Set up real-time listener
      const unsubscribe = firestoreService.subscribeToCollection<Contact>(
        CONTACTS_COLLECTION,
        (contacts) => set({ contacts, loading: false }),
        (error) => set({ error, loading: false })
      );
      
      set({ unsubscribe });
      return unsubscribe;
    } catch (error) {
      console.error('Error in contacts real-time sync:', error);
      set({ error: error as Error, loading: false });
      return () => {};
    }
  }
}));

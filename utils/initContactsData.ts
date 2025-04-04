import { Contact } from './types';
import { CONTACTS_COLLECTION } from './contactsStore';
import firestoreService from './firestoreService';

// Sample contacts data for initialization
const sampleContacts: Omit<Contact, 'id'>[] = [
  {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john.doe@acme.example.com',
    phone: '+1-555-123-4567',
    job_title: 'CTO',
    account_id: '1',
    lead_status: 'Customer',
    lead_source: 'Website',
    address: '123 Tech Lane',
    city: 'Metropolis',
    state: 'NY',
    country: 'USA',
    postal_code: '10001',
    notes: 'Key decision maker for all technology purchases',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane.smith@globex.example.com',
    phone: '+1-555-987-6543',
    job_title: 'VP of Marketing',
    account_id: '2',
    lead_status: 'Customer',
    lead_source: 'Conference',
    address: '456 Marketing Ave',
    city: 'Silicon Valley',
    state: 'CA',
    country: 'USA',
    postal_code: '94025',
    notes: 'Interested in our analytics solution',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    first_name: 'Michael',
    last_name: 'Johnson',
    email: 'michael.johnson@oceanic.example.com',
    phone: '+1-555-456-7890',
    job_title: 'Procurement Manager',
    account_id: '3',
    lead_status: 'Customer',
    lead_source: 'Referral',
    address: '789 Fleet St',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    postal_code: '90045',
    notes: 'Handles all vendor relationships',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    first_name: 'Sarah',
    last_name: 'Williams',
    email: 'sarah.williams@newprospect.example.com',
    phone: '+1-555-789-0123',
    job_title: 'CEO',
    account_id: undefined,
    lead_status: 'Prospect',
    lead_source: 'Website',
    address: '101 Executive Dr',
    city: 'Boston',
    state: 'MA',
    country: 'USA',
    postal_code: '02108',
    notes: 'Expressed interest in enterprise package',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    first_name: 'Robert',
    last_name: 'Brown',
    email: 'robert.brown@potentiallead.example.com',
    phone: '+1-555-321-0987',
    job_title: 'IT Director',
    account_id: undefined,
    lead_status: 'Lead',
    lead_source: 'Outbound',
    address: '222 Tech Park',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    postal_code: '78701',
    notes: 'Cold-called, requested information',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Initialize contacts in Firestore
 * Call this function once to seed the database with sample data
 */
export const initContactsData = async (): Promise<void> => {
  try {
    // Check if contacts collection already has data
    const contactsCollection = firestoreService.getCollection<Contact>(CONTACTS_COLLECTION);
    const querySnapshot = await firestoreService.getDocs(contactsCollection);

    if (!querySnapshot.empty) {
      console.log('Contacts collection already has data. Skipping initialization.');
      return;
    }

    console.log('Initializing contacts collection with sample data...');

    // Add sample contacts to Firestore
    await Promise.all(
      sampleContacts.map(async (contact) => {
        await firestoreService.addDoc(contactsCollection, contact);
      })
    );

    console.log('Contacts collection initialized successfully.');
  } catch (error) {
    console.error('Error initializing contacts data:', error);
    throw error;
  }
};

/**
 * Check if contacts collection exists in Firestore
 */
export const checkContactsData = async (): Promise<boolean> => {
  try {
    const contactsCollection = firestoreService.getCollection<Contact>(CONTACTS_COLLECTION);
    const querySnapshot = await firestoreService.getDocs(contactsCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking contacts data:', error);
    return false;
  }
};

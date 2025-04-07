import firestoreService from './firestoreService';

// Sample accounts data to initialize Firestore collection
const ACCOUNTS_COLLECTION = 'accounts';

// Sample accounts data to initialize Firestore collection
const accountsData = [
  {
    id: '1',
    name: 'Acme Corporation',
    industry: 'Manufacturing',
    website: 'https://acme.example.com',
    employees: 500,
    annual_revenue: 25000000,
    address: '123 Main St',
    city: 'Metropolis',
    state: 'NY',
    country: 'USA',
    postal_code: '10001',
    phone: '+1-555-123-4567',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Globex Industries',
    industry: 'Technology',
    website: 'https://globex.example.com',
    employees: 1200,
    annual_revenue: 75000000,
    address: '456 Tech Blvd',
    city: 'Silicon Valley',
    state: 'CA',
    country: 'USA',
    postal_code: '94025',
    phone: '+1-555-987-6543',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Oceanic Airlines',
    industry: 'Transportation',
    website: 'https://oceanic.example.com',
    employees: 3500,
    annual_revenue: 150000000,
    address: '789 Sky Way',
    city: 'Los Angeles',
    state: 'CA',
    country: 'USA',
    postal_code: '90045',
    phone: '+1-555-456-7890',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Initech',
    industry: 'Software',
    website: 'https://initech.example.com',
    employees: 250,
    annual_revenue: 18000000,
    address: '101 Office Park',
    city: 'Austin',
    state: 'TX',
    country: 'USA',
    postal_code: '73301',
    phone: '+1-555-789-0123',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Stark Industries',
    industry: 'Aerospace',
    website: 'https://stark.example.com',
    employees: 4800,
    annual_revenue: 250000000,
    address: '1 Stark Tower',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postal_code: '10010',
    phone: '+1-555-234-5678',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Check if accounts data exists in Firestore
 * @returns Promise<boolean> - true if data exists, false otherwise
 */
export async function checkAccountsData(): Promise<boolean> {
  try {
    const accountsCollection = firestoreService.getCollection(ACCOUNTS_COLLECTION);
    const querySnapshot = await firestoreService.getAllDocs(accountsCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking accounts data:', error);
    return false;
  }
}

/**
 * Initialize the accounts collection in Firestore if it's empty
 */
export async function initializeAccountsData() {
  console.log('Checking if accounts data exists in Firestore...');
  // Check if accounts already exist
  const exists = await checkAccountsData();
  if (exists) {
    console.log('Accounts data already exists in Firestore');
    return true;
  }
  
  // console.log('No accounts found, initializing with sample data...');
  // // Initialize the accounts with batch operations
  // try {
  //   // Add each account to Firestore
  //   const initializationPromises = accountsData.map(account => {
  //     return firestoreService.setDocument(ACCOUNTS_COLLECTION, account.id, account);
  //   });

  //   await Promise.all(initializationPromises);
  //   console.log('Accounts data successfully initialized in Firestore!');
  //   return true;
  // } catch (error) {
  //   console.error('Error initializing accounts data:', error);
  //   return false;
  // }
}

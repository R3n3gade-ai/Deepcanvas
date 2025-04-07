import firestoreService from './firestoreService';
import { Deal } from './types';

// Collection name for deals in Firestore
const DEALS_COLLECTION = 'deals';

// Sample deals data for initialization
const sampleDeals: Omit<Deal, 'id'>[] = [
  {
    name: 'Annual Software License',
    account_id: '1',
    stage: 'Qualification',
    amount: 25000,
    close_date: '2025-06-30',
    probability: 20,
    description: 'Annual enterprise license renewal',
    status: 'In Progress',
    team_member_id: '1',
    owner_id: 'user1',
    region: 'NAMER',
    lead_source: 'Website',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    name: 'Implementation Services',
    account_id: '2',
    stage: 'Evaluation',
    amount: 45000,
    close_date: '2025-07-15',
    probability: 50,
    description: 'Professional services for new implementation',
    status: 'In Progress',
    team_member_id: '2',
    owner_id: 'user1',
    region: 'EMEA',
    lead_source: 'Referral',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    name: 'Hardware Upgrade',
    account_id: '3',
    stage: 'Proposal',
    amount: 65000,
    close_date: '2025-08-01',
    probability: 70,
    description: 'Server infrastructure upgrade',
    status: 'In Progress',
    team_member_id: '1',
    owner_id: 'user1',
    region: 'APAC',
    lead_source: 'Partner',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    name: 'Cloud Migration',
    account_id: '4',
    stage: 'Closed Won',
    amount: 120000,
    close_date: '2025-05-15',
    probability: 100,
    description: 'Migration of on-prem systems to cloud',
    status: 'In Progress',
    team_member_id: '3',
    owner_id: 'user1',
    region: 'NAMER',
    lead_source: 'Outbound',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    name: 'Security Audit',
    account_id: '5',
    stage: 'Closed Lost',
    amount: 35000,
    close_date: '2025-05-10',
    probability: 0,
    description: 'Comprehensive security assessment',
    status: 'Stalled',
    team_member_id: '2',
    owner_id: 'user1',
    region: 'LATAM',
    lead_source: 'Conference',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Initialize deals in Firestore
 * Call this function once to seed the database with sample data
 */
export const initDealsData = async (): Promise<void> => {
  try {
    // Check if deals collection already has data
    const dealsCollection = firestoreService.getCollection<Deal>(DEALS_COLLECTION);
    const querySnapshot = await firestoreService.getDocs(dealsCollection);

    if (!querySnapshot.empty) {
      console.log('Deals collection already has data. Skipping initialization.');
      return;
    }

    // console.log('Initializing deals collection with sample data...');

    // // Add sample deals to Firestore
    // await Promise.all(
    //   sampleDeals.map(async (deal) => {
    //     await firestoreService.addDocument(DEALS_COLLECTION, deal);
    //   })
    // );

    // console.log('Deals collection initialized successfully.');
  } catch (error) {
    console.error('Error initializing deals data:', error);
    throw error;
  }
};

/**
 * Check if deals collection exists in Firestore
 */
export const checkDealsData = async (): Promise<boolean> => {
  try {
    const dealsCollection = firestoreService.getCollection<Deal>(DEALS_COLLECTION);
    const querySnapshot = await firestoreService.getDocs(dealsCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking deals data:', error);
    return false;
  }
};

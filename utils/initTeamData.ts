import firestoreService from './firestoreService';
import { TeamMember, TeamPerformance } from './types';

// Collection names
const TEAM_MEMBERS_COLLECTION = 'team_members';
const TEAM_PERFORMANCE_COLLECTION = 'team_performance';

// Sample team members data for initialization
const teamMembersData: TeamMember[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john.smith@example.com',
    role: 'Sales Manager',
    position: 'Sales Manager',
    department: 'Sales',
    phone: '(555) 123-4567',
    status: 'Active',
    joined_date: '2021-05-15',
    avatar_url: 'https://randomuser.me/api/portraits/men/1.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    role: 'Account Executive',
    position: 'Senior Account Executive',
    department: 'Sales',
    phone: '(555) 234-5678',
    status: 'Active',
    joined_date: '2022-01-10',
    avatar_url: 'https://randomuser.me/api/portraits/women/2.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'David Lee',
    email: 'david.lee@example.com',
    role: 'Solutions Engineer',
    position: 'Senior Solutions Engineer',
    department: 'Engineering',
    phone: '(555) 345-6789',
    status: 'Active',
    joined_date: '2021-08-22',
    avatar_url: 'https://randomuser.me/api/portraits/men/3.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Maria Garcia',
    email: 'maria.garcia@example.com',
    role: 'Customer Success Manager',
    position: 'Customer Success Manager',
    department: 'Customer Success',
    phone: '(555) 456-7890',
    status: 'Active',
    joined_date: '2022-03-05',
    avatar_url: 'https://randomuser.me/api/portraits/women/4.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james.wilson@example.com',
    role: 'Marketing Specialist',
    position: 'Marketing Specialist',
    department: 'Marketing',
    phone: '(555) 567-8901',
    status: 'Active',
    joined_date: '2022-06-12',
    avatar_url: 'https://randomuser.me/api/portraits/men/5.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Emily Chen',
    email: 'emily.chen@example.com',
    role: 'Product Manager',
    position: 'Senior Product Manager',
    department: 'Product',
    phone: '(555) 678-9012',
    status: 'On Leave',
    joined_date: '2021-02-28',
    avatar_url: 'https://randomuser.me/api/portraits/women/6.jpg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

// Sample team performance data for initialization
const teamPerformanceData: TeamPerformance[] = [
  {
    id: '1',
    team_member_id: '1',
    year: 2023,
    quarter: 1,
    quota: 500000,
    forecast_amount: 480000,
    percent_to_goal: 92
  },
  {
    id: '2',
    team_member_id: '2',
    year: 2023,
    quarter: 1,
    quota: 200000,
    forecast_amount: 210000,
    percent_to_goal: 103
  },
  {
    id: '3',
    team_member_id: '1',
    year: 2023,
    quarter: 2,
    quota: 550000,
    forecast_amount: 525000,
    percent_to_goal: 86
  },
  {
    id: '4',
    team_member_id: '2',
    year: 2023,
    quarter: 2,
    quota: 220000,
    forecast_amount: 245000,
    percent_to_goal: 95
  }
];

/**
 * Check if team members data exists in Firestore
 * @returns Promise<boolean> - true if data exists, false otherwise
 */
export async function checkTeamMembersData(): Promise<boolean> {
  try {
    const teamCollection = firestoreService.getCollection(TEAM_MEMBERS_COLLECTION);
    const querySnapshot = await firestoreService.getAllDocs(teamCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking team members data:', error);
    return false;
  }
}

/**
 * Check if team performance data exists in Firestore
 * @returns Promise<boolean> - true if data exists, false otherwise
 */
export async function checkTeamPerformanceData(): Promise<boolean> {
  try {
    const performanceCollection = firestoreService.getCollection(TEAM_PERFORMANCE_COLLECTION);
    const querySnapshot = await firestoreService.getAllDocs(performanceCollection);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking team performance data:', error);
    return false;
  }
}

/**
 * Initialize the team members collection in Firestore if it's empty
 */
export async function initializeTeamMembersData(): Promise<boolean> {
  console.log('Checking if team members data exists in Firestore...');

  // Check if team members already exist
  const exists = await checkTeamMembersData();
  if (exists) {
    console.log('Team members data already exists in Firestore');
    return true;
  }

  // console.log('No team members found, initializing with sample data...');

  // // Initialize the team members with batch operations
  // try {
  //   // Add each team member to Firestore
  //   const initializationPromises = teamMembersData.map(member => {
  //     return firestoreService.setDocument(TEAM_MEMBERS_COLLECTION, member.id, member);
  //   });

  //   await Promise.all(initializationPromises);
  //   console.log('Team members data successfully initialized in Firestore!');
  //   return true;
  // } catch (error) {
  //   console.error('Error initializing team members data:', error);
  //   return false;
  // }
}

/**
 * Initialize the team performance collection in Firestore if it's empty
 */
export async function initializeTeamPerformanceData(): Promise<boolean> {
  console.log('Checking if team performance data exists in Firestore...');

  // Check if team performance data already exists
  const exists = await checkTeamPerformanceData();
  if (exists) {
    console.log('Team performance data already exists in Firestore');
    return true;
  }

  // console.log('No team performance data found, initializing with sample data...');

  // // Initialize the team performance data with batch operations
  // try {
  //   // Add each performance record to Firestore
  //   const initializationPromises = teamPerformanceData.map(performance => {
  //     return firestoreService.setDocument(TEAM_PERFORMANCE_COLLECTION, performance.id, performance);
  //   });

  //   await Promise.all(initializationPromises);
  //   console.log('Team performance data successfully initialized in Firestore!');
  //   return true;
  // } catch (error) {
  //   console.error('Error initializing team performance data:', error);
  //   return false;
  // }
}

/**
 * Initialize all team-related data in Firestore
 */
export async function initializeTeamData(): Promise<void> {
  await initializeTeamMembersData();
  await initializeTeamPerformanceData();
}

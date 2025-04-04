import { create } from 'zustand';
import { TeamMember, TeamPerformance } from './types';
import firestoreService from './firestoreService';
import { initializeTeamMembersData, initializeTeamPerformanceData, checkTeamMembersData, checkTeamPerformanceData } from './initTeamData';

// Collection names for Firestore
const TEAM_MEMBERS_COLLECTION = 'team_members';
const TEAM_PERFORMANCE_COLLECTION = 'team_performance';

interface TeamState {
  teamMembers: TeamMember[];
  teamPerformance: TeamPerformance[];
  isLoading: boolean;
  error: Error | null;
  fetchTeamMembers: () => Promise<void>;
  fetchTeamPerformance: (year: number, quarter: number) => Promise<void>;
  getTeamMemberById: (id: string) => TeamMember | undefined;
  getTeamMembersByRole: (role: string) => TeamMember[];
  createTeamMember: (member: Omit<TeamMember, 'id'>) => Promise<TeamMember>;
  updateTeamMember: (id: string, data: Partial<TeamMember>) => Promise<void>;
  deleteTeamMember: (id: string) => Promise<void>;
  setupMembersRealtimeSync: () => () => void; // Returns unsubscribe function
  setupPerformanceRealtimeSync: (year: number, quarter: number) => () => void; // Returns unsubscribe function
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teamMembers: [],
  teamPerformance: [],
  isLoading: false,
  error: null,

  fetchTeamMembers: async () => {
    set({ isLoading: true, error: null });
    try {
      // Check if there's data in Firestore
      const teamCollection = firestoreService.getCollection<TeamMember>(TEAM_MEMBERS_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(teamCollection);
      
      if (querySnapshot.empty) {
        // If no data exists, seed with mock data
        console.log('No team members found in Firestore, seeding with mock data');
        await initializeTeamMembersData();
        
        // Fetch the initialized data
        const freshSnapshot = await firestoreService.getDocs(teamCollection);
        const teamMembers = freshSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        
        set({ teamMembers, isLoading: false });
      } else {
        // Map the documents to TeamMember objects
        const teamMembers = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamMember[];
        
        set({ teamMembers, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      set({ error: error as Error, isLoading: false });
    }
  },

  fetchTeamPerformance: async (year, quarter) => {
    set({ isLoading: true, error: null });
    try {
      // Check if there's data in Firestore
      const performanceCollection = firestoreService.getCollection<TeamPerformance>(TEAM_PERFORMANCE_COLLECTION);
      const querySnapshot = await firestoreService.getDocs(performanceCollection);
      
      if (querySnapshot.empty) {
        // If no data exists, seed with mock data
        console.log('No team performance data found in Firestore, seeding with mock data');
        await initializeTeamPerformanceData();
        
        // Fetch the initialized data and filter by year and quarter
        const freshSnapshot = await firestoreService.getDocs(performanceCollection);
        const allPerformance = freshSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamPerformance[];
        
        // Filter by year and quarter
        const filteredPerformance = allPerformance.filter(
          p => p.year === year && p.quarter === quarter
        );
        
        set({ teamPerformance: filteredPerformance, isLoading: false });
      } else {
        // Map the documents to TeamPerformance objects
        const allPerformance = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeamPerformance[];
        
        // Filter by year and quarter
        const filteredPerformance = allPerformance.filter(
          p => p.year === year && p.quarter === quarter
        );
        
        set({ teamPerformance: filteredPerformance, isLoading: false });
      }
    } catch (error) {
      console.error('Error fetching team performance:', error);
      set({ error: error as Error, isLoading: false });
    }
  },

  getTeamMemberById: (id) => {
    return get().teamMembers.find(member => member.id === id);
  },

  getTeamMembersByRole: (role) => {
    return get().teamMembers.filter(member => member.role === role);
  },

  createTeamMember: async (memberData) => {
    set({ isLoading: true, error: null });
    try {
      // Add timestamp fields
      const now = new Date().toISOString();
      const newMemberData = {
        ...memberData,
        created_at: now,
        updated_at: now
      };
      
      // Add document to Firestore with auto-generated ID
      const id = await firestoreService.addDocument(TEAM_MEMBERS_COLLECTION, newMemberData);
      
      // Create the complete team member object with ID
      const newMember = { id, ...newMemberData } as TeamMember;
      
      // Update local state optimistically
      set(state => ({
        teamMembers: [...state.teamMembers, newMember],
        isLoading: false
      }));
      
      return newMember;
    } catch (error) {
      console.error('Error creating team member:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  updateTeamMember: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Add updated timestamp
      const updateData = {
        ...data,
        updated_at: new Date().toISOString()
      };
      
      // Update the document in Firestore
      await firestoreService.updateDocument(TEAM_MEMBERS_COLLECTION, id, updateData);
      
      // Update local state optimistically
      set(state => ({
        teamMembers: state.teamMembers.map(member => 
          member.id === id ? { ...member, ...updateData } : member
        ),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error updating team member:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },

  deleteTeamMember: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Validate the ID before deletion
      if (!id) {
        const error = new Error('Cannot delete team member: ID is empty or undefined');
        console.error(error);
        set({ error, isLoading: false });
        throw error;
      }
      
      console.log(`Attempting to delete team member with ID: ${id}`);
      
      // Delete the document from Firestore
      await firestoreService.deleteDocument(TEAM_MEMBERS_COLLECTION, id);
      
      // Update local state optimistically
      set(state => ({
        teamMembers: state.teamMembers.filter(member => member.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting team member:', error);
      set({ error: error as Error, isLoading: false });
      throw error;
    }
  },
  
  // Setup real-time sync for team members
  setupMembersRealtimeSync: () => {
    // Set up a real-time listener for the team members collection
    const unsubscribe = firestoreService.subscribeToCollection<TeamMember>(
      TEAM_MEMBERS_COLLECTION,
      (teamMembers) => {
        // Update the store with the new data
        set(state => ({
          ...state,
          teamMembers: teamMembers as TeamMember[],
          isLoading: false
        }));
      },
      (error) => {
        console.error('Error in team members collection listener:', error);
        set(state => ({
          ...state,
          error: error as Error,
          isLoading: false
        }));
      }
    );
    
    return unsubscribe;
  },
  
  // Setup real-time sync for team performance filtered by year and quarter
  setupPerformanceRealtimeSync: (year, quarter) => {
    // Set up a real-time listener for the team performance collection
    const unsubscribe = firestoreService.subscribeToCollection<TeamPerformance>(
      TEAM_PERFORMANCE_COLLECTION,
      (allPerformance) => {
        // Filter by year and quarter
        const filteredPerformance = (allPerformance as TeamPerformance[]).filter(
          p => p.year === year && p.quarter === quarter
        );
        
        // Update the store with the filtered data
        set(state => ({
          ...state,
          teamPerformance: filteredPerformance,
          isLoading: false
        }));
      },
      (error) => {
        console.error('Error in team performance collection listener:', error);
        set(state => ({
          ...state,
          error: error as Error,
          isLoading: false
        }));
      }
    );
    
    return unsubscribe;
  }
}));

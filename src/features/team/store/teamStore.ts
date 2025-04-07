import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { TeamMember, TeamStore } from '../types';

// Sample team members for initial data
const sampleTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Sales Manager',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    department: 'Sales',
    phone: '(555) 123-4567',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'Marketing Specialist',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    department: 'Marketing',
    phone: '(555) 987-6543',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    role: 'Account Executive',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    department: 'Sales',
    phone: '(555) 456-7890',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

/**
 * Team Store - Manages team members state
 */
const useTeamStore = create<TeamStore>((set, get) => ({
  teamMembers: [...sampleTeamMembers],
  loading: false,
  error: null,

  fetchTeamMembers: async () => {
    set({ loading: true, error: null });
    try {
      // In a real app, this would fetch from an API or database
      // For now, we'll just use the sample team members
      set({ teamMembers: [...sampleTeamMembers], loading: false });
    } catch (error) {
      console.error('Error fetching team members:', error);
      set({ error: 'Failed to fetch team members', loading: false });
    }
  },

  addTeamMember: async (member) => {
    set({ loading: true, error: null });
    try {
      // Add timestamp
      const memberWithTimestamp = {
        ...member,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Generate ID (in a real app, this would be done by the backend)
      const newMember = {
        id: uuidv4(),
        ...memberWithTimestamp
      };
      
      // Update local state
      set(state => ({
        teamMembers: [...state.teamMembers, newMember],
        loading: false
      }));
      
      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      set({ error: 'Failed to add team member', loading: false });
      throw error;
    }
  },

  updateTeamMember: async (id, data) => {
    set({ loading: true, error: null });
    try {
      // Add updated timestamp
      const updates = {
        ...data,
        updated_at: new Date().toISOString(),
      };
      
      // Update local state
      set(state => ({
        teamMembers: state.teamMembers.map(member => 
          member.id === id ? { ...member, ...updates } : member
        ),
        loading: false
      }));
    } catch (error) {
      console.error('Error updating team member:', error);
      set({ error: 'Failed to update team member', loading: false });
      throw error;
    }
  },

  deleteTeamMember: async (id) => {
    set({ loading: true, error: null });
    try {
      // Update local state
      set(state => ({
        teamMembers: state.teamMembers.filter(member => member.id !== id),
        loading: false
      }));
    } catch (error) {
      console.error('Error deleting team member:', error);
      set({ error: 'Failed to delete team member', loading: false });
      throw error;
    }
  },

  getTeamMemberById: (id) => {
    return get().teamMembers.find(member => member.id === id);
  },
}));

export default useTeamStore;

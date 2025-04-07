import React, { useEffect } from "react";
import { Toaster, toast } from 'sonner';
import { BrainCaptureProvider } from './BrainCaptureProvider';
import { GlobalBrainButton } from '../components/brain';
import { useTeamStore } from "./teamStore";
import { useAccountsStore } from "./accountsStore";
import { useDealsStore } from "./dealsStore";
import { useTasksStore } from "./tasksStore";
import { useActivitiesStore } from "./activitiesStore";
import { useContactsStore } from "./contactsStore";
import { checkDealsData, initDealsData } from "./initFirestoreData";
import { checkAccountsData } from "./initAccountsData";
import { checkTeamMembersData, initializeTeamData } from "./initTeamData";
import { checkTasksData, initializeTasksData } from "./initTasksData";
import { checkContactsData, initContactsData } from "./initContactsData";
import { applyStoredFirebaseConfig } from "./firebaseConfig";

// Create a context for the toast
export const ToastContext = React.createContext({
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => {}
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const { fetchTeamMembers, setupMembersRealtimeSync } = useTeamStore();
  const { fetchAccounts, setupRealtimeSync: setupAccountsSync } = useAccountsStore();
  const { setupRealtimeSync: setupDealsSync } = useDealsStore();
  const { setupRealtimeSync: setupTasksSync } = useTasksStore();
  const { setupRealtimeSync: setupActivitiesSync } = useActivitiesStore();
  const { setupRealtimeSync: setupContactsSync } = useContactsStore();

  // Initialize Firebase configuration on app startup
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await applyStoredFirebaseConfig();
      } catch (error) {
        console.error("Failed to apply stored Firebase config:", error);
        toast.error("Firebase configuration error. Please configure Firebase in Setup.");
      }
    };

    initFirebase();
  }, []);

  // Fetch global data on app initialization
  useEffect(() => {
    try {
      // Load team members and accounts which are needed across the app
      fetchTeamMembers();
      fetchAccounts();

      // Setup real-time syncing for all collections
      const unsubscribeDeals = setupDealsSync();
      const unsubscribeAccounts = setupAccountsSync();
      const unsubscribeTeam = setupMembersRealtimeSync();
      const unsubscribeTasks = setupTasksSync();
      const unsubscribeActivities = setupActivitiesSync();
      const unsubscribeContacts = setupContactsSync();

      // Check if data exists, if not initialize it
      const initData = async () => {
        try {
          // Check deals data
          const hasDealsData = await checkDealsData();
          if (!hasDealsData) {
            console.log("No deals data found, initializing...");
            await initDealsData();
          }

          // Check accounts data - no need to initialize here as it's handled in fetchAccounts
          const hasAccountsData = await checkAccountsData();
          if (!hasAccountsData) {
            console.log("No accounts data detected, it will be initialized during fetch");
          }

          // Check team data - no need to initialize here as it's handled in fetchTeamMembers
          const hasTeamData = await checkTeamMembersData();
          if (!hasTeamData) {
            console.log("No team data detected, initializing team data...");
            await initializeTeamData();
          }

          // Check tasks data
          const hasTasksData = await checkTasksData();
          if (!hasTasksData) {
            console.log("No tasks data detected, initializing tasks data...");
            await initializeTasksData();
          }

          // Check contacts data
          const hasContactsData = await checkContactsData();
          if (!hasContactsData) {
            console.log("No contacts data detected, initializing contacts data...");
            await initContactsData();
          }
        } catch (error) {
          console.error("Error initializing data:", error);
          toast.error("Failed to initialize data. Please try again.");
        }
      };

      initData();

      return () => {
        // Cleanup subscriptions
        unsubscribeDeals();
        unsubscribeAccounts();
        unsubscribeTeam();
        unsubscribeTasks();
        unsubscribeActivities();
        unsubscribeContacts();
      };
    } catch (error) {
      console.error("Error in global data initialization:", error);
      toast.error("Failed to initialize application data. Please refresh and try again.");
      return () => {}; // Return empty cleanup function
    }
  }, [fetchTeamMembers, fetchAccounts, setupDealsSync, setupAccountsSync, setupMembersRealtimeSync, setupTasksSync, setupActivitiesSync, setupContactsSync]);

  // Toast handler function
  const showToast = (message: string, type?: "success" | "error" | "info" | "warning") => {
    switch (type) {
      case "success":
        toast.success(message);
        break;
      case "error":
        toast.error(message);
        break;
      case "warning":
        toast.warning(message);
        break;
      default:
        toast(message);
        break;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      <BrainCaptureProvider position="bottom-right">
        <Toaster position="top-right" richColors />
        {children}
        <GlobalBrainButton position="bottom-right" offset={20} />
      </BrainCaptureProvider>
    </ToastContext.Provider>
  );
}

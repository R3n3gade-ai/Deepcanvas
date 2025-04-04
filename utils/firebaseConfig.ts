import { toast } from "sonner";
import { FirebaseOptions, initializeApp, deleteApp, getApp } from "firebase/app";
import { getAuth, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseApp as authFirebaseApp } from "app";

// Default Firebase Configuration - Replace with your own in production
// This is a placeholder and will need to be updated with real values
export const firebaseConfig: FirebaseOptions = {
  // IMPORTANT: Replace these placeholder values with your actual Firebase project details
  // You can find these values in your Firebase project settings
  apiKey: "AIzaSyAEjyXpJQPCuKWZP9pffOZeqcejXi6F_xU",  // This is a placeholder value - replace with your actual API key
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789jkl"
};

// Get the current Firebase app instance or null if it doesn't exist
export const getCurrentFirebaseApp = () => {
  try {
    // First try to get the default app
    return getApp();
  } catch (error) {
    // If no default app exists, return the auth extension's app
    try {
      return authFirebaseApp;
    } catch (innerError) {
      console.error("Failed to get Firebase app:", innerError);
      return null;
    }
  }
};

// This function is used to update the Firebase configuration at runtime
export const initializeFirebaseConfig = async (config: FirebaseOptions): Promise<void> => {
  try {
    // Store configuration in localStorage
    localStorage.setItem('firebaseConfig', JSON.stringify(config));
    
    // Get current Firebase app instance
    const currentApp = getCurrentFirebaseApp();
    
    // Get current auth instance before we delete the app
    const auth = currentApp ? getAuth(currentApp) : null;
    
    // Sign out current user if logged in
    if (auth && auth.currentUser) {
      await signOut(auth);
    }
    
    // Delete existing app if it exists - but don't delete the auth extension's app
    // as we can't recreate it with the same name
    try {
      if (currentApp && currentApp !== authFirebaseApp) {
        await deleteApp(currentApp);
      }
    } catch (error) {
      console.warn("Could not delete Firebase app, continuing with initialization", error);
    }
    
    // Initialize a new Firebase app with the new config
    const newApp = initializeApp(config);
    
    // Initialize services on the new app
    const newAuth = getAuth(newApp);
    const newFirestore = getFirestore(newApp);
    
    toast.success("Firebase configuration updated successfully! The page will reload to apply all changes.", {
      duration: 3000,
    });
    
    // We still need to reload the page to ensure all Firebase instances are updated properly
    // This is because some Firebase instances might be cached in various components
    setTimeout(() => {
      window.location.reload();
    }, 2000);
    
    return Promise.resolve();
  } catch (error) {
    console.error("Error initializing Firebase with new config:", error);
    toast.error(`Failed to update Firebase configuration: ${error instanceof Error ? error.message : String(error)}`);
    return Promise.reject(error);
  }
};

// Get the stored Firebase config or use default
export const getFirebaseConfig = (): FirebaseOptions => {
  try {
    const storedConfig = localStorage.getItem('firebaseConfig');
    if (storedConfig) {
      return JSON.parse(storedConfig) as FirebaseOptions;
    }
  } catch (error) {
    console.error("Error retrieving stored Firebase config:", error);
  }
  return firebaseConfig;
};

// Get the current active Firebase configuration
export const getCurrentFirebaseConfig = (): FirebaseOptions => {
  const app = getCurrentFirebaseApp();
  if (!app) return firebaseConfig;
  
  return {
    apiKey: app.options.apiKey || "",
    authDomain: app.options.authDomain || "",
    projectId: app.options.projectId || "",
    storageBucket: app.options.storageBucket || "",
    messagingSenderId: app.options.messagingSenderId || "",
    appId: app.options.appId || ""
  };
};

// Check if we're using the default configuration
export const isUsingDefaultConfig = (): boolean => {
  const app = getCurrentFirebaseApp();
  if (!app) return true;
  
  const currentConfig = app.options;
  return (
    currentConfig.apiKey === "AIzaSyAEjyXpJQPCuKWZP9pffOZeqcejXi6F_xU" ||
    !currentConfig.apiKey ||
    currentConfig.projectId === "your-project-id"
  );
};

// Function to apply saved configuration on app startup
export const applyStoredFirebaseConfig = async (): Promise<void> => {
  try {
    // Get stored config
    const storedConfig = localStorage.getItem('firebaseConfig');
    
    // If there's no stored config, we can't reinitialize
    if (!storedConfig) {
      return;
    }
    
    // Parse the stored config
    const config = JSON.parse(storedConfig) as FirebaseOptions;
    
    // Skip if the config is invalid
    if (!config.apiKey || !config.projectId) {
      return;
    }
    
    // Skip if we're already using the same config
    const currentApp = getCurrentFirebaseApp();
    if (currentApp && 
        currentApp.options.apiKey === config.apiKey && 
        currentApp.options.projectId === config.projectId) {
      return;
    }
    
    // Check if the auth extension's app already has valid config
    const authApp = authFirebaseApp;
    if (authApp && 
        authApp.options.apiKey && 
        authApp.options.apiKey !== "AIzaSyAEjyXpJQPCuKWZP9pffOZeqcejXi6F_xU" && 
        authApp.options.projectId && 
        authApp.options.projectId !== "your-project-id") {
      console.log("Auth extension already has valid Firebase config, no need to apply saved config");
      return;
    }
    
    // Apply the saved config
    console.log("Applying stored Firebase configuration...");
    await initializeFirebaseConfig(config);
  } catch (error) {
    console.error("Error applying stored Firebase config:", error);
  }
};

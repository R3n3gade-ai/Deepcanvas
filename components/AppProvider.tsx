import type { ReactNode } from "react";
import { useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { applyStoredFirebaseConfig, isUsingDefaultConfig } from "utils/firebaseConfig";

interface Props {
  children: ReactNode;
}

/**
 * A provider wrapping the whole app.
 *
 * You can add multiple providers here by nesting them,
 * and they will all be applied to the app.
 */
export const AppProvider = ({ children }: Props) => {
  const navigate = useNavigate();
  
  // Initialize Firebase configuration on app startup
  useEffect(() => {
    const initFirebase = async () => {
      try {
        await applyStoredFirebaseConfig();
        
        // Check if we're still using default config after applying stored config
        if (isUsingDefaultConfig()) {
          // Show a toast but don't redirect if we're already on the setup page
          if (!window.location.pathname.includes('/setup')) {
            toast.info("Firebase is not configured. Please set up your Firebase project.", {
              duration: 5000,
              action: {
                label: "Go to Setup",
                onClick: () => navigate("/setup")
              }
            });
          }
        }
      } catch (error) {
        console.error("Failed to apply stored Firebase config:", error);
        toast.error("Firebase configuration error. Please visit the Setup page.", {
          duration: 5000,
          action: {
            label: "Go to Setup",
            onClick: () => navigate("/setup")
          }
        });
      }
    };
    
    initFirebase();
  }, [navigate]);
  
  return <>{children}</>;
};
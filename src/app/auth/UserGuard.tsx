import type { User } from "firebase/auth";
import * as React from "react";
import { createContext, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useCurrentUser } from "./useCurrentUser";

type UserGuardContextType = {
  user: User;
};

const UserGuardContext = createContext<UserGuardContextType | undefined>(
  undefined,
);

/**
 * Hook to access the logged in user from within a <UserGuard> component.
 */
export const useUserGuardContext = () => {
  const context = useContext(UserGuardContext);

  if (context === undefined) {
    throw new Error("useUserGuardContext must be used within a <UserGuard>");
  }

  return context;
};

/**
 * All protected routes are wrapped in a UserGuard component.
 */
export const UserGuard = (props: {
  children: React.ReactNode;
}) => {
  // For local development, we'll use a simpler approach
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { pathname } = useLocation();

  React.useEffect(() => {
    // Check if user is logged in via localStorage
    const userJson = localStorage.getItem('mock_user');
    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        setUser(parsedUser);
      } catch (err) {
        console.error('Error parsing user:', err);
      }
    }
    setLoading(false);
  }, []);

  // If no user is found, create a mock user for local development
  React.useEffect(() => {
    if (!loading && !user) {
      const mockUser = {
        id: 'user-123',
        email: 'demo@example.com',
        name: 'Demo User',
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, [loading, user]);

  if (loading) {
    return <React.Fragment />;
  }

  if (!user) {
    const queryParams = new URLSearchParams(window.location.search);

    // Don't set the next param if the user is logging out
    // to avoid ending up in an infinite redirect loop
    if (pathname !== "/logout" && pathname !== "/sign-out") {
      queryParams.set("next", pathname);
    }

    const queryString = queryParams.toString();

    return <Navigate to={`/login?${queryString}`} replace={true} />;
  }

  return (
    <UserGuardContext.Provider value={{ user }}>
      {props.children}
    </UserGuardContext.Provider>
  );
};

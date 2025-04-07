import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

// Mock user type
export interface User {
  id: string;
  email: string;
  name: string;
  photoURL?: string;
}

// Mock auth service
export const auth = {
  currentUser: null as User | null,
  signOut: async () => {
    localStorage.removeItem('mock_user');
    window.location.href = '/login';
  },
  signIn: async (email: string, password: string) => {
    // For local development, just accept any credentials
    const mockUser: User = {
      id: 'user-123',
      email,
      name: email.split('@')[0],
    };
    localStorage.setItem('mock_user', JSON.stringify(mockUser));
    return mockUser;
  }
};

// Create context
const UserContext = createContext<{
  user: User | null;
  loading: boolean;
  error: Error | null;
}>({
  user: null,
  loading: true,
  error: null,
});

// Provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Check for user in localStorage (for local development)
    const storedUser = localStorage.getItem('mock_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        auth.currentUser = parsedUser;
      } catch (err) {
        console.error('Error parsing stored user:', err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      }
    }
    setLoading(false);
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};

// Hook for using the context
export const useCurrentUser = () => useContext(UserContext);

// Guard component for protected routes
export const UserGuard = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useCurrentUser();

  // For local development, create a mock user if none exists
  useEffect(() => {
    if (!loading && !user) {
      // Create a mock user for local development
      const mockUser: User = {
        id: 'user-123',
        email: 'demo@example.com',
        name: 'Demo User',
      };
      localStorage.setItem('mock_user', JSON.stringify(mockUser));
      window.location.reload();
    }
  }, [user, loading]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default {
  UserProvider,
  useCurrentUser,
  UserGuard,
  auth
};

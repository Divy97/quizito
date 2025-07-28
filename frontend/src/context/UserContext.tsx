'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { fetchWithAuth } from '@/lib/api';

// Define the User type
interface User {
  id: string;
  google_id: string;
  email: string;
  username: string;
  avatar_url: string;
}

// Define the context type
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

// Define the provider component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      const response = await fetchWithAuth(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`);

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        setUser(null);
        localStorage.removeItem('token'); // Clear invalid token
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
      localStorage.removeItem('token'); // Clear invalid token
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch user on initial load, not on every mount
  useEffect(() => {
    if (!hasInitialized) {
      fetchUser();
      setHasInitialized(true);
    }
  }, [fetchUser, hasInitialized]);

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem('token');
      setUser(null);
      setHasInitialized(false); // Reset initialization flag
    } catch (error) {
      console.error('Logout failed', error);
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, isLoading, fetchUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Define the custom hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 
'use client';

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// 1. User Interface
interface User {
  id?: string;
  name?: string;
  email?: string;
  [key: string]: unknown; 
}

// 2. Auth State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  guestId: string | null;
  loading: boolean;
}

// 3. Context Interface
interface AuthContextType extends AuthState {
  login: (userData: User, userToken: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

const generateGuestId = () => {
  return 'guest_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    guestId: null,
    loading: true,
  });

  useEffect(() => {
    // We wrap this logic in a helper function
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      let guestId = localStorage.getItem('guestId');

      if (!guestId) {
        guestId = generateGuestId();
        localStorage.setItem('guestId', guestId);
      }

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          
          setAuthState({
            token: storedToken,
            user: parsedUser,
            guestId,
            loading: false,
          });
        } catch (error) {
          console.error("Failed to parse user data", error);
          // Clean up corrupt data
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          setAuthState({
            token: null,
            user: null,
            guestId,
            loading: false,
          });
        }
      } else {
        setAuthState((prev) => ({ ...prev, guestId, loading: false }));
      }
    };

    // FIX: Execute this check on the next tick to avoid "Synchronous setState" warning
    // This allows the component to finish its initial render first.
    const timeoutId = setTimeout(() => {
      initializeAuth();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const login = (userData: User, userToken: string) => {
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userToken);
    localStorage.removeItem('guestId'); // Guest session is over
    
    setAuthState({
      user: userData,
      token: userToken,
      guestId: null,
      loading: false,
    });
    
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    setAuthState({
      user: null,
      token: null,
      guestId: localStorage.getItem('guestId'), // Restore guestId on logout
      loading: false,
    });
    
    router.push('/login');
  };

  const authContextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    isAuthenticated: !!authState.token,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
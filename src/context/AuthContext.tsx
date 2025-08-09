import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, CurrentUser } from '../types';
import { LocalStorageService } from '../services/localStorage';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const localStorageService = new LocalStorageService();

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = localStorageService.getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await localStorageService.authenticateUser(username, password);
      if (user) {
        const currentUser: CurrentUser = {
          id: user.id,
          username: user.username,
          isLoggedIn: true,
        };
        setCurrentUser(currentUser);
        localStorageService.setCurrentUser(currentUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const user = await localStorageService.createUser(username, password);
      const currentUser: CurrentUser = {
        id: user.id,
        username: user.username,
        isLoggedIn: true,
      };
      setCurrentUser(currentUser);
      localStorageService.setCurrentUser(currentUser);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorageService.setCurrentUser(null);
  };

  const value: AuthContextType = {
    currentUser,
    login,
    register,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
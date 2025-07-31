import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'engineer' | 'technician';
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // TODO: Здесь должна быть логика получения пользователя из API или localStorage
    // Пока используем моковые данные
    const mockUser: User = {
      id: 4,
      name: "Инженер Иванов И.И.",
      role: "engineer"
    };
    
    setUser(mockUser);
    setIsLoading(false);
  }, []);

  const value = {
    user,
    setUser,
    isLoading
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};
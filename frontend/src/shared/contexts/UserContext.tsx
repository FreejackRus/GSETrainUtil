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

    const fetchUser = async () => {
      const token = localStorage.getItem('token'); // Токен сохранён после логина

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/api/v1/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Ошибка авторизации');
        }

        const data = await response.json();
        const userId: number = data.user.id;
        const responseUser = await fetch(`http://localhost:3000/api/v1/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const { name, role } = await responseUser.json();

        const user: User = {
          id: userId,
          name: name,
          role: role,
        };
        return user;
      } catch (error) {
        console.error('Ошибка при получении пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };
    const mockUser: User = {
      id: 4,
      name: 'Инженер Иванов И.И.',
      role: 'engineer',
    };
    fetchUser()
      .then((data) => {
        if (data) {
          setUser(data);
        } else {
          setUser(mockUser); // fallback
        }
      })
      .catch((e) => {
        setUser(mockUser);
      });


    setIsLoading(false);
  }, []);

  const value = {
    user,
    setUser,
    isLoading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

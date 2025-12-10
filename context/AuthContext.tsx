import React, { createContext, useState, useContext, useEffect } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  login: (user: User) => void; // Mantido para compatibilidade, mas o AuthState controla
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ouve alterações na autenticação do Firebase em tempo real
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || 'Usuário',
          email: firebaseUser.email || '',
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Limpa o listener ao desmontar
    return () => unsubscribe();
  }, []);

  // Funções wrapper (O onAuthStateChanged fará a atualização do state 'user' automaticamente)
  const login = (userData: User) => {
    // Ação já realizada pelo dbLogin/dbRegister chamando firebase,
    // o listener acima atualizará o estado.
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Erro ao sair", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
}

interface AuthContextType {
  user: User | null;
  signIn: (email: string) => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Lấy user từ localStorage khi app khởi động
    const stored = localStorage.getItem('demo_user');
    return stored ? JSON.parse(stored) : null;
  });

  const signIn = (email: string) => {
    const userObj = { email };
    setUser(userObj);
    localStorage.setItem('demo_user', JSON.stringify(userObj));
    // Navigation should be handled in the component after signIn
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('demo_user');
    // Navigation should be handled in the component after signOut
  };

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

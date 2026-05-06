import { createContext, useContext, ReactNode, useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface User {
  _id: Id<"users">;
  name: string;
  email: string;
  phone?: string;
  role: "tenant" | "owner";
  _creationTime: number;
}

interface AuthContextType {
  user: User | null | undefined;
  isLoading: boolean;
  userId: Id<"users"> | null;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const [storedUserId, setStoredUserId] = useState<Id<"users"> | null>(() => {
    const saved = localStorage.getItem("rentkaro_userId");
    return saved ? (saved as Id<"users">) : null;
  });

  const user = useQuery(api.users.getMe, storedUserId ? { userId: storedUserId } : "skip");
  const isLoading = user === undefined && storedUserId !== null;

  const login = (userData: User) => {
    localStorage.setItem("rentkaro_userId", userData._id);
    setStoredUserId(userData._id);
  };

  const logout = () => {
    localStorage.removeItem("rentkaro_userId");
    setStoredUserId(null);
    setLocation("/");
  };

  // If the stored userId returns null user, clear it
  useEffect(() => {
    if (storedUserId && user === null) {
      localStorage.removeItem("rentkaro_userId");
      setStoredUserId(null);
    }
  }, [user, storedUserId]);

  return (
    <AuthContext.Provider
      value={{
        user: storedUserId ? user : null,
        isLoading,
        userId: storedUserId,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role?: "tenant" | "owner";
}) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setLocation("/login");
      } else if (role && user.role !== role) {
        setLocation("/");
      }
    }
  }, [user, isLoading, role, setLocation]);

  if (isLoading || !user || (role && user.role !== role)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export type { User };

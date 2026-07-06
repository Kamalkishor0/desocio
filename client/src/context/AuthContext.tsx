"use client";

import { createContext, useContext } from "react";
import type { AuthUser } from "@/types/auth";

type AuthContextType = {
  user: AuthUser | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
});

export function AuthProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: AuthUser | null;
}) {
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
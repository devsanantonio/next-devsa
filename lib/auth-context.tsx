"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextValue {
  role: string | null;
}

const AuthContext = createContext<AuthContextValue>({ role: null });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storedRole = window.localStorage.getItem("devsa-role");
    setRole(storedRole || null);
  }, []);

  return <AuthContext.Provider value={{ role }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

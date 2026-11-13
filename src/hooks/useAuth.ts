import { createContext, useContext } from "react";
import type { DemoAccount, User } from "@/types";

export interface AuthResult {
  ok: boolean;
  error?: string;
  needsEmailConfirmation?: boolean;
  role?: User["role"];
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isPatient: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
  }) => Promise<AuthResult>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: "pasien@apotekerkita.com",
    password: "pasien123",
    role: "patient",
    fullName: "Budi Santoso",
  },
  {
    email: "admin@apotekerkita.com",
    password: "admin123",
    role: "admin",
    fullName: "Dewi Administrasi",
  },
];

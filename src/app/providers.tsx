import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getProfile } from "@/services/profiles.service";
import { AuthContext, type AuthResult } from "@/hooks/useAuth";
import type { Profile, User } from "@/types";

function translateAuthError(message: string): string {
  const normalized = message.toLowerCase();
  if (normalized.includes("invalid login credentials")) {
    return "Email atau kata sandi salah";
  }
  if (normalized.includes("email not confirmed")) {
    return "Email belum dikonfirmasi. Periksa kotak masuk Anda.";
  }
  if (normalized.includes("user already registered")) {
    return "Email sudah terdaftar";
  }
  if (normalized.includes("password should be at least")) {
    return "Kata sandi minimal 6 karakter";
  }
  return message;
}

function mapUser(authUser: SupabaseUser, profile: Profile | null): User {
  const metadataName = authUser.user_metadata?.full_name;
  return {
    id: authUser.id,
    fullName:
      profile?.fullName ||
      (typeof metadataName === "string" ? metadataName : "") ||
      authUser.email?.split("@")[0] ||
      "Pengguna",
    email: profile?.email || authUser.email || "",
    phone: profile?.phone,
    dateOfBirth: profile?.dateOfBirth,
    gender: profile?.gender ?? "",
    role: profile?.role ?? "patient",
    profilePicture: profile?.profilePicture,
    createdAt: profile?.createdAt || authUser.created_at,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async (authUser: SupabaseUser | null): Promise<User | null> => {
    if (!authUser) {
      setUser(null);
      return null;
    }
    let profile: Profile | null = null;
    try {
      profile = await getProfile(authUser.id);
    } catch {
      profile = null;
    }
    const mapped = mapUser(authUser, profile);
    setUser(mapped);
    return mapped;
  }, []);

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      await loadUser(data.session?.user ?? null);
      if (active) setLoading(false);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const authUser = session?.user ?? null;
      window.setTimeout(() => {
        if (active) void loadUser(authUser);
      }, 0);
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: translateAuthError(error.message) };
      const loggedUser = await loadUser(data.user);
      return { ok: true, role: loggedUser?.role ?? "patient" };
    },
    [loadUser]
  );

  const register = useCallback(
    async (input: { fullName: string; email: string; password: string }): Promise<AuthResult> => {
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: { data: { full_name: input.fullName } },
      });
      if (error) return { ok: false, error: translateAuthError(error.message) };
      if (data.session) {
        await loadUser(data.user);
        return { ok: true };
      }
      return { ok: true, needsEmailConfirmation: true };
    },
    [loadUser]
  );

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      isPatient: user?.role === "patient",
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

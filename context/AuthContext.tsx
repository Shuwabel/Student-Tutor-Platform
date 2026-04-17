"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// App-level user type
export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: "student" | "tutor" | "both" | "admin";
  avatar_url?: string;
  bio?: string;
  is_demo?: boolean;
}

type AuthContextType = {
  user: AppUser | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "both";
  }) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithFacebook: () => Promise<void>;
  loginAsDemo: (role: "student" | "tutor" | "both") => Promise<void>;
  logout: () => Promise<void>;
  updateUserData: (updates: Partial<AppUser>) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_ACCOUNTS: Record<string, { email: string; password: string }> = {
  student: { email: "demo-student@studenttutorplatform.app", password: "demo123456" },
  tutor: { email: "demo-tutor@studenttutorplatform.app", password: "demo123456" },
  both: { email: "demo-both@studenttutorplatform.app", password: "demo123456" },
};

function getDashboardRoute(role: string): string {
  switch (role) {
    case "tutor":
      return "/tutor-dashboard";
    case "admin":
      return "/admin-dashboard";
    default:
      return "/dashboard";
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Fetch profile from the profiles table
  async function fetchProfile(authUser: SupabaseUser): Promise<AppUser | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (error || !data) {
      console.error("Failed to fetch profile:", error);
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      avatar_url: data.avatar_url,
      bio: data.bio,
      is_demo: data.is_demo,
    };
  }

  // Initialize: check for existing session
  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setSupabaseUser(authUser);
          const profile = await fetchProfile(authUser);
          if (profile) setUser(profile);
        }
      } catch (err) {
        console.error("Auth init error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    init();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setSupabaseUser(session.user);
        const profile = await fetchProfile(session.user);
        if (profile) setUser(profile);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSupabaseUser(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Email/password login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      setSupabaseUser(data.user);
      const profile = await fetchProfile(data.user);
      if (profile) {
        setUser(profile);
        router.push(getDashboardRoute(profile.role));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Register
  const register = async (formData: {
    name: string;
    email: string;
    password: string;
    role: "student" | "tutor" | "both";
  }) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.name,
            role: formData.role,
          },
        },
      });

      if (error) throw error;

      // If email confirmation is required, redirect to login
      if (data.user && !data.session) {
        router.push("/login?registered=true");
      }
      // If auto-confirmed (e.g. in dev), go straight to dashboard
      else if (data.user && data.session) {
        setSupabaseUser(data.user);
        const profile = await fetchProfile(data.user);
        if (profile) {
          setUser(profile);
          router.push(getDashboardRoute(profile.role));
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Google OAuth
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  // Facebook OAuth
  const loginWithFacebook = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  // Demo login
  const loginAsDemo = async (role: "student" | "tutor" | "both") => {
    const creds = DEMO_ACCOUNTS[role];
    if (!creds) throw new Error("Invalid demo role");
    await login(creds.email, creds.password);
  };

  // Logout
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    router.push("/");
  };

  // Update profile
  const updateUserData = async (updates: Partial<AppUser>) => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        bio: updates.bio,
      })
      .eq("id", user.id);

    if (error) throw error;

    setUser((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        supabaseUser,
        isLoading,
        login,
        register,
        loginWithGoogle,
        loginWithFacebook,
        loginAsDemo,
        logout,
        updateUserData,
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



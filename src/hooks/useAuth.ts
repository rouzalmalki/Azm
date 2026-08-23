/**
 * useAuth — Phone OTP authentication via Supabase
 */
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export interface AuthUser {
  id: string;
  phone: string;
}

export interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  otpSent: boolean;
  setOtpSent: (v: boolean) => void;
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    phone: user.phone ?? "",
  };
}

// Normalize phone to E.164 format for Saudi numbers
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  // 05xxxxxxxx → +9665xxxxxxxx
  if (digits.startsWith("05") && digits.length === 10) {
    return "+966" + digits.slice(1);
  }
  // 5xxxxxxxx → +9665xxxxxxxx
  if (digits.startsWith("5") && digits.length === 9) {
    return "+966" + digits;
  }
  // 9665xxxxxxxx → +9665xxxxxxxx
  if (digits.startsWith("966") && digits.length === 12) {
    return "+" + digits;
  }
  // Already +966...
  if (raw.startsWith("+")) return raw;
  return "+" + digits;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted && session?.user) setUser(mapUser(session.user));
      if (mounted) setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_IN" && session?.user) {
          setUser(mapUser(session.user));
          setLoading(false);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setLoading(false);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          setUser(mapUser(session.user));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    const normalized = normalizePhone(phone);
    const { error } = await supabase.auth.signInWithOtp({ phone: normalized });
    if (error) throw error;
    setOtpSent(true);
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const normalized = normalizePhone(phone);
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalized,
      token,
      type: "sms",
    });
    if (error) throw error;
    if (data.user) setUser(mapUser(data.user));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setOtpSent(false);
  }, []);

  return { user, loading, sendOtp, verifyOtp, logout, otpSent, setOtpSent };
}

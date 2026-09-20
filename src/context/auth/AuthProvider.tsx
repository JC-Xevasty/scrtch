import { useEffect, useRef, useState, type ReactNode } from "react";

import { useToast } from "../toast/ToastContext";
import { AuthContext, type UserProfile } from "./AuthContext";

import { getSession, getUserProfile } from "../../services/auth";

import type { User } from "@supabase/supabase-js";

import { supabase } from "../../utils/supabase";

const AuthProvider = ({ children }: { children: ReactNode }) => {
    const { showToast } = useToast();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);

    const [authLoading, setAuthLoading] = useState(true);

    // To prevent updating session when verifying tokens
    const isVerifying = useRef(false);
    const setIsVerifying = (val: boolean) => (isVerifying.current = val);

    useEffect(() => {
        // Check active session on load
        const fetchSession = async () => {
            try {
                if (isVerifying.current) return;

                const { session } = await getSession();

                if (session?.user) {
                    setUser(session.user);
                    const userProfile = await getUserProfile(session.user.id);
                    setProfile(userProfile);
                }

                setAuthLoading(false);
            } catch (error: any) {
                showToast(error?.message, "error");
                setAuthLoading(false);
            }
        };

        fetchSession();

        // Listen to auth changes
        const authSubscription = supabase.auth.onAuthStateChange(async (event, session) => {
            if (isVerifying.current) return;

            if (event === "SIGNED_OUT") {
                setUser(null);
                setProfile(null);
            } else if (event === "TOKEN_REFRESHED") {
                setUser(session?.user ?? null);
            }
        });

        return () => authSubscription.data.subscription.unsubscribe();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                profile,
                authLoading,
                setUser,
                setProfile,
                setIsVerifying,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;

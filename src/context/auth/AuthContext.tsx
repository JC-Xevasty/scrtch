import { createContext, useContext } from "react";

import type { User } from "@supabase/supabase-js";

import type { ThemeMode } from "../theme/ThemeContext";

interface UserProfile {
    theme: ThemeMode;
    home: "home" | "groups" | "notes" | "lists" | "logs" | "links";
    post_save_action: "view" | "stay";
}

interface AuthContextType {
    user: User | null;
    profile: UserProfile | null;
    authLoading: boolean;
    setUser: (user: User | null) => void;
    setProfile: (profile: UserProfile | null) => void;
    setIsVerifying: (value: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within a AuthProvider");
    }
    return context;
};

export { AuthContext, useAuth };
export type { UserProfile, AuthContextType };

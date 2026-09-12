import { supabase } from "../utils/supabase";
import type { UserProfile } from "../context/auth/AuthContext";

/* Sign in with email and password */
export const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        if (error.code === "invalid_credentials") {
            throw { status: "error", message: "Incorrect email and/or password" }
        } else if (error.code === "email_not_confirmed") {
            throw { status: "warning", message: "Please verify email address." }
        } else {
            throw { status: "error", message: error.message }
        }
    }

    const profile = await getUserProfile(data.user.id);

    return { user: data.user, profile };
}

/* Get current session */
export const getSession = async () => {
    const { data, error } = await supabase.auth.getSession();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data;
}


/* Sign out and clear session */
export const signOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
        throw { status: "error", message: error.message }
    }
}

/* For forgot password */
export const requestPasswordResetEmail = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/reset-password"
    })

    if (error) {
        if (error.code === "over_email_send_rate_limit") {
            throw { status: "error", message: "Something went wrong. Please try again later" }
        } else {
            throw { status: "error", message: error.message }
        }
    }

    await supabase.auth.signOut();

    return data;
}


/* For reset password */
export const resetPassword = async (newPassword: string) => {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data;
}

export const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {},
            emailRedirectTo: window.location.origin + "/login"
        }
    })

    if (error) {
        if (error.code === "anonymous_provider_disabled") {
            throw { status: "error", message: "Provide required informaton" }
        } else if (error.code === "over_email_send_rate_limit") {
            throw { status: "error", message: "Something went wrong. Please try again later" }
        } else {
            throw { status: "error", message: error.message }
        }
    }

    return data;
}

/* Verify token for email verification, reset password. email change */
export const verifyTokenHash = async (token_hash: string, type: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash, type })

    if (error) {
        if (error.code === "otp_expired") {
            throw { status: "error", message: "Link is invalid or expired." };
        } else {
            throw { status: "error", message: error.message };
        }
    }

    return data;
}


/*
 * ACCOUNT SETTINGS
 */

export const updateEmail = async (new_email: string) => {
    const { data, error } = await supabase.auth.updateUser({ email: new_email });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data;
}


export const updatePassword = async (current_password: string, new_password: string) => {
    /* 
     * Supabase dashboard: Authentication > Sign In Providers > Email
     * Enable 'Secure password change' and 'Require current password when updating' options
     */
    const { data, error } = await supabase.auth.updateUser({
        current_password,
        password: new_password
    });

    if (error) {
        if (error.code === "current_password_required") {
            throw { status: "error", message: "Current password required when updating password" }
        } else if (error.code === "current_password_invalid") {
            throw { status: "error", message: "Incorrect current password" }
        }
        throw { status: "error", message: error.message }
    }

    return data;

}

export const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
        .from("profiles")
        .select('theme, home, post_save_action')
        .eq("id", userId)
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data;
}

export const updateUserProfile = async (userId: string, update: Partial<UserProfile>) => {
    const { data, error } = await supabase
        .from("profiles")
        .update(update)
        .eq("id", userId)
        .select("theme, home, post_save_action")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data;
}

export const deleteUserContent = async () => {
    const { error } = await supabase.rpc("handle_delete_user_content_rpc");

    if (error) {
        throw { status: "error", message: error.message }
    }
}

export const deleteAccount = async () => {
    const { error } = await supabase.rpc("delete_user_account_rpc");

    if (error) {
        throw { status: "error", message: error.message }
    }

    return true;
}
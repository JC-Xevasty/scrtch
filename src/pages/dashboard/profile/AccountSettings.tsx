import { useState } from "react";
import { useNavigate } from "react-router-dom";

import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import TextButton from "../../../components/TextButton";
import Dropdown from "../../../components/Dropdown";
import Modal from "../../../components/Modal";

import { type User } from "@supabase/supabase-js";

import useHead from "../../../hooks/useHead";
import { useToast } from "../../../context/toast/ToastContext";
import { useAuth, type UserProfile } from "../../../context/auth/AuthContext";
import { useTheme, type ThemeMode } from "../../../context/theme/ThemeContext";
import { useAccountMutation } from "../../../hooks/useAccount";
import { useQueryClient } from "@tanstack/react-query";

import { deleteAccount, signOut, updateEmail, updatePassword, updateUserProfile } from "../../../services/auth";

const THEMEOPTIONS = [
    { id: "light", value: "light", text: "Light" },
    { id: "dark", value: "dark", text: "Dark" },
    { id: "system", value: "system", text: "System" },
];

const HOMEOPTIONS = [
    { id: "home", value: "home", text: "Home" },
    { id: "groups", value: "groups", text: "Groups" },
    { id: "notes", value: "notes", text: "Notes" },
    { id: "lists", value: "lists", text: "Lists" },
    { id: "logs", value: "logs", text: "Logs" },
    { id: "links", value: "links", text: "Links" },
];

const POSTSAVEOPTIONS = [
    { id: "view", value: "view", text: "Return to Viewer" },
    { id: "stay", value: "stay", text: "Stay on Editor" },
];

const DANGERMODE = {
    USERCONTENT: "content",
    ACCOUNT: "account",
} as const;

type DangerModeType = (typeof DANGERMODE)[keyof typeof DANGERMODE];

const DANGERMODAL = {
    content: {
        title: "Delete All Content",
        text: "Delete All Content",
        textLoading: "Deleting All Content...",
    },
    account: {
        title: "Delete Account",
        text: "Delete Account",
        textLoading: "Deleting Acount...",
    },
};

const AccountSettings = () => {
    useHead({ title: "Account Settings" });
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setTheme } = useTheme();
    const { user, profile, setProfile } = useAuth();
    const queryClient = useQueryClient();
    const { deleteUserContent, isDeletingUserContent } = useAccountMutation();
    const [isDeletingAccount, setIsDeletingAccount] = useState<boolean>(false);

    // Display the last email change pending to update
    const [updateEmailLoading, setUpdateEmailLoading] = useState(false);
    const [newEmail, setNewEmail] = useState<Pick<User, "new_email" | "email_change_sent_at">>({
        new_email: user?.new_email,
        email_change_sent_at: user?.email_change_sent_at,
    });

    const [newEmailField, setNewEmailField] = useState("");

    const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
    const [passwordFormData, setPasswordFormData] = useState({
        current_password: "",
        new_password: "",
        password_confirmation: "",
    });

    const [updatePreferencesLoading, setUpdatePreferencesLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        home: HOMEOPTIONS.find((option) => option.value === profile?.home) ?? {
            id: "home",
            value: "home",
            text: "Home",
        },
        theme: THEMEOPTIONS.find((option) => option.value === profile?.theme) ?? {
            id: "system",
            value: "system",
            text: "System",
        },
        post_save_action: POSTSAVEOPTIONS.find((option) => option.value === profile?.post_save_action) ?? {
            id: "view",
            value: "view",
            text: "Return to Viewer",
        },
    });

    const [deleteModalMode, setDeleteModalMode] = useState<DangerModeType | undefined>(undefined);
    const [confirmDeleteField, setConfirmDeleteField] = useState("");

    const handleUpdateEmail = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdateEmailLoading(true);
        try {
            const response = await updateEmail(newEmailField);
            if (response.user.new_email) {
                const { new_email, email_change_sent_at } = response.user;
                setNewEmail({ new_email, email_change_sent_at });
            }

            setUpdateEmailLoading(false);
            setNewEmailField("");
            showToast("Confirmation links set to both the old and new email address.", "success");
        } catch (error: any) {
            setUpdateEmailLoading(false);
            showToast(error.message, error.status);
        }
    };

    const handleChangePasswordField = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleUpdatePassword = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdatePasswordLoading(true);

        try {
            const { current_password, new_password, password_confirmation } = passwordFormData;

            if (new_password !== password_confirmation) {
                throw { message: "Passwords do not match", status: "error" };
            }

            await updatePassword(current_password, new_password);

            setUpdatePasswordLoading(false);
            setPasswordFormData({ current_password: "", new_password: "", password_confirmation: "" });
            showToast("Password updated successfully.", "success");
        } catch (error: any) {
            setUpdatePasswordLoading(false);
            showToast(error.message, error.status);
        }
    };

    const handleUpdatePreferences = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!user) return;
        setUpdatePreferencesLoading(true);

        try {
            const response = await updateUserProfile(user.id, {
                home: preferences.home.value as UserProfile["home"],
                theme: preferences.theme.value as UserProfile["theme"],
                post_save_action: preferences.post_save_action.value as UserProfile["post_save_action"],
            });

            setUpdatePreferencesLoading(false);
            setProfile(response);
            setTheme(preferences.theme.value as ThemeMode);
            showToast("Account preferences updated successfully.", "success");
        } catch (error: any) {
            setUpdatePreferencesLoading(false);
            showToast(error.message, error.status);
        }
    };

    const handleDeleteContent = async () => {
        if (!user) return;

        try {
            await deleteUserContent();

            showToast("All user content has been permanently deleted.", "success");
            setConfirmDeleteField("");
        } catch (error: any) {
            showToast(error.message, error.status);
            throw error;
        }
    };

    const handleDeleteAccount = async () => {
        if (!user) return;

        setIsDeletingAccount(true);

        try {
            // Delete account from database
            await deleteAccount();
        } catch (error: any) {
            // EDGE CASE RESCUE: If the account was deleted successfully,
            // the server might throw a 401 or drop the network connection.
            // If the error message indicates an auth failure, treat it as a success!
            const isAuthDrop = error.message?.includes("JW") || error.status === 401;

            if (!isAuthDrop) {
                showToast(error.message || "Failed to delete account", "error");
                setIsDeletingAccount(false);
                throw error;
            }
        }

        try {
            // Clear local storage, cookies, and Supabase client memory state
            await signOut();
        } catch {
            // If signOut fails because the session is already dead, wipe storage manually
            localStorage.clear();
            sessionStorage.clear();
        }

        queryClient.clear();

        setIsDeletingAccount(false);
        showToast("Your account has been permanently deleted.", "success");
        setDeleteModalMode(undefined);
        navigate("/login", { replace: true });
    };

    const loading = updateEmailLoading || updatePasswordLoading || updatePreferencesLoading;

    return (
        <div>
            <div className="flex flex-row justify-between items-center py-8 -mt-4 sticky -top-4 bg-background-0 border-b-2 border-background-3 z-1">
                <h1 className="font-medium">
                    <span className="text-4xl align-middle mr-4 uppercase">Account Settings</span>
                </h1>
            </div>
            <br />

            {/*
             * ================================
             * PROFILE
             * ================================
             */}

            <h2 className="font-medium text-2xl my-4">Profile</h2>
            <div className="border border-foreground-muted/50 p-4 rounded mb-8">
                <div className="flex gap-4 mb-8">
                    <div className="flex-1">
                        <p className="font-medium text-sm">Email Address</p>
                        <p className="text-sm text-foreground-secondary">
                            A confirmation link will be sent to the new email address to complete the update.
                        </p>
                        {newEmail.new_email !== undefined && (
                            <>
                                <p className="font-medium text-sm mt-4">
                                    Confirmation link is already sent to: <br />
                                    <span className="text-accent/80">{newEmail.new_email}</span> at{" "}
                                    {new Intl.DateTimeFormat("en-us", { dateStyle: "full" }).format(
                                        new Date(newEmail.email_change_sent_at ?? ""),
                                    )}
                                </p>
                            </>
                        )}
                    </div>
                    <form onSubmit={handleUpdateEmail} className="flex-1 flex flex-col items-stretch">
                        <FieldLabel htmlFor="new_email" className="mb-4">
                            New Email Address
                        </FieldLabel>
                        <TextInput
                            type="email"
                            id="new_email"
                            name="new_email"
                            autoComplete="off"
                            className="w-full"
                            value={newEmailField}
                            onChange={(e) => setNewEmailField(e.target.value)}
                            disabled={loading}
                        />
                        <TextButton
                            type="submit"
                            className="ml-auto mt-4"
                            disabled={newEmailField.trim().length === 0 || loading}
                        >
                            Update Email
                        </TextButton>
                    </form>
                </div>
                {/* PASSWORD */}
                <div className="flex gap-4">
                    <div className="flex-1 text-sm">
                        <p className="font-medium">Password</p>
                        <p className="text-foreground-secondary">Password Requirements</p>
                        <ul className="list-disc pl-8 text-foreground-secondary">
                            <li>Must be at least 6 characters.</li>
                            <li>Must contain at least one digit.</li>
                            <li>Must contain at least one lowerrcase letter.</li>
                            <li>Must contain at least one uppercase letter.</li>
                        </ul>
                    </div>
                    <form onSubmit={handleUpdatePassword} className="flex-1 flex flex-col items-stretch">
                        <FieldLabel htmlFor="current_password" className="mb-4">
                            Current Password
                        </FieldLabel>
                        <TextInput
                            type="password"
                            id="current_password"
                            name="current_password"
                            placeholder="•••••••••"
                            autoComplete="off"
                            className="w-full"
                            value={passwordFormData.current_password}
                            onChange={handleChangePasswordField}
                            disabled={loading}
                        />
                        <FieldLabel htmlFor="new_password" className="my-4">
                            New Password
                        </FieldLabel>
                        <TextInput
                            type="password"
                            id="new_password"
                            name="new_password"
                            placeholder="•••••••••"
                            autoComplete="off"
                            className="w-full"
                            value={passwordFormData.new_password}
                            onChange={handleChangePasswordField}
                            disabled={loading}
                        />
                        <FieldLabel htmlFor="password_confirmation" className="my-4">
                            Confirm New Password
                        </FieldLabel>
                        <TextInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            placeholder="•••••••••"
                            autoComplete="off"
                            className="w-full"
                            value={passwordFormData.password_confirmation}
                            onChange={handleChangePasswordField}
                            disabled={loading}
                        />

                        <TextButton
                            type="submit"
                            className="ml-auto mt-4"
                            disabled={
                                Object.values(passwordFormData).every((val) => val.trim().length === 0) || loading
                            }
                        >
                            Update Password
                        </TextButton>
                    </form>
                </div>
            </div>

            {/*
             * ================================
             * PREFERENCES
             * ================================
             */}

            <h2 className="font-medium text-2xl my-4">Preferences</h2>
            <div className="border border-foreground-muted/50 p-4 rounded mb-8">
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 shrink-0">
                        <p className="font-medium text-sm">Default Theme</p>
                        <span className="text-foreground-secondary text-sm">
                            Choose how the site looks or match your devices settings.
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 shrink-0">
                        <Dropdown
                            className="w-full"
                            value={preferences.theme}
                            onChange={(val) => setPreferences((prev) => ({ ...prev, theme: val }))}
                            options={THEMEOPTIONS}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mb-8">
                    <div className="flex-1 shrink-0">
                        <p className="font-medium text-sm">Default Landing Page</p>
                        <span className="text-foreground-secondary text-sm">
                            Choose which page you see first after signing in.
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 shrink-0">
                        <Dropdown
                            className="w-full"
                            value={preferences.home}
                            onChange={(val) => setPreferences((prev) => ({ ...prev, home: val }))}
                            options={HOMEOPTIONS}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 shrink-0">
                        <p className="font-medium text-sm">After saving content</p>
                        <span className="text-foreground-secondary text-sm">
                            Choose what happens immediately after yoy finish editing a note, list, or log.
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 shrink-0">
                        <Dropdown
                            className="w-full"
                            value={preferences.post_save_action}
                            onChange={(val) => setPreferences((prev) => ({ ...prev, post_save_action: val }))}
                            options={POSTSAVEOPTIONS}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <TextButton
                        className="ml-auto mt-4"
                        disabled={
                            (preferences.home.value === profile?.home &&
                                preferences.theme.value === profile.theme &&
                                preferences.post_save_action.value === profile.post_save_action) ||
                            loading
                        }
                        onClick={handleUpdatePreferences}
                    >
                        Save preferences
                    </TextButton>
                </div>
            </div>

            {/*
             * ================================
             * DANGER ZONE
             * ================================
             */}

            <h2 className="font-medium text-2xl my-4">Danger Zone</h2>
            <div className="border border-error/60 p-4 rounded mb-8">
                <div className="flex gap-4 mb-8">
                    <div className="flex-1 shrink-0">
                        <p className="font-medium text-sm">Default User Content</p>
                        <span className="text-foreground-secondary text-sm">
                            Permanently delete all your notes, lists, logs, links, and groups.
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 shrink-0 flex justify-end">
                        <TextButton
                            variant="error-ghost"
                            className="h-fit"
                            onClick={() => setDeleteModalMode(DANGERMODE.USERCONTENT)}
                        >
                            Delete All Content
                        </TextButton>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="flex-1 shrink-0">
                        <p className="font-medium text-sm">Delete Account</p>
                        <span className="text-foreground-secondary text-sm">
                            Permanently delete your SCRTCH account and data.
                        </span>
                    </div>
                    <div className="flex-1 min-w-0 shrink-0 flex justify-end">
                        <TextButton
                            variant="error"
                            className="h-fit"
                            onClick={() => setDeleteModalMode(DANGERMODE.ACCOUNT)}
                        >
                            Delete Account
                        </TextButton>
                    </div>
                </div>
            </div>

            <Modal
                modalOpen={deleteModalMode !== undefined}
                onClose={() => setDeleteModalMode(undefined)}
                title={DANGERMODAL[deleteModalMode ?? DANGERMODE.ACCOUNT].title}
                confirmAction={{
                    variant: "error",
                    text: DANGERMODAL[deleteModalMode ?? DANGERMODE.ACCOUNT][
                        isDeletingUserContent || isDeletingAccount ? "textLoading" : "text"
                    ],
                    disabled: confirmDeleteField !== user?.email,
                }}
                onConfirm={
                    deleteModalMode === undefined
                        ? undefined
                        : deleteModalMode === DANGERMODE.ACCOUNT
                          ? handleDeleteAccount
                          : handleDeleteContent
                }
            >
                {deleteModalMode === "content" && (
                    <p>
                        This will permanently delete all your notes, lists, logs, links, and groups. This action cannot
                        be undone.
                    </p>
                )}
                {deleteModalMode === "account" && (
                    <p>This will permanently delete your account and all your content. This action cannot be undone.</p>
                )}
                <br />
                <FieldLabel htmlFor="confirm-delete" className="mb-4">
                    Type in your email address to confirm
                </FieldLabel>
                <TextInput
                    id="confirm-delete"
                    value={confirmDeleteField}
                    onChange={(e) => setConfirmDeleteField(e.target.value)}
                    className="w-full"
                    disabled={isDeletingUserContent || isDeletingAccount}
                />
            </Modal>
        </div>
    );
};

export default AccountSettings;

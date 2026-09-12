import { useEffect, useState } from "react";
import FieldLabel from "../../components/FieldLabel";
import LinkText from "../../components/LinkText";
import TextButton from "../../components/TextButton";
import TextInput from "../../components/TextInput";
import useHead from "../../hooks/useHead";
import { useToast } from "../../context/toast/ToastContext";
import { resetPassword, signOut, verifyTokenHash } from "../../services/auth";
import { useAuth } from "../../context/auth/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";

const ResetPassword = () => {
    useHead({ title: "Reset Password" });
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { setIsVerifying } = useAuth();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState(false);
    const [isVerifyingToken, setIsVerifyingToken] = useState(true);
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    useEffect(() => {
        const verifyToken = async () => {
            const token_hash = searchParams.get("token_hash");
            const type = searchParams.get("type");

            if (!token_hash || !type) {
                showToast("Invalid reset password link.", "warning");
                return navigate("/login", { replace: true });
            }

            setIsVerifying(true);

            try {
                await verifyTokenHash(token_hash, type);
                setIsVerifyingToken(false);
            } catch (error: any) {
                showToast(error.message, "error");
                setIsVerifying(false);
                return navigate("/login", { replace: true });
            }
        };

        verifyToken();
    }, [searchParams, navigate, showToast]);

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await resetPassword(password);
            setLoading(false);
            await signOut();
            showToast("Password reset successfully", "success");
            setIsVerifying(false);
            return navigate("/login", { replace: true });
        } catch (error: any) {
            setLoading(false);
            showToast(error.message, "error");
        }
    };

    if (isVerifyingToken) {
        return (
            <div className="text-center text-sm font-semibold mt-4">Verifying reset password link, please wait...</div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full py-4">
            <div className="mb-6">
                <p className="text-2xl ml-1 font-bold mb-1">Reset Password</p>
                <p className="text-sm ml-1 text-foreground-secondary font-semibold">
                    Create a new password for your account
                </p>
            </div>
            <div className="w-full space-y-2 mb-4">
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <TextInput
                    type="password"
                    className="w-full"
                    placeholder="•••••••••"
                    id="password"
                    name="password"
                    autoComplete="off"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                />
            </div>
            {/* TODO: password requriements */}
            <div className="w-full space-y-2 mb-2">
                <FieldLabel htmlFor="re_password">Confirm Password</FieldLabel>
                <TextInput
                    type="password"
                    className="w-full"
                    placeholder="•••••••••"
                    id="re_password"
                    name="re_password"
                    autoComplete="off"
                    value={rePassword}
                    onChange={(e) => setRePassword(e.target.value)}
                    disabled={loading}
                />
            </div>

            <TextButton type="submit" variant="primary" className="w-full my-4" disabled={loading}>
                Reset Password
            </TextButton>

            <p className="text-center text-sm">
                Remembered your password?{" "}
                <LinkText to="/login" disabled={loading}>
                    Sign In
                </LinkText>
            </p>
        </form>
    );
};

export default ResetPassword;

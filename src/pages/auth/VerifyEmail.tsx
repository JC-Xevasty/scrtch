import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../context/toast/ToastContext";
import { useEffect } from "react";
import { signOut, verifyTokenHash } from "../../services/auth";
import { useAuth } from "../../context/auth/AuthContext";
import useHead from "../../hooks/useHead";

const VerifyEmail = () => {
    useHead({ title: "Verify Email" });
    const { showToast } = useToast();
    const { setIsVerifying } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const verifyToken = async () => {
            const token_hash = searchParams.get("token_hash");
            const type = searchParams.get("type");

            if (!token_hash || !type) {
                showToast("Failed to verify email address. Invalid confirmation link", "warning");
                navigate("/login", { replace: true });
                return;
            }

            setIsVerifying(true);

            try {
                await verifyTokenHash(token_hash, type);
                await signOut();
                showToast("Email verified successfully. Please sign in", "success");
            } catch (error: any) {
                showToast(error.message, "error");
            }

            setIsVerifying(false);
            navigate("/login", { replace: true });
            return;
        };

        verifyToken();
    }, [searchParams, navigate, showToast]);

    return <div className="text-center text-sm font-semibold mt-4">Verifying email address, please wait...</div>;
};
export default VerifyEmail;

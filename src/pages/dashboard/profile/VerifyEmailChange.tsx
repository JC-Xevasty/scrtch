import { useEffect } from "react";
import { verifyTokenHash } from "../../../services/auth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useToast } from "../../../context/toast/ToastContext";
import useHead from "../../../hooks/useHead";

const VerifyEmailChange = () => {
    useHead({ title: "Account Settings" });
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const verifyToken = async () => {
            const token_hash = searchParams.get("token_hash");
            const type = searchParams.get("type");

            if (!token_hash || !type) {
                showToast("Failed to update email address. Invalid confirmation link", "warning");
                navigate("/account-settings", { replace: true });
                return;
            }

            try {
                await verifyTokenHash(token_hash, type);
                showToast("Email address updated successfully.", "success");
            } catch (error: any) {
                showToast(error.message, "error");
            }

            navigate("/account-settings", { replace: true });
            return;
        };

        verifyToken();
    }, [searchParams, navigate, showToast]);

    return (
        <div>
            <div className="flex flex-row justify-between items-center py-8 -mt-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <h1 className="font-medium">
                    <span className="text-4xl align-middle mr-4 uppercase">Account Settings</span>
                </h1>
            </div>
            <br />
            <div className="text-center text-sm font-semibold mt-4">
                Completing email address change, please wait...
            </div>
        </div>
    );
};

export default VerifyEmailChange;

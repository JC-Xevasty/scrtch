import { useState } from "react";
import FieldLabel from "../../components/FieldLabel";
import LinkText from "../../components/LinkText";
import TextButton from "../../components/TextButton";
import TextInput from "../../components/TextInput";
import useHead from "../../hooks/useHead";
import { requestPasswordResetEmail } from "../../services/auth";
import { useToast } from "../../context/toast/ToastContext";

const ForgotPassword = () => {
    useHead({ title: "Forgot Password" });
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await requestPasswordResetEmail(email);
            setLoading(false);
            showToast("Check your email inbox", "success");
        } catch (error: any) {
            setLoading(false);
            showToast(error?.message, "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full py-4">
            <div className="mb-6">
                <p className="text-2xl ml-1 font-bold mb-1">Forgot Password?</p>
                <p className="text-sm ml-1 text-foreground-secondary font-semibold">
                    Enter email address and receive instructions to reset password.
                </p>
            </div>
            <div className="w-full space-y-2">
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <TextInput
                    type="text"
                    className="w-full"
                    placeholder="Email Address"
                    id="email"
                    name="email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                />
            </div>

            <TextButton type="submit" variant="primary" className="w-full my-4" disabled={loading}>
                Submit Email Address
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
export default ForgotPassword;

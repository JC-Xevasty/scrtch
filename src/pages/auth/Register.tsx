import { useState } from "react";
import FieldLabel from "../../components/FieldLabel";
import LinkText from "../../components/LinkText";
import TextButton from "../../components/TextButton";
import TextInput from "../../components/TextInput";
import useHead from "../../hooks/useHead";
import { signUp } from "../../services/auth";
import { useToast } from "../../context/toast/ToastContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
    useHead({ title: "Register" });
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rePassword, setRePassword] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            await signUp(email, password);

            setLoading(false);
            showToast("If an account exists for this email, you will receive a confirmation link shortly.", "success");
            navigate("/login", { replace: true });
        } catch (error: any) {
            setLoading(false);
            showToast(error.message, "error");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full py-4">
            <div className="mb-6">
                <p className="text-2xl ml-1 font-bold mb-1">Get started</p>
                <p className="text-sm ml-1 text-foreground-secondary font-semibold">Create a new account</p>
            </div>
            <div className="w-full space-y-2 mb-4">
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
            <div className="w-full space-y-2 mb-4">
                <FieldLabel htmlFor="password">Password</FieldLabel>
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
                Create Account
            </TextButton>

            <p className="text-center text-sm">
                Already have an account?{" "}
                <LinkText to="/login" disabled={loading}>
                    Sign in
                </LinkText>
            </p>
        </form>
    );
};
export default Register;

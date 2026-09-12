import FieldLabel from "../../components/FieldLabel";
import TextInput from "../../components/TextInput";
import TextButton from "../../components/TextButton";
import LinkText from "../../components/LinkText";
import useHead from "../../hooks/useHead";
import { signIn } from "../../services/auth";
import { useState } from "react";
import { useToast } from "../../context/toast/ToastContext";
import { useAuth } from "../../context/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/theme/ThemeContext";

const Login = () => {
    useHead({ title: "Login" });
    const navigate = useNavigate();
    const { setProfile, setUser } = useAuth();
    const { setTheme } = useTheme();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { user, profile } = await signIn(email, password);

            setLoading(false);

            // Redirect to default home
            setUser(user);
            setProfile(profile);

            // Set auth states
            setTimeout(() => {
                const { home, theme } = profile;
                const redirectTo = home === "home" ? "/dashboard" : `/${home}`;
                setTheme(theme);
                navigate(redirectTo, { replace: true });
                showToast("Sign in successful. Welcome!", "success");
            }, 1);
        } catch (error: any) {
            setLoading(false);
            showToast(error.message, error.status);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full py-4">
            <div className="mb-6">
                <p className="text-2xl ml-1 font-bold mb-1">Welcome Back!</p>
                <p className="text-sm ml-1 text-foreground-secondary font-semibold">Sign in to your account</p>
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
            <div className="w-full space-y-2 mb-2">
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

            <LinkText to="/forgot-password" className="text-sm" disabled={loading}>
                Forgot Password?
            </LinkText>

            <TextButton type="submit" variant="primary" className="w-full mt-4" disabled={loading}>
                Sign In
            </TextButton>

            {import.meta.env.VITE_ALLOW_REGISTRATION === true && (
                <p className="text-center text-sm mt-4">
                    Don't have an account?{" "}
                    <LinkText to="/register" disabled={loading}>
                        Register
                    </LinkText>
                </p>
            )}
        </form>
    );
};
export default Login;

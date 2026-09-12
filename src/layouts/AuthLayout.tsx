import { Link, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/auth/AuthContext";
import Logo from "../components/Logo";

const AuthLayout = () => {
    const { user, authLoading } = useAuth();

    if (authLoading) return null;
    if (user) return <Navigate to="/dashboard" replace />;

    return (
        <div className="h-full w-full flex justify-center items-center p-4 dot-grid">
            {/* AUTH CONTAINER */}
            <div className="bg-background-2 p-4 rounded-md border border-white/10 shadow-sm flex flex-col justify-center items-center w-full max-w-100">
                <Link to="/" className="mb-4">
                    <Logo className="h-8" />
                </Link>

                <Outlet />
            </div>
        </div>
    );
};
export default AuthLayout;

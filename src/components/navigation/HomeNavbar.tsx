import { Link } from "react-router-dom";
import { useAuth } from "../../context/auth/AuthContext";
import TextButton from "../TextButton";
import Logo from "../Logo";

const HomeNavbar = () => {
    const { user } = useAuth();

    return (
        <header className="bg-background-1 flex justify-between items-center px-4 sm:px-8 py-4 shadow-md">
            <Link to="/">
                <Logo className="h-6 sm:h-8" />
            </Link>
            <div className="flex justify-end items-center gap-4">
                {!user ? (
                    <Link to="login">
                        <TextButton variant="ghost">Sign In</TextButton>
                    </Link>
                ) : (
                    <Link to="dashboard">
                        <TextButton variant="ghost">Dashboard</TextButton>
                    </Link>
                )}
            </div>
        </header>
    );
};
export default HomeNavbar;

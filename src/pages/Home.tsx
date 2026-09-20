import { Link } from "react-router-dom";

import TextButton from "../components/TextButton";
import Icon from "../components/Icon";

import Logo from "../components/Logo";

import useHead from "../hooks/useHead";
import { useAuth } from "../context/auth/AuthContext";

const Home = () => {
    useHead({ title: "scrtch" });
    const { user } = useAuth();

    return (
        <div className="w-full h-full flex justify-center items-center p-4 select-none">
            {/* DOT GRID */}
            <div
                aria-hidden="true"
                className="absolute inset-0 w-svw h-svh pointer-events-none bg-[radial-gradient(var(--background-3)_2px,transparent_1px)] bg-size-[48px_48px]"
            />

            <div className="flex flex-col items-center z-1">
                {/* Logo with subtle glow */}
                <Logo
                    className="w-[80vw] max-w-175"
                    svgClassName="drop-shadow-[0_0_10px_var(--color-foreground-muted)]"
                />
                <p className="italic text-foreground-secondary text-xl text-center mt-2">
                    Designed and built for personal utility.
                </p>
                <div className="flex gap-4 mt-8">
                    {!user ? (
                        <Link to="login">
                            <TextButton variant="primary">Sign In</TextButton>
                        </Link>
                    ) : (
                        <Link to="dashboard">
                            <TextButton variant="primary">Dashboard</TextButton>
                        </Link>
                    )}

                    <Link to="quick">
                        <TextButton variant="ghost">Quick Scratch</TextButton>
                    </Link>
                </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-1 text-foreground-muted">
                <div className={"flex justify-between items-center w-screen px-4 py-2 text-sm"}>
                    <p>
                        <span>&#0169; {new Date().getFullYear()} | Built with </span>
                        <a
                            href="https://react.dev/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline transition-all hover:text-foreground-secondary"
                        >
                            React
                        </a>
                        &nbsp;and&nbsp;
                        <a
                            href="https://supabase.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline transition-all hover:text-foreground-secondary"
                        >
                            Supabase
                        </a>
                    </p>
                    <a
                        href="https://github.com/JC-Xevasty/scrtch"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline transition-all hover:text-foreground-secondary"
                    >
                        <div className="flex items-center gap-2">
                            <Icon name="github" color="" size={16} />
                            <span className="hidden sm:block">github.com/JC-Xevasty</span>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Home;

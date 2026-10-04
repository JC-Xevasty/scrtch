import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Icon from "../Icon";
import Divider from "../Divider";
import Logo from "../Logo";

import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/auth/AuthContext";
import { useTheme, type ThemeMode } from "../../context/theme/ThemeContext";
import { useToast } from "../../context/toast/ToastContext";

import { signOut } from "../../services/auth";

const ThemeSelector = ({ targetTheme }: { targetTheme: ThemeMode }) => {
    const { theme, setTheme } = useTheme();
    const isSelected = theme === targetTheme;

    return (
        <div className="flex items-center mb-3 pl-5 relative">
            {isSelected && <div className="absolute left-1 w-2 h-2 bg-foreground-primary rounded-sm" />}
            <p
                className={
                    isSelected
                        ? "font-semibold cursor-default capitalize"
                        : "cursor-pointer capitalize hover:opacity-70"
                }
                onClick={isSelected ? undefined : () => setTheme(targetTheme)}
            >
                {targetTheme}
            </p>
        </div>
    );
};

const DashboardNavbar = () => {
    const location = useLocation();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [isOpen, setIsOpen] = useState<boolean>(false);

    const popupRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (!isOpen) return;

        const handleOutsideClick = (e: MouseEvent) => {
            if (popupRef.current === null) return;

            const clickedElement = e.target as Node;

            if (!popupRef.current.contains(clickedElement)) {
                setIsOpen(false);
            }
        };

        window.addEventListener("mousedown", handleOutsideClick);
        return () => {
            window.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [isOpen]);

    const handleLogout = async () => {
        try {
            await signOut();
            queryClient.clear();
            navigate("/login", { replace: true });
        } catch (error) {
            showToast("Failed to sign out", "error");
        }

        setIsOpen(false);
    };

    return (
        <header
            id="dashboard-header"
            className="bg-background-1 flex justify-between items-center px-3 sm:px-8 py-3 sm:py-4 shadow-md z-10"
        >
            {/* Space for mobile sidebar toggler */}
            <div className="block w-6 sm:hidden" />

            {/* Logo */}
            <Link to="/dashboard">
                <Logo className="h-6 sm:h-8" />
            </Link>

            {/* Account */}
            <div className="relative" ref={popupRef}>
                <div onClick={() => setIsOpen(!isOpen)}>
                    <Icon name="person" className="hover:text-foreground-secondary cursor-pointer" />
                </div>
                {isOpen && (
                    <>
                        <div className="absolute right-0 top-full mt-2 z-50 transition-colors header-popup">
                            <div className="w-50 sm:w-64 p-4 rounded bg-background-2 border border-white/10 shadow-md text-xs">
                                <p className="font-semibold truncate ">{user?.email}</p>
                                <Divider className="-mx-4" />
                                <Link to="/account-settings" className="font-medium hover:opacity-70">
                                    Account Settings
                                </Link>
                                <Divider className="-mx-4" />
                                <Link to="/quick" className="font-medium hover:opacity-70">
                                    Quick Scratch
                                </Link>
                                <Divider className="-mx-4" />
                                <p className="mb-2 font-medium">Theme</p>
                                <ThemeSelector targetTheme="light" />
                                <ThemeSelector targetTheme="dark" />
                                <ThemeSelector targetTheme="system" />
                                <Divider className="-mx-4" />
                                <p
                                    className="text-error hover:opacity-70 cursor-pointer font-medium"
                                    onClick={handleLogout}
                                >
                                    Log Out
                                </p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </header>
    );
};

export default DashboardNavbar;

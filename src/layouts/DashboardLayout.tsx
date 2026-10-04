import React, { useCallback, useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import Icon from "../components/Icon";
import DashboardNavbar from "../components/navigation/DashboardNavbar";
import DashboardSidebar from "../components/navigation/DashboardSidebar";

import { useAuth } from "../context/auth/AuthContext";

import "../style/dashboard.css";

const DashboardLayout = () => {
    const location = useLocation();
    const { user, authLoading } = useAuth();

    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

    useEffect(() => {
        document.getElementById("dashboard-content")?.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    const handleOutsideClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const { id } = e.target as HTMLElement;
        if (!["dashboard-header", "dashboard-sidebar"].includes(id)) {
            setMobileSidebarOpen(false);
        }
    }, []);

    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="h-full flex flex-col" onClick={mobileSidebarOpen ? handleOutsideClick : undefined}>
            {/* HEADER */}
            <div className="relative z-20">
                <div
                    className="sm:hidden h-full absolute top-0 flex items-center ml-3"
                    onClick={() => setMobileSidebarOpen((prev) => !prev)}
                >
                    <Icon
                        name={mobileSidebarOpen ? "x" : "hamburger"}
                        width={30}
                        height={mobileSidebarOpen ? 24 : 30}
                    />
                </div>
                <DashboardNavbar />
            </div>

            {/* MAIN CONTENT */}
            <div className="grow overflow-y-hidden flex flex-row relative">
                {/* SIDEBAR */}
                <div
                    className={
                        "sidebar bg-background-0 h-full absolute sm:relative left-0 top-0 z-10 " +
                        "border-r border-background-3 shadow-lg " +
                        "duration-300 ease-in-out sm:translate-x-0 " +
                        (mobileSidebarOpen ? "translate-x-0" : "-translate-x-full")
                    }
                >
                    <DashboardSidebar />
                </div>

                {/* CONTENT */}
                <div id="dashboard-content" className="p-4 grow overflow-y-auto relative">
                    <div className="w-full max-w-4xl mx-auto pb-20">
                        <Outlet />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;

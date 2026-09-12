import { Navigate, Outlet, useLocation } from "react-router-dom";
import DashboardNavbar from "../components/navigation/DashboardNavbar";
import "../style/dashboard.css";
import DashboardSidebar from "../components/navigation/DashboardSidebar";
import { useEffect } from "react";
import { useAuth } from "../context/auth/AuthContext";

const DashboardLayout = () => {
    const location = useLocation();
    const { user, authLoading } = useAuth();

    useEffect(() => {
        document.getElementById("dashboard-content")?.scrollTo({ top: 0, behavior: "smooth" });
    }, [location.pathname]);

    if (authLoading) return null;
    if (!user) return <Navigate to="/login" replace />;

    return (
        <div className="h-full flex flex-col">
            <DashboardNavbar />
            <div className="grow overflow-y-hidden flex flex-row">
                <div className="sidebar border border-background-3">
                    <DashboardSidebar />
                </div>
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

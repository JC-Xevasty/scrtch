import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import Icon from "../Icon";
import Divider from "../Divider";

const SidebarLink = ({ active, url, icon, label }: { active?: boolean; url: string; icon: string; label: string }) => {
    return (
        <Link
            to={url}
            className={`flex flex-row items-center gap-2 ${active ? "bg-background-2" : ""} hover:bg-background-2 p-2 rounded-md cursor-pointer overflow-hidden transition-all ease-in-out`}
        >
            <Icon
                name={icon}
                className="shrink-0 transition-colors ease-in-out duration-300"
                color={active ? "text-accent" : "text-foreground-primary"}
            />
            <p
                className={`font-medium ${active ? "text-accent" : "text-foreground-secondary"} transition-colors ease-in-out duration-300`}
            >
                {label}
            </p>
        </Link>
    );
};

const DashboardSidebar = () => {
    const location = useLocation();

    const mainPath: string = useMemo(() => {
        return location.pathname.split("/")[1];
    }, [location.pathname]);

    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    return (
        <div
            className={`h-full w-40 ${isSidebarExpanded ? "sm:w-50" : "sm:w-14"} transition-[width] duration-300 ease-in-out`}
        >
            <div id="dashboard-sidebar" className="h-full p-2 flex flex-col justify-between overflow-hidden">
                <nav>
                    <SidebarLink active={mainPath === "dashboard"} url="/dashboard" icon="home" label="Home" />
                    <Divider />
                    <div className="space-y-1">
                        <SidebarLink active={mainPath === "groups"} url="/groups" icon="folder" label="Groups" />
                        <SidebarLink active={mainPath === "notes"} url="/notes" icon="note" label="Notes" />
                        <SidebarLink active={mainPath === "lists"} url="/lists" icon="list" label="Lists" />
                        <SidebarLink active={mainPath === "logs"} url="/logs" icon="calendar-plus" label="Logs" />
                        <SidebarLink active={mainPath === "links"} url="/links" icon="globe" label="Links" />
                    </div>
                </nav>

                {/* Hide on mobile */}
                <div
                    className="hidden sm:block p-2 rounded-md hover:bg-background-2 w-fit"
                    onClick={() => setIsSidebarExpanded((prev) => !prev)}
                >
                    <Icon
                        name="sidebar"
                        className="cursor-pointer"
                        color={!isSidebarExpanded ? "text-foreground-muted" : ""}
                    />
                </div>
            </div>
        </div>
    );
};

export default DashboardSidebar;

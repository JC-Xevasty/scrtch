import { Outlet } from "react-router-dom";
import HomeNavbar from "../components/navigation/HomeNavbar";

const PublicLayout = () => {
    return (
        <div className="h-full flex flex-col">
            <HomeNavbar />
            <div className="grow overflow-y-auto p-4 dot-grid">
                <Outlet />
            </div>
        </div>
    );
};

export default PublicLayout;

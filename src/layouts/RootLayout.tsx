import { Outlet } from "react-router-dom";

const RootLayout = () => {
    return (
        <main className="font-brand text-foreground-primary font-light h-svh w-svw">
            <Outlet />
        </main>
    );
};

export default RootLayout;

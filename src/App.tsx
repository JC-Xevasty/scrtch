import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./App.css";

import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Quick from "./pages/Quick";

import RootLayout from "./layouts/RootLayout";
import PublicLayout from "./layouts/PublicLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import AccountSettings from "./pages/dashboard/profile/AccountSettings";

import LinksManager from "./pages/dashboard/links/LinksManager";
import GroupCollection from "./pages/dashboard/groups/GroupCollection";
import Group from "./pages/dashboard/groups/Group";
import NoteCollection from "./pages/dashboard/notes/NoteCollection";
import Note from "./pages/dashboard/notes/Note";
import ListCollection from "./pages/dashboard/lists/ListCollection";
import List from "./pages/dashboard/lists/List";
import LogCollection from "./pages/dashboard/logs/LogCollection";
import Log from "./pages/dashboard/logs/Log";

import Test from "./pages/Test";
import AuthProvider from "./context/auth/AuthProvider";
import VerifyEmail from "./pages/auth/VerifyEmail";
import VerifyEmailChange from "./pages/dashboard/profile/VerifyEmailChange";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        errorElement: <NotFound />,
        children: [
            { index: true, element: <Home /> },
            // Public facing
            {
                element: <PublicLayout />,
                children: [
                    { path: "quick", element: <Quick /> },
                    { path: "test", element: <Test /> },
                ],
            },

            // Auth routes
            {
                element: <AuthLayout />,
                children: [
                    { path: "login", element: <Login /> },
                    { path: "register", element: <Register /> },
                    { path: "forgot-password", element: <ForgotPassword /> },
                    { path: "verify-email", element: <VerifyEmail /> },
                    { path: "reset-password", element: <ResetPassword /> },
                ],
            },

            // Dashboard routes
            {
                element: <DashboardLayout />,
                children: [
                    { path: "dashboard", element: <Dashboard /> },
                    // Account management, preferences
                    {
                        path: "account-settings",
                        children: [
                            { index: true, element: <AccountSettings /> },
                            { path: "verify-email-change", element: <VerifyEmailChange /> },
                        ],
                    },

                    // Content
                    { path: "links", element: <LinksManager /> },
                    {
                        path: "groups",
                        children: [
                            { index: true, element: <GroupCollection /> },
                            { path: ":id", element: <Group /> },
                        ],
                    },
                    {
                        path: "notes",
                        children: [
                            { index: true, element: <NoteCollection /> },
                            { path: ":id/:mode?", element: <Note /> },
                        ],
                    },
                    {
                        path: "lists",
                        children: [
                            { index: true, element: <ListCollection /> },
                            { path: ":id/:mode?", element: <List /> },
                        ],
                    },
                    {
                        path: "logs",
                        children: [
                            { index: true, element: <LogCollection /> },
                            { path: ":id/:mode?", element: <Log /> },
                        ],
                    },
                ],
            },
        ],
    },

    // Catch-all
    { path: "*", element: <NotFound /> },
]);

const App = () => {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
};

export default App;

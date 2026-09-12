import { createRoot } from "react-dom/client";
import "./style/reset.css";
import "./style/global.css";
import App from "./App.tsx";
import ThemeProvider from "./context/theme/ThemeProvider.tsx";
import ToastProvider from "./context/toast/ToastProvider.tsx";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

// 1. Initialize the core cache client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false, // Turn off retries everywhere by default
            refetchOnWindowFocus: false, // Turn off tab-focus fetching everywhere by default
        },
    },
});

createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
        <ToastProvider>
            <QueryClientProvider client={queryClient}>
                <App />
            </QueryClientProvider>
        </ToastProvider>
    </ThemeProvider>,
);

import { useEffect, useState, type ReactNode } from "react";
import { ThemeContext, type ThemeMode } from "./ThemeContext";

const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState<ThemeMode>(() => {
        return (localStorage.getItem("app-theme") as ThemeMode) || "system";
    });

    const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        const root = window.document.documentElement;

        const updateTheme = () => {
            let activeTheme: "light" | "dark";

            if (theme === "system") {
                activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
            } else {
                activeTheme = theme;
            }

            root.setAttribute("data-theme", activeTheme);
            setResolvedTheme(activeTheme);
            localStorage.setItem("app-theme", theme);
        };

        updateTheme();

        // Listen for System Preference Changes (e.g., Sunset/Sunrise)
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

        const handleChange = () => {
            if (theme === "system") updateTheme();
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [theme]);

    // Listen for LocalStorage changes from other tabs/windows
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === "app-theme") {
                setTheme((e.newValue as ThemeMode) || "system");
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, []);

    return <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>{children}</ThemeContext.Provider>;
};

export default ThemeProvider;

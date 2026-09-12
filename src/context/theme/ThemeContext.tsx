import { createContext, useContext } from "react";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;

    // The actual theme being applied
    resolvedTheme?: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};

export { ThemeContext, useTheme };
export type { ThemeContextType, ThemeMode };

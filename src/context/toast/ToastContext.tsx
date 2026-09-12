import { createContext, useContext } from "react";

type ToastStatus = "default" | "success" | "error" | "warning";

interface ToastContextType {
    showToast: (message: string, status?: ToastStatus) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export { ToastContext, useToast };
export type { ToastStatus };

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ToastContext, type ToastStatus } from "./ToastContext";
import { createPortal } from "react-dom";
import ToastItem from "./ToastItem";

interface Toast {
    id: string;
    message: string;
    type: ToastStatus;
    isExiting?: boolean;
}

const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toastList, setToasList] = useState<Toast[]>([]);
    const [existingToastIDList, setExitingToastIDList] = useState<string[]>([]);
    const timeoutListRef = useRef<Record<string, number>>({});

    useEffect(() => {
        return () => {
            for (const key of Object.keys(timeoutListRef.current)) {
                clearTimeout(timeoutListRef.current[key]);
            }
        };
    }, []);

    const showToast = useCallback((message: string, type?: ToastStatus) => {
        const id = crypto.randomUUID();
        setToasList((prev) => [{ id, message, type: type ?? "default" }, ...prev.slice(0, 4)]);

        // Auto-remove after 5 seconds
        timeoutListRef.current[id] = setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id: string) => {
        clearTimeout(timeoutListRef.current[id]);
        setExitingToastIDList((prev) => [...prev, id]);

        // Remove from list after exit animation
        setTimeout(() => {
            setToasList((prev) => prev.filter((t) => t.id !== id));
            delete timeoutListRef.current[id];
        }, 500);
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toastList.length > 0 &&
                createPortal(
                    <div className="toast-container fixed bottom-0 right-0 mb-4 px-8 z-9999 flex flex-col gap-3 w-full max-w-100">
                        {toastList.map((toast) => (
                            <ToastItem
                                key={toast.id}
                                {...toast}
                                isExiting={existingToastIDList.includes(toast.id)}
                                handleClose={() => {
                                    if (!existingToastIDList.includes(toast.id)) {
                                        removeToast(toast.id);
                                    }
                                }}
                            />
                        ))}
                    </div>,
                    document.body,
                )}
        </ToastContext.Provider>
    );
};

export default ToastProvider;
export type { Toast };

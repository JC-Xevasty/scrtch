import Icon, { type IconProps } from "../../components/Icon";
import type { ToastStatus } from "./ToastContext";
import type { Toast } from "./ToastProvider";

const BASESTYLES = "p-4 rounded-lg flex justify-between items-center w-full";

const VARIANT = {
    default: "bg-background-3 border border-white/20 text-foreground-primary",
    success: "bg-success-soft border border-success/30 text-success",
    error: "bg-error-soft border border-error/30 text-error",
    warning: "bg-accent-soft border border-accent text-accent",
};

const ICONS: Record<ToastStatus, IconProps> = {
    default: { name: "info-circle", color: "text-foreground-primary" },
    success: { name: "check-circle", color: "text-success" },
    error: { name: "exclamation-circle", color: "text-error" },
    warning: { name: "exclamation-triangle", color: "text-accent" },
};

const ToastItem = ({ message, type, isExiting, handleClose }: Toast & { handleClose: () => void }) => {
    return (
        <div className={`toast-item ${BASESTYLES} ${VARIANT[type]} ${isExiting ? "toast-exit" : ""}`} role="alert">
            <div className="flex items-center gap-4">
                <Icon size={20} {...ICONS[type]} className="shrink-0" />
                <p className="text-sm font-medium line-clamp-2 select-none" title={message}>
                    {message}
                </p>
            </div>
            <div className="ml-4 cursor-pointer" onClick={handleClose}>
                <Icon name="x-thick" size={20} />
            </div>
        </div>
    );
};

export default ToastItem;

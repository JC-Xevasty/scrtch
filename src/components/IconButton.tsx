import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonVariant } from "../types";
import Icon, { type IconProps } from "./Icon";

interface PropTypes extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    className?: string;
    icon: IconProps;
    children?: ReactNode;
}

const BASESTYLES = "font-medium shadow-md transition-all  " + "disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS = {
    primary: "bg-accent hover:bg-accent-hover active:bg-accent-active text-white disabled:bg-accent",
    ghost: "border border-accent text-accent hover:bg-accent/10 disabled:bg-transparent",
    success: "bg-success hover:opacity-90 text-white",
    "success-ghost": "text-success border border-success hover:bg-success/10 disabled:bg-transparent",
    error: "bg-error hover:opacity-90 text-white",
    "error-ghost": "text-error border border-error hover:bg-error/10 disabled:bg-transparent",
    neutral: "bg-foreground-primary hover:opacity-90 text-background-3",
    "neutral-ghost":
        "text-foreground-primary border border-foreground-primary hover:bg-foreground-primary/10 disabled:bg-transparent",
};

const SIZES = {
    sm: "p-1 rounded-sm",
    md: "p-2 rounded-md",
    lg: "p-3 rounded-lg",
};

const SIZESWITHTEXT = {
    sm: "text-xs px-2 py-1 rounded-sm",
    md: "text-sm px-4 py-2 rounded-md",
    lg: "text-base px-6 py-3 rounded-lg",
};

const ICONSIZE = { sm: 16, md: 20, lg: 24 };

const IconButton = ({ variant = "primary", size = "md", className = "", icon, children, ...props }: PropTypes) => {
    return (
        <button
            className={`${BASESTYLES} ${VARIANTS[variant]} ${children !== undefined ? SIZESWITHTEXT[size] : SIZES[size]} ${className}`}
            {...props}
        >
            {children !== undefined ? (
                <div className="flex flex-row justify-center items-center gap-2">
                    <Icon {...icon} size={ICONSIZE[size]} color="" />
                    {children}
                </div>
            ) : (
                <Icon {...icon} size={ICONSIZE[size]} color="" />
            )}
        </button>
    );
};

export default IconButton;

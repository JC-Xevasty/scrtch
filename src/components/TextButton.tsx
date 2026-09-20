import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { ButtonVariant } from "../types";

interface PropTypes extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: "sm" | "md" | "lg";
    className?: string;
    children?: ReactNode;
}

const BASESTYLES =
    "font-medium shadow-md transition-all select-none " + "disabled:opacity-50 disabled:cursor-not-allowed";

const VARIANTS = {
    primary:
        "bg-accent hover:bg-accent-hover border border-accent/50 active:bg-accent-active text-white disabled:bg-accent",
    ghost: "border border-accent text-accent hover:bg-accent/10 disabled:bg-transparent",
    success: "bg-success hover:opacity-90 border-success/50 text-white",
    "success-ghost": "text-success border border-success hover:bg-success/10 disabled:bg-transparent",
    error: "bg-error hover:opacity-90 border-error/50 text-white",
    "error-ghost": "text-error border border-error hover:bg-error/10 disabled:bg-transparent",
    neutral: "bg-foreground-primary hover:opacity-90 border-foreground-primary/50 text-background-3",
    "neutral-ghost":
        "text-foreground-primary border border-foreground-primary hover:bg-foreground-primary/10 disabled:bg-transparent",
};

const SIZES = {
    sm: "text-xs px-3 py-1 rounded-sm",
    md: "text-sm px-6 py-2 rounded-md",
    lg: "text-base px-8 py-3 rounded-lg",
};

const TextButton = ({ variant = "primary", size = "md", className = "", children, ...props }: PropTypes) => {
    return (
        <button
            type={props.type ?? "button"}
            className={`${BASESTYLES} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default TextButton;

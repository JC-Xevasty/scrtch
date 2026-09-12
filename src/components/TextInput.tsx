import type { InputHTMLAttributes } from "react";

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
    inputSize?: "sm" | "md" | "lg";
    className?: string;
}

const BASESTYLES =
    "bg-background-1 border border-background-3 text-foreground-primary " +
    "rounded-md outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all";

const SIZES = {
    sm: "text-xs px-4 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-4 py-2.5",
};

const TextInput = ({
    inputSize = "md",
    className = "",
    ...props
}: PropTypes) => {
    return (
        <input
            className={`${BASESTYLES} ${SIZES[inputSize]} ${className}`}
            {...props}
        />
    );
};

export default TextInput;

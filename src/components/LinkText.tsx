import type { ReactNode, RefAttributes } from "react";
import { Link, type LinkProps } from "react-router-dom";

interface PropTypes extends RefAttributes<HTMLAnchorElement>, LinkProps {
    className?: string;
    disabled?: boolean;
    children?: ReactNode;
}

const BASESTYLES = "text-accent hover:underline underline-offset-2";

const LinkText = ({ className = "", children, disabled = false, ...props }: PropTypes) => {
    return (
        <Link
            tabIndex={disabled ? -1 : undefined}
            className={`${!disabled ? BASESTYLES : "pointer-events-none text-accent/50"} ${className}`}
            onClick={(e) => {
                if (disabled) e.preventDefault();
            }}
            {...props}
        >
            {children}
        </Link>
    );
};

export default LinkText;

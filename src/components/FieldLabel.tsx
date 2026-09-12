import type { LabelHTMLAttributes, ReactNode } from "react";

interface PropTypes extends LabelHTMLAttributes<HTMLLabelElement> {
    children?: ReactNode;
    className?: string;
}

const BASESTYLES = "block text-sm ml-1 font-semibold w-fit";

const FieldLabel = ({
    className = "",
    children,
    htmlFor,
    ...props
}: PropTypes) => {
    return htmlFor !== undefined && htmlFor.trim().length > 0 ? (
        <label className={`${BASESTYLES} ${className}`} htmlFor={htmlFor} {...props}>
            {children}
        </label>
    ) : (
        <div className={`${BASESTYLES} ${className}`}>{children}</div>
    );
};
export default FieldLabel;

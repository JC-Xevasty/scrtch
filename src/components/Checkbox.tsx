import type { InputHTMLAttributes } from "react";
import Icon from "./Icon";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
    inputSize?: "sm" | "md" | "lg";
    label?: string;
    className?: string;
}

const Checkbox = ({ inputSize = "md", label, className = "", ...props }: CheckboxProps) => {
    const checkboxId = props.id || `checkbox-${label?.replace(/\s+/g, "-").toLowerCase()}`;

    return (
        <label htmlFor={checkboxId} className={`flex items-center gap-2 cursor-pointer ${className}`}>
            <input type="checkbox" id={checkboxId} className="sr-only peer" {...props} />

            <div
                className={
                    "size-5 flex justify-center items-center border border-accent rounded-md transition-all " +
                    "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background-1 " +
                    (props.checked ? " bg-accent" : "bg-background-3")
                }
            >
                {props.checked && <Icon name="check" color="text-white" />}
            </div>

            {label && <span className="cursor-pointer">{label}</span>}
        </label>
    );
};
export default Checkbox;

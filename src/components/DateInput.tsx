import { useRef, type InputHTMLAttributes } from "react";

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
    inputSize?: "sm" | "md" | "lg";
    value: string;
    className?: string;
    formatDate?: (dateString: string) => string;
}

const BASESTYLES =
    "bg-background-1 border border-background-3 text-foreground-primary " +
    "rounded-md select-none outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all";

const ADDITIONALSTYLES = {
    disabled: "cursor-not-allowed",
    default: "cursor-pointer hover:bg-background-3",
};

const SIZES = {
    sm: "text-xs px-4 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-4 py-2.5",
};

const DateInput = ({
    inputSize = "md",
    className = "",
    value = "",
    placeholder,
    disabled,
    formatDate,
    onChange,
    ...props
}: PropTypes) => {
    const dateInputRef = useRef<HTMLInputElement>(null);

    const showDatePicker = () => {
        dateInputRef.current?.showPicker();
    };

    let displayDate = "";

    if (value === "") {
        displayDate = placeholder ?? "YYYY-MM-DD";
    } else {
        if (formatDate !== undefined) {
            displayDate = formatDate(value);
        } else {
            displayDate = value;
        }
    }

    return (
        <div className="flex gap-4 relative">
            <input
                ref={dateInputRef}
                type="date"
                className="absolute -bottom-4 opacity-0 pointer-events-none"
                onChange={onChange}
                value={value.split("T")[0]}
                {...props}
            />
            <div
                className={`${BASESTYLES} ${ADDITIONALSTYLES[disabled ? "disabled" : "default"]} ${SIZES[inputSize]} ${className}`}
                tabIndex={0}
                onClick={showDatePicker}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        showDatePicker();
                    }
                }}
            >
                {displayDate}
            </div>
        </div>
    );
};

export default DateInput;

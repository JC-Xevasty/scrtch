import { useLayoutEffect, useRef, type ChangeEvent, type InputHTMLAttributes } from "react";

interface TextBlockProps extends InputHTMLAttributes<HTMLTextAreaElement> {
    autoResize?: boolean;
    className?: string;
    inputSize?: "sm" | "md" | "lg";
}

const BASESTYLES =
    "bg-background-1 border border-background-3 text-foreground-primary whitespace-pre-wrap rounded-md min-h-9 " +
    "before:content-[attr(data-placeholder)] before:text-foreground-secondary/50 before:absolute empty:before:block before:hidden " + // placeholder
    "outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all ";

const SIZES = {
    sm: "text-xs px-4 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-base px-4 py-2.5",
};

const TextBlock = ({
    inputSize = "md",
    autoResize = true,
    className,
    value = "",
    onChange,
    ...props
}: TextBlockProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const resize = () => {
        if (!autoResize) return;

        // Optimization: Defer the resize until the next animation frame
        requestAnimationFrame(() => {
            const textarea = textareaRef.current;
            if (!textarea) return;

            if (textarea.style.height !== `${textarea.scrollHeight}px`) {
                // Set it to auto first so that it shrinks to its natural height (when deleting content)
                textarea.style.height = "auto";
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
        });
    };

    useLayoutEffect(() => resize(), [value]);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        if (!onChange) return;
        onChange(e);
        resize();
    };

    return (
        <textarea
            ref={textareaRef}
            className={`${BASESTYLES} ${SIZES[inputSize]} ${autoResize ? "overflow-hidden resize-none" : "resize-none"} ${className}`}
            value={value}
            onChange={handleChange}
            {...props}
        />
    );
};

export default TextBlock;

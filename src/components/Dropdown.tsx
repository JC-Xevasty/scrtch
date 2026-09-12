import { useRef, useState, type ReactNode } from "react";
import Icon from "./Icon";
import Popover from "./Popover";

interface DropdownOption {
    id: string;
    value: string;
    text: string;
}

interface DropdownProps {
    value?: DropdownOption;
    options: DropdownOption[];
    onChange: (val: DropdownOption) => void;
    trigger?: ReactNode;
    className?: string;
    disabled?: boolean;
}

const Dropdown = ({
    value = { id: "", value: "", text: "" },
    options,
    onChange,
    trigger,
    className = "",
    disabled = false,
}: DropdownProps) => {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLDivElement>(null);
    const [menuAnchor, setMenuAnchor] = useState<DOMRect | null>(null);

    const handleSelectOption = (newValue: DropdownOption) => {
        if (value?.id !== newValue.id) {
            onChange(newValue);
        }
        setOpen(false);
    };

    const toggleDropdown = () => {
        if (!open && triggerRef.current) {
            setMenuAnchor(triggerRef.current.getBoundingClientRect());
            setOpen(true);
        } else {
            setMenuAnchor(null);
            setOpen(false);
        }
    };

    return (
        <div
            ref={triggerRef}
            role="listbox"
            aria-expanded={open}
            className={
                "inline-block relative bg-background-1 border border-background-3 text-foreground-primary " +
                "rounded-md outline-none focus:ring-0 focus:ring-accent focus:border-accent transition-all " +
                (disabled ? "pointer-events-none opacity-50 " : "") +
                className
            }
            tabIndex={0}
        >
            {trigger ? (
                <div onClick={toggleDropdown}>{trigger}</div>
            ) : (
                <div
                    className="cursor-pointer flex justify-between items-center gap-4 text-sm px-4 py-2"
                    onClick={toggleDropdown}
                >
                    <p className="min-w-0 truncate" title={value.text}>
                        {value.text}
                    </p>
                    <div className="shrink-0">
                        <Icon name={open ? "chevron-up" : "chevron-down"} size={16} />
                    </div>
                </div>
            )}

            {open && menuAnchor !== null && (
                <Popover
                    anchor={menuAnchor}
                    position="bottom"
                    offset={4}
                    onClose={() => {
                        setOpen(false);
                        setMenuAnchor(null);
                    }}
                >
                    <div
                        className={
                            "text-sm rounded-md bg-background-1 border border-background-3 text-foreground-primary " +
                            "flex flex-col items-stretch"
                        }
                        style={{ width: menuAnchor.width }}
                    >
                        {options.map((option, _) => {
                            const isSelected = value.value === option.value;
                            return (
                                <div
                                    key={option.id}
                                    aria-checked={isSelected}
                                    aria-selected={isSelected}
                                    role="option"
                                    className={
                                        "px-4 py-2 cursor-pointer hover:bg-foreground-muted/30 " +
                                        (isSelected ? "font-semibold bg-foreground-muted/30" : "")
                                    }
                                    onClick={() => handleSelectOption(option)}
                                >
                                    {option.text}
                                </div>
                            );
                        })}
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default Dropdown;

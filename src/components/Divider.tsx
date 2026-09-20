interface DividerProps {
    className?: string;
    space?: string;
    thickness?: string;
    color?: string;
}

const Divider = ({ className = "", space = "my-2", thickness = "h-0.5", color = "bg-background-3" }: DividerProps) => {
    return <div className={`divider ${thickness} ${space} ${color} ${className}`} />;
};

export default Divider;

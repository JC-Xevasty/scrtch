export interface IconProps {
    name: string;
    color?: string;
    height?: number;
    width?: number;
    size?: number;
    className?: string;
}

const Icon = ({
    name,
    color = "text-foreground-primary",
    height = 24,
    width = 24,
    size,
    className = "",
}: IconProps) => {
    return (
        <svg
            className={`${color} ${className}`}
            height={size !== undefined ? `${size}px` : `${height}px`}
            width={size !== undefined ? `${size}px` : `${width}px`}
            fill="currentColor"
        >
            <use href={`/icons/sprite.svg#${name}`} />
        </svg>
    );
};

export default Icon;

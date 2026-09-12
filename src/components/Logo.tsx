const Logo = ({ className = "", svgClassName = "" }: { className?: string; svgClassName?: string }) => {
    return (
        <div className={`relative ${className}`}>
            <svg
                fill="currentColor"
                viewBox="0 0 90 18"
                className={`h-full w-full text-foreground-primary ${svgClassName}`}
            >
                <use href={`/scrtch.svg#logo`} />
            </svg>
        </div>
    );
};

export default Logo;

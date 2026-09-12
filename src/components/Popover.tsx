import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

import type { PopoverHorizontalAlign, PopoverPosition, PopoverVerticalAlign } from "../types";
import { createPortal } from "react-dom";

interface PopoverProps {
    anchor: DOMRect;
    position: PopoverPosition;
    verticalAlign?: PopoverVerticalAlign;
    horizontalAlign?: PopoverHorizontalAlign;
    offset?: number;
    onClose?: () => void;
    children: ReactNode;
}

const Popover = ({
    anchor,
    position = "bottom",
    verticalAlign = "center",
    horizontalAlign = "center",
    offset = 10,
    onClose,
    children,
}: PopoverProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);
    const [style, setStyle] = useState<CSSProperties>({
        position: "fixed",
        opacity: 0,
        transform: "scale(0.95)",
        transition: "opacity 150ms ease-out, transform 150ms ease-out",
        pointerEvents: "none",
    });

    useLayoutEffect(() => {
        if (!popoverRef.current) return;

        const aWidth = anchor.width;
        const aHeight = anchor.height;
        const pWidth = popoverRef.current.offsetWidth;
        const pHeight = popoverRef.current.offsetHeight;
        const wWidth = window.innerWidth;
        const wHeight = window.innerHeight;

        let finalPosition = position;
        let finalAlignment;

        if (["top", "bottom"].includes(finalPosition)) {
            finalAlignment = horizontalAlign;
        } else if (["left", "right"].includes(finalPosition)) {
            finalAlignment = verticalAlign;
        }

        /*
         * Calculate the available space for all positions
         */

        const spaceTop = anchor.top - offset;
        const spaceBottom = wHeight - anchor.bottom - offset;
        const spaceLeft = anchor.left - offset;
        const spaceRight = wWidth - anchor.right - offset;

        /*
         * Change to the opposite position if there are
         * no available space on the preferred position
         */
        if (finalPosition === "top" && spaceTop < pHeight) {
            finalPosition = "bottom";
        } else if (finalPosition === "bottom" && spaceBottom < pHeight) {
            finalPosition = "top";
        } else if (finalPosition === "left" && spaceLeft < pWidth) {
            finalPosition = "right";
        } else if (finalPosition === "right" && spaceRight < pWidth) {
            finalPosition = "left";
        }

        /*
         * Change alignment if preferred alignment will make the
         * popover exceed the screen
         */

        if (["top", "bottom"].includes(finalPosition)) {
            if (wWidth - anchor.right < pWidth - aWidth) {
                finalAlignment = "right";
            } else if (anchor.left < pWidth - aWidth) {
                finalAlignment = "left";
            }
        } else if (["left", "right"].includes(finalPosition)) {
            if (wHeight - anchor.bottom < pHeight - aHeight) {
                finalAlignment = "bottom";
            } else if (anchor.top < pHeight - aHeight) {
                finalAlignment = "top";
            }
        }

        const verticalAligment: Record<string, number> = {
            top: anchor.top,
            center: anchor.top + anchor.height / 2 - pHeight / 2,
            bottom: anchor.bottom - pHeight,
        };

        const horizontalAlignment: Record<string, number> = {
            left: anchor.left,
            center: anchor.left + anchor.width / 2 - pWidth / 2,
            right: anchor.right - pWidth,
        };

        const coordinates = {
            top: {
                top: anchor.top - pHeight - offset,
                left: horizontalAlignment[finalAlignment ?? "center"],
            },
            bottom: {
                top: anchor.bottom + offset,
                left: horizontalAlignment[finalAlignment ?? "center"],
            },
            left: {
                left: anchor.left - pWidth - offset,
                top: verticalAligment[finalAlignment ?? "center"],
            },
            right: {
                left: anchor.right + offset,
                top: verticalAligment[finalAlignment ?? "center"],
            },
        };

        const { top, left } = coordinates[finalPosition];

        setStyle((prev) => ({ ...prev, top, left, opacity: 1, transform: "scale(1)", pointerEvents: "auto" }));
    }, [anchor, position, verticalAlign, horizontalAlign, offset]);

    useEffect(() => {
        if (onClose === undefined) return;
        
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        

        window.addEventListener("keydown", handleEsc);
        window.addEventListener("scroll", onClose);
        window.addEventListener("resize", onClose);

        return () => {
            window.removeEventListener("keydown", handleEsc);
            window.removeEventListener("scroll", onClose);
            window.removeEventListener("resize", onClose);
        };
    }, [onClose]);

    return createPortal(
        <div className="relative z-10">
            <div className="fixed top-0 left-0 w-svw h-svh" onClick={onClose} />
            <div ref={popoverRef} style={{ ...style }}>
                {children}
            </div>
        </div>,
        document.getElementById("root") ?? document.body,
    );
};

export default Popover;

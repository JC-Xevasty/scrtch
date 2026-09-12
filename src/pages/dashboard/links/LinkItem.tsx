import Icon from "../../../components/Icon";
import type { Link } from "../../../types";

const LinksItem = ({
    title,
    href,
    item_type,
    active,
    handleItemClick,
    handleItemOptionsClick,
}: {
    index: number;
    active: boolean;
    handleItemClick: () => void;
    handleItemOptionsClick: (e: React.MouseEvent<HTMLDivElement>) => void;
} & Link) => {
    return (
        <div
            className={
                (active ? "bg-background-3" : "bg-background-1") +
                " px-4 py-3 text-sm flex justify-between items-center gap-4 w-full"
            }
        >
            {/* Middle Container: Needs min-w-0 to allow children to truncate */}
            <div className="flex items-center gap-4 grow min-w-0 py-2 -my-2" onClick={handleItemClick}>
                {item_type === "folder" && (
                    <>
                        <Icon name="folder" size={16} />
                        <span className="min-w-0 truncate">{title}</span>
                    </>
                )}

                {item_type === "link" && (
                    <>
                        {/* 1. Link Name
                        - flex-1: It wants to take all space by default.
                        - min-w-[80px]: It will never shrink below this.
                        */}
                        <span className="truncate flex-1 min-w-20">{title}</span>

                        {/* 2. URL
                            - flex-[0_1_auto]: 
                                    0 (don't grow if space is empty)
                                    1 (shrink if space is tight)
                                    auto (basis)
                            - min-w-0: Essential for truncation.
                        */}
                        {active && (
                            <span className="text-foreground-secondary truncate flex-[0_1_auto] min-w-0">{href}</span>
                        )}
                    </>
                )}
            </div>

            {/* KEBAB MENU */}
            <div
                className={
                    (active ? "hover:bg-foreground-muted" : "hover:bg-background-3") +
                    " cursor-pointer p-2 -my-2 rounded-md shrink-0"
                }
                onClick={handleItemOptionsClick}
            >
                <Icon name="kebab-menu" size={16} />
            </div>
        </div>
    );
};

export default LinksItem;

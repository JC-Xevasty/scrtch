import { useLocation, useNavigate } from "react-router-dom";
import { DateFormat } from "../../utils/helpers";
import Icon from "../Icon";

import type { Content } from "../../types";

interface ContentListItemProps extends Content {
    showGroup?: boolean;
    showType?: boolean;
    cameFrom: "Dashboard" | "Group";
    handleItemOptionsClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ITEMTYPEICONS = {
    notes: "note",
    lists: "list",
    logs: "calendar-plus",
};

const ContentListItem = ({
    id,
    type,
    title,
    group_title,
    updated_at,
    showGroup = false,
    showType = false,
    cameFrom,
    handleItemOptionsClick,
}: ContentListItemProps) => {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div
            onClick={() => {
                navigate(`/${type}/${encodeURIComponent(id)}`, {
                    state: { from: location.pathname, fromName: cameFrom },
                });
            }}
        >
            <div className="flex flex-row justify-between items-center border-b border-background-3 p-3 hover:bg-background-3 cursor-pointer max-w-full">
                <div className="flex flex-row min-w-0 items-center gap-2">
                    {showType && (
                        <div className="shrink-0">
                            <Icon name={ITEMTYPEICONS[type]} size={20} />
                        </div>
                    )}

                    <p className="min-w-0 truncate" title={title}>
                        {title}
                    </p>

                    {showGroup && (
                        <p
                            className={
                                `truncate py-1 px-2 rounded text-xs border ml-2 ` +
                                (group_title
                                    ? "text-accent border-accent/80 max-w-50"
                                    : " text-accent/60 border border-accent/30")
                            }
                            title={group_title ?? "Ungrouped"}
                        >
                            {group_title ?? "Ungrouped"}
                        </p>
                    )}
                </div>

                <div className="shrink-0 ml-4 flex items-center gap-4">
                    <p className="text-foreground-secondary text-sm tracking-wide shrink-0 ml-4" title={updated_at}>
                        {DateFormat.relativeDate(updated_at)}
                    </p>

                    {handleItemOptionsClick && (
                        <div
                            className={"hover:bg-foreground-muted cursor-pointer p-2 -my-2 rounded-md shrink-0"}
                            onClick={handleItemOptionsClick}
                        >
                            <Icon name="kebab-menu" size={16} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContentListItem;

import { useLocation, useNavigate } from "react-router-dom";
import { DateFormat } from "../../utils/helpers";
import Icon from "../Icon";

import type { Content } from "../../types";

interface ContentGridItemProps extends Content {
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

const ContentGridItem = ({
    id,
    type,
    title,
    group_title,
    updated_at,
    showGroup = false,
    showType = false,
    cameFrom,
    handleItemOptionsClick,
}: ContentGridItemProps) => {
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
            <div className="h-full bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer flex flex-col justify-between gap-4">
                <div>
                    {(showGroup || showType) && (
                        <div className="flex items-start gap-2">
                            <div className="space-y-2 w-fit min-w-0">
                                {showType && <Icon name={ITEMTYPEICONS[type]} size={20} />}
                                {showGroup && (
                                    <p
                                        className={`w-fit max-w-full py-1 px-2 rounded text-xs mb-2 truncate border ${group_title ? "text-accent border-accent max-w-25" : " text-accent/70 border-accent/70"}`}
                                        title={group_title ?? "Ungrouped"}
                                    >
                                        {group_title ?? "Ungrouped"}
                                    </p>
                                )}
                            </div>
                            {handleItemOptionsClick && (
                                <div
                                    className="hover:bg-foreground-muted cursor-pointer p-2 -mt-2 ml-auto -mr-2 rounded-md shrink-0"
                                    onClick={handleItemOptionsClick}
                                >
                                    <Icon name="kebab-menu" size={16} />
                                </div>
                            )}
                        </div>
                    )}
                    <div className="flex items-start gap-2">
                        <p className="line-clamp-2 wrap-break-word" title={title}>
                            {title}
                        </p>

                        {!(showGroup || showType) && handleItemOptionsClick && (
                            <div
                                className="hover:bg-foreground-muted cursor-pointer p-2 -mt-2 ml-auto -mr-2 rounded-md shrink-0"
                                onClick={handleItemOptionsClick}
                            >
                                <Icon name="kebab-menu" size={16} />
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-foreground-secondary text-xs tracking-wide" title={updated_at}>
                    {DateFormat.relativeDate(updated_at)}
                </p>
            </div>
        </div>
    );
};

export default ContentGridItem;

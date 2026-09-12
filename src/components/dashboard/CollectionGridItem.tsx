import { useNavigate } from "react-router-dom";
import { DateFormat } from "../../utils/helpers";
import Icon from "../Icon";

interface CollectionGridItemPropTypes {
    collectionName: string;
    itemId: string;
    itemName: string;
    showGroup?: boolean;
    groupName?: string;
    updatedAt: string;
    handleItemOptionsClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const CollectionGridItem = ({
    collectionName,
    itemId,
    itemName,
    showGroup = false,
    groupName = undefined,
    updatedAt,
    handleItemOptionsClick,
}: CollectionGridItemPropTypes) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/${collectionName}/${encodeURIComponent(itemId)}`)}>
            <div className="h-full bg-background-2 border border-white/10 shadow-md p-4 rounded hover:bg-background-3 hover:border-white/20 cursor-pointer flex flex-col justify-between gap-4">
                <div>
                    {showGroup && (
                        <div className="flex items-center gap-2">
                            <p
                                className={`w-fit max-w-full py-1 px-2 rounded text-xs mb-2 truncate border ${groupName ? "text-accent border-accent max-w-25" : " text-accent/70 border-accent/70"}`}
                                title={groupName}
                            >
                                {groupName ?? "Ungrouped"}
                            </p>
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
                        <p className="line-clamp-2" title={itemName}>
                            {itemName}
                        </p>

                        {!showGroup && handleItemOptionsClick && (
                            <div
                                className="hover:bg-foreground-muted cursor-pointer p-2 -mt-1 ml-auto -mr-2 rounded-md shrink-0"
                                onClick={handleItemOptionsClick}
                            >
                                <Icon name="kebab-menu" size={16} />
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-foreground-secondary text-xs tracking-wide" title={updatedAt}>
                    {DateFormat.relativeDate(updatedAt)}
                </p>
            </div>
        </div>
    );
};

export default CollectionGridItem;

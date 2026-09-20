import { useNavigate } from "react-router-dom";
import { DateFormat } from "../../utils/helpers";
import Icon from "../Icon";

interface CollectionListItemPropTypes {
    collectionName: string;
    itemId: string;
    itemName: string;
    showGroup?: boolean;
    groupName?: string;
    updatedAt: string;
    handleItemOptionsClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const CollectionListItem = ({
    collectionName,
    itemId,
    itemName,
    showGroup = true,
    groupName = undefined,
    updatedAt,
    handleItemOptionsClick,
}: CollectionListItemPropTypes) => {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/${collectionName}/${encodeURIComponent(itemId)}`)}>
            <div className="flex flex-row justify-between items-center border-b border-background-3 p-3 hover:bg-background-3 cursor-pointer max-w-full">
                <div className="flex flex-row min-w-0 items-center">
                    <p className="min-w-0 truncate" title={itemName}>
                        {itemName}
                    </p>

                    {showGroup && (
                        <p
                            className={
                                `truncate py-1 px-2 rounded text-xs border ml-2 ` +
                                (groupName
                                    ? "text-accent border-accent/80 max-w-50"
                                    : " text-accent/60 border border-accent/30")
                            }
                            title={groupName}
                        >
                            {groupName ?? "Ungrouped"}
                        </p>
                    )}
                </div>

                <div className="shrink-0 ml-4 flex items-center gap-4">
                    <p className="text-foreground-secondary text-sm select-none" title={updatedAt}>
                        {DateFormat.relativeDate(updatedAt)}
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

export default CollectionListItem;
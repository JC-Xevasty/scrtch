import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import TextButton from "../TextButton";
import Icon from "../Icon";
import Popover from "../Popover";

import CollectionListItem from "./CollectionListItem";
import CollectionGridItem from "./CollectionGridItem";
import GroupSelector from "./GroupSelector";

import type { Group, List, Log, Note } from "../../types";

import { useToast } from "../../context/toast/ToastContext";

export interface CollectionItem {
    id: string;
    title: string;
    group?: {
        id: string | null;
        name?: string;
    };
    is_pinned_collection: boolean;
    is_pinned_group?: boolean;
    is_pinned_dashboard: boolean;
    updated_at: string;
}

interface CollectionPropTypes {
    collectionName: string;
    items?: CollectionItem[];
    isLoading: boolean;
    error: { message: string } | null;
    onCreate?: () => void;
    showGroup?: boolean;

    // Kebab menu
    itemOptions?: {
        pin_collection?: boolean;
        pin_group?: boolean;
        pin_dashboard?: boolean;
        group?: boolean;
        delete?: boolean;
    };
    updateHook?: {
        updateContent: (data: {
            id: string;
            group_id?: string | null;
            is_pinned_collection?: boolean;
            is_pinned_group?: boolean;
            is_pinned_dashboard?: boolean;
        }) => Promise<Note | List | Log | Group>;
        isLoading: boolean;
    };
}

const Collection = ({
    collectionName,
    items = [],
    isLoading = false,
    error = null,
    onCreate,
    showGroup = true,
    itemOptions = {
        pin_collection: false,
        pin_group: false,
        pin_dashboard: false,
        group: false,
        delete: false,
    },
    updateHook,
}: CollectionPropTypes) => {
    const { showToast } = useToast();

    const pinnedItems = useMemo(() => {
        if (items.length === 0) return [];
        return items.filter((item) => item.is_pinned_collection === true);
    }, [items]);

    const [view, setView] = useState("list");

    const [selectedItem, setSelectedItem] = useState<CollectionItem | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);

    const handleItemOptionsClick = (e: React.MouseEvent<HTMLDivElement>, item: CollectionItem) => {
        e.stopPropagation();
        if (isLoading) return;

        setSelectedItem(item);
        setPopoverAnchor(e.currentTarget.getBoundingClientRect());
    };

    const handleChangePinnedStatus = async (
        e: React.MouseEvent<HTMLDivElement>,
        pin_key: "is_pinned_collection" | "is_pinned_group" | "is_pinned_dashboard",
    ) => {
        e.stopPropagation();
        if (!selectedItem || !updateHook) return;
        try {
            let submitData = {
                id: selectedItem.id,
                [pin_key]: !selectedItem[pin_key],
            };

            await updateHook.updateContent(submitData);

            setPopoverAnchor(null);
            setSelectedItem(null);
        } catch (error: any) {
            showToast(error.message, error.status);
        }
    };

    return (
        <div>
            <div className="flex flex-row justify-between items-center py-8 -mt-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="font-medium flex items-center gap-4">
                    <h1 className="text-4xl align-middle uppercase">{collectionName}</h1>
                    {!isLoading && (
                        <div className="align-middle bg-accent p-2 rounded-full min-w-10 text-center">
                            {items.length}
                        </div>
                    )}
                </div>
                {onCreate !== undefined ? (
                    <TextButton onClick={onCreate} disabled={isLoading}>
                        <span className="capitalize">New {collectionName.slice(0, -1)}</span>
                    </TextButton>
                ) : (
                    <Link to={`/${collectionName}/new`}>
                        <TextButton disabled={isLoading}>
                            <span className="capitalize">New {collectionName.slice(0, -1)}</span>
                        </TextButton>
                    </Link>
                )}
            </div>
            <br />

            {isLoading ? (
                <p>Loading....</p>
            ) : (
                <>
                    {pinnedItems.length > 0 && (
                        <>
                            <h2 className="font-medium border-b-4 border-background-3 pb-2 px-3 capitalize mb-4">
                                Pinned {collectionName}
                            </h2>
                            <div className="grid grid-cols-4 gap-4 mb-4">
                                {pinnedItems.map((item) => {
                                    return (
                                        <CollectionGridItem
                                            key={item.id}
                                            collectionName={collectionName}
                                            itemId={item.id}
                                            itemName={item.title}
                                            updatedAt={item.updated_at}
                                            groupName={item.group?.name}
                                            showGroup={showGroup}
                                            handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                        />
                                    );
                                })}
                            </div>
                            <br />
                        </>
                    )}

                    <div className="border-b-4 border-background-3 pb-2 px-3 mb-4 flex flex-row justify-between items-center">
                        <h2 className="font-medium capitalize">All {collectionName}</h2>
                        <div className="flex items-center gap-2">
                            {/* ADD SEARCH */}
                            {/* ADD SORT */}
                            <div onClick={() => setView("list")}>
                                <Icon
                                    name="view-list"
                                    size={16}
                                    className="cursor-pointer"
                                    color={view === "list" ? "text-accent" : "text-foreground-secondary"}
                                />
                            </div>
                            <div onClick={() => setView("grid")}>
                                <Icon
                                    name="view-grid"
                                    size={18}
                                    className="cursor-pointer"
                                    color={view === "grid" ? "text-accent" : "text-foreground-secondary"}
                                />
                            </div>
                        </div>
                    </div>

                    {error !== null && (
                        <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                            <p className="text-center">
                                Failed to load {collectionName}: {error.message}
                            </p>
                        </div>
                    )}

                    {items.length === 0 && (
                        <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                            No {collectionName}
                        </p>
                    )}

                    {items.length > 0 && view === "grid" && (
                        <div className="grid grid-cols-4 gap-4">
                            {items.map((item) => {
                                return (
                                    <CollectionGridItem
                                        key={item.id}
                                        collectionName={collectionName}
                                        itemId={item.id}
                                        itemName={item.title}
                                        updatedAt={item.updated_at}
                                        groupName={item.group?.name}
                                        showGroup={showGroup}
                                        handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {items.length > 0 && view === "list" && (
                        <div>
                            {items.map((item) => {
                                return (
                                    <CollectionListItem
                                        key={item.id}
                                        collectionName={collectionName}
                                        itemId={item.id}
                                        itemName={item.title}
                                        updatedAt={item.updated_at}
                                        groupName={item.group?.name}
                                        showGroup={showGroup}
                                        handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {popoverAnchor !== null && updateHook && (
                <Popover
                    anchor={popoverAnchor}
                    position="bottom"
                    horizontalAlign="right"
                    offset={0}
                    onClose={() => {
                        if (updateHook?.isLoading) return;
                        setPopoverAnchor(null);
                        setSelectedItem(null);
                    }}
                >
                    <div
                        className={
                            "bg-background-3 border border-white/20 shadow-xl text-xs text-foreground-primary select-none px-4 py-2 rounded-md " +
                            (updateHook?.isLoading ? "opacity-70" : "")
                        }
                    >
                        {itemOptions.pin_collection && updateHook && selectedItem && (
                            <div
                                className={
                                    "px-4 py-2 -mx-4 " +
                                    (updateHook.isLoading
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-foreground-muted/30")
                                }
                                onClick={(e) => handleChangePinnedStatus(e, "is_pinned_collection")}
                            >
                                {!selectedItem.is_pinned_collection ? "Pin to Collection" : "Unpin from Collection"}
                            </div>
                        )}
                        {itemOptions.pin_group && updateHook && selectedItem && (
                            <div
                                className={
                                    "px-4 py-2 -mx-4 " +
                                    (updateHook.isLoading
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-foreground-muted/30")
                                }
                                onClick={(e) => handleChangePinnedStatus(e, "is_pinned_group")}
                            >
                                {!selectedItem.is_pinned_group ? "Pin to Group" : "Unpin from Group"}
                            </div>
                        )}
                        {itemOptions.pin_dashboard && updateHook && selectedItem && (
                            <div
                                className={
                                    "px-4 py-2 -mx-4 " +
                                    (updateHook.isLoading
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-foreground-muted/30")
                                }
                                onClick={(e) => handleChangePinnedStatus(e, "is_pinned_dashboard")}
                            >
                                {!selectedItem.is_pinned_dashboard ? "Pin to Dashboard" : "Unpin from Dashboard"}
                            </div>
                        )}
                        {itemOptions.group && updateHook && selectedItem?.group && (
                            <GroupSelector
                                contentId={selectedItem.id}
                                currentGroup={{
                                    id: selectedItem.group.id,
                                    name: selectedItem.group.name ?? "Ungrouped",
                                }}
                                updateHook={{
                                    updateContent: async (data) => {
                                        await updateHook.updateContent(data);
                                        setPopoverAnchor(null);
                                        setSelectedItem(null);
                                    },
                                    isLoading: updateHook.isLoading,
                                }}
                                trigger={
                                    <div
                                        className={
                                            "px-4 py-2 -mx-4 " +
                                            (updateHook.isLoading
                                                ? "cursor-not-allowed"
                                                : "cursor-pointer hover:bg-foreground-muted/30")
                                        }
                                    >
                                        <span>Move to Group / Ungroup</span>
                                    </div>
                                }
                            />
                        )}
                    </div>
                </Popover>
            )}
        </div>
    );
};

export default Collection;

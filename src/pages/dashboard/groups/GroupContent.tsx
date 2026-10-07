import { useMemo, useState } from "react";

import Icon from "../../../components/Icon";
import Popover from "../../../components/Popover";

import ContentGridItem from "../../../components/dashboard/ContentGroupItem";
import ContentListItem from "../../../components/dashboard/ContentListItem";
import GroupSelector from "../../../components/dashboard/GroupSelector";

import type { Content } from "../../../types";

import { useToast } from "../../../context/toast/ToastContext";
import { useListMutation } from "../../../hooks/dashboard/useLists";
import { useLogMutation } from "../../../hooks/dashboard/useLogs";
import { useNoteMutation } from "../../../hooks/dashboard/useNotes";

const ItemsTypePill = ({
    label,
    isActive,
    handleClick,
}: {
    label: string;
    isActive: boolean;
    handleClick: () => void;
}) => {
    return (
        <div
            className={
                (isActive ? "text-white bg-accent hover:bg-accent/80" : "text-accent hover:bg-accent/20") +
                " border border-accent px-2 py-1 text-sm rounded-md cursor-pointer font-medium select-none"
            }
            onClick={handleClick}
        >
            {label}
        </div>
    );
};

interface GroupContentProps {
    items: Content[];
    isLoading: boolean;
}

const GroupContent = ({ isLoading, items }: GroupContentProps) => {
    const { showToast } = useToast();

    // Initialize all contents of group
    const groupContent = useMemo(() => {
        if (!items) return [];
        if (items.length === 0) return [];

        let allContent = [...items];
        allContent.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

        return allContent;
    }, [items]);

    const pinnedItems = useMemo(() => {
        if (items.length === 0) return [];
        return items.filter((item) => item.is_pinned_group === true);
    }, [items]);

    const [view, setView] = useState("list");

    // Update which content are currently displayed based on filter
    const [filterItemTypes, setFilterItemTypes] = useState<string[]>(["all"]);
    const displayedItems = useMemo(() => {
        if (!groupContent || groupContent.length === 0) return [];

        if (filterItemTypes.includes("all")) return groupContent;

        return groupContent.filter((item) => filterItemTypes.includes(item.type));
    }, [groupContent, filterItemTypes]);

    const handleFilterType = (value: string) => {
        if (filterItemTypes.includes(value) && filterItemTypes.length === 1) return;
        // Single selection
        setFilterItemTypes([value]);

        // Multi-select
        /*  *
        if (value === "all") {
            setFilterItemTypes(["all"]);
        } else if (filterItemTypes.includes("all")) {
            setFilterItemTypes([value]);
        } else {
            setFilterItemTypes((prev) => {
                if (prev.includes(value)) {
                    return prev.filter((type) => type !== value);
                } else {
                    return [...prev, value];
                }
            });
        }
        /*  */
    };

    const { updateNote, isUpdating: isNoteUpdating } = useNoteMutation();
    const { updateListRecord, isUpdating: isListUpdating } = useListMutation();
    const { updateLogRecord, isUpdating: isLogUpdating } = useLogMutation();

    const isContentUpdating = isNoteUpdating || isListUpdating || isLogUpdating;

    const [selectedItem, setSelectedItem] = useState<Content | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);

    const handleItemOptionsClick = (e: React.MouseEvent<HTMLDivElement>, item: Content) => {
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
        if (!selectedItem || isContentUpdating) return;

        try {
            let submitData = {
                id: selectedItem.id,
                [pin_key]: !selectedItem[pin_key],
            };

            let updateHook;
            if (selectedItem.type === "notes") {
                updateHook = updateNote;
            } else if (selectedItem.type === "lists") {
                updateHook = updateListRecord;
            } else if (selectedItem.type === "logs") {
                updateHook = updateLogRecord;
            } else {
                return;
            }

            await updateHook(submitData);

            setPopoverAnchor(null);
            setSelectedItem(null);
        } catch (error: any) {
            showToast(error.message, error.status);
        }
    };

    return (
        <div>
            {isLoading ? (
                <p>Loading....</p>
            ) : (
                <>
                    {pinnedItems.length > 0 && (
                        <>
                            <h2 className="font-medium border-b-4 border-background-3 pb-2 px-3 capitalize mb-4">
                                Pinned Items
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                                {pinnedItems.map((item) => {
                                    return (
                                        <ContentGridItem
                                            key={item.id}
                                            {...item}
                                            cameFrom="Group"
                                            showType={true}
                                            handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                        />
                                    );
                                })}
                            </div>
                            <br />
                        </>
                    )}

                    <div className="mb-4 flex flex-row justify-between items-center">
                        <h2 className="font-medium select-none">All Items</h2>
                        <div className="flex items-center gap-2">
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

                    <div className="border-b-4 border-background-3 pb-2 mb-4 flex items-center gap-2">
                        <ItemsTypePill
                            label="All Items"
                            isActive={filterItemTypes.includes("all")}
                            handleClick={() => handleFilterType("all")}
                        />
                        <ItemsTypePill
                            label="Notes"
                            isActive={filterItemTypes.includes("notes")}
                            handleClick={() => handleFilterType("notes")}
                        />
                        <ItemsTypePill
                            label="Lists"
                            isActive={filterItemTypes.includes("lists")}
                            handleClick={() => handleFilterType("lists")}
                        />
                        <ItemsTypePill
                            label="Logs"
                            isActive={filterItemTypes.includes("logs")}
                            handleClick={() => handleFilterType("logs")}
                        />
                    </div>

                    {displayedItems.length === 0 && (
                        <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                            No items
                        </p>
                    )}

                    {displayedItems.length > 0 && view === "grid" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {displayedItems.map((item) => {
                                return (
                                    <ContentGridItem
                                        key={item.id}
                                        {...item}
                                        cameFrom="Group"
                                        showType={filterItemTypes.includes("all") || filterItemTypes.length > 1}
                                        handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                    />
                                );
                            })}
                        </div>
                    )}

                    {displayedItems.length > 0 && view === "list" && (
                        <div className="-mt-4">
                            {displayedItems.map((item) => {
                                return (
                                    <ContentListItem
                                        key={item.id}
                                        {...item}
                                        cameFrom="Group"
                                        showType={filterItemTypes.includes("all") || filterItemTypes.length > 1}
                                        handleItemOptionsClick={(e) => handleItemOptionsClick(e, item)}
                                    />
                                );
                            })}
                        </div>
                    )}
                </>
            )}

            {popoverAnchor !== null && (
                <Popover
                    anchor={popoverAnchor}
                    position="bottom"
                    horizontalAlign="right"
                    offset={0}
                    onClose={() => {
                        if (isContentUpdating) return;
                        setPopoverAnchor(null);
                        setSelectedItem(null);
                    }}
                >
                    <div
                        className={
                            "bg-background-3 border border-white/20 shadow-xl text-xs text-foreground-primary select-none px-4 py-2 rounded-md " +
                            (isContentUpdating ? "opacity-70" : "")
                        }
                    >
                        {selectedItem && (
                            <div
                                className={
                                    "px-4 py-2 -mx-4 " +
                                    (isContentUpdating
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-foreground-muted/30")
                                }
                                onClick={(e) => handleChangePinnedStatus(e, "is_pinned_group")}
                            >
                                {!selectedItem.is_pinned_group ? "Pin to Group" : "Unpin from Group"}
                            </div>
                        )}
                        {selectedItem && (
                            <div
                                className={
                                    "px-4 py-2 -mx-4 " +
                                    (isContentUpdating
                                        ? "cursor-not-allowed"
                                        : "cursor-pointer hover:bg-foreground-muted/30")
                                }
                                onClick={(e) => handleChangePinnedStatus(e, "is_pinned_dashboard")}
                            >
                                {!selectedItem.is_pinned_dashboard ? "Pin to Dashboard" : "Unpin from Dashboard"}
                            </div>
                        )}
                        {selectedItem && (
                            <GroupSelector
                                contentId={selectedItem.id}
                                currentGroup={{
                                    id: selectedItem.group_id,
                                    name: selectedItem.group_title ?? "Ungrouped",
                                }}
                                updateHook={{
                                    updateContent: async (data) => {
                                        let updateHook;
                                        if (selectedItem.type === "notes") {
                                            updateHook = updateNote;
                                        } else if (selectedItem.type === "lists") {
                                            updateHook = updateListRecord;
                                        } else if (selectedItem.type === "logs") {
                                            updateHook = updateLogRecord;
                                        } else {
                                            return;
                                        }

                                        await updateHook(data);
                                        setPopoverAnchor(null);
                                        setSelectedItem(null);
                                    },
                                    isLoading: isContentUpdating,
                                }}
                                trigger={
                                    <div
                                        className={
                                            "px-4 py-2 -mx-4 " +
                                            (isContentUpdating
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

export default GroupContent;

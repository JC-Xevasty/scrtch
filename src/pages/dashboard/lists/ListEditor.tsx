import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Icon from "../../../components/Icon";
import TextButton from "../../../components/TextButton";
import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import TextBlock from "../../../components/TextBlock";

import type { ListCreate, ListItemDelete, ListItemUpdate, ListUpdate } from "../../../types";

import { useAuth } from "../../../context/auth/AuthContext";
import { useToast } from "../../../context/toast/ToastContext";
import { useList, useListMutation } from "../../../hooks/dashboard/useLists";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const NEWITEMINDICATOR = "~NEW~";

const ToolBar = ({
    actions,
    disabled = false,
    className,
}: {
    actions: { label: string; icon: string; onClick: () => void }[];
    disabled: boolean;
    className?: string;
}) => {
    if (disabled) return <></>;

    return (
        <div className={`flex items-center shadow-md h-8 select-none ${className}`}>
            {actions.map((action, index, arr) => {
                let rounded = "";

                if (arr.length === 1) rounded = "rounded-t-sm";
                else if (index === 0) rounded = "rounded-tl-sm";
                else if (index === arr.length - 1) rounded = "rounded-tr-sm";

                return (
                    <div
                        key={index}
                        className={
                            "h-full text-xs px-2.5 py-1 flex items-center justify-center gap-1 cursor-pointer " +
                            "bg-background-2 hover:bg-foreground-muted border border-foreground-muted/50 " +
                            rounded
                        }
                        onClick={action.onClick}
                    >
                        <Icon name={action.icon} size={16} className="shrink-0" />
                        <span className="whitespace-nowrap">{action.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const ListEditorItem = ({
    index,
    id,
    title = "",
    content = "",
    disabled = false,
    handleAddItem,
    handleRemoveItem,
    handleChangeOrder,
    handleUpdateItem,
}: {
    index: number;
    id?: string;
    title: string;
    content: string;
    disabled: boolean;
    handleAddItem: (index: number) => void;
    handleRemoveItem: (index: number) => void;
    handleChangeOrder: (prevIndex: number, newIndex: number) => void;
    handleUpdateItem: (index: number, key: "title" | "content", newValue: string) => void;
}) => {
    const [showContent, setShowContent] = useState(content.length > 0);

    return (
        <>
            <div className="flex gap-4 relative">
                <div className="flex flex-col items-center gap-4">
                    <div
                        className={
                            "bg-background-2 p-1 h-6 w-6 rounded-md flex items-center justify-center select-none " +
                            (disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-foreground-muted")
                        }
                        onClick={disabled ? undefined : () => handleChangeOrder(index, index - 1)}
                    >
                        <Icon name="chevron-up" />
                    </div>
                    <div
                        className={
                            "bg-background-2 p-1 h-6 w-6 rounded-md flex items-center justify-center select-none " +
                            (disabled ? "cursor-not-allowed" : "cursor-pointer hover:bg-foreground-muted")
                        }
                        onClick={disabled ? undefined : () => handleChangeOrder(index, index + 1)}
                    >
                        <Icon name="chevron-down" />
                    </div>
                </div>
                <div className="absolute top-0 -translate-y-full right-0 max-w-full pl-10">
                    <ToolBar
                        className="overflow-x-auto"
                        disabled={disabled}
                        actions={[
                            {
                                label: "Top",
                                icon: "plus",
                                onClick: () => handleAddItem(index),
                            },
                            {
                                label: "Bottom",
                                icon: "plus",
                                onClick: () => handleAddItem(index + 1),
                            },
                            {
                                label: showContent ? "Remove Content" : "Add Content",
                                icon: showContent ? "chevrons-northwest" : "chevrons-southeast",
                                onClick: () => {
                                    if (!showContent) {
                                        setShowContent(true);
                                    } else {
                                        setShowContent(false);
                                        handleUpdateItem(index, "content", "");
                                    }
                                },
                            },
                            {
                                label: "Remove",
                                icon: "trash",
                                onClick: () => handleRemoveItem(index),
                            },
                        ]}
                    />
                </div>
                <TextBlock
                    id={`title-${id}`}
                    className="grow py-4 flex items-center rounded-tr-none"
                    value={title}
                    onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                    disabled={disabled}
                />
            </div>

            {showContent && (
                <div className="flex items-center mt-4">
                    <TextBlock
                        id={`content-${id}`}
                        className="grow bg-background-3 border border-white/20 shadow-sm rounded-md py-4 ml-12 sm:ml-16"
                        value={content}
                        onChange={(e) => handleUpdateItem(index, "content", e.target.value)}
                        disabled={disabled}
                    />
                </div>
            )}
        </>
    );
};

const ListEditor = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();
    const { showToast } = useToast();
    useUnsavedChanges();

    const { data: list, isLoading, error } = useList(id);
    const { createList, isCreating, updateList, isUpdating } = useListMutation();
    const [listForm, setListForm] = useState<Pick<ListCreate, "title" | "list_type" | "group_id">>({
        title: "",
        list_type: "unordered",
        group_id: null,
    });

    const [listItems, setListItems] = useState<ListItemUpdate[]>([
        { id: `${NEWITEMINDICATOR}0`, title: "", content: "", item_order: 0 },
    ]);
    const listItemCounter = useRef(listItems.length);

    useEffect(() => {
        if (list) {
            const { title, list_type, group_id, list_items } = list;
            setListForm({ title, list_type, group_id });

            listItemCounter.current = list_items.length;
            setListItems(
                list_items.map((v) => ({ id: v.id, title: v.title, content: v.content, item_order: v.item_order })),
            );
        }
    }, [list]);

    const [removedItems, setRemovedItems] = useState<ListItemUpdate[]>([]);

    // Update title or content of a list item by index
    const updateListItem = (index: number, key: "title" | "content", value: string) => {
        setListItems((prev) => {
            let newValue = [...prev];

            newValue[index] = { ...newValue[index], [key]: value };

            return newValue;
        });
    };

    const handleAddItem = (index: number) => {
        const newItem: ListItemUpdate = {
            id: NEWITEMINDICATOR + listItemCounter.current,
            title: "",
            content: "",
        };

        setListItems((prev) => {
            return [...prev.slice(0, index), newItem, ...prev.slice(index)];
        });

        listItemCounter.current += 1;
    };

    const handleRemoveItem = (index: number) => {
        const itemToBeRemoved = listItems[index];

        // Track which items are to be deleted from database
        if (!itemToBeRemoved.id?.startsWith(NEWITEMINDICATOR)) {
            setRemovedItems((prev) => [...prev, itemToBeRemoved]);
        }

        // If the last item to be removed, add a blank list item
        if (listItems.length === 1) {
            setListItems([
                {
                    id: NEWITEMINDICATOR + listItemCounter.current,
                    title: "",
                    content: "",
                    item_order: 0,
                },
            ]);
            listItemCounter.current += 1;
            return;
        }

        // Remove the list item
        setListItems((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleChangeOrder = (prevIndex: number, newIndex: number) => {
        if (listItems.length === 1) return;
        if (newIndex < 0 && newIndex >= listItems.length) return;

        setListItems((prev) => {
            let newList = [...prev];

            // Remove the item from current position, and store in variable
            const removedItem = newList.splice(prevIndex, 1)[0];

            // Put the item in the new position
            newList.splice(newIndex, 0, removedItem);

            return newList;
        });
    };

    const handleSave = () => {
        if (!id) return;

        if (id === "new") handleCreateList();
        else handleUpdateList();
    };

    const validateForm = () => {
        let valid = true;

        if (listForm.title.trim().length === 0) {
            valid = false;
            showToast("List title required.", "error");
        }

        if (!["unordered", "ordered"].includes(listForm.list_type)) {
            valid = false;
            showToast("Must select list type.", "error");
        }

        if (listItems.every((item) => item.title.trim().length === 0)) {
            valid = false;
            showToast("List items required.", "error");
        }

        if (listItems.some((item) => item.title.trim().length === 0)) {
            valid = false;
            showToast("List items must have a main description.", "error");
        }

        return valid;
    };

    const handleCreateList = async () => {
        if (!validateForm()) return;

        try {
            let submitData: ListCreate = {
                ...listForm,
                list_items: listItems.map((item, index) => ({
                    title: item.title,
                    content: item.content,
                    item_order: index + 1,
                })),
            };

            const response = await createList(submitData);
            showToast("List created successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/lists/${response.id}/view`);
            } else if (profile?.post_save_action === "stay") {
                navigate(`/lists/${response.id}/edit`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleUpdateList = async () => {
        if (!id || !validateForm()) return;

        try {
            let new_items: ListItemUpdate[] = [];
            let existing_items: ListItemUpdate[] = [];

            for (const [index, item] of listItems.entries()) {
                if (item.id?.startsWith(NEWITEMINDICATOR)) {
                    new_items.push({
                        title: item.title,
                        content: item.content,
                        item_order: index + 1,
                    });
                } else {
                    existing_items.push({ ...item, item_order: index + 1 });
                }
            }

            const removed_items: ListItemDelete[] = removedItems.map((i) => ({ id: i.id! }));

            const submitData: ListUpdate = {
                id,
                ...listForm,
                new_list_items: new_items,
                existing_list_items: existing_items,
                removed_list_items: removed_items,
            };

            const response = await updateList(submitData);
            showToast("List updated successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/lists/${response.id}/view`);
            } else if (profile?.post_save_action === "stay") {
                navigate(`/lists/${response.id}/edit`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleCancel = () => {
        if (isCreating || isUpdating) return;

        if (id === "new") {
            navigate(location.state?.from ?? "/lists", { replace: true });
        } else {
            navigate(`/lists/${id}/view`, { state: location.state });
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3 z-10">
                <div className="flex flex-row items-center gap-4">
                    {isLoading || isCreating || isUpdating ? (
                        <div>
                            <Icon name="arrow-left " />
                        </div>
                    ) : (
                        <Link to={location.state?.from ?? "/lists"}>
                            <Icon name="arrow-left " />
                        </Link>
                    )}
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Lists"}</span>
                </div>

                {(id === "new" || list) && (
                    <div className="flex flex-row items-center gap-4">
                        <TextButton
                            variant="neutral"
                            onClick={handleCancel}
                            disabled={isLoading || isCreating || isUpdating}
                        >
                            <span>Cancel</span>
                        </TextButton>

                        <TextButton onClick={handleSave} disabled={isLoading || isCreating || isUpdating}>
                            <span>Save</span>
                        </TextButton>
                    </div>
                )}
            </div>

            {isLoading ? (
                <p>Loading....</p>
            ) : id !== "new" && error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load list details for editing: {error.message}</p>
                </div>
            ) : id !== "new" && !list ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load list details for editing: List does not exist.</p>
                </div>
            ) : (
                <>
                    <FieldLabel htmlFor="title" className="mb-4">
                        List Title
                    </FieldLabel>
                    <TextInput
                        id="title"
                        className="w-full mb-4"
                        value={listForm.title}
                        onChange={(e) => setListForm((prev) => ({ ...prev, title: e.target.value }))}
                        disabled={isCreating || isUpdating}
                    />

                    <FieldLabel className="mb-4">List Type</FieldLabel>
                    <div className="flex gap-4 items-center mb-8">
                        <TextButton
                            variant={listForm.list_type === "unordered" ? "primary" : "ghost"}
                            onClick={() => {
                                if (listForm.list_type !== "unordered") {
                                    setListForm((prev) => ({ ...prev, list_type: "unordered" }));
                                }
                            }}
                            disabled={isCreating || isUpdating}
                        >
                            <span>Unordered</span>
                        </TextButton>

                        <TextButton
                            variant={listForm.list_type === "ordered" ? "primary" : "ghost"}
                            onClick={() => {
                                if (listForm.list_type !== "ordered") {
                                    setListForm((prev) => ({ ...prev, list_type: "ordered" }));
                                }
                            }}
                            disabled={isCreating || isUpdating}
                        >
                            <span>Ordered</span>
                        </TextButton>
                    </div>

                    <FieldLabel className="mb-8 md:mb-4">List Items</FieldLabel>
                    <div className="space-y-14 my-4 py-4 text-sm">
                        {listItems.map((listItem, index) => {
                            return (
                                <div key={listItem.id}>
                                    <ListEditorItem
                                        index={index}
                                        {...listItem}
                                        disabled={isCreating || isUpdating}
                                        handleAddItem={handleAddItem}
                                        handleRemoveItem={handleRemoveItem}
                                        handleUpdateItem={updateListItem}
                                        handleChangeOrder={handleChangeOrder}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ListEditor;

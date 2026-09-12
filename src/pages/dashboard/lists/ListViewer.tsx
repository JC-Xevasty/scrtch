import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IconButton from "../../../components/IconButton";
import Modal from "../../../components/Modal";
import Icon from "../../../components/Icon";
import type { ListItem, ListType } from "../../../types";
import { useToast } from "../../../context/toast/ToastContext";
import { useList, useListMutation } from "../../../hooks/useLists";
import GroupSelector from "../../../components/dashboard/GroupSelector";

const ListItem = ({ list_type, title, content, item_order }: { list_type?: ListType } & ListItem) => {
    const [showContent, setShowContent] = useState(false);

    const hasContent = content.length > 0;

    return (
        <>
            <div className="flex gap-4">
                <div className="flex flex-col justify-between items-center w-6">
                    <div className="font-semibold text-md bg-background-3 p-1 h-6 w-6 rounded-md flex items-center justify-center select-none">
                        {list_type === "ordered" && <>{item_order}</>}
                        {list_type === "unordered" && <>•</>}
                    </div>
                    {hasContent && (
                        <div
                            className="cursor-pointer mb-1 select-none"
                            onClick={() => setShowContent((prev) => !prev)}
                            title={showContent ? "hide content" : "show content"}
                        >
                            <Icon
                                name={`chevrons-${showContent ? "northwest" : "southeast"}`}
                                className="hover:text-foreground-secondary"
                                size={16}
                            />
                        </div>
                    )}
                </div>
                <div className="grow bg-background-1 border border-background-3 shadow-sm rounded-md p-4 ">
                    <p className="whitespace-pre-wrap">{title}</p>
                </div>
            </div>
            {hasContent && showContent && (
                <>
                    <div className="flex items-start gap-2 mt-4">
                        <div
                            className="border-l-2 border-b-2 border-background-3 rounded-bl-md w-10 h-6 ml-3 hover:border-background-2 cursor-pointer"
                            onClick={() => setShowContent((prev) => !prev)}
                        />
                        <div className="grow bg-background-3 border border-white/20 shadow-sm rounded-md p-4 whitespace-pre-wrap">
                            {content}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

const ListViewer = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { data: list, isLoading, error } = useList(id);
    const { updateListRecord, isUpdating, deleteList, isDeleting } = useListMutation();

    const { listItems, groupName } = useMemo(() => {
        if (!list) return { listItems: [], groupName: "Ungrouped" };

        const groupName = list.groups?.title ?? "Ungrouped";
        const listItems = list.list_items;

        return { listItems, groupName };
    }, [list]);

    const handleDeleteList = async () => {
        if (!id) return;

        try {
            await deleteList(id);

            showToast("List deleted successfully.", "success");
            // Navigate back to group or lists collection page
            navigate(location.state?.from ?? "/lists", { replace: true });
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="flex flex-row items-center gap-4">
                    <Link to={location.state?.from ?? "/lists"}>
                        <Icon name="arrow-left " />
                    </Link>
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Lists"}</span>
                </div>
                {list && (
                    <div className="flex flex-row items-center gap-4">
                        <Link to={`/lists/${id}/edit`} state={location.state}>
                            <IconButton variant="ghost" icon={{ name: "pencil" }} disabled={isLoading}>
                                <span>Edit</span>
                            </IconButton>
                        </Link>

                        <Modal
                            trigger={
                                <IconButton variant="error-ghost" icon={{ name: "trash" }} disabled={isLoading}>
                                    <span>Delete</span>
                                </IconButton>
                            }
                            title="Delete List?"
                            confirmAction={{
                                variant: "error",
                                text: isDeleting ? "Deleting List..." : "Delete List",
                            }}
                            onConfirm={handleDeleteList}
                        >
                            <p>Are you sure you want to delete this list? This cannot be undone.</p>
                        </Modal>
                        <IconButton variant="neutral-ghost" icon={{ name: "info" }} disabled={isLoading} />
                    </div>
                )}
            </div>

            {isLoading ? (
                <p>Loading....</p>
            ) : error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load list details: {error.message}</p>
                </div>
            ) : !list ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load list details: List does not exist.</p>
                </div>
            ) : (
                <>
                    {/* LIST TITLE */}
                    <h1 className="font-medium text-4xl mb-4">{list?.title}</h1>

                    {/* LIST GROUP */}
                    <div className="flex flex-row justify-between max-w-full">
                        <GroupSelector
                            contentId={list.id}
                            currentGroup={{ id: list.group_id, name: groupName }}
                            updateHook={{ updateContent: updateListRecord, isLoading: isUpdating }}
                            triggerClassname="min-w-0 max-w-[500px]"
                        />
                    </div>

                    {/* LIST ITEMS */}
                    <div className="space-y-4 my-4 py-4 text-sm">
                        {listItems.length === 0 && (
                            <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                                No list items
                            </p>
                        )}

                        {listItems.length > 0 &&
                            listItems.map((listItem, index) => {
                                return (
                                    <div key={index}>
                                        <ListItem list_type={list?.list_type} {...listItem} />
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </div>
    );
};

export default ListViewer;

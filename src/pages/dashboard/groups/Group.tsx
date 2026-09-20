import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import Icon from "../../../components/Icon";
import IconButton from "../../../components/IconButton";
import Modal from "../../../components/Modal";
import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import TextBlock from "../../../components/TextBlock";
import Checkbox from "../../../components/Checkbox";

import GroupContent from "./GroupContent";

import type { GroupDelete, GroupUpdate } from "../../../types";

import { useToast } from "../../../context/toast/ToastContext";
import { useGroup, useGroupMutation } from "../../../hooks/useGroups";

const DELETENORMAL = false;
const DELETECASCADE = true;

const Group = () => {
    const { id = "" } = useParams<{ id: string }>();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const { data: group, isLoading, error } = useGroup(id);
    const { updateGroup, isUpdating, deleteGroup, isDeleting } = useGroupMutation();

    /*
     * UPDATING THE GROUP
     */

    // Initialize edit form
    const [groupForm, setGroupForm] = useState<GroupUpdate>({ title: "", description: "" });
    useEffect(() => {
        if (group) {
            setGroupForm({ title: group.title, description: group.description });
        }
    }, [group]);

    const handleChange = (key: string, value: string) => {
        setGroupForm((prev) => ({ ...prev, [key]: value }));
    };

    const resetForm = () => {
        if (!group) return;
        setGroupForm({ title: group.title, description: group.description });
    };

    const validateForm = () => {
        let valid = true;

        if (groupForm.title?.trim().length === 0) {
            valid = false;
            showToast("Group title required.", "error");
        }

        return valid;
    };

    const handleUpdateGroup = async () => {
        // Error thrown so that modal does not close
        if (!validateForm()) throw null;

        try {
            let submitData: { id: string } & GroupUpdate = { id, ...groupForm };

            await updateGroup(submitData);
            showToast("Group updated successfully.", "success");
        } catch (error: any) {
            showToast(error.message, "error");
            // Error thrown so that modal does not close
            throw error;
        }
    };

    /*
     * DELETING THE GROUP
     */

    const [deleteMode, setDeleteMode] = useState<boolean>(DELETENORMAL);

    const handleDelete = async () => {
        if (!id) return;

        try {
            const args: GroupDelete = { id, delete_contents: deleteMode };
            await deleteGroup(args);

            showToast(`Group ${deleteMode === DELETECASCADE ? "and its content" : ""} deleted successfully`, "success");
            navigate("/groups", { replace: true });
        } catch (error: any) {
            showToast(error.message, "error");
            // Error thrown so that modal does not close
            throw error;
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="flex flex-row items-center gap-4">
                    <Link to="/groups">
                        <Icon name="arrow-left " />
                    </Link>
                    <span className="font-semibold text-lg">Groups</span>
                </div>
                {group && (
                    <div className="flex flex-row items-center gap-4">
                        <Modal
                            trigger={
                                <IconButton variant="ghost" icon={{ name: "pencil" }} disabled={isLoading}>
                                    <span>Edit</span>
                                </IconButton>
                            }
                            title="Edit Group"
                            confirmAction={{
                                text: isUpdating ? "Saving changes..." : "Save Changes",
                                disabled:
                                    group.title === groupForm.title && group.description === groupForm.description,
                            }}
                            onConfirm={handleUpdateGroup}
                            onClose={resetForm}
                        >
                            <FieldLabel htmlFor="title" className="mb-4">
                                Group Name
                            </FieldLabel>
                            <TextInput
                                id="title"
                                className="w-full mb-4"
                                value={groupForm.title}
                                onChange={(e) => handleChange("title", e.target.value)}
                            />
                            <FieldLabel htmlFor="group_description" className="mb-4">
                                Description
                            </FieldLabel>
                            <TextBlock
                                id="group_description"
                                className="h-50 overflow-y-auto w-full"
                                autoResize={false}
                                value={groupForm.description}
                                onChange={(e) => handleChange("description", e.target.value)}
                            />
                        </Modal>

                        <Modal
                            trigger={
                                <IconButton variant="error-ghost" icon={{ name: "trash" }} disabled={isLoading}>
                                    <span>Delete</span>
                                </IconButton>
                            }
                            title="Delete Group"
                            confirmAction={{
                                variant: "error",
                                text: isDeleting ? "Deleting group..." : "Delete Group",
                            }}
                            onConfirm={handleDelete}
                            onClose={() => setDeleteMode(DELETENORMAL)}
                        >
                            <p>Are you sure you want to delete this group? This cannot be undone.</p>
                            <div>
                                <Checkbox
                                    label="Also delete all items in this group."
                                    className="mt-4 text-error font-semibold select-none"
                                    checked={deleteMode === DELETECASCADE}
                                    onChange={() => {
                                        if (!isDeleting) setDeleteMode((prev) => !prev);
                                    }}
                                    disabled={isDeleting}
                                />
                                {deleteMode === DELETENORMAL && (
                                    <p className="italic text-xs mt-2">* All items will become ungrouped.</p>
                                )}
                            </div>
                        </Modal>
                        <IconButton variant="neutral-ghost" icon={{ name: "info" }} disabled={isLoading} />
                    </div>
                )}
            </div>

            {isLoading ? (
                <div>loading....</div>
            ) : error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load group details: {error.message}</p>
                </div>
            ) : !group ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load group details: Group does not exist.</p>
                </div>
            ) : (
                <>
                    {/* GROUP TITLE */}
                    <h1 className="font-medium text-4xl mb-4">{group?.title}</h1>

                    {/* GROUP DESCRIPTION */}
                    <p className="text-foreground-secondary">{group?.description ?? <i>No description</i>}</p>

                    <br />

                    <GroupContent items={group.content} isLoading={isLoading} />
                </>
            )}
        </div>
    );
};

export default Group;

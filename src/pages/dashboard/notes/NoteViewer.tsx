import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Icon from "../../../components/Icon";
import IconButton from "../../../components/IconButton";
import Divider from "../../../components/Divider";
import Modal from "../../../components/Modal";

import GroupSelector from "../../../components/dashboard/GroupSelector";

import { useToast } from "../../../context/toast/ToastContext";
import { useNote, useNoteMutation } from "../../../hooks/dashboard/useNotes";

const NoteViewer = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { data: note, isLoading, error } = useNote(id);
    const { updateNote, isUpdating, deleteNote, isDeleting } = useNoteMutation();

    const { noteContent, groupName } = useMemo(() => {
        if (!note) return { noteContent: [], groupName: "Ungrouped" };

        const groupName = note?.groups?.title ?? "Ungrouped";
        const noteContent = note === undefined ? [] : note.content.split("~~DIVIDER~~").filter((v) => v.length > 0);

        return { groupName, noteContent };
    }, [note]);

    const handleDeleteNote = async () => {
        if (!id) return;

        try {
            await deleteNote(id);

            showToast("Note deleted successfully.", "success");
            // Navigate back to group or notes collection page
            navigate(location.state?.from ?? "/notes", { replace: true });
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="flex flex-row items-center gap-4">
                    <Link to={location.state?.from ?? "/notes"}>
                        <Icon name="arrow-left " />
                    </Link>
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Notes"}</span>
                </div>
                {note && (
                    <div className="flex flex-row items-center gap-4">
                        <Link to={`/notes/${id}/edit`} state={location.state}>
                            <IconButton variant="ghost" icon={{ name: "pencil" }} disabled={isLoading}>
                                <span className="hidden sm:block">Edit</span>
                            </IconButton>
                        </Link>

                        <Modal
                            trigger={
                                <IconButton variant="error-ghost" icon={{ name: "trash" }} disabled={isLoading}>
                                    <span className="hidden sm:block">Delete</span>
                                </IconButton>
                            }
                            title="Delete Note?"
                            confirmAction={{
                                variant: "error",
                                text: isDeleting ? "Deleting Note..." : "Delete Note",
                                disabled: isDeleting,
                            }}
                            onConfirm={handleDeleteNote}
                        >
                            <p>Are you sure you want to delete this note? This cannot be undone.</p>
                        </Modal>
                        <IconButton variant="neutral-ghost" icon={{ name: "info" }} disabled={isLoading} />
                    </div>
                )}
            </div>

            {isLoading ? (
                <p>Loading....</p>
            ) : error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load note details: {error.message}</p>
                </div>
            ) : !note ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load note details: Note does not exist.</p>
                </div>
            ) : (
                <>
                    {/* NOTE TITLE */}
                    <h1 className="font-medium text-4xl mb-4 wrap-break-word">{note?.title}</h1>

                    {/* NOTE GROUP */}
                    <div className="flex flex-row justify-between max-w-full">
                        <GroupSelector
                            contentId={note.id}
                            currentGroup={{ id: note.group_id, name: groupName }}
                            updateHook={{ updateContent: updateNote, isLoading: isUpdating }}
                            triggerClassname="min-w-0 max-w-[500px]"
                        />
                    </div>

                    {/* NOTE CONTENT */}
                    <div className="bg-background-1 border border-background-3 rounded-md my-4 p-4">
                        {noteContent.map((v, i, arr) => {
                            return (
                                <React.Fragment key={i}>
                                    <p className="whitespace-pre-wrap wrap-break-word text-sm">{v}</p>

                                    {i < arr.length - 1 && (
                                        <div className="my-4">
                                            <Divider />
                                            <Divider />
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
};

export default NoteViewer;

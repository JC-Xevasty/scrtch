import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import Icon from "../../../components/Icon";
import TextButton from "../../../components/TextButton";
import TextInput from "../../../components/TextInput";
import FieldLabel from "../../../components/FieldLabel";
import TextBlock from "../../../components/TextBlock";

import type { NoteCreate, NoteUpdate } from "../../../types";

import { useToast } from "../../../context/toast/ToastContext";
import { useNote, useNoteMutation } from "../../../hooks/dashboard/useNotes";
import { useAuth } from "../../../context/auth/AuthContext";
import useUnsavedChanges from "../../../hooks/useUnsavedChanges";

const BLOCKDIVIDER = "~~DIVIDER~~";

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
        <div className={`flex items-center rounded-md shadow-md h-6 ${className}`}>
            {actions.map((action, index, arr) => {
                let rounded = "";

                if (arr.length === 1) rounded = "rounded-sm";
                else if (index === 0) rounded = "rounded-s-sm";
                else if (index === arr.length - 1) rounded = "rounded-e-sm";

                return (
                    <div
                        key={index}
                        className={
                            "h-full bg-background-2 hover:bg-foreground-muted text-xs px-2 py-1 border border-foreground-muted/50 flex items-center justify-center gap-1 cursor-pointer " +
                            rounded
                        }
                        onClick={action.onClick}
                    >
                        <Icon name={action.icon} size={16} />
                        <span>{action.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

const NoteEditor = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();
    const { showToast } = useToast();
    useUnsavedChanges();

    const { data: note, isLoading, error } = useNote(id);
    const { createNote, isCreating, updateNote, isUpdating } = useNoteMutation();

    const [noteForm, setNoteForm] = useState<NoteCreate>({
        title: "",
        content: "",
        group_id: null,
    });

    const [contentList, setContentList] = useState<{ id: number; text: string }[]>([{ id: 0, text: "" }]);
    const blockCounter = useRef(contentList.length);

    useEffect(() => {
        if (note) {
            const { title, content, group_id } = note;
            setNoteForm({ title, content, group_id });

            const tempContentList = content.split(BLOCKDIVIDER).filter((v) => v.length > 0);
            blockCounter.current = tempContentList.length;
            setContentList(tempContentList.map((v, i) => ({ id: i, text: v })));
        }
    }, [note]);

    const updateContent = (index: number, value: string) => {
        setContentList((prev) => {
            let newValue = [...prev];

            newValue[index] = { ...newValue[index], text: value };

            return newValue;
        });
    };

    const handleAddBlock = (index: number) => {
        const newBlock = { id: blockCounter.current, text: "" };

        setContentList((prev) => {
            return [...prev.slice(0, index), newBlock, ...prev.slice(index)];
        });

        blockCounter.current += 1;
    };

    const handleRemoveBlock = (index: number) => {
        if (contentList.length === 1) {
            setContentList([{ id: blockCounter.current, text: "" }]);
            blockCounter.current += 1;
            return;
        }

        setContentList((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleSave = () => {
        if (!id) return;

        if (id === "new") handleCreateNote();
        else handleUpdateNote();
    };

    const validateForm = () => {
        let valid = true;

        if (noteForm.title.trim().length === 0) {
            valid = false;
            showToast("Note title required.", "error");
        }

        if (contentList.every((content) => content.text.trim().length === 0)) {
            valid = false;
            showToast("Note content required.", "error");
        }

        return valid;
    };

    const handleCreateNote = async () => {
        if (!validateForm()) return;

        try {
            let submitData: NoteCreate = {
                ...noteForm,
                content: contentList.map((v) => v.text).join(BLOCKDIVIDER),
            };

            const response = await createNote(submitData);
            showToast("Note created successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/notes/${response.id}/view`);
            } else if (profile?.post_save_action === "stay") {
                navigate(`/notes/${response.id}/edit`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleUpdateNote = async () => {
        if (!id || !validateForm()) return;

        try {
            let submitData: { id: string } & NoteUpdate = {
                id,
                ...noteForm,
                content: contentList.map((v) => v.text).join(BLOCKDIVIDER),
            };

            const response = await updateNote(submitData);
            showToast("Note updated successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/notes/${response.id}/view`, { state: location.state });
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleCancel = () => {
        if (isCreating || isUpdating) return;

        if (id === "new") {
            navigate(location.state?.from ?? "/notes", { replace: true });
        } else {
            navigate(`/notes/${id}/view`, { state: location.state });
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="flex flex-row items-center gap-4">
                    {isLoading || isCreating || isUpdating ? (
                        <div>
                            <Icon name="arrow-left " />
                        </div>
                    ) : (
                        <Link to={location.state?.from ?? "/notes"}>
                            <Icon name="arrow-left " />
                        </Link>
                    )}
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Notes"}</span>
                </div>

                {(id === "new" || note) && (
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
                    <p className="text-center">Failed to load note details for editing: {error.message}</p>
                </div>
            ) : id !== "new" && !note ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load note details: Note does not exist.</p>
                </div>
            ) : (
                <>
                    <FieldLabel htmlFor="title" className="mb-4">
                        Note Title
                    </FieldLabel>
                    <TextInput
                        id="title"
                        className="w-full mb-8"
                        value={noteForm.title}
                        onChange={(e) => setNoteForm((prev) => ({ ...prev, title: e.target.value }))}
                        disabled={isCreating || isUpdating}
                    />
                    <FieldLabel className="mb-4">Note Content</FieldLabel>
                    <div className="space-y-8">
                        {contentList.map((content, index) => {
                            return (
                                <div key={content.id} className="relative">
                                    <ToolBar
                                        className="absolute -top-3 right-0 mx-4"
                                        disabled={isCreating || isUpdating}
                                        actions={[
                                            {
                                                label: "Top",
                                                icon: "plus",
                                                onClick: () => handleAddBlock(index),
                                            },
                                            {
                                                label: "Bottom",
                                                icon: "plus",
                                                onClick: () => handleAddBlock(index + 1),
                                            },
                                            {
                                                label: "Remove",
                                                icon: "trash",
                                                onClick: () => handleRemoveBlock(index),
                                            },
                                        ]}
                                    />
                                    <TextBlock
                                        id={`${content.id}`}
                                        className="w-full"
                                        value={content.text}
                                        onChange={(e) => updateContent(index, e.target.value)}
                                        disabled={isCreating || isUpdating}
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

export default NoteEditor;

import { useEffect, useRef, useState } from "react";
import type { LogCreate, LogItem, LogItemDelete, LogItemUpdate, LogUpdate } from "../../../types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Icon from "../../../components/Icon";
import TextButton from "../../../components/TextButton";
import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import TextBlock from "../../../components/TextBlock";
import DateInput from "../../../components/DateInput";
import IconButton from "../../../components/IconButton";
import { useAuth } from "../../../context/auth/AuthContext";
import { useToast } from "../../../context/toast/ToastContext";
import { useLog, useLogMutation } from "../../../hooks/useLogs";

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
        <div className={`flex items-center rounded-md shadow-md h-6 ${className} select-none`}>
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

const LogEditorItem = ({
    index,
    title,
    content,
    entry_date,
    disabled,
    handleUpdateItem,
    handleRemoveItem,
}: {
    index: number;
    disabled: boolean;
    handleUpdateItem: (index: number, key: "title" | "content" | "entry_date", newValue: string) => void;
    handleRemoveItem: (index: number) => void;
} & Pick<LogItem, "title" | "content" | "entry_date">) => {
    const [showContent, setShowContent] = useState(content.length > 0);

    const [dateValue, setDateValue] = useState(entry_date);
    const [entryDateChanged, setEntryDateChanged] = useState(false);

    useEffect(() => {
        if (entry_date !== dateValue) {
            setEntryDateChanged(true);
        } else if (entryDateChanged) {
            setEntryDateChanged(false);
        }
    }, [entry_date, dateValue]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                    <DateInput
                        value={dateValue}
                        onChange={(e) => setDateValue(e.target.value)}
                        formatDate={(date) =>
                            new Date(date).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                            })
                        }
                        disabled={disabled}
                    />
                    {entryDateChanged && (
                        <>
                            <IconButton
                                icon={{ name: "x" }}
                                size="md"
                                variant="neutral-ghost"
                                onClick={() => setDateValue(entry_date)}
                            />
                            <IconButton
                                icon={{ name: "check" }}
                                size="md"
                                variant="success-ghost"
                                onClick={() => handleUpdateItem(index, "entry_date", dateValue)}
                            />
                        </>
                    )}
                </div>
            </div>
            <div className="flex gap-4 relative">
                <ToolBar
                    className="absolute -top-3 right-0 mx-4"
                    disabled={disabled}
                    actions={[
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
                <TextBlock
                    className="grow py-4 flex items-center"
                    value={title}
                    onChange={(e) => handleUpdateItem(index, "title", e.target.value)}
                    disabled={disabled}
                />
            </div>

            {showContent && (
                <div className="flex items-center mt-4 ml-16">
                    <TextBlock
                        className="grow bg-background-3 border border-white/20 shadow-sm rounded-md py-4"
                        value={content}
                        onChange={(e) => handleUpdateItem(index, "content", e.target.value)}
                        disabled={disabled}
                    />
                </div>
            )}
        </>
    );
};

const LogEditor = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { profile } = useAuth();
    const { showToast } = useToast();

    const { data: log, isLoading, error } = useLog(id);
    const { createLog, isCreating, updateLog, isUpdating } = useLogMutation();

    const [logForm, setLogForm] = useState<Pick<LogCreate, "title" | "group_id">>({
        title: "",
        group_id: null,
    });

    const [logItems, setLogItems] = useState<LogItemUpdate[]>([
        { id: `${NEWITEMINDICATOR}0`, title: "", content: "", entry_date: "" },
    ]);
    const logItemsCounter = useRef(logItems.length);

    useEffect(() => {
        if (log) {
            const { title, group_id, log_items } = log;
            setLogForm({ title, group_id });

            logItemsCounter.current = log_items.length;
            setLogItems(
                log_items.map((v) => ({ id: v.id, title: v.title, content: v.content, entry_date: v.entry_date })),
            );
        }
    }, [log]);

    const [removedItems, setRemovedItems] = useState<LogItemUpdate[]>([]);

    // Update title, content, entry date of a log item by index
    const updateLogItem = (index: number, key: "title" | "content" | "entry_date", value: string) => {
        if (key === "entry_date") {
            updateEntryDate(index, value);
            return;
        }

        setLogItems((prev) => {
            let newValue = [...prev];

            newValue[index] = { ...newValue[index], [key]: value };

            return newValue;
        });
    };

    const updateEntryDate = (index: number, entry_date: string) => {
        setLogItems((prev) => {
            let newValue = [...prev];

            newValue[index] = { ...newValue[index], entry_date };

            return [...newValue].sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
        });
    };

    const handleAddItem = () => {
        const newItem: LogItemUpdate = {
            id: NEWITEMINDICATOR + logItemsCounter.current,
            title: "",
            content: "",
            entry_date: "",
        };

        setLogItems((prev) => [newItem, ...prev]);

        logItemsCounter.current += 1;
    };

    const handleRemoveItem = (index: number) => {
        const itemToBeRemoved = logItems[index];

        // Track which items are to be deleted from database
        if (!itemToBeRemoved.id?.startsWith(NEWITEMINDICATOR)) {
            setRemovedItems((prev) => [...prev, itemToBeRemoved]);
        }

        // If the last item to be removed, add a blank list item
        if (logItems.length === 1) {
            setLogItems([
                {
                    id: NEWITEMINDICATOR + logItemsCounter.current,
                    title: "",
                    content: "",
                    entry_date: "",
                },
            ]);
            logItemsCounter.current += 1;
            return;
        }

        // Remove the list item
        setLogItems((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleSave = () => {
        if (!id) return;

        if (id === "new") handleCreateLog();
        else handleUpdateLog();
    };

    const validateForm = () => {
        let valid = true;

        if (logForm.title.trim().length === 0) {
            valid = false;
            showToast("Log title required.", "error");
        }

        if (logItems.every((item) => item.title.trim().length === 0)) {
            valid = false;
            showToast("Log items required.", "error");
        }

        if (logItems.some((item) => item.title.trim().length === 0)) {
            valid = false;
            showToast("Log items must have a main description.", "error");
        }

        if (logItems.some((item) => item.entry_date.trim().length === 0)) {
            valid = false;
            showToast("All log items must have an entry date", "error");
        }

        return valid;
    };

    const handleCreateLog = async () => {
        if (!validateForm()) return;

        try {
            let submitData: LogCreate = {
                ...logForm,
                log_items: logItems.map((item) => ({
                    title: item.title,
                    content: item.content,
                    entry_date: item.entry_date,
                })),
            };

            const response = await createLog(submitData);
            showToast("Log created successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/logs/${response.id}/view`);
            } else if (profile?.post_save_action === "stay") {
                navigate(`/logs/${response.id}/edit`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleUpdateLog = async () => {
        if (!id || !validateForm()) return;

        try {
            let new_items: LogItemUpdate[] = [];
            let existing_items: LogItemUpdate[] = [];

            for (const item of logItems) {
                if (item.id?.startsWith(NEWITEMINDICATOR)) {
                    new_items.push({
                        title: item.title,
                        content: item.content,
                        entry_date: item.entry_date,
                    });
                } else {
                    existing_items.push({ ...item });
                }
            }

            const removed_items: LogItemDelete[] = removedItems.map((i) => ({ id: i.id! }));

            const submitData: LogUpdate = {
                id,
                ...logForm,
                new_log_items: new_items,
                existing_log_items: existing_items,
                removed_log_items: removed_items,
            };

            const response = await updateLog(submitData);
            showToast("Log updated successfully.", "success");

            if (profile?.post_save_action === "view") {
                navigate(`/logs/${response.id}/view`);
            } else if (profile?.post_save_action === "stay") {
                navigate(`/logs/${response.id}/edit`);
            }
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    const handleCancel = () => {
        if (isCreating || isUpdating) return;

        if (id === "new") {
            navigate(location.state?.from ?? "/logs", { replace: true });
        } else {
            navigate(`/logs/${id}/view`, { state: location.state });
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
                        <Link to={location.state?.from ?? "/logs"}>
                            <Icon name="arrow-left " />
                        </Link>
                    )}
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Logs"}</span>
                </div>

                {(id === "new" || log) && (
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
                    <p className="text-center">Failed to load log details for editing: {error.message}</p>
                </div>
            ) : id !== "new" && !log ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load log details for editing: Log does not exist.</p>
                </div>
            ) : (
                <>
                    <FieldLabel htmlFor="title" className="mb-4">
                        Log Title
                    </FieldLabel>
                    <TextInput
                        id="title"
                        className="w-full mb-8"
                        value={logForm.title}
                        onChange={(e) => setLogForm((prev) => ({ ...prev, title: e.target.value }))}
                        disabled={isCreating || isUpdating}
                    />

                    <div className="flex justify-between items-center mb-4">
                        <FieldLabel>Log Items</FieldLabel>
                        <div className="flex items-center">
                            <TextButton onClick={handleAddItem} disabled={isCreating || isUpdating}>
                                Add Entry
                            </TextButton>
                        </div>
                    </div>
                    <div className="space-y-8 my-4 text-sm">
                        {logItems.map((logItem, index) => {
                            return (
                                <div key={logItem.id}>
                                    <LogEditorItem
                                        index={index}
                                        {...logItem}
                                        disabled={isCreating || isUpdating}
                                        handleRemoveItem={handleRemoveItem}
                                        handleUpdateItem={updateLogItem}
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

export default LogEditor;

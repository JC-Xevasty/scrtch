import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import IconButton from "../../../components/IconButton";
import Modal from "../../../components/Modal";
import Icon from "../../../components/Icon";
import type { LogItem } from "../../../types";
import { DateFormat } from "../../../utils/helpers";
import { useLog, useLogMutation } from "../../../hooks/useLogs";
import { useToast } from "../../../context/toast/ToastContext";
import GroupSelector from "../../../components/dashboard/GroupSelector";

const LogItem = ({ title, content, entry_date }: Pick<LogItem, "title" | "content" | "entry_date">) => {
    const [showContent, setShowContent] = useState(false);

    const hasContent = content.length > 0;

    const formattedDate = DateFormat.localString(entry_date, undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <>
            <p className="font-semibold mb-4 text-center">{formattedDate}</p>
            <div className="flex gap-4">
                <div className="flex flex-col justify-end items-center w-6">
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
                    <div className="flex items-center gap-2 mt-4">
                        <div
                            className="border-l-2 border-b-2 border-background-3 rounded-bl-md w-10 h-10 -mt-10 ml-3 hover:border-background-2 cursor-pointer"
                            onClick={() => setShowContent((prev) => !prev)}
                        />
                        <div className="grow bg-background-3 border border-white/20 shadow-sm rounded-md p-4 ">
                            {title}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

const LogViewer = ({ id }: { id: string | undefined }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { showToast } = useToast();
    const { data: log, isLoading, error } = useLog(id);
    const { updateLogRecord, isUpdating, deleteLog, isDeleting } = useLogMutation();

    const { logItems, groupName } = useMemo(() => {
        if (!log) return { logItems: [], groupName: "Ungrouped" };

        const groupName = log.groups?.title ?? "Ungrouped";
        const logItems = log.log_items;

        return { logItems, groupName };
    }, [log]);

    const handleDeleteLog = async () => {
        if (!id) return;

        try {
            await deleteLog(id);

            showToast("Log deleted successfully.", "success");
            // Navigate back to group or logs collection page
            navigate(location.state?.from ?? "/logs", { replace: true });
        } catch (error: any) {
            showToast(error.message, "error");
        }
    };

    return (
        <div>
            <div className="flex flex-row items-center justify-between py-4 -mt-4 mb-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <div className="flex flex-row items-center gap-4">
                    <Link to={location.state?.from ?? "/logs"}>
                        <Icon name="arrow-left " />
                    </Link>
                    <span className="font-semibold text-lg">Back to {location.state?.fromName ?? "Logs"}</span>
                </div>
                {log && (
                    <div className="flex flex-row items-center gap-4">
                        <Link to={`/logs/${id}/edit`} state={location.state}>
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
                            title="Delete Log?"
                            confirmAction={{
                                variant: "error",
                                text: isDeleting ? "Deleting Log..." : "Delete Log",
                            }}
                            onConfirm={handleDeleteLog}
                        >
                            <p>Are you sure you want to delete this log? This cannot be undone.</p>
                        </Modal>
                        <IconButton variant="neutral-ghost" icon={{ name: "info" }} disabled={isLoading} />
                    </div>
                )}
            </div>

            {isLoading ? (
                <p>Loading....</p>
            ) : error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load log details: {error.message}</p>
                </div>
            ) : !log ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load log details: Log does not exist.</p>
                </div>
            ) : (
                <>
                    {/* LOG TITLE */}
                    <h1 className="font-medium text-4xl mb-4">{log?.title}</h1>

                    {/* LOG GROUP */}
                    <div className="flex flex-row justify-between max-w-full">
                        <GroupSelector
                            contentId={log.id}
                            currentGroup={{ id: log.group_id, name: groupName }}
                            updateHook={{ updateContent: updateLogRecord, isLoading: isUpdating }}
                            triggerClassname="min-w-0 max-w-[500px]"
                        />
                    </div>

                    {/* LOG ITEMS */}
                    <div className="space-y-4 my-4 py-4 text-sm">
                        {logItems.length === 0 && (
                            <p className="text-center text-foreground-muted text-sm font-semibold select-none capitalize">
                                No log items
                            </p>
                        )}

                        {logItems.length > 0 &&
                            logItems.map((logItem, index) => {
                                return (
                                    <div key={index}>
                                        <LogItem {...logItem} />
                                    </div>
                                );
                            })}
                    </div>
                </>
            )}
        </div>
    );
};

export default LogViewer;

import { useEffect, useState } from "react";

import FieldLabel from "../components/FieldLabel";
import TextInput from "../components/TextInput";
import TextBlock from "../components/TextBlock";
import Divider from "../components/Divider";
import Icon from "../components/Icon";
import TextButton from "../components/TextButton";
import IconButton from "../components/IconButton";
import Modal from "../components/Modal";

import { useToast } from "../context/toast/ToastContext";
import useUnsavedChanges from "../hooks/useUnsavedChanges";

import { DateFormat } from "../utils/helpers";

const DEBOUNCE_SAVE_MS = 500;
const LOCALSTORAGE_KEY = "scrtch_quick_list";

const EXPORT = {
    text: { extension: "txt", mimetype: "text/plain;charset=utf-8" },
    json: { extension: "scrtch", mimetype: "application/json;charset=utf-8" },
};

const DELETEMODE = {
    current: "current",
    all: "all",
} as const;

type DeleteModeType = (typeof DELETEMODE)[keyof typeof DELETEMODE];

const DELETEMODAL = {
    current: {
        title: "Delete Scratch",
        text: "Delete Scratch",
        textLoading: "Deleting Scratch...",
    },
    all: {
        title: "Delete All Scratch",
        text: "Delete All Scratch",
        textLoading: "Deleting All Scratch...",
    },
};

interface Scratch {
    id: number;
    title: string;
    content: string;
    updated_at: number;
}

const Quick = () => {
    const { showToast } = useToast();
    useUnsavedChanges();

    const [currentScratch, setCurrentScratch] = useState<Scratch>({ id: 0, title: "", content: "", updated_at: 0 });
    const [scratchList, setScratchList] = useState<Scratch[]>([]);
    const [copied, setCopied] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [openDeleteModal, setOpenDeleteModal] = useState(false);
    const [deleteMode, setDeleteMode] = useState<DeleteModeType | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const [openImportModal, setOpenImportModal] = useState(false);
    const [importData, setImportData] = useState<Scratch | undefined>(undefined);

    // For mobile screens
    const [showSidebar, setShowSidebar] = useState(false);

    /* Initialize scratch list from localStorage */
    useEffect(() => {
        const saved = localStorage.getItem(LOCALSTORAGE_KEY);
        let initialScratchList: Scratch[] = saved ? JSON.parse(saved) : [];

        if (initialScratchList.length === 0) {
            const timestampNow = Date.now();
            const newScratch = {
                id: timestampNow,
                title: "",
                content: "",
                updated_at: timestampNow,
            };

            initialScratchList = [newScratch];
        }

        setScratchList(initialScratchList);
        setCurrentScratch(initialScratchList[0]);
    }, []);

    /* Debounce save to localStorage */
    useEffect(() => {
        if (scratchList.length === 0) return;

        const handler = setTimeout(() => {
            localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(scratchList));
        }, DEBOUNCE_SAVE_MS);

        return () => clearTimeout(handler);
    }, [scratchList]);

    /* Scratch selection */
    const handleChangeCurrentScratch = (id: number) => {
        const scratch = scratchList.find((s) => s.id === id);
        if (scratch) {
            setCurrentScratch(scratch);
        }
    };

    /* Create new scratch */
    const createScratch = () => {
        setIsLoading(true);

        const timestampNow = Date.now();
        const scratch = {
            id: timestampNow,
            title: "",
            content: "",
            updated_at: timestampNow,
        };

        setScratchList((prev) => [...prev, scratch]);
        setCurrentScratch(scratch);
        setIsLoading(false);
    };

    /* Update scratch title or content */
    const handleUpdateScratch = (key: "title" | "content", value: string) => {
        const updatedScratch = { ...currentScratch, [key]: value, updated_at: Date.now() };

        setScratchList((prev) => prev.map((scratch) => (scratch.id === updatedScratch.id ? updatedScratch : scratch)));
        setCurrentScratch(updatedScratch);
    };

    /* Copy content text to clipboard */
    const handleCopyContent = async () => {
        try {
            await navigator.clipboard.writeText(currentScratch.content);
            showToast("Content copied to clipboard", "default");
            setCopied(true);

            setTimeout(() => setCopied(false), 2000);
        } catch (error: any) {
            showToast(`Failed to copy content: ${error}`, "error");
        }
    };

    /* Import .scrtch files*/
    const handleImportScratch = () => {
        setIsLoading(true);

        const fileInput = Object.assign(document.createElement("input"), {
            type: "file",
            accept: `.${EXPORT.json.extension}`,
        });

        const cleanup = () => {
            fileInput.onchange = null;
            fileInput.oncancel = null;
            setIsLoading(false);
        };

        fileInput.oncancel = () => cleanup();

        fileInput.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];

            if (!file) {
                cleanup();
                return;
            }

            try {
                const textContent = await file.text();
                const importedData = JSON.parse(textContent);

                const isValidScratch =
                    importedData &&
                    typeof importedData === "object" &&
                    ["id", "title", "content", "updated_at"].every((key) => key in importedData);

                if (isValidScratch) {
                    if (scratchList.find((s) => s.id === importedData.id)) {
                        setOpenImportModal(true);
                        setImportData(importedData);
                        cleanup();
                        return;
                    }

                    setScratchList((prev) => [...prev, importedData]);
                    setCurrentScratch(importedData);
                } else {
                    showToast("Invalid .scrtch file format", "error");
                }
            } catch (error) {
                showToast("Failed to parse .scrtch file", "error");
            }

            cleanup();
        };

        fileInput.click();
    };

    /* Chooe whether to replace or create a new copy if imported scratch already in the lsit */
    const handleImportExisting = (type: "replace" | "copy") => {
        if (importData === undefined) return;

        let newScratch;
        setScratchList((prevList) => {
            if (type === "replace") {
                return prevList.map((item) => {
                    if (item.id !== importData.id) return item;
                    newScratch = { ...importData, updated_at: Date.now() };
                    return newScratch;
                });
            } else {
                const timestampNow = Date.now();
                newScratch = {
                    id: timestampNow,
                    title: importData.title.length > 0 ? `(Copy) ${importData.title}` : "",
                    content: importData.content,
                    updated_at: timestampNow,
                };
                return [...prevList, newScratch];
            }
        });

        if (newScratch) {
            setCurrentScratch(newScratch);
        }

        setIsLoading(false);
        setOpenImportModal(false);
        setImportData(undefined);
    };

    /* Export scratch to text file or .scrtch file */
    const handleExportScratch = (type: "text" | "json") => {
        let scratchTitle = currentScratch.title.trim() || getUntitledString(currentScratch.id);
        let fileName = `[SCRTCH] ${scratchTitle.replace(/[^a-zA-Z0-9\s-_]/g, "_")}.${EXPORT[type].extension}`;

        let fileData = "";
        if (type === "text") {
            const DIVIDER = "====================";
            fileData = `${scratchTitle}\n${DIVIDER}\n${currentScratch.content}`;
        } else if (type === "json") {
            fileData = JSON.stringify(currentScratch, null, 2);
        }

        // Create a virtual anchor element and trigger download
        const link = Object.assign(document.createElement("a"), {
            href: URL.createObjectURL(new Blob([fileData], { type: EXPORT[type].mimetype })),
            download: fileName,
        });
        link.click();
        URL.revokeObjectURL(link.href);
    };

    const handleDeleteScratch = () => {
        if (deleteMode === "current" && !scratchList.find((s) => s.id === currentScratch.id)) {
            if (openDeleteModal) throw null;
            return;
        }

        if (isDeleting) return;

        setIsDeleting(true);

        try {
            let newScratchList = [...scratchList];

            if (deleteMode === "current") {
                const currentIndex = newScratchList.findIndex((s) => s.id === currentScratch.id);

                newScratchList = newScratchList.filter((s) => s.id !== currentScratch.id);

                if (newScratchList.length > 0) {
                    const nextIndex = Math.min(currentIndex, newScratchList.length - 1);
                    setCurrentScratch(newScratchList[nextIndex]);
                }
            }

            if (deleteMode === "all" || newScratchList.length === 0) {
                const timestampNow = Date.now();
                newScratchList = [{ id: timestampNow, title: "", content: "", updated_at: timestampNow }];
                setCurrentScratch(newScratchList[0]);
            }

            setScratchList(newScratchList);
            setIsDeleting(false);
        } catch (error: any) {
            showToast(error.message, error.status);

            // Error thrown so that modal does not close
            if (openDeleteModal) throw null;
        }
    };

    const getUntitledString = (date: number) =>
        `Untitled - ${DateFormat.localString(new Date(date).toISOString(), undefined, { dateStyle: "short", timeStyle: "medium" })}`;

    return (
        <>
            <div className="relative h-full flex gap-4">
                {/* SIDEBAR */}
                <div
                    className={
                        "h-full shrink-0 z-10 left-0 top-0 transition-all duration-300 ease-in-out " +
                        `w-full absolute ${showSidebar ? "translate-x-0" : "-translate-x-full pr-4"} ` +
                        "sm:w-75 sm:relative sm:translate-x-0 sm:pr-0"
                    }
                >
                    <div className="w-full h-full shrink-0 bg-background-2 rounded-md flex flex-col">
                        <div className="grow min-h-0 flex flex-col">
                            <div className="p-2 flex justify-between items-end border-b-2 border-background-3">
                                <p className="font-bold">Scratch List</p>
                                <div className="hidden sm:flex items-center gap-2">
                                    <div
                                        onClick={isLoading ? undefined : handleImportScratch}
                                        title="Import a scrtch file"
                                    >
                                        <Icon
                                            name="upload"
                                            size={20}
                                            className={
                                                isLoading
                                                    ? "cursor-not-allowed text-foreground-secondary"
                                                    : "cursor-pointer hover:text-foreground-secondary"
                                            }
                                        />
                                    </div>
                                    <div onClick={isLoading ? undefined : createScratch} title="Create a new Scratch">
                                        <Icon
                                            name="plus"
                                            className={
                                                isLoading
                                                    ? "cursor-not-allowed text-foreground-secondary"
                                                    : "cursor-pointer hover:text-foreground-secondary"
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="block sm:hidden" onClick={() => setShowSidebar(false)}>
                                    <Icon name="x" size={20} />
                                </div>
                            </div>
                            <div className="grow min-h-0 overflow-y-auto pt-2">
                                {scratchList.map((v, _) => {
                                    let className =
                                        "px-4 py-2 truncate cursor-pointer select-none hover:bg-background-3";

                                    if (v.id === currentScratch?.id) {
                                        className += " bg-foreground-muted/20 hover:bg-foreground-muted/20 font-bold";
                                    }

                                    let title = v.title;

                                    if (title.length === 0) {
                                        title = `(${getUntitledString(v.id)})`;
                                        className += " italic";
                                    }

                                    return (
                                        <div
                                            key={`${v.id}`}
                                            className={className}
                                            onClick={() => handleChangeCurrentScratch(v.id)}
                                            title={title}
                                        >
                                            {title}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <Divider />
                        <div className="py-2 px-4 sm:py-4 shrink-0 text-sm">
                            {currentScratch && (
                                <>
                                    <p className="font-semibold mb-2">Created at</p>
                                    <p className="mb-2">
                                        {DateFormat.localString(new Date(currentScratch.id).toISOString(), undefined, {
                                            dateStyle: "medium",
                                            timeStyle: "medium",
                                        })}
                                    </p>
                                    <p className="font-semibold mb-2">Updated at</p>
                                    <p className="mb-2">
                                        {DateFormat.localString(
                                            new Date(currentScratch.updated_at).toISOString(),
                                            undefined,
                                            {
                                                dateStyle: "medium",
                                                timeStyle: "medium",
                                            },
                                        )}
                                    </p>
                                    <p className="font-semibold mb-2">Export</p>
                                    <div className="flex gap-4 mb-2">
                                        <TextButton
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleExportScratch("text")}
                                            title="Export to text file"
                                            disabled={isLoading || isDeleting || openDeleteModal}
                                        >
                                            TXT
                                        </TextButton>
                                        <TextButton
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={() => handleExportScratch("json")}
                                            title="Export to scrtch file"
                                            disabled={isLoading || isDeleting || openDeleteModal}
                                        >
                                            SCRTCH
                                        </TextButton>
                                    </div>
                                    <p className="font-semibold mb-2">Actions</p>
                                    <div className="flex gap-4 mb-2">
                                        <TextButton
                                            variant="error-ghost"
                                            size="sm"
                                            className="grow"
                                            onClick={() => {
                                                setOpenDeleteModal(true);
                                                setDeleteMode("current");
                                            }}
                                            disabled={isLoading || isDeleting || openDeleteModal}
                                        >
                                            Delete Scratch
                                        </TextButton>
                                        <TextButton
                                            variant="error"
                                            size="sm"
                                            className="grow"
                                            onClick={() => {
                                                setOpenDeleteModal(true);
                                                setDeleteMode("all");
                                            }}
                                            disabled={isLoading || isDeleting || openDeleteModal}
                                        >
                                            Delete All Scratch
                                        </TextButton>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* FORM */}
                <div className="grow">
                    {currentScratch && (
                        <div className="w-full max-w-4xl mx-auto p-0 sm:p-4 flex flex-col h-full">
                            <div className="flex sm:hidden justify-between mb-4">
                                <div onClick={() => setShowSidebar(true)}>
                                    <Icon name="hamburger" size={28} />
                                </div>
                                <div className="flex">
                                    <div className="flex items-center gap-2">
                                        <div
                                            onClick={isLoading ? undefined : handleImportScratch}
                                            title="Import a scrtch file"
                                        >
                                            <Icon
                                                name="upload"
                                                size={20}
                                                className={
                                                    isLoading
                                                        ? "cursor-not-allowed text-foreground-secondary"
                                                        : "cursor-pointer hover:text-foreground-secondary"
                                                }
                                            />
                                        </div>
                                        <div
                                            onClick={isLoading ? undefined : createScratch}
                                            title="Create a new Scratch"
                                        >
                                            <Icon
                                                name="plus"
                                                className={
                                                    isLoading
                                                        ? "cursor-not-allowed text-foreground-secondary"
                                                        : "cursor-pointer hover:text-foreground-secondary"
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <FieldLabel htmlFor="title" className="mb-4 shrink-0">
                                Title
                            </FieldLabel>
                            <TextInput
                                id="title"
                                className="w-full mb-8 shrink-0"
                                value={currentScratch.title}
                                onChange={(e) => handleUpdateScratch("title", e.target.value)}
                                disabled={isLoading || isDeleting || openDeleteModal}
                            />
                            <div className="flex justify-between items-center mb-4">
                                <FieldLabel className="shrink-0">Content</FieldLabel>
                                <IconButton
                                    variant="neutral-ghost"
                                    size="sm"
                                    icon={{ name: copied ? "check" : "copy", size: 14 }}
                                    onClick={handleCopyContent}
                                    disabled={
                                        currentScratch.content.length === 0 ||
                                        copied ||
                                        isLoading ||
                                        isDeleting ||
                                        openDeleteModal
                                    }
                                >
                                    <span>{copied ? "Copied" : "Copy"}</span>
                                </IconButton>
                            </div>
                            <TextBlock
                                autoResize={false}
                                className="w-full grow min-h-auto overflow-y-auto"
                                value={currentScratch.content}
                                onChange={(e) => handleUpdateScratch("content", e.target.value)}
                                disabled={isLoading || isDeleting || openDeleteModal}
                            />
                        </div>
                    )}
                </div>
            </div>

            {importData !== undefined && (
                <Modal
                    modalOpen={openImportModal}
                    onClose={() => {
                        setOpenImportModal(false);
                        setImportData(undefined);
                        setIsLoading(false);
                    }}
                    title="Scratch already in list"
                    confirmAction={{ text: "Replace Existing" }}
                    cancelAction={{ text: "Create copy", variant: "ghost" }}
                    onConfirm={() => handleImportExisting("replace")}
                    onCancel={() => handleImportExisting("copy")}
                >
                    <p>
                        Scratch already exists in the list. Do you want to replace the current scratch or create a new
                        copy?
                    </p>
                </Modal>
            )}

            {deleteMode !== undefined && (
                <Modal
                    modalOpen={openDeleteModal}
                    onClose={() => {
                        setOpenDeleteModal(false);
                    }}
                    title={DELETEMODAL[deleteMode].title}
                    confirmAction={{
                        variant: "error",
                        text: DELETEMODAL[deleteMode][isDeleting ? "textLoading" : "text"],
                        disabled: isDeleting,
                    }}
                    onCancel={() => {
                        setOpenDeleteModal(false);
                    }}
                    onConfirm={handleDeleteScratch}
                >
                    {deleteMode === "current" && (
                        <p>
                            Are you sure you want to delete this scratch:{" "}
                            <span className="font-bold">
                                {currentScratch.title.length === 0
                                    ? getUntitledString(currentScratch.id)
                                    : currentScratch.title}
                            </span>
                            ? This cannot be undone.
                        </p>
                    )}

                    {deleteMode === "all" && (
                        <p>Are you sure you want to delete all your scratches? This cannot be undone.</p>
                    )}
                </Modal>
            )}
        </>
    );
};

export default Quick;

import React, { useMemo, useState } from "react";
import type { LinkItemUpdate, Link, LinkItemType, LinkCreate, LinkUpdate, LinkDelete } from "../../../types";
import TextButton from "../../../components/TextButton";
import Icon from "../../../components/Icon";
import Popover from "../../../components/Popover";
import Modal from "../../../components/Modal";
import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import LinksItem from "./LinkItem";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLinkMutation, useLinks } from "../../../hooks/useLinks";
import { useToast } from "../../../context/toast/ToastContext";

type LinkModalType = "add" | "edit" | "delete";

const LINKMODALDETAILS = {
    link: {
        add: {
            title: "Add Link",
            confirmText: "Add Link",
            confirmTextLoading: "Adding Link...",
        },
        edit: {
            title: "Edit Link",
            confirmText: "Edit Link",
            confirmTextLoading: "Editing Link...",
        },
        delete: {
            title: "Delete Link",
            confirmText: "Delete Link",
            confirmTextLoading: "Deleting Link...",
        },
    },
    folder: {
        add: {
            title: "Add Folder",
            confirmText: "Add Folder",
            confirmTextLoading: "Adding Folder...",
        },
        edit: {
            title: "Rename Folder",
            confirmText: "Rename Folder",
            confirmTextLoading: "Renaming Folder...",
        },
        delete: {
            title: "Delete Folder",
            confirmText: "Delete Folder",
            confirmTextLoading: "Deleting Folder...",
        },
    },
};

const LinksManager = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { data: links, isLoading, error } = useLinks(searchParams.get("folder"));
    const { createLink, isCreating, updateLink, isUpdating, deleteLink, isDeleting } = useLinkMutation();

    const { breadcrumbs, currentFolder, linkItems } = useMemo(() => {
        let initialData = {
            breadcrumbs: [{ id: null, title: "Home" }],
            currentFolder: undefined,
            linkItems: [],
        };

        if (links === undefined) return initialData;

        return {
            breadcrumbs: [...initialData.breadcrumbs, ...links.folder_path],
            currentFolder: links.folder_data,
            linkItems: links.folder_items,
        };
    }, [links]);

    const [selectedItem, setSelectedItem] = useState<Link | null>(null);
    const [popoverAnchor, setPopoverAnchor] = useState<DOMRect | null>(null);
    const [showModal, setShowModal] = useState(false);

    const [linkModalDetails, setLinkModalDetails] = useState<{
        mode: LinkModalType;
        title: string;
        confirmText: string;
        confirmTextLoading: string;
    }>({ mode: "add", ...LINKMODALDETAILS.link.add });

    const [linkForm, setLinkForm] = useState<LinkItemUpdate>({
        title: "",
        href: null,
        item_type: "link",
    });

    const navigateToFolder = (folder_id: string | null) => {
        if (currentFolder?.id !== folder_id) {
            setSelectedItem(null);

            if (folder_id === null) {
                navigate("/links");
            } else {
                navigate("/links?folder=" + folder_id);
            }
        }
    };

    const openLink = (href: string | null) => {
        if (!href) return;

        let targetUrl = href.trim();

        // Check if it already has a protocol; if not, prepend https://
        if (!/^https?:\/\//i.test(targetUrl)) {
            targetUrl = `https://${targetUrl}`;
        }

        window.open(targetUrl, "_blank", "noopener,noreferrer");
    };

    /*
     * Item is unselected: select and highlight the item
     * Item is selected:
     *      Item is folder: navigate to folder
     *      Item is link: open link in new tab
     */
    const handleItemClick = (currentItem: Link) => {
        if (isCreating || isUpdating || isDeleting) return;
        const { id, href, item_type } = currentItem;

        if (selectedItem === null || selectedItem.id !== id) {
            setSelectedItem(currentItem);
        } else {
            if (item_type === "folder") {
                navigateToFolder(currentItem.id);
            } else if (item_type === "link") {
                openLink(href);
            }
        }
    };

    const handleItemOptionsClick = (e: React.MouseEvent<HTMLDivElement>, item: Link) => {
        e.stopPropagation();
        if (isCreating || isUpdating || isDeleting) return;

        setSelectedItem(item);
        setPopoverAnchor(e.currentTarget.getBoundingClientRect());
    };

    /*
     * ADDING, UPDATING, REMOVING LINK ITEMS
     */

    const openForm = (mode: LinkModalType, type?: LinkItemType) => {
        if (selectedItem !== null && type === undefined) {
            // Populate modal form if an item is selected
            setLinkForm({
                title: selectedItem.title,
                href: selectedItem.item_type === "link" ? selectedItem.href : null,
                item_type: selectedItem.item_type,
            });
            setLinkModalDetails({ mode, ...LINKMODALDETAILS[selectedItem.item_type][mode] });
        } else {
            // Otherwise, show default values
            setLinkForm({ title: "", href: null, item_type: type ?? "link" });
            setLinkModalDetails({ mode, ...LINKMODALDETAILS[type ?? "link"][mode] });
        }

        setShowModal(true);
    };

    const handleChange = (key: keyof LinkItemUpdate, value: string | null) => {
        setLinkForm((prev) => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        let valid = true;

        if (linkForm.title.trim().length === 0) {
            valid = false;
            if (linkForm.item_type === "link") {
                showToast("Link name required.", "error");
            } else if (linkForm.item_type === "folder") {
                showToast("Folder name required.", "error");
            }
        }

        // TODO: Check if valid url
        if (linkForm.item_type === "link" && (linkForm.href === null || linkForm.href.trim().length === 0)) {
            valid = false;
            showToast("Link URL required.", "error");
        }

        return valid;
    };

    const handleAddItem = async () => {
        if (!validateForm()) throw null;

        try {
            let submitData: LinkCreate = {
                title: linkForm.title,
                href: linkForm.href,
                item_type: linkForm.item_type,
                folder_id: currentFolder?.id ?? null,
            };

            await createLink(submitData);
            if (linkForm.item_type === "link") {
                showToast("Link added successfully.", "success");
            } else if (linkForm.item_type === "folder") {
                showToast("Folder created successfully.", "success");
            }
            setLinkForm({ title: "", href: null, item_type: "link" });
            setShowModal(false);
        } catch (error: any) {
            showToast(error.message, error.status);
            // Error thrown so that modal does not close
            throw null;
        }
    };

    const updateLinkItem = async () => {
        if (selectedItem === null || !validateForm()) throw null;

        try {
            let submitData: { id: string } & LinkUpdate = {
                id: selectedItem.id,
                title: linkForm.title,
                href: linkForm.href,
            };

            await updateLink(submitData);
            if (linkForm.item_type === "link") {
                showToast("Link updated successfully.", "success");
            } else if (linkForm.item_type === "folder") {
                showToast("Folder renamed successfully.", "success");
            }
            setLinkForm({ title: "", href: null, item_type: "link" });
            setSelectedItem(null);
            setPopoverAnchor(null);
            setShowModal(false);
        } catch (error: any) {
            showToast(error.message, error.status);
            // Error thrown so that modal does not close
            throw null;
        }
    };

    const handleRemoveItem = async () => {
        if (selectedItem === null) {
            if (showModal) throw null;

            return;
        }

        if (isDeleting) return;

        try {
            let submitData: LinkDelete = {
                id: selectedItem.id,
                folder_id: selectedItem.folder_id,
            };

            await deleteLink(submitData);
            if (selectedItem.item_type === "link") {
                showToast("Link removed successfully.", "success");
            } else if (selectedItem.item_type === "folder") {
                showToast("Folder and links inside removed successfully.", "success");
            }
            setSelectedItem(null);
            setPopoverAnchor(null);
            setShowModal(false);
        } catch (error: any) {
            showToast(error.message, error.status);

            // Error thrown so that modal does not close
            if (showModal === true) throw null;
        }
    };

    return (
        <div>
            <div className="flex flex-row justify-between items-center py-8 -mt-4 sticky -top-4 bg-background-0 border-b-2 border-background-3">
                <h1 className="font-medium">
                    <span className="text-4xl align-middle mr-4 uppercase">Links</span>
                </h1>
                {links !== undefined && (
                    <div className="flex items-center gap-4">
                        <TextButton
                            variant="ghost"
                            onClick={() => openForm("add", "folder")}
                            disabled={isLoading || isCreating || isUpdating || isDeleting}
                        >
                            New Folder
                        </TextButton>
                        <TextButton
                            onClick={() => openForm("add", "link")}
                            disabled={isLoading || isCreating || isUpdating || isDeleting}
                        >
                            New Link
                        </TextButton>
                    </div>
                )}
            </div>
            <br />

            {/* BREADCRUMBS */}
            <div className="flex items-center gap-2 select-none flex-wrap">
                {breadcrumbs.map((breadcrumb, index) => {
                    return (
                        <React.Fragment key={index}>
                            {index !== 0 && <Icon name="chevron-right" size={14} />}
                            <p
                                className={
                                    "cursor-pointer hover:text-accent " +
                                    (currentFolder?.id === breadcrumb.id ? "font-normal" : "text-foreground-secondary")
                                }
                                onClick={() => navigateToFolder(breadcrumb.id)}
                            >
                                {breadcrumb.title}
                            </p>
                        </React.Fragment>
                    );
                })}
            </div>
            <br />

            {/* LINKS */}
            {isLoading ? (
                <p>Loading....</p>
            ) : error !== null ? (
                <div className="bg-error-soft border border-error/30 text-error p-4 rounded-lg flex justify-between items-center w-full mb-8">
                    <p className="text-center">Failed to load folders and links: {error.message}</p>
                </div>
            ) : (
                <>
                    {linkItems.length === 0 && (
                        <div className="text-center text-foreground-muted text-sm font-semibold select-none">
                            No items
                        </div>
                    )}
                    {linkItems.map((link, index) => {
                        return (
                            <div key={link.id} className="select-none">
                                <LinksItem
                                    index={index}
                                    handleItemClick={() => handleItemClick(link)}
                                    handleItemOptionsClick={(e) => handleItemOptionsClick(e, link)}
                                    active={selectedItem?.id === link.id}
                                    {...link}
                                />
                            </div>
                        );
                    })}

                    {popoverAnchor !== null && (
                        <Popover
                            anchor={popoverAnchor}
                            position="bottom"
                            horizontalAlign="right"
                            offset={0}
                            onClose={() => {
                                if (isCreating || isUpdating || isDeleting) return;
                                setPopoverAnchor(null);
                                setSelectedItem(null);
                            }}
                        >
                            <div className="bg-background-3 border border-white/20 shadow-xl text-xs text-foreground-primary select-none px-4 py-2 rounded-md">
                                <div
                                    className={
                                        "px-4 py-2 -mx-4 " +
                                        (isCreating || isUpdating || isDeleting
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer hover:bg-foreground-muted/30")
                                    }
                                    onClick={() => openForm("edit")}
                                >
                                    Edit
                                </div>
                                <div
                                    className={
                                        "px-4 py-2 -mx-4 " +
                                        (isCreating || isUpdating || isDeleting
                                            ? "cursor-not-allowed"
                                            : "cursor-pointer hover:bg-foreground-muted/30")
                                    }
                                    onClick={() => {
                                        if (selectedItem?.item_type === "link") {
                                            handleRemoveItem();
                                        } else if (selectedItem?.item_type === "folder") {
                                            openForm("delete");
                                        }
                                    }}
                                >
                                    Remove
                                </div>
                            </div>
                        </Popover>
                    )}
                    {/*
                     * For adding/updating folders and links
                     * For removing folders
                     */}
                    <Modal
                        modalOpen={showModal}
                        title={linkModalDetails.title}
                        onClose={() => {
                            setLinkForm({ title: "", href: null, item_type: linkForm.item_type });
                            setShowModal(false);
                        }}
                        onConfirm={async () => {
                            const mode = linkModalDetails.mode;
                            if (mode === "add") {
                                await handleAddItem();
                            } else if (mode === "edit") {
                                await updateLinkItem();
                            } else if (mode === "delete") {
                                await handleRemoveItem();
                            }
                        }}
                        confirmAction={{
                            text: LINKMODALDETAILS[linkForm.item_type][linkModalDetails.mode][
                                isCreating || isUpdating || isDeleting ? "confirmTextLoading" : "confirmText"
                            ],
                            variant: linkModalDetails.mode === "delete" ? "error" : "primary",
                            disabled: isCreating || isUpdating || isDeleting,
                        }}
                    >
                        {["add", "edit"].includes(linkModalDetails.mode) && (
                            <>
                                <FieldLabel htmlFor="title" className="mb-4">
                                    Title
                                </FieldLabel>
                                <TextInput
                                    id="title"
                                    className="w-full"
                                    value={linkForm.title}
                                    onChange={(e) => handleChange("title", e.target.value)}
                                    disabled={isCreating || isUpdating}
                                />

                                {linkForm.item_type === "link" && (
                                    <>
                                        <FieldLabel htmlFor="href" className="my-4">
                                            URL
                                        </FieldLabel>
                                        <TextInput
                                            id="href"
                                            className="w-full"
                                            value={linkForm.href ?? ""}
                                            onChange={(e) => handleChange("href", e.target.value)}
                                            disabled={isCreating || isUpdating}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        {linkModalDetails.mode === "delete" && (
                            <p>
                                Are you sure you want to remove this folder? This will remove all folders and links
                                inside. This action can't be undone.
                            </p>
                        )}
                    </Modal>
                </>
            )}
        </div>
    );
};

export default LinksManager;

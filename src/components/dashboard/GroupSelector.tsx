import { useState, type ReactNode } from "react";

import FieldLabel from "../FieldLabel";
import Modal from "../Modal";

import type { List, Log, Note } from "../../types";

import { useGroups } from "../../hooks/dashboard/useGroups";
import { useToast } from "../../context/toast/ToastContext";

interface GroupSelectorProps {
    contentId: string;
    currentGroup: {
        id: string | null;
        name: string;
    };
    updateHook?: {
        updateContent: (data: { id: string; group_id: string | null }) => Promise<void | Note | List | Log>;
        isLoading: boolean;
    };
    trigger?: ReactNode;
    triggerClassname?: string;
}

const GroupItem = ({
    groupName,
    isSelected,
    handleClick,
}: {
    groupName: string;
    isSelected: boolean;
    handleClick: () => void;
}) => {
    return (
        <div
            className={
                `px-4 py-2 border-y border-white/10 cursor-pointer max-w-100 truncate select-none ` +
                (isSelected
                    ? "font-bold bg-foreground-muted/30 hover:bg-foreground-muted/50"
                    : "hover:bg-foreground-muted/30")
            }
            onClick={handleClick}
            title={groupName}
        >
            {groupName}
        </div>
    );
};

const GroupSelector = ({ contentId, currentGroup, updateHook, trigger, triggerClassname = "" }: GroupSelectorProps) => {
    const { showToast } = useToast();
    const [showModal, setShowModal] = useState(false);
    const { data: groups, isLoading } = useGroups(showModal);
    const [selectedGroup, setSelectedGroup] = useState<string | null>(currentGroup.id);

    const handleChangeSelection = (value: string | null) => {
        if (selectedGroup !== value) setSelectedGroup(value);
    };

    const handleSelectGroup = async () => {
        if (!updateHook) throw null;

        try {
            let submitData = { id: contentId, group_id: selectedGroup, is_pinned_group: false };

            await updateHook.updateContent(submitData);
        } catch (error: any) {
            showToast(error.message, "error");
            throw null;
        }
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setShowModal((prev) => !prev)}>{trigger}</div>
            ) : (
                <p
                    className={
                        `truncate py-1 px-2 rounded text-xs border cursor-pointer ` +
                        ` ${triggerClassname} ` +
                        (currentGroup.id
                            ? "text-accent border-accent/80 hover:text-accent/60 hover:border-accent/30"
                            : " text-accent/60 border border-accent/30 hover:text-accent hover:border-accent/80")
                    }
                    title={currentGroup.name}
                    onClick={() => setShowModal((prev) => !prev)}
                >
                    {currentGroup.name}
                </p>
            )}

            <Modal
                modalOpen={showModal}
                title="Move to Group"
                confirmAction={{
                    text:
                        selectedGroup === null && currentGroup.id !== null
                            ? updateHook?.isLoading
                                ? "Ungrouping..."
                                : "Ungroup"
                            : updateHook?.isLoading
                              ? "Moving..."
                              : "Move",
                    disabled: isLoading || updateHook?.isLoading || selectedGroup === currentGroup.id,
                }}
                onConfirm={handleSelectGroup}
                onClose={() => setShowModal(false)}
            >
                <div className="pb-4">
                    <FieldLabel className="mb-4 flex items-center max-w-full">
                        <span className="shrink-0">Current Group:</span>
                        <span
                            className="ml-2 min-w-0 truncate py-1 px-2 rounded text-xs border select-none text-accent border-accent/80"
                            title={currentGroup.name}
                        >
                            {currentGroup.name}
                        </span>
                    </FieldLabel>

                    {isLoading ? (
                        <p className="px-4 py-2 border-y border-white/10 select-none">Loading...</p>
                    ) : groups?.length === 0 ? (
                        <p className="px-4 py-2 border-y border-white/10 select-none">No Groups</p>
                    ) : (
                        <>
                            <GroupItem
                                groupName="Ungrouped"
                                isSelected={selectedGroup === null}
                                handleClick={() => handleChangeSelection(null)}
                            />
                            {groups?.map((group, _) => {
                                return (
                                    <GroupItem
                                        key={group.id}
                                        groupName={group.title}
                                        isSelected={selectedGroup === group.id}
                                        handleClick={() => handleChangeSelection(group.id)}
                                    />
                                );
                            })}
                        </>
                    )}
                </div>
            </Modal>
        </>
    );
};

export default GroupSelector;

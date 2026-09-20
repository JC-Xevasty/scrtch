import { useState } from "react";

import Modal from "../../../components/Modal";
import FieldLabel from "../../../components/FieldLabel";
import TextInput from "../../../components/TextInput";
import TextBlock from "../../../components/TextBlock";

import Collection from "../../../components/dashboard/Collection";

import type { GroupCreate } from "../../../types";

import { useToast } from "../../../context/toast/ToastContext";
import { useGroupMutation, useGroups } from "../../../hooks/useGroups";

const GroupCollection = () => {
    const { showToast } = useToast();
    const { data, isLoading, error } = useGroups();
    const { createGroup, isCreating, updateGroup, isUpdating } = useGroupMutation();

    const groups =
        data === undefined
            ? []
            : data.map((group) => ({
                  id: group.id,
                  title: group.title,
                  is_pinned_collection: group.is_pinned_collection,
                  is_pinned_dashboard: group.is_pinned_dashboard,
                  updated_at: group.updated_at,
              }));

    const [showModal, setShowModal] = useState(false);
    const [newGroup, setNewGroup] = useState<GroupCreate>({ title: "", description: "" });

    const handleChange = (key: string, value: string) => {
        setNewGroup((prev) => ({ ...prev, [key]: value }));
    };

    const validateForm = () => {
        let valid = true;

        if (newGroup.title.trim().length === 0) {
            valid = false;
            showToast("Group title required.", "error");
        }

        return valid;
    };

    const handleAddGroup = async () => {
        // Error thrown so that modal does not close
        if (!validateForm()) throw null;

        try {
            let submitData: GroupCreate = { ...newGroup };

            await createGroup(submitData);
            showToast("Group created successfully.", "success");
            setShowModal(false);
        } catch (error: any) {
            showToast(error.message, "error");
            // Error thrown so that modal does not close
            throw null;
        }
    };

    return (
        <>
            <Collection
                collectionName="groups"
                items={groups}
                isLoading={isLoading}
                error={error}
                onCreate={() => setShowModal(true)}
                showGroup={false}
                itemOptions={{ pin_collection: true, pin_dashboard: true }}
                updateHook={{ updateContent: updateGroup, isLoading: isUpdating }}
            />
            <Modal
                modalOpen={showModal}
                title="New Group"
                confirmAction={{ text: isCreating ? "Creating Group...." : "Create Group", disabled: isCreating }}
                onConfirm={handleAddGroup}
                onClose={() => {
                    setNewGroup({ title: "", description: "" });
                    setShowModal(false);
                }}
            >
                <FieldLabel htmlFor="group_name" className="mb-4">
                    Group Name
                </FieldLabel>
                <TextInput
                    id="group_name"
                    className="w-full mb-4"
                    value={newGroup.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                />
                <FieldLabel htmlFor="group_description" className="mb-4">
                    Description
                </FieldLabel>
                <TextBlock
                    id="group_description"
                    className="h-50 overflow-y-auto w-full"
                    autoResize={false}
                    value={newGroup.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
            </Modal>
        </>
    );
};

export default GroupCollection;

import Collection from "../../../components/dashboard/Collection";
import { useNoteMutation, useNotes } from "../../../hooks/useNotes";

const NoteCollection = () => {
    const { data, isLoading, error } = useNotes();
    const { updateNote, isUpdating } = useNoteMutation();

    const notes =
        data === undefined
            ? []
            : data.map((note) => ({
                  id: note.id,
                  title: note.title,
                  group: {
                      id: note.group_id,
                      name: note.groups?.title,
                  },
                  is_pinned_collection: note.is_pinned_collection,
                  is_pinned_group: note.is_pinned_group,
                  is_pinned_dashboard: note.is_pinned_dashboard,
                  updated_at: note.updated_at,
              }));

    return (
        <Collection
            collectionName="notes"
            items={notes}
            isLoading={isLoading}
            error={error}
            itemOptions={{ pin_collection: true, pin_dashboard: true, group: true }}
            updateHook={{ updateContent: updateNote, isLoading: isUpdating }}
        />
    );
};

export default NoteCollection;

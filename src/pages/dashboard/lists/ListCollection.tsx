import Collection from "../../../components/dashboard/Collection";
import { useListMutation, useLists } from "../../../hooks/useLists";

const ListCollection = () => {
    const { data, isLoading, error } = useLists();
    const { updateListRecord, isUpdating } = useListMutation();

    const lists =
        data === undefined
            ? []
            : data.map((list) => ({
                  id: list.id,
                  title: list.title,
                  group: {
                      id: list.group_id,
                      name: list.groups?.title,
                  },
                  is_pinned_collection: list.is_pinned_collection,
                  is_pinned_group: list.is_pinned_group,
                  is_pinned_dashboard: list.is_pinned_dashboard,
                  updated_at: list.updated_at,
              }));

    return (
        <Collection
            collectionName="lists"
            items={lists}
            isLoading={isLoading}
            error={error}
            itemOptions={{ pin_collection: true, pin_dashboard: true, group: true }}
            updateHook={{ updateContent: updateListRecord, isLoading: isUpdating }}
        />
    );
};

export default ListCollection;

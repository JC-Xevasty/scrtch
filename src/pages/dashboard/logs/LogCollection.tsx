import Collection from "../../../components/dashboard/Collection";
import { useLogMutation, useLogs } from "../../../hooks/dashboard/useLogs";

const LogCollection = () => {
    const { data, isLoading, error } = useLogs();
    const { updateLogRecord, isUpdating } = useLogMutation();

    const logs =
        data === undefined
            ? []
            : data.map((log) => ({
                  id: log.id,
                  title: log.title,
                  group: {
                      id: log.group_id,
                      name: log.groups?.title,
                  },
                  is_pinned_collection: log.is_pinned_collection,
                  is_pinned_group: log.is_pinned_group,
                  is_pinned_dashboard: log.is_pinned_dashboard,
                  updated_at: log.updated_at,
              }));

    return (
        <Collection
            collectionName="logs"
            items={logs}
            isLoading={isLoading}
            error={error}
            itemOptions={{ pin_collection: true, pin_dashboard: true, group: true }}
            updateHook={{ updateContent: updateLogRecord, isLoading: isUpdating }}
        />
    );
};

export default LogCollection;

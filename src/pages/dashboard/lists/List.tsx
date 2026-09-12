import { Navigate, useLocation, useParams } from "react-router-dom";
import ListViewer from "./ListViewer";
import ListEditor from "./ListEditor";

const List = () => {
    const { id, mode } = useParams<{
        id: string;
        mode: "view" | "mode" | undefined;
    }>();

    const location = useLocation();

    if (id !== "new" && mode === undefined) {
        return <Navigate to={`/lists/${id}/view`} state={location.state} replace />;
    }

    if (id === "new" && mode !== undefined) {
        return <Navigate to={`/lists/new`} state={location.state} replace />;
    }

    return mode === "view" ? <ListViewer id={id} /> : <ListEditor id={id} />;
};

export default List;

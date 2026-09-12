import { Navigate, useLocation, useParams } from "react-router-dom";
import LogViewer from "./LogViewer";
import LogEditor from "./LogEditor";

const Log = () => {
    const { id, mode } = useParams<{
        id: string;
        mode: "view" | "mode" | undefined;
    }>();

    const location = useLocation();

    if (id !== "new" && mode === undefined) {
        return <Navigate to={`/logs/${id}/view`} state={location.state} replace />;
    }

    if (id === "new" && mode !== undefined) {
        return <Navigate to={`/logs/new`} state={location.state} replace />;
    }
    
    return mode === "view" ? <LogViewer id={id} /> : <LogEditor id={id} />;
};

export default Log;

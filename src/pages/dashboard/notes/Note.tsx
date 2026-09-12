import { Navigate, useLocation, useParams } from "react-router-dom";
import NoteViewer from "./NoteViewer";
import NoteEditor from "./NoteEditor";

const Note = () => {
    const { id, mode } = useParams<{
        id: string;
        mode: "view" | "mode" | undefined;
    }>();

    const location = useLocation();

    if (id !== "new" && mode === undefined) {
        return <Navigate to={`/notes/${id}/view`} state={location.state} replace />;
    }

    if (id === "new" && mode !== undefined) {
        return <Navigate to={`/notes/new`} state={location.state} replace />;
    }

    return mode === "view" ? <NoteViewer id={id} /> : <NoteEditor id={id} />;
};

export default Note;

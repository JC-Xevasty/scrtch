import { supabase } from "../utils/supabase";
import type { Note, NoteCreate, NoteUpdate } from "../types";

/* Fetch all notes which belongs to the authenticated user */
export const fetchNoteCollection = async (): Promise<Note[]> => {
    const { data, error } = await supabase
        .from("notes")
        .select("*, groups(title)")
        .order("updated_at", { ascending: false });

    if (error) {
        throw { status: "error", message: error.message }
    }

    return (data as unknown as Note[]) ?? [];
}

/* Fetch a single note by id */
export const fetchNote = async (id: string): Promise<Note> => {
    const { data, error } = await supabase
        .from("notes")
        .select("*, groups(title)")
        .eq("id", id)
        .maybeSingle();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as Note;
}

/* Create a note */
export const createNote = async (note: NoteCreate): Promise<Note> => {
    const { data, error } = await supabase
        .from("notes")
        .insert([note])
        .select("*, groups(title)")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as Note;
}

/* Update a note by id */
export const updateNote = async (id: string, updates: NoteUpdate): Promise<Note> => {
    const { data, error } = await supabase
        .from("notes")
        .update(updates)
        .eq('id', id)
        .select("*, groups(title)")
        .single();

    if (error) {
        throw { status: "error", message: error.message }
    }

    return data as unknown as Note;
}

/* Delete a note by id */
export const deleteNote = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)

    if (error) {
        throw { status: "error", message: error.message }
    }
}
export type ButtonVariant =
    | "primary"
    | "ghost"
    | "success"
    | "success-ghost"
    | "error"
    | "error-ghost"
    | "neutral"
    | "neutral-ghost";

export type PopoverPosition = "top" | "bottom" | "left" | "right";
export type PopoverVerticalAlign = "top" | "center" | "bottom";
export type PopoverHorizontalAlign = "left" | "center" | "right";

/* 
 * =============================
 * GROUP
 * =============================
 */

export interface Group {
    id: string;
    title: string;
    description: string;
    is_pinned_collection: boolean;
    is_pinned_dashboard: boolean;
    created_at: string;
    updated_at: string;
}

export interface GroupContent extends Group {
    content: Content[];
}

export type GroupCreate = Pick<Group, "title" | "description">;
export type GroupUpdate = Partial<Pick<Group, "title" | "description" | "is_pinned_collection" | "is_pinned_dashboard">>;
export interface GroupDelete { id: string; delete_contents: boolean; };

/* 
 * =============================
 * NOTE 
 * =============================
 */

export interface Note {
    id: string;
    title: string;
    content: string;
    is_pinned_collection: boolean;
    is_pinned_group: boolean;
    is_pinned_dashboard: boolean;
    group_id: string | null;
    groups: { title: string } | null;
    created_at: string;
    updated_at: string;
}

export type NoteCreate = Pick<Note, "title" | "content" | "group_id">;
export type NoteUpdate = Partial<Pick<Note, "title" | "content" | "is_pinned_collection" | "is_pinned_group" | "is_pinned_dashboard" | "group_id">>

/* 
 * =============================
 * LIST 
 * =============================
 */

export type ListType = "ordered" | "unordered" | "checklist";

export interface List {
    id: string;
    title: string;
    list_type: ListType;
    is_pinned_collection: boolean;
    is_pinned_group: boolean;
    is_pinned_dashboard: boolean;
    group_id: string | null;
    groups: { title: string } | null;
    created_at: string;
    updated_at: string;
}

export interface ListItem {
    id: string;
    list_id: string;
    title: string;
    content: string;
    checked: boolean;
    item_order: number;
    created_at: string;
    updated_at: string;
}

export type ListDetail = List & {
    list_items: ListItem[];
};

export type ListItemUpdate = Pick<ListItem, "title" | "content"> & Partial<Pick<ListItem, "id" | "item_order">>;
export type ListItemDelete = Pick<ListItem, "id">;

export type ListCreate = Pick<List, "title" | "list_type" | "group_id"> & { list_items: ListItemUpdate[] };
export type ListRecordUpdate = Partial<Pick<List, "title" | "list_type" | "is_pinned_collection" | "is_pinned_group" | "is_pinned_dashboard" | "group_id">>
export type ListUpdate = Pick<List, "id" | "title" | "list_type" | "group_id"> & {
    new_list_items: ListItemUpdate[];
    existing_list_items: ListItemUpdate[];
    removed_list_items: ListItemDelete[];
}

/* 
 * =============================
 * LOG 
 * =============================
 */

export interface Log {
    id: string;
    title: string;
    is_pinned_collection: boolean;
    is_pinned_group: boolean;
    is_pinned_dashboard: boolean;
    group_id: string | null;
    groups: { title: string } | null;
    created_at: string;
    updated_at: string;
}

export interface LogItem {
    id: string;
    log_id: string;
    title: string;
    content: string;
    entry_date: string;
    created_at: string;
    updated_at: string;
}

export type LogDetail = Log & {
    log_items: LogItem[];
};


export type LogItemUpdate = Pick<LogItem, "title" | "content" | "entry_date"> & Partial<Pick<LogItem, "id">>;
export type LogItemDelete = Pick<LogItem, "id">;

export type LogCreate = Pick<Log, "title" | "group_id"> & { log_items: LogItemUpdate[] };
export type LogRecordUpdate = Partial<Pick<Log, "title" | "is_pinned_collection" | "is_pinned_group" | "is_pinned_dashboard" | "group_id">>
export type LogUpdate = Pick<Log, "id" | "title" | "group_id"> & {
    new_log_items: LogItemUpdate[];
    existing_log_items: LogItemUpdate[];
    removed_log_items: LogItemDelete[];
}


/* 
 * =============================
 * LINK
 * =============================
 */


export type LinkItemType = "folder" | "link";

export interface Link {
    id: string;
    title: string;
    href: string | null;
    item_type: LinkItemType;
    folder_id: string | null;
    created_at: string;
    updated_at: string;
}

export interface LinkFolder {
    folder_data: Pick<Link, "id" | "title">;
    folder_path: (Pick<Link, "id" | "title" | "folder_id"> & { depth: number })[];
    folder_items: Link[]
}

export type LinkCreate = Pick<Link, "title" | "href" | "item_type" | "folder_id">;
export type LinkUpdate = Partial<Pick<Link, "title" | "href" | "folder_id">>;
export type LinkDelete = Pick<Link, "id" | "folder_id">;
export type LinkItemUpdate = Pick<Link, "title" | "href" | "item_type"> & Partial<Pick<Link, "id">>

/* 
 * =============================
 * DASHBOARD
 * =============================
 */

export interface DashboardStats {
    notes: { count: number, size: number };
    lists: { count: number, size: number };
    list_items: { count: number, size: number };
    logs: { count: number, size: number };
    log_items: { count: number, size: number };
    links: { folder_count: number, link_count: number, size: number };
    groups: { count: number, size: number };
}


export interface Content {
    id: string;
    type: "notes" | "lists" | "logs";
    title: string;
    group_id: string | null;
    group_title: string | null;
    is_pinned_collection: boolean;
    is_pinned_group: boolean;
    is_pinned_dashboard: boolean;
    updated_at: string;
}

export interface DashboardCleanupStats {
    empty_groups: Group[];
    ungrouped_content: Content[];
}

export interface DashboardPinnedItems {
    content: Content[];
    groups: Group[];
}
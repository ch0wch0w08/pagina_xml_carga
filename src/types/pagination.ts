
export interface PaginationQuery {
    limit: number;
    sortBy: string;
    direction: "ASC" | "DESC";
    lastId?: number | null;
    lastSortValue?: unknown;
}

export interface PaginationResponse<T> {
    content: T[];
    limit: number;
    hasNext: boolean;
    nextLastId?: number | null;
    nextLastSortValue?: unknown;
    totalItems?: number | null;
}

export interface Error{
    message : string,
    exception: string,
    error: string,
    path: string
}
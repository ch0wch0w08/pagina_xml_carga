import axios from "axios";
import type { PaginationQuery, PaginationResponse } from "../types/pagination";

const api_url = "http://localhost:8080/api/v1/";

export const api = axios.create({
    baseURL: api_url,
    timeout: 10000,
    withCredentials: true
})


export async function getCursorPage<T, TFilter extends object>(
    resource: string,
    query: PaginationQuery,
    filter: TFilter,
): Promise<PaginationResponse<T>> {
    const response = await api.get<PaginationResponse<T>>(resource, {
        params: {
            ...query,
            ...filter,
        },
    });
    return response.data;
}





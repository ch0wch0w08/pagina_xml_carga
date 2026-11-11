import { useQuery } from "@tanstack/react-query";
import type { PaginationResponse } from "../../../types/pagination";
import type { GastoPresupuestalFullResponse, GastoPresupuestalResponse, TiempoOptions } from "../type/MefTypes";
import { MefService } from "../service/MefService";
import type { ColumnFiltersState, PaginationState, SortingState } from "@tanstack/react-table";


function useGetAllGastos(
    sorting: SortingState,
    columnFilters: ColumnFiltersState,
    pagination: PaginationState,
    lastId?: number | null,
    lastSortValue?: unknown
) { 

    const filters = Object.fromEntries(
        columnFilters.map(filter => [filter.id, filter.value])
    )

    return useQuery<PaginationResponse<GastoPresupuestalResponse>,Error>({
        queryKey: [
            "useGetAllGastos",
            sorting,
            columnFilters,
            pagination.pageSize,
            lastId,
            lastSortValue,
        ],
        queryFn: () => MefService.getAll(
           {
                limit: pagination.pageSize,
                direction: sorting[0]?.desc ? "DESC" : "ASC",
                sortBy: sorting[0]?.id ?? "idHecho",
                lastId: lastId,
                lastSortValue: lastSortValue
           },
           filters
        )
    })
}

function useGetGastoById(
    id : number
){
    return useQuery<GastoPresupuestalFullResponse, Error>({
        queryKey: ["getById",id],
        queryFn: () => MefService.getById(id)
    })

}

function useGetTiempoOptions() {
    return useQuery<TiempoOptions, Error>({
        queryKey: ["getTiempoOptions"],
        queryFn: MefService.getTiempoOptions,
        staleTime: 5 * 60 * 1000,
    });
}

export const useMef = {
    useGetGastoById,
    useGetAllGastos,
    useGetTiempoOptions
}
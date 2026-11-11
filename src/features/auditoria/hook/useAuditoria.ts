import { useQuery } from '@tanstack/react-query';
import type { ColumnFiltersState, PaginationState, SortingState } from '@tanstack/react-table';
import type { PaginationResponse } from '../../../types/pagination';
import { AuditoriaService } from '../service/AuditoriaService';
import type {
  AuditoriaDetalle,
  AuditoriaDetalleFilter,
  AuditoriaEjecucion,
  AuditoriaEjecucionFilter,
  AuditoriaRechazo,
} from '../type/AuditoriaTypes';

const filtersFromColumns = (columnFilters: ColumnFiltersState) => Object.fromEntries(columnFilters.map(({ id, value }) => [id, value]));

export const useAuditoria = {

  useEjecuciones: (
    sorting: SortingState,
    columnFilters: ColumnFiltersState,
    pagination: PaginationState,
    cursor: { lastId?: number | null; lastSortValue?: unknown },
  ) => useQuery<PaginationResponse<AuditoriaEjecucion>, Error>({
    queryKey: ['auditoria-ejecuciones', sorting, columnFilters, pagination.pageSize, cursor],
    queryFn: () => AuditoriaService.getEjecuciones({
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id ?? 'idEjecucion',
      direction: sorting[0]?.desc ? 'DESC' : 'ASC',
      ...cursor,
    }, 
    filtersFromColumns(columnFilters) as AuditoriaEjecucionFilter),
  }),

  useDetalles: (
    idEjecucion: number,
    sorting: SortingState,
    pagination: PaginationState,
    filters: AuditoriaDetalleFilter,
    cursor: { lastId?: number | null; lastSortValue?: unknown },
  ) => useQuery<PaginationResponse<AuditoriaDetalle>, Error>({
    queryKey: ['auditoria-detalles', idEjecucion, sorting, pagination.pageSize, filters, cursor],
    queryFn: () => AuditoriaService.getDetalles(idEjecucion, {
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id ?? 'idDetalle',
      direction: sorting[0]?.desc ? 'DESC' : 'ASC',
      ...cursor,
    }, 
    filters),
    enabled: idEjecucion > 0,
  }),

  useRechazos: (
    idEjecucion: number,
    sorting: SortingState,
    pagination: PaginationState,
    cursor: { lastId?: number | null; lastSortValue?: unknown },
  ) => useQuery<PaginationResponse<AuditoriaRechazo>, Error>({
    queryKey: ['auditoria-rechazos', idEjecucion, sorting, pagination.pageSize, cursor],
    queryFn: () => AuditoriaService.getRechazos(idEjecucion, {
      limit: pagination.pageSize,
      sortBy: sorting[0]?.id ?? 'idRechazo',
      direction: sorting[0]?.desc ? 'DESC' : 'ASC',
      ...cursor,
    }),
    enabled: idEjecucion > 0,
  }),

  useAnios: () => useQuery<number[], Error>({
    queryKey: ['auditoria-anios'],
    queryFn: AuditoriaService.getAnios,
    staleTime: 5 * 60 * 1000,
  }),

};

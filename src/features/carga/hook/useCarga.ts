import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PaginationQuery } from '../../../types/pagination';
import { ApiError, getApiErrorMessage, toApiError } from '../../../utils/apiError';
import { CargaService, type UrlPayload } from '../service/CargaService';
import type { UrlFilter, UrlRecord } from '../type/CargaTypes';

export { ApiError as CargaApiError, getApiErrorMessage as getCargaErrorMessage, toApiError as toCargaApiError };

export function useUrls(query: PaginationQuery, filter: UrlFilter) {
  return useQuery({
    queryKey: ['carga-urls', query, filter],
    queryFn: () => CargaService.getUrls(query, filter),
  });
}

export function useUrlYears() {
  return useQuery({
    queryKey: ['carga-url-years'],
    queryFn: CargaService.getYears,
    staleTime: 5 * 60 * 1000,
  });
}

export function useUrlMutations() {
  
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['carga-urls'] });

  const create = useMutation<UrlRecord, ApiError, UrlPayload>({
    mutationFn: async (payload) => {
      try {
        return await CargaService.createUrl(payload);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: invalidate,
  });
  
  const update = useMutation<
    UrlRecord,
    ApiError,
    { id: number; payload: UrlPayload }
  >({
    mutationFn: async ({ id, payload }) => {
      try {
        return await CargaService.updateUrl(id, payload);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: invalidate,
  });
  const remove = useMutation<void, ApiError, number>({
    mutationFn: async (id) => {
      try {
        return await CargaService.deleteUrl(id);
      } catch (error) {
        throw toApiError(error);
      }
    },
    onSuccess: invalidate,
  });

  return { create, update, remove };
}

export type { UrlRecord };

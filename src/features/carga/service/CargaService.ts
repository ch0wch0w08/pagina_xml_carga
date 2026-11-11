import { api } from '../../../services/ApiService';
import type { PaginationQuery, PaginationResponse } from '../../../types/pagination';
import type { EtlJob, StartEtlResponse, UrlFilter, UrlRecord } from '../type/CargaTypes';

export interface UrlPayload {
  UrlValue: string;
  CantidadRegistros?: number;
}

const etlBaseUrl = 'http://localhost:8080/api/etl/ejecuciones';

export const CargaService = {
  getUrls: async (
    query: PaginationQuery,
    filter: UrlFilter,
  ): Promise<PaginationResponse<UrlRecord>> => {
    const response = await api.get('carga', { params: { ...query, ...filter } });
    return response.data;
  },

  getYears: async (): Promise<number[]> => {
    const response = await api.get('carga/anios');
    return response.data;
  },

  createUrl: async (payload: UrlPayload): Promise<UrlRecord> => {
    const response = await api.post('carga', payload);
    return response.data;
  },

  updateUrl: async (id: number, payload: UrlPayload): Promise<UrlRecord> => {
    const response = await api.put(`carga/${id}`, payload);
    return response.data;
  },

  deleteUrl: async (id: number): Promise<void> => {
    await api.delete(`carga/${id}`);
  },

  startJob: async (): Promise<StartEtlResponse> => {
    const response = await fetch(etlBaseUrl, { method: 'POST' });
    if (!response.ok) throw new Error('No se pudo iniciar la carga');
    return response.json();
  },

  cancelJob: async (jobId: string): Promise<void> => {
    const response = await fetch(`${etlBaseUrl}/${jobId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('No se pudo cancelar la carga');
  },

  getJob: async (jobId: string): Promise<EtlJob> => {
    const response = await fetch(`${etlBaseUrl}/${jobId}`);
    if (!response.ok) throw new Error('No se pudo consultar la carga');
    return response.json();
  },

  eventsUrl: (jobId: string) => `${etlBaseUrl}/${jobId}/eventos`,
};

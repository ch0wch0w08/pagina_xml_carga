import { api } from '../../../services/ApiService';
import type { PaginationQuery, PaginationResponse } from '../../../types/pagination';
import type {
  AuditoriaDetalle,
  AuditoriaDetalleFilter,
  AuditoriaEjecucion,
  AuditoriaEjecucionFilter,
  AuditoriaRechazo,
} from '../type/AuditoriaTypes';

export const AuditoriaService = {
  
  getEjecuciones: async (
    query: PaginationQuery,
    filter: AuditoriaEjecucionFilter,
  ): Promise<PaginationResponse<AuditoriaEjecucion>> => {
    const response = await api.get('auditoria', { params: { ...query, ...filter } });
    return response.data;
  },

  getDetalles: async (
    idEjecucion: number,
    query: PaginationQuery,
    filter: AuditoriaDetalleFilter,
  ): Promise<PaginationResponse<AuditoriaDetalle>> => {
    const response = await api.get(`auditoria/${idEjecucion}/detalles`, {
      params: { ...query, ...filter },
    });
    return response.data;
  },

  getRechazos: async (
    idEjecucion: number,
    query: PaginationQuery,
  ): Promise<PaginationResponse<AuditoriaRechazo>> => {
    const response = await api.get(`auditoria/${idEjecucion}/rechazos`, {
      params: query,
    });
    return response.data;
  },

  getAnios: async (): Promise<number[]> => {
    const response = await api.get('auditoria/anios');
    return response.data;
  },
};

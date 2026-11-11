export interface AuditoriaEjecucion {
  idEjecucion: number;
  fechaInicio: string;
  fechaFin: string | null;
  estadoEjecucion: string;
  totalProcesados: number;
  totalErrores: number;
  observaciones: string | null;
}

export interface AuditoriaDetalle {
  idDetalle: number;
  idEjecucion: number;
  url: string;
  anioEje: number;
  estadoUrl: string;
  registrosEsperados: number;
  registrosRecibidos: number;
  registrosInsertados: number;
  mensajeError: string | null;
  httpStatus: number;
  intentos: number;
  duracionMs: number;
  bytesDescargados: number;
  tipoError: string | null;
  hashContenido: string | null;
  fechaIntento: string;
}

export interface AuditoriaRechazo {
  idRechazo: number;
  idEjecucion: number;
  urlOrigen: string;
  idStg: number | null;
  motivo: string;
  filaOriginal: string;
  fechaRechazo: string;
}

export interface AuditoriaEjecucionFilter {
  estadoEjecucion?: string;
}

export interface AuditoriaDetalleFilter {
  anioEje?: number;
  estadoUrl?: string;
  httpStatus?: number;
}

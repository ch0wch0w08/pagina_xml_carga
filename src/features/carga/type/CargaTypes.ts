export interface UrlRecord {
  idUrl: number;
  urlValue: string;
  anio: number;
  cantidadRegistros: number | null;
}

export interface UrlFilter {
  anio?: number;
}

export interface EtlJob {
  jobId: string;
  idEjecucion: number | null;
  status: 'RUNNING' | 'CANCELLING' | 'SUCCEEDED' | 'FAILED' | 'CANCELLED';
  exitCode: number | null;
}

export interface EtlEvent {
  type: string;
  timestamp: string;
  message: string;
  data: Record<string, unknown>;
}

export interface StartEtlResponse {
  jobId: string;
  status: string;
  message: string;
}

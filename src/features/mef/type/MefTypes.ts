
export interface GastoPresupuestalFilter {
  anioEje?: number;
  mesEje?: number;
  idEntidad?: number;
  idClasificador?: number;
  idUbicacion?: number;
  idEjecucion?: number;
}

export interface TiempoOptions {
  anios: number[];
  meses: number[];
}


export interface ClasificadorGasto {
  idClasificador: number;
  categGasto: number;
  tipoTransaccion: number;
  generica: number;
  subgenerica: number;
  subgenericaDet: number;
  especifica: number;
  especificaDet: number;
}


export interface Entidad {
  idEntidad: number;
  idNivelGobierno: string;
  subTipoGobierno: string;
  idSector: string;
  idPliego: string;
  idEjecutora: string;
  secEjec: number;
}

export interface Tiempo {
  idTiempo: number;
  anioEje: number;
  mesEje: number;
}

export interface Ubigeo {
  idUbicacion: number;
  departamento: string;
  provincia: string;
  distrito: string;
}


export interface GastoPresupuestalResponse {
  idHecho: number;
  pia: number;
  pim: number;
  certificado: number;
  compAnual: number;
  atencionCompMensual: number;
  devengado: number;
  girado: number;
  idEjecucion: number;
  idUrl: number | null;
  fechaCarga: string;

  idTiempo: number;
  idEntidad: number;
  idClasificador: number;
  idUbicacion: number;
}


export interface GastoPresupuestalFullResponse {
  idHecho: number;
  pia: number;
  pim: number;
  certificado: number;
  compAnual: number;
  atencionCompMensual: number;
  devengado: number;
  girado: number;
  idEjecucion: number;
  idUrl: number | null;
  fechaCarga: string;

  tiempo: Tiempo;
  entidad: Entidad;
  clasificador: ClasificadorGasto;
  ubicacion: Ubigeo;
}
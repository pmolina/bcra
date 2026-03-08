export interface Entidad {
  entidad: string;
  situacion: number;    // 1=Normal, 2+=Problematic
  monto: number;        // in thousands of AR$
  enRevision: boolean;
  procesoJud: boolean;
}

export interface Periodo {
  periodo: string;      // "202512"
  entidades: Entidad[];
}

export interface BCRAResult {
  identificacion: number;
  denominacion: string;
  periodos: Periodo[];
}

export interface BCRAResponse {
  status: number;
  results: BCRAResult;
}

export type ResultState =
  | { status: 'loading' }
  | { status: 'success'; data: BCRAResult }
  | { status: 'error'; message: string }
  | { status: 'empty' };

// Cheques rechazados
export interface ChequeDetalle {
  nroCheque: number;
  fechaRechazo: string;   // "2024-09-17"
  monto: number;          // AR$ face value
  fechaPago: string | null;
  fechaPagoMulta: string | null;
  estadoMulta: string;
  ctaPersonal: boolean;
  denomJuridica: string;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface ChequeEntidad {
  entidad: number;        // bank code
  detalle: ChequeDetalle[];
}

export interface ChequeCausal {
  causal: string;
  entidades: ChequeEntidad[];
}

export interface ChequesResult {
  identificacion: number;
  denominacion: string;
  causales: ChequeCausal[];
}

export interface ChequesResponse {
  status: number;
  results: ChequesResult;
}

export type ChequesState =
  | { status: 'loading' }
  | { status: 'success'; data: ChequesResult }
  | { status: 'error'; message: string }
  | { status: 'empty' };

export interface NosisInfo {
  actividad: string | null;
  provincia: string | null;
}

export type NosisState =
  | { status: 'loading' }
  | { status: 'success'; data: NosisInfo }
  | { status: 'idle' };

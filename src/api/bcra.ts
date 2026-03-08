import type { BCRAResponse, ChequesResponse, NosisInfo } from '../types/bcra';

const BASE = 'https://api.bcra.gob.ar/centraldedeudores/v1.0/Deudas';

export class NotFoundError extends Error {}

export async function fetchDebtHistory(cuit: string): Promise<BCRAResponse> {
  const res = await fetch(`${BASE}/Historicas/${cuit}`);
  if (res.status === 404) throw new NotFoundError('CUIT sin deuda registrada');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<BCRAResponse>;
}

export async function fetchRejectedChecks(cuit: string): Promise<ChequesResponse> {
  const res = await fetch(`${BASE}/ChequesRechazados/${cuit}`);
  if (res.status === 404) throw new NotFoundError('CUIT sin cheques rechazados');
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<ChequesResponse>;
}

export async function fetchNosisInfo(cuit: string): Promise<NosisInfo> {
  const res = await fetch(`/api/nosis?cuit=${cuit}`);
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json() as Promise<NosisInfo>;
}

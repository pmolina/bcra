import { useState } from 'react';
import type { ResultState, ChequesState } from '../types/bcra';
import { DebtChart } from './DebtChart';
import { ChecksTable } from './ChecksTable';

function ShareIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
      <polyline points="16 6 12 2 8 6"/>
      <line x1="12" y1="2" x2="12" y2="15"/>
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

interface Props {
  cuit: string;
  state: ResultState;
  checksState: ChequesState;
}

function formatCuit(cuit: string): string {
  return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
}

type Tab = 'deudas' | 'cheques';

function Spinner() {
  return (
    <div className="flex items-center justify-center h-32 gap-2 text-gray-400 dark:text-gray-500">
      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span className="text-sm">Consultando BCRA…</span>
    </div>
  );
}

export function ResultCard({ cuit, state, checksState }: Props) {
  const [tab, setTab] = useState<Tab>('deudas');
  const [copied, setCopied] = useState(false);

  function handleShare() {
    const url = `${window.location.origin}${window.location.pathname}?cuit=${cuit}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const denominacion =
    state.status === 'success' ? state.data.denominacion :
    checksState.status === 'success' ? checksState.data.denominacion :
    null;

  const hasIrregularLastPeriod = state.status === 'success' && (() => {
    const lastPeriodo = state.data.periodos.reduce((a, b) =>
      a.periodo > b.periodo ? a : b
    );
    return lastPeriodo.entidades.some(e => e.situacion >= 2);
  })();

  const checksCount =
    checksState.status === 'success'
      ? checksState.data.causales.reduce(
          (sum, c) => sum + c.entidades.reduce((s, e) => s + e.detalle.length, 0),
          0
        )
      : null;

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">{formatCuit(cuit)}</p>
          {denominacion && (
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-0.5">
              {denominacion}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {hasIrregularLastPeriod ? (
            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded-full whitespace-nowrap">
              Situación irregular
            </span>
          ) : state.status === 'success' ? (
            <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full whitespace-nowrap">
              Situación normal
            </span>
          ) : null}
          <button
            onClick={handleShare}
            title="Copiar enlace con este CUIT"
            className={`p-1.5 rounded-lg border transition-colors ${
              copied
                ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            {copied ? <CheckIcon /> : <ShareIcon />}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 dark:border-gray-700 px-4">
        {([
          { key: 'deudas', label: 'Deudas históricas' },
          { key: 'cheques', label: 'Cheques rechazados', count: checksCount },
        ] as { key: Tab; label: string; count?: number | null }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`py-2.5 px-1 mr-5 text-xs font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            }`}
          >
            {t.label}
            {t.count != null && t.count > 0 && (
              <span className="ml-1.5 bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-xs font-semibold px-1.5 py-0.5 rounded-full">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Body */}
      <div className="p-4">
        {tab === 'deudas' && (
          <>
            {state.status === 'loading' && <Spinner />}
            {state.status === 'error' && (
              <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400 text-sm">
                {state.message}
              </div>
            )}
            {state.status === 'empty' && (
              <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                Sin deuda registrada en el BCRA
              </div>
            )}
            {state.status === 'success' && (
              state.data.periodos.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                  Sin períodos con deuda
                </div>
              ) : (
                <DebtChart periodos={state.data.periodos} />
              )
            )}
          </>
        )}

        {tab === 'cheques' && (
          <>
            {checksState.status === 'loading' && <Spinner />}
            {checksState.status === 'error' && (
              <div className="flex items-center justify-center h-32 text-red-500 dark:text-red-400 text-sm">
                {checksState.message}
              </div>
            )}
            {checksState.status === 'empty' && (
              <div className="flex items-center justify-center h-32 text-gray-400 dark:text-gray-500 text-sm">
                Sin cheques rechazados
              </div>
            )}
            {checksState.status === 'success' && (
              <ChecksTable data={checksState.data} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

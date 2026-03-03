import { useState, useEffect } from 'react';
import type { ResultState, ChequesState } from './types/bcra';
import { fetchDebtHistory, fetchRejectedChecks } from './api/bcra';
import { CUITInput } from './components/CUITInput';
import { ResultCard } from './components/ResultCard';

function SunIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2" x2="12" y2="6"/>
      <line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.22" y1="4.22" x2="7.05" y2="7.05"/>
      <line x1="16.95" y1="16.95" x2="19.78" y2="19.78"/>
      <line x1="2" y1="12" x2="6" y2="12"/>
      <line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.22" y1="19.78" x2="7.05" y2="16.95"/>
      <line x1="16.95" y1="7.05" x2="19.78" y2="4.22"/>
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function App() {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const [results, setResults] = useState<Map<string, ResultState>>(new Map());
  const [checksResults, setChecksResults] = useState<Map<string, ChequesState>>(new Map());
  const [activeCuits, setActiveCuits] = useState<string[]>([]);

  const [initialInputValue] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const cuit = params.get('cuit');
    return cuit ? cuit.split(',').join('\n') : '';
  });

  const loading = [...results.values()].some(r => r.status === 'loading')
    || [...checksResults.values()].some(r => r.status === 'loading');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cuit = params.get('cuit');
    if (cuit) {
      const cuits = cuit.split(',').map(c => c.replace(/-/g, '').trim()).filter(Boolean);
      if (cuits.length > 0) handleSubmit(cuits);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(cuits: string[]) {
    setActiveCuits(cuits);

    const loadingDebt = new Map<string, ResultState>(cuits.map(c => [c, { status: 'loading' }]));
    const loadingChecks = new Map<string, ChequesState>(cuits.map(c => [c, { status: 'loading' }]));
    setResults(loadingDebt);
    setChecksResults(loadingChecks);

    // Fetch debt history and rejected checks in parallel for all CUITs
    const [debtSettled, checksSettled] = await Promise.all([
      Promise.allSettled(cuits.map(c => fetchDebtHistory(c))),
      Promise.allSettled(cuits.map(c => fetchRejectedChecks(c))),
    ]);

    setResults(() => {
      const next = new Map<string, ResultState>();
      debtSettled.forEach((result, i) => {
        const cuit = cuits[i]!;
        if (result.status === 'fulfilled') {
          const data = result.value.results;
          if (!data || data.periodos.length === 0) {
            next.set(cuit, { status: 'empty' });
          } else {
            next.set(cuit, { status: 'success', data });
          }
        } else {
          const msg = result.reason instanceof Error ? result.reason.message : 'Error desconocido';
          next.set(cuit, msg.includes('sin deuda') ? { status: 'empty' } : { status: 'error', message: msg });
        }
      });
      return next;
    });

    setChecksResults(() => {
      const next = new Map<string, ChequesState>();
      checksSettled.forEach((result, i) => {
        const cuit = cuits[i]!;
        if (result.status === 'fulfilled') {
          const data = result.value.results;
          if (!data || data.causales.length === 0) {
            next.set(cuit, { status: 'empty' });
          } else {
            next.set(cuit, { status: 'success', data });
          }
        } else {
          const msg = result.reason instanceof Error ? result.reason.message : 'Error desconocido';
          next.set(cuit, msg.includes('sin cheques') ? { status: 'empty' } : { status: 'error', message: msg });
        }
      });
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Central de Deudores del BCRA
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Consultá el historial de deudas por CUIL/CUIT.
            </p>
          </div>
          <button
            onClick={() => setDark(d => !d)}
            className="shrink-0 mt-1 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {dark ? <SunIcon /> : <MoonIcon />}
          </button>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 mb-8">
          <CUITInput onSubmit={handleSubmit} loading={loading} initialValue={initialInputValue} />
        </div>

        {activeCuits.length > 0 && (
          <div className="space-y-5">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Resultados ({activeCuits.length} CUIT{activeCuits.length !== 1 ? 's' : ''})
            </h2>
            {activeCuits.map(cuit => (
              <ResultCard
                key={cuit}
                cuit={cuit}
                state={results.get(cuit) ?? { status: 'loading' }}
                checksState={checksResults.get(cuit) ?? { status: 'loading' }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

import type { ChequesResult, ChequeDetalle } from '../types/bcra';

interface Props {
  data: ChequesResult;
}

function formatDate(d: string | null): string {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}/${m}/${y}`;
}

function formatARS(n: number): string {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
}

const MULTA_COLORS: Record<string, string> = {
  'Pagada':         'text-green-600 dark:text-green-400',
  'No Corresponde': 'text-gray-500 dark:text-gray-400',
};

function multaClass(estado: string): string {
  return MULTA_COLORS[estado] ?? 'text-red-600 dark:text-red-400';
}

function CheckRow({ row }: { row: ChequeDetalle }) {
  return (
    <tr className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750">
      <td className="px-3 py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
        {row.nroCheque}
      </td>
      <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 whitespace-nowrap">
        {formatDate(row.fechaRechazo)}
      </td>
      <td className="px-3 py-2 text-xs text-right font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
        {formatARS(row.monto)}
      </td>
      <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">
        {row.ctaPersonal ? 'Personal' : (row.denomJuridica || 'Jurídica')}
      </td>
      <td className={`px-3 py-2 text-xs font-medium ${multaClass(row.estadoMulta)}`}>
        {row.estadoMulta || '—'}
      </td>
      <td className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
        {formatDate(row.fechaPago)}
      </td>
    </tr>
  );
}

export function ChecksTable({ data }: Props) {
  const totalChecks = data.causales.reduce(
    (sum, c) => sum + c.entidades.reduce((s, e) => s + e.detalle.length, 0),
    0
  );

  if (totalChecks === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 text-sm">
        Sin cheques rechazados
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {data.causales.map(causal => (
        <div key={causal.causal}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
              {causal.causal}
            </span>
          </div>
          {causal.entidades.map(ent => (
            <div key={ent.entidad} className="mb-3">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Entidad {ent.entidad}
              </p>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60">
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Nro. Cheque</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Fecha Rechazo</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">Monto</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Cuenta</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Multa</th>
                      <th className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400">Fecha Pago</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800">
                    {ent.detalle.map((row, i) => (
                      <CheckRow key={`${row.nroCheque}-${i}`} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

import { useState } from 'react';
import { parseCuits, validateCuit } from '../utils/cuit';

interface Props {
  onSubmit: (cuits: string[]) => void;
  loading: boolean;
}

export function CUITInput({ onSubmit, loading }: Props) {
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = [...new Set(parseCuits(value))];
    const errs: string[] = [];

    if (parsed.length === 0) {
      errs.push('Ingresá al menos un CUIT.');
    }
    if (parsed.length > 10) {
      errs.push(`Máximo 10 CUITs (ingresaste ${parsed.length}).`);
    }

    const invalid = parsed.filter(c => !validateCuit(c));
    if (invalid.length > 0) {
      invalid.forEach(c => errs.push(`CUIT inválido: ${c}`));
    }

    setErrors(errs);
    if (errs.length === 0) {
      const valid = parsed.filter(c => validateCuit(c));
      onSubmit(valid);
    }
  }

  const parsed = parseCuits(value);
  const count = parsed.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        CUITs a consultar{' '}
        <span className="text-gray-400 dark:text-gray-500 font-normal">
          (uno por línea, con o sin guiones)
        </span>
      </label>
      <textarea
        value={value}
        onChange={e => setValue(e.target.value)}
        rows={5}
        placeholder={'20-18413955-4\n30526874249\n30-71517725-4'}
        className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm font-mono placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        disabled={loading}
      />
      <div className="flex items-center justify-between">
        <span className={`text-xs ${count > 10 ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
          {count > 0 ? `${count}/10 CUITs` : 'Sin CUITs ingresados'}
        </span>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium transition-colors"
        >
          {loading ? 'Consultando…' : 'Consultar'}
        </button>
      </div>
      {errors.length > 0 && (
        <ul className="space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="text-sm text-red-600 dark:text-red-400 flex items-start gap-1">
              <span className="mt-0.5">⚠</span>
              <span>{err}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}

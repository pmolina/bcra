import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Periodo } from '../types/bcra';
import { formatPeriod } from '../utils/format';
import { getEntityColor } from '../utils/colors';

interface Props {
  periodos: Periodo[];
}

function formatARS(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// Situation badge colors
function situacionClass(sit: number): string {
  if (sit >= 4) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
  if (sit >= 2) return 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400';
  return 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400';
}

interface TooltipPayloadItem {
  name: string;
  value: number;
  fill: string;
  payload: Record<string, unknown>;
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  const situations = payload[0]?.payload._situations as Map<string, number> | undefined;

  // Show only entries with actual debt in this period, sorted largest first
  const items = payload
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-xs max-w-72">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-2">{label}</p>
      <div className="space-y-1.5">
        {items.map(item => {
          const situation = situations?.get(item.name) ?? 1;
          const irregular = situation >= 2;
          return (
            <div key={item.name} className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: item.fill }}
              />
              <span className="flex-1 truncate text-gray-700 dark:text-gray-300 min-w-0">
                {item.name}
              </span>
              <span className="font-medium text-gray-900 dark:text-gray-100 shrink-0">
                {formatARS(item.value)}
              </span>
              <span className={`shrink-0 px-1.5 py-0.5 rounded font-medium ${situacionClass(situation)}`}>
                Sit. {situation}
              </span>
              {irregular && (
                <svg
                  className="shrink-0 text-red-500"
                  width="13" height="13" viewBox="0 0 24 24"
                  fill="none" stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface BarShapeProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fill?: string;
  payload?: Record<string, unknown>;
}

function makeBarShape(entityName: string) {
  return function CustomBar(rawProps: unknown): React.ReactElement {
    const { x = 0, y = 0, width = 0, height = 0, fill, payload } = rawProps as BarShapeProps;
    if (!width || !height || height < 0) return <g />;
    const problemEntities = payload?._problemEntities as Set<string> | undefined;
    const isProblem = problemEntities?.has(entityName) ?? false;
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} />
        {isProblem && (
          <line
            x1={x + width - 1}
            y1={y}
            x2={x + width - 1}
            y2={y + height}
            stroke="rgb(239,68,68)"
            strokeWidth={3}
          />
        )}
      </g>
    );
  };
}

export function DebtChart({ periodos }: Props) {
  const sorted = [...periodos].sort((a, b) => a.periodo.localeCompare(b.periodo));

  const entityTotals = new Map<string, number>();
  for (const p of sorted) {
    for (const e of p.entidades) {
      entityTotals.set(e.entidad, (entityTotals.get(e.entidad) ?? 0) + e.monto);
    }
  }
  const entityNames = Array.from(entityTotals.keys()).sort(
    (a, b) => (entityTotals.get(b) ?? 0) - (entityTotals.get(a) ?? 0)
  );

  const chartData = sorted.map(p => {
    const row: Record<string, unknown> = { period: formatPeriod(p.periodo) };
    const problemEntities = new Set<string>();
    const situations = new Map<string, number>();
    for (const e of p.entidades) {
      row[e.entidad] = ((row[e.entidad] as number) || 0) + e.monto * 1000;
      if (e.situacion >= 2) problemEntities.add(e.entidad);
      // Keep the worst (highest) situation if entity appears multiple times
      situations.set(e.entidad, Math.max(situations.get(e.entidad) ?? 0, e.situacion));
    }
    row._problemEntities = problemEntities;
    row._situations = situations;
    return row;
  });

  const chartHeight = Math.max(280, Math.min(700, entityNames.length * 22 + 140));

  return (
    <ResponsiveContainer width="100%" height={chartHeight}>
      <BarChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
        <XAxis
          dataKey="period"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatARS}
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {entityNames.length > 1 && (
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
        )}
        {entityNames.map(name => (
          <Bar
            key={name}
            dataKey={name}
            stackId="a"
            fill={getEntityColor(name)}
            shape={makeBarShape(name)}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

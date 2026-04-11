import React from 'react';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { dashboardStrings } from '@/data/es/alumno/dashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, Activity, CheckCircle2 } from 'lucide-react';

interface PerformanceAnalyticsProps {
  calendarDays: any[];
}

/**
 * PerformanceAnalytics V1.0
 * Resumen técnico de impacto basado en el benchmark de TrainerStudio.
 */
export function PerformanceAnalytics({ calendarDays }: PerformanceAnalyticsProps) {
  // Cálculos de ingeniería rápidos
  const last30Days = calendarDays.slice(-30);
  const completed = last30Days.filter(d => d.status === 'completada').length;
  const targetDays = last30Days.filter(d => d.status !== 'descanso').length;
  const completionRate = targetDays > 0 ? Math.round((completed / targetDays) * 100) : 0;
  
  // Sparkline de los últimos 7 días (Simulado o real si tuviéramos volumen)
  // Como no tenemos volumen por día en el dashboard payload, usamos el estado para "intensidad" visual
  const sparklinePoints = calendarDays.slice(-14).map((d, i) => {
    let y = 40; // Base
    if (d.status === 'completada') y = 10;
    if (d.status === 'omitida') y = 35;
    if (d.status === 'descanso') y = 30;
    return `${(i * 10)},${y}`;
  }).join(' ');

  return (
    <section className="bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 shadow-xl relative overflow-hidden group">
      {/* BACKGROUND ACCENT */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 blur-[50px] pointer-events-none group-hover:bg-lime-400/10 transition-all duration-700" />
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <TechnicalLabel className="text-zinc-500 uppercase flex items-center gap-2">
            <Activity className="w-3 h-3 text-lime-400" />
            {dashboardStrings.stats.title}
          </TechnicalLabel>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-4xl font-black text-white tracking-tighter leading-none">
              {completionRate}%
            </span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
              {dashboardStrings.stats.completionRate}
            </span>
          </div>
        </div>

        {/* INDUSTRIAL SPARKLINE (SVG RAW) */}
        <div className="w-24 h-12 relative opacity-50 group-hover:opacity-100 transition-opacity">
            <svg viewBox="0 0 130 50" className="w-full h-full overflow-visible">
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-lime-400/40"
                    points={sparklinePoints}
                />
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-lime-400"
                    points={sparklinePoints}
                />
            </svg>
        </div>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:border-zinc-700">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {dashboardStrings.stats.workoutsCompleted}
            </p>
            <p className="text-xl font-bold text-white tracking-tight leading-none uppercase">
                {completed} <span className="text-xs text-zinc-600">Total</span>
            </p>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 transition-all hover:border-zinc-700">
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                <TrendingUp className="w-2.5 h-2.5" />
                {dashboardStrings.stats.intensity}
            </p>
            <p className="text-xl font-bold text-white tracking-tight leading-none uppercase">
                {completionRate > 80 ? 'Peak' : 'Solid'}
            </p>
        </div>
      </div>

      {/* FOOTER DETAIL (Atomic) */}
      {completionRate < 100 && (
        <div className="mt-4 pt-4 border-t border-zinc-900 flex items-center justify-between">
            <TechnicalLabel className="text-[8px] text-zinc-600">
                PROX. MEJORA: +15% VOLUMEN
            </TechnicalLabel>
            <div className="h-1 w-20 bg-zinc-900 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)]" 
                    style={{ width: `${completionRate}%` }} 
                />
            </div>
        </div>
      )}
    </section>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================
// Tipos del DayCalendarStrip
// =============================================

export type DayStatus = 'completada' | 'en_progreso' | 'pendiente' | 'omitida' | 'futura';

export interface CalendarDay {
  fecha: string;             // ISO: '2024-04-02'
  fechaDisplay: string;      // Display: '2'
  diaSemana: string;         // Corto: 'Jue'
  numeroDiaPlan: number;     // Día del plan: 4
  semana: number;            // Semana del ciclo: 1
  status: DayStatus;
  nombreDia?: string;        // Nombre del grupo: 'Pecho + Tríceps'
  esHoy: boolean;
  esFuturo: boolean;
  sesionId?: string;
}

interface DayCalendarStripProps {
  dias: CalendarDay[];
  diaSeleccionado?: string;   // ISO date seleccionado
  onSelectDia?: (fecha: string) => void;
  className?: string;
}

// =============================================
// Helpers visuales
// =============================================

function getStatusIcon(status: DayStatus, esHoy: boolean): string {
  if (esHoy && status !== 'completada') return '●';
  switch (status) {
    case 'completada': return '✓';
    case 'omitida':    return '✕';
    case 'en_progreso': return '▶';
    default:           return '';
  }
}

function getStatusColors(status: DayStatus, esHoy: boolean, selected: boolean): {
  dot: string;
  num: string;
  label: string;
  bg: string;
  border: string;
} {
  if (selected) {
    return {
      dot:    'bg-lime-400',
      num:    'text-black bg-lime-400',
      label:  'text-lime-400',
      bg:     'bg-lime-500/10',
      border: 'border-lime-500',
    };
  }
  if (esHoy) {
    return {
      dot:    'bg-lime-400 animate-pulse',
      num:    'text-lime-400 bg-lime-500/15 border border-lime-500/40',
      label:  'text-lime-400',
      bg:     'bg-lime-500/5',
      border: 'border-lime-500/30',
    };
  }
  switch (status) {
    case 'completada':
      return {
        dot:    'bg-lime-500',
        num:    'text-white bg-zinc-800',
        label:  'text-lime-500',
        bg:     '',
        border: 'border-zinc-800',
      };
    case 'omitida':
      return {
        dot:    'bg-red-500/60',
        num:    'text-zinc-600 bg-zinc-900',
        label:  'text-red-500/60',
        bg:     '',
        border: 'border-zinc-900',
      };
    case 'futura':
      return {
        dot:    'bg-zinc-700',
        num:    'text-zinc-600 bg-zinc-900',
        label:  'text-zinc-600',
        bg:     '',
        border: 'border-zinc-900',
      };
    default:
      return {
        dot:    'bg-zinc-600',
        num:    'text-zinc-400 bg-zinc-800',
        label:  'text-zinc-400',
        bg:     '',
        border: 'border-zinc-800',
      };
  }
}

// =============================================
// Componente principal
// =============================================

export function DayCalendarStrip({
  dias,
  diaSeleccionado,
  onSelectDia,
  className,
}: DayCalendarStripProps) {
  // Encontrar el índice del día de hoy para centrar el scroll inicial
  const hoyIdx = dias.findIndex((d) => d.esHoy);
  const [startIdx, setStartIdx] = useState(Math.max(0, hoyIdx - 3));

  const VISIBLE_DAYS = 7;
  const visibleDias = dias.slice(startIdx, startIdx + VISIBLE_DAYS);
  const canGoBack = startIdx > 0;
  const canGoForward = startIdx + VISIBLE_DAYS < dias.length;

  return (
    <div className={cn('w-full select-none', className)}>
      {/* Encabezado del strip */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setStartIdx(Math.max(0, startIdx - 7))}
          disabled={!canGoBack}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            canGoBack
              ? 'text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95'
              : 'text-zinc-800 cursor-not-allowed'
          )}
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
          {visibleDias[0]
            ? new Date(visibleDias[0].fecha + 'T12:00:00').toLocaleDateString('es-AR', {
                month: 'long',
                year: 'numeric',
              })
            : ''}
        </span>

        <button
          onClick={() => setStartIdx(Math.min(dias.length - VISIBLE_DAYS, startIdx + 7))}
          disabled={!canGoForward}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            canGoForward
              ? 'text-zinc-400 hover:text-white hover:bg-white/5 active:scale-95'
              : 'text-zinc-800 cursor-not-allowed'
          )}
          aria-label="Semana siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid de 7 días */}
      <div className="grid grid-cols-7 gap-1.5">
        {visibleDias.map((dia) => {
          const selected = dia.fecha === diaSeleccionado;
          const colors = getStatusColors(dia.status, dia.esHoy, selected);
          const icon = getStatusIcon(dia.status, dia.esHoy);
          const clickable = !dia.esFuturo || dia.esHoy;

          return (
            <button
              key={dia.fecha}
              onClick={() => clickable && onSelectDia?.(dia.fecha)}
              disabled={!clickable && !onSelectDia}
              aria-label={`${dia.diaSemana} ${dia.fechaDisplay} - Día ${dia.numeroDiaPlan} - ${dia.status}`}
              aria-current={dia.esHoy ? 'date' : undefined}
              className={cn(
                'flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl border transition-all duration-200',
                colors.bg,
                colors.border,
                clickable ? 'cursor-pointer hover:bg-white/5 active:scale-95' : 'cursor-default',
              )}
            >
              {/* Día de semana */}
              <span className={cn('text-[9px] font-black uppercase tracking-wider', colors.label)}>
                {dia.diaSemana}
              </span>

              {/* Número del día del mes */}
              <span className={cn(
                'w-8 h-8 flex items-center justify-center rounded-xl text-sm font-black transition-all',
                colors.num,
              )}>
                {dia.fechaDisplay}
              </span>

              {/* Indicador de estado */}
              <span className={cn(
                'w-1.5 h-1.5 rounded-full transition-all',
                icon ? colors.dot : 'bg-transparent',
              )} />

              {/* Número de día del plan */}
              <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-wider">
                D{dia.numeroDiaPlan}
              </span>
            </button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-center gap-5 mt-4">
        {[
          { color: 'bg-lime-500', label: 'Completada' },
          { color: 'bg-lime-400 animate-pulse', label: 'Hoy' },
          { color: 'bg-zinc-600', label: 'Pendiente' },
          { color: 'bg-red-500/60', label: 'Omitida' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', color)} />
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

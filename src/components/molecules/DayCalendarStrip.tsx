import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================
// Tipos del DayCalendarStrip
// =============================================

export type DayStatus = 'completada' | 'en_progreso' | 'pendiente' | 'omitida' | 'futura' | 'descanso';

export interface CalendarDay {
  fecha: string;             // ISO: '2024-04-02'
  fechaDisplay: string;      // Display: '2'
  diaSemana: string;         // Corto: 'Jue'
  numeroDiaPlan: number;     // Día del plan: 4
  semana: number;            // Semana del ciclo: 1
  cycleNumber?: number;      // Número de ciclo: 2
  relativeWeek?: number;     // Semana dentro del ciclo: 1
  status: DayStatus;
  nombreDia?: string;        // Nombre del grupo: 'Pecho + Tríceps'
  esHoy: boolean;
  esFuturo: boolean;
  sesionId?: string;
  rutinaIdOriginal?: string;
}

interface DayCalendarStripProps {
  dias: CalendarDay[];
  diaSeleccionado?: string;   // ISO date seleccionado
  onSelectDia?: (fecha: string) => void;
  className?: string;
  minimal?: boolean;
}

// =============================================
// Helpers visuales
// =============================================

function getStatusIcon(status: DayStatus, esHoy: boolean): string {
  if (esHoy && status !== 'completada') return '●';
  switch (status) {
    case 'completada': return '✓';
    case 'omitida': return '✕';
    case 'en_progreso': return '▶';
    case 'descanso': return '○';
    default: return '';
  }
}

function getStatusColors(status: DayStatus, esHoy: boolean, selected: boolean): {
  dot: string;
  num: string;
  label: string;
  bg: string;
  border: string;
} {
  // 1. Determinar el color del DOT (Semántica de Resultado)
  let dotColor = 'bg-zinc-500'; // Programada / Futura
  if (status === 'completada') dotColor = 'bg-lime-500';
  if (status === 'omitida') dotColor = 'bg-red-500';
  if (status === 'descanso') dotColor = 'bg-transparent border border-zinc-500';
  if (status === 'en_progreso') dotColor = 'bg-amber-400 animate-pulse';
  if (esHoy && status !== 'completada' && status !== 'omitida') dotColor = 'bg-violet-500 animate-pulse';

  // 2. Jerarquía de Navegación (Selección > Hoy > Normal)
  if (selected) {
    return {
      dot: dotColor,
      num: 'text-black bg-lime-500 shadow-lg shadow-lime-500/40',
      label: 'text-lime-500',
      bg: 'bg-lime-500/[0.08]',
      border: 'border-lime-500/50',
    };
  }

  if (esHoy) {
    return {
      dot: dotColor,
      num: 'text-violet-400 bg-violet-500/15 border border-violet-500/40',
      label: 'text-violet-400',
      bg: 'bg-violet-500/[0.03]',
      border: 'border-violet-500/20',
    };
  }

  // Estados base según el status
  switch (status) {
    case 'completada':
      return {
        dot: dotColor,
        num: 'text-lime-500 bg-zinc-900',
        label: 'text-zinc-500',
        bg: 'bg-transparent',
        border: 'border-zinc-800/10',
      };
    case 'omitida':
      return {
        dot: dotColor,
        num: 'text-red-500/70 bg-zinc-900',
        label: 'text-zinc-600',
        bg: 'opacity-80',
        border: 'border-zinc-900',
      };
    case 'descanso':
      return {
        dot: dotColor,
        num: 'text-zinc-700 bg-transparent border-zinc-900',
        label: 'text-zinc-800',
        bg: 'opacity-40',
        border: 'border-zinc-950',
      };
    default:
      return {
        dot: dotColor,
        num: 'text-zinc-400 bg-zinc-800',
        label: 'text-zinc-500',
        bg: '',
        border: 'border-zinc-800/5',
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
  minimal = false,
}: DayCalendarStripProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const hoyRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const [currentMonth, setCurrentMonth] = useState("");

  // Centrar hoy o seleccionado al montar o cambiar selección
  useEffect(() => {
    const target = selectedRef.current || hoyRef.current;
    if (target) {
      setTimeout(() => {
        target.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest'
        });
      }, 100);
    }
  }, [dias.length, diaSeleccionado]);

  // Trackear el mes visible mediante Intersection Observer o Scroll
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      // Aproximar el mes basado en el centro del scroll
      const center = containerRef.current.scrollLeft + (containerRef.current.offsetWidth / 2);
      const items = containerRef.current.children;
      let closestItem: any = null;
      let minDiff = Infinity;

      for (let i = 0; i < items.length; i++) {
        const item: any = items[i];
        const diff = Math.abs((item.offsetLeft + item.offsetWidth / 2) - center);
        if (diff < minDiff) {
          minDiff = diff;
          closestItem = item;
        }
      }

      if (closestItem) {
        const dateStr = closestItem.getAttribute('data-date');
        if (dateStr) {
          const month = new Date(dateStr + 'T12:00:00').toLocaleDateString('es-AR', {
            month: 'long',
          });
          setCurrentMonth(month);
        }
      }
    };

    const container = containerRef.current;
    container?.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    return () => container?.removeEventListener('scroll', handleScroll);
  }, [dias]);

  const scrollJump = (weeks: number) => {
    if (!containerRef.current) return;
    const width = containerRef.current.offsetWidth;
    containerRef.current.scrollBy({ left: width * weeks, behavior: 'smooth' });
  };

  return (
    <div className={cn('w-full select-none flex flex-col', className)}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Encabezado del strip */}
      <div className={cn("flex items-center justify-between px-1", minimal ? "mb-2" : "mb-4")}>
        <button
          onClick={() => scrollJump(-1)}
          className="p-2 rounded-xl text-zinc-600 hover:text-white transition-all active:scale-95"
          aria-label="Anterior"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        <span
          key={currentMonth}
          className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.3em] animate-in fade-in slide-in-from-bottom-1 duration-500"
        >
          {currentMonth}
        </span>

        <button
          onClick={() => scrollJump(1)}
          className="p-2 rounded-xl text-zinc-600 hover:text-white transition-all active:scale-95"
          aria-label="Siguiente"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-1.5 sm:gap-3 scroll-smooth py-1 px-1"
      >
        {dias.map((dia) => {
          const selected = dia.fecha === diaSeleccionado;
          const colors = getStatusColors(dia.status, dia.esHoy, selected);
          const icon = getStatusIcon(dia.status, dia.esHoy);

          return (
            <button
              key={dia.fecha}
              ref={selected ? selectedRef : (dia.esHoy ? hoyRef : null)}
              data-date={dia.fecha}
              onClick={() => onSelectDia?.(dia.fecha)}
              className={cn(
                'flex-none w-[calc((100%-48px)/7)] min-w-[50px] snap-center flex flex-col items-center gap-1.5 py-4 rounded-2xl border transition-all duration-500 group',
                colors.bg,
                colors.border,
                selected ? 'shadow-xl shadow-lime-500/10 scale-105 z-10' : 'hover:bg-zinc-800/5 active:scale-95 border-zinc-800/5',
                minimal && "py-3"
              )}
            >
              {/* Día de semana */}
              <span className={cn('text-[9px] font-bold uppercase tracking-widest transition-colors', colors.label)}>
                {dia.diaSemana}
              </span>

              {/* Número del día del mes */}
              <span className={cn(
                'w-8 h-8 flex items-center justify-center rounded-xl text-xs font-black transition-all group-hover:scale-105',
                colors.num,
              )}>
                {dia.fechaDisplay}
              </span>

              {/* Indicador de estado */}
              <div className="flex flex-col items-center gap-1">
                <span className={cn(
                  'w-1 h-1 rounded-full transition-all',
                  icon ? colors.dot : 'bg-transparent border border-zinc-700/50',
                )} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Leyenda (Oculta en minimal) */}
      {!minimal && (
        <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
          {[
            { color: 'bg-lime-400', label: 'Hecho' },
            { color: 'bg-violet-500 animate-pulse', label: 'Hoy' },
            { color: 'bg-zinc-500', label: 'Pendiente' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className={cn('w-1 h-1 rounded-full', color)} />
              <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
  if (selected) {
    return {
      dot: 'bg-lime-500',
      num: 'text-black bg-lime-500',
      label: 'text-lime-400',
      bg: 'bg-lime-500/10',
      border: 'border-lime-500',
    };
  }
  if (esHoy) {
    return {
      dot: 'bg-lime-500 animate-pulse',
      num: 'text-lime-400 bg-lime-500/15 border border-lime-500/40',
      label: 'text-lime-400',
      bg: 'bg-lime-500/5',
      border: 'border-lime-500/30',
    };
  }
  switch (status) {
    case 'completada':
      return {
        dot: 'bg-lime-500',
        num: 'text-white bg-zinc-800',
        label: 'text-lime-500',
        bg: '',
        border: 'border-zinc-800',
      };
    case 'omitida':
      return {
        dot: 'bg-red-500/60',
        num: 'text-zinc-600 bg-zinc-900',
        label: 'text-red-500/60',
        bg: '',
        border: 'border-zinc-900',
      };
    case 'futura':
      return {
        dot: 'bg-zinc-700',
        num: 'text-zinc-600 bg-zinc-900',
        label: 'text-zinc-600',
        bg: '',
        border: 'border-zinc-900',
      };
    case 'descanso':
      return {
        dot: 'bg-zinc-800',
        num: 'text-zinc-700 bg-transparent border-zinc-900',
        label: 'text-zinc-800',
        bg: 'opacity-40',
        border: 'border-zinc-950',
      };
    default:
      return {
        dot: 'bg-zinc-600',
        num: 'text-zinc-400 bg-zinc-800',
        label: 'text-zinc-400',
        bg: '',
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
            year: 'numeric',
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
      <div className="flex items-center justify-between mb-4 px-1">
        <button
          onClick={() => scrollJump(-1)}
          className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800/10"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <span
          key={currentMonth}
          className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.2em] animate-in fade-in slide-in-from-bottom-1 duration-500 min-w-[120px] text-center"
        >
          {currentMonth}
        </span>

        <button
          onClick={() => scrollJump(1)}
          className="p-2 rounded-xl text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 border border-zinc-800/10"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Grid Deslizable (Native UX) */}
      <div
        ref={containerRef}
        className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-1.5 sm:gap-3 scroll-smooth py-2 px-1 scroll-p-10 sm:scroll-p-20"
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
                'flex-none w-[calc((100%-48px)/7)] min-w-[52px] sm:min-w-[70px] snap-center flex flex-col items-center gap-1 sm:gap-1.5 py-3 sm:py-5 rounded-2xl sm:rounded-[2rem] border transition-all duration-500 group',
                colors.bg,
                colors.border,
                selected ? 'shadow-xl shadow-lime-500/20 scale-105 z-10' : 'hover:bg-zinc-800/10 active:scale-95 border-zinc-800/5',
              )}
            >
              {/* Día de semana */}
              <span className={cn('text-[10px] font-bold uppercase tracking-widest transition-colors', colors.label)}>
                {dia.diaSemana}
              </span>

              {/* Número del día del mes */}
              <span className={cn(
                'w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-xl sm:rounded-[1rem] text-xs sm:text-sm font-bold transition-all group-hover:scale-105',
                colors.num,
              )}>
                {dia.fechaDisplay}
              </span>

              {/* Indicador de estado + Plan Info */}
              <div className="flex flex-col items-center gap-1 px-1">
                <span className={cn(
                  'w-1.5 h-1.5 rounded-full transition-all',
                  icon ? colors.dot : 'bg-transparent border border-zinc-800/50',
                )} />
                {/* <span className="text-[8px] font-bold text-zinc-500/70 uppercase tracking-tighter">
                  D{dia.numeroDiaPlan}
                </span> */}
                {dia.cycleNumber && dia.cycleNumber > 1 && (
                  <span className="text-[7px] font-bold text-lime-500/60 uppercase tracking-tighter leading-none mt-0.5">
                    C{dia.cycleNumber}•S{dia.relativeWeek}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Leyenda y Cycle Info */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
        {[
          { color: 'bg-lime-500', label: 'Completada' },
          { color: 'bg-lime-500 animate-pulse', label: 'Hoy' },
          { color: 'bg-red-500/60', label: 'Omitida' },
          { color: 'bg-zinc-800', label: 'Descanso' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn('w-1.5 h-1.5 rounded-full', color)} />
            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

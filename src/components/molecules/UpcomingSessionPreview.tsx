import React from 'react';
import { Dumbbell, Clock, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================
// Tipos de UpcomingSessionPreview
// =============================================

export interface UpcomingEjercicio {
  nombre: string;
  series_plan: number;
  reps_plan: string;
}

export interface UpcomingSessionData {
  fecha: string;           // ISO: '2024-04-03'
  fechaHumana: string;     // 'Mañana, Viernes'
  numeroDiaPlan: number;
  semana: number;
  nombreDia: string;       // 'Espalda + Bíceps'
  ejercicios: UpcomingEjercicio[];
  tiempoEstimadoMin?: number; // Estimado en minutos
}

interface UpcomingSessionPreviewProps {
  sesion: UpcomingSessionData | null;
  className?: string;
}

// =============================================
// Helper: estimar tiempo por ejercicios
// =============================================
function estimarTiempo(ejercicios: UpcomingEjercicio[]): number {
  // ~4–5 min por ejercicio (series + descanso estimado)
  return ejercicios.length * 5;
}

// =============================================
// Componente
// =============================================

export function UpcomingSessionPreview({ sesion, className }: UpcomingSessionPreviewProps) {
  if (!sesion) {
    return (
      <div className={cn(
        'w-full p-5 rounded-3xl border border-zinc-800/60 bg-zinc-900/40 text-center',
        className
      )}>
        <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">
          Sin sesión programada para mañana
        </p>
      </div>
    );
  }

  const tiempo = sesion.tiempoEstimadoMin ?? estimarTiempo(sesion.ejercicios);

  return (
    <div className={cn(
      'w-full p-6 rounded-3xl border border-zinc-800/70 bg-zinc-900/50 backdrop-blur-xl overflow-hidden relative group transition-all duration-300 hover:border-zinc-700',
      className
    )}>
      {/* Ambient glow */}
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-fuchsia-500/10 blur-[40px] pointer-events-none group-hover:bg-fuchsia-500/15 transition-all" />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" />
            {sesion.fechaHumana}
          </p>
          <h3 className="text-lg font-black text-white tracking-tight">{sesion.nombreDia}</h3>
          <p className="text-xs font-medium text-zinc-500 mt-0.5">
            Día {sesion.numeroDiaPlan} · Semana {sesion.semana}
          </p>
        </div>

        {/* Badge tiempo estimado */}
        <div className="flex items-center gap-1.5 bg-zinc-800/80 border border-zinc-700/50 px-3 py-1.5 rounded-full">
          <Clock className="w-3 h-3 text-zinc-400" />
          <span className="text-xs font-bold text-zinc-400">~{tiempo} min</span>
        </div>
      </div>

      {/* Ejercicios preview (top 3) */}
      <div className="space-y-2">
        {sesion.ejercicios.slice(0, 3).map((ej, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className="w-5 h-5 flex items-center justify-center bg-zinc-800 rounded-md text-zinc-500 font-black text-[9px]">
              {idx + 1}
            </span>
            <p className="text-sm font-bold text-zinc-300 flex-1 truncate">{ej.nombre}</p>
            <span className="text-xs text-zinc-600 font-medium whitespace-nowrap">
              {ej.series_plan}×{ej.reps_plan}
            </span>
          </div>
        ))}

        {sesion.ejercicios.length > 3 && (
          <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider pl-8">
            +{sesion.ejercicios.length - 3} ejercicios más
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-5 pt-4 border-t border-zinc-800/50 flex items-center gap-2">
        <Dumbbell className="w-3 h-3 text-zinc-600" />
        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
          Preparado automáticamente
        </span>
      </div>
    </div>
  );
}

import React from "react";
import {
  ChevronDown,
  TrendingUp,
  RefreshCw,
  Dumbbell,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MetricConsole } from "@/components/molecules/profesor/MetricConsole";
import { ExerciseHistoryPanel } from "@/components/molecules/profesor/ExerciseHistoryPanel";
import type { EjercicioDetail } from "@/hooks/profesor/useStudentCalendar";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface ExerciseExpandibleRowProps {
  ej: EjercicioDetail;
  idx: number;
  alumnoId: string;
  isSaving: boolean;
  isExpanded: boolean;
  readOnly?: boolean;
  isCompact?: boolean;
  onToggle: () => void;
  onSave: (fields: any) => void;
  onSwap: () => void;
  onRemove: () => void;
}

/**
 * ExerciseExpandibleRow: Molécula que encapsula la visualización y edición de un ejercicio
 * dentro de la sesión del alumno.
 */
export function ExerciseExpandibleRow({
  ej,
  idx,
  alumnoId,
  isSaving,
  isExpanded,
  readOnly = false,
  isCompact = false,
  onToggle,
  onSave,
  onSwap,
  onRemove
}: ExerciseExpandibleRowProps) {
  const copy = athleteProfileCopy.workspace.calendar.exerciseRow;

  return (
    <div className={cn(
      "transition-all duration-300 relative",
      isExpanded ? "bg-zinc-50 dark:bg-zinc-900/40" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10",
      ej.is_variation && "border-l-4 border-fuchsia-500"
    )}>
      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 px-4 sm:px-6 py-5">
        <div className="flex items-center gap-4 flex-1 w-full min-w-0 relative group/ej">
          {/* 1. NAVEGACIÓN + THUMBNAIL */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <button 
              onClick={onToggle} 
              className="flex flex-col items-center gap-1.5 group/toggle p-1 -m-1"
              aria-label={isExpanded ? "Contraer" : "Expandir"}
            >
              <div className={cn(
                "w-7 h-7 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all",
                ej.completado 
                  ? "bg-lime-400 text-zinc-950" 
                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover/toggle:bg-zinc-950 group-hover/toggle:text-white"
              )}>
                {ej.completado ? "✓" : idx + 1}
              </div>
              <div className={cn(
                "w-6 h-6 sm:w-5 sm:h-5 rounded-md bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 transition-transform",
                isExpanded && "rotate-180"
              )}>
                <ChevronDown className={cn("w-3.5 h-3.5 sm:w-3 sm:h-3", isExpanded ? "text-lime-400" : "text-zinc-400")} />
              </div>
            </button>

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[1.25rem] bg-zinc-100 dark:bg-zinc-900 overflow-hidden shrink-0 flex items-center justify-center border border-zinc-100 dark:border-zinc-800 shadow-sm">
              {ej.media_url ? (
                <img src={ej.media_url} alt={ej.nombre} className="w-full h-full object-cover" />
              ) : (
                <Dumbbell className="w-5 h-5 text-zinc-300" />
              )}
            </div>
          </div>

          {/* 2. INFO DEL EJERCICIO */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
              <h5 className={cn(
                "font-black text-sm uppercase tracking-tight truncate leading-tight", 
                ej.completado ? "text-zinc-400 line-through" : "text-zinc-950 dark:text-white"
              )}>
                {ej.nombre}
              </h5>
              {ej.is_variation && (
                <span className="text-[7px] font-black uppercase tracking-widest text-white bg-fuchsia-600 px-1.5 py-0.5 rounded leading-none shrink-0">
                  {copy.variant}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {!readOnly && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onSwap(); }}
                  className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-lime-500 transition-colors"
                >
                  <RefreshCw className="w-3 h-3" />
                  Intercambiar
                </button>
              )}

              {ej.series_real && !isExpanded && (
                <span className="text-[9px] font-black text-lime-500 uppercase tracking-widest flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" /> {copy.real}: {ej.series_real}×{ej.reps_real} @ {ej.peso_real}kg
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Consola Unificada (Métrica) o Resumen Compacto */}
        {isCompact && !isExpanded ? (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[11px] font-black text-zinc-950 dark:text-white uppercase tracking-[0.2em] leading-none">
              {ej.series_plan}×{ej.reps_plan}
            </span>
            <span className="text-[10px] font-black text-lime-500 uppercase tracking-widest leading-none">
              @{ej.peso_plan}kg
            </span>
          </div>
        ) : (
          <MetricConsole
            series={ej.series_plan}
            reps={ej.reps_plan}
            peso={ej.peso_plan}
            descanso={ej.descanso_plan || 60}
            isSaving={isSaving}
            readOnly={readOnly}
            onUpdate={onSave}
            className="w-full lg:w-auto"
          />
        )}
      </div>

      {/* Panel Expandible (Historial) */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2">
          <ExerciseHistoryPanel
            alumnoId={alumnoId}
            ejercicioId={ej.biblioteca_ejercicio_id}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );
}

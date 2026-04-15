import React from "react";
import { MuscleFilterChips } from "@/components/molecules/profesor/perfil/MuscleFilterChips";
import { ViewToggle } from "@/components/molecules/ViewToggle";

interface Props {
  fechaInicio: string | null;
  fechaFin: string | null;
  cicloSemanas: number | null;
  totalExercises: number;
  muscleFilter: string | null;
  viewMode: "grid" | "table";
  exercises: any[];
  onUpdateDates: (dates: { fecha_inicio?: Date; fecha_fin?: Date | null }) => void;
  onFilterChange: (filter: string | null) => void;
  onViewChange: (view: "grid" | "table") => void;
  mode: "plan" | "routine";
}

/**
 * RoutineWorkspaceControls: Panel de control técnico para vigencia y filtrado.
 * Separa la carga de inputs de la lógica de renderizado de rutinas.
 */
export function RoutineWorkspaceControls({
  fechaInicio,
  fechaFin,
  cicloSemanas,
  totalExercises,
  muscleFilter,
  viewMode,
  exercises,
  onUpdateDates,
  onFilterChange,
  onViewChange,
  mode
}: Props) {
  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-wrap items-center gap-8">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Fecha de Inicio</span>
            <input
              type="date"
              defaultValue={fechaInicio ? fechaInicio.split("T")[0] : ""}
              onChange={(e) => onUpdateDates({ fecha_inicio: new Date(e.target.value) })}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2 font-bold text-sm text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Fecha de Fin</span>
            <input
              type="date"
              defaultValue={fechaFin ? fechaFin.split("T")[0] : ""}
              onChange={(e) => onUpdateDates({ fecha_fin: e.target.value ? new Date(e.target.value) : null })}
              className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2 font-bold text-sm text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
            />
          </div>
          {cicloSemanas !== null && (
            <div className="bg-lime-500/10 border border-lime-400/20 px-4 py-2 rounded-2xl flex flex-col items-center justify-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">Ciclo de</span>
              <span className="text-lg font-bold text-zinc-950 dark:text-white leading-none">{cicloSemanas} semanas</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Ejercicios Totales</span>
            <span className="text-2xl font-black text-zinc-950 dark:text-white">{totalExercises}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <MuscleFilterChips 
          exercises={exercises}
          activeFilter={muscleFilter}
          onFilterChange={onFilterChange}
        />

        {mode === "plan" && (
          <ViewToggle 
            view={viewMode}
            onChange={onViewChange}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-1"
          />
        )}
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { LayoutGrid, List, CheckCircle2, Loader2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { SessionStatusBadge } from "@/components/atoms/profesor/SessionStatusBadge";
import { ExerciseExpandibleRow } from "@/components/molecules/profesor/calendar/ExerciseExpandibleRow";

interface Props {
  selectedSesion: any;
  selectedDay: string;
  hoyISO: string;
  alumnoId: string;
  isReadOnly: boolean;
  isClosingSession: boolean;
  isSessionCompleted: boolean;
  savingIds: Set<string>;
  copy: any;
  onComplete: () => void;
  onUpdateMetric: (ej: any, fields: any) => void;
  onSwap: (id: string) => void;
  onRemove: (id: string) => void;
  onAddExercise: () => void;
}

/**
 * SessionDetailPanel: Maneja el renderizado de la sesión seleccionada.
 * Optimiza el rendimiento mediante el uso de sub-componentes y estados locales de vista.
 */
export function SessionDetailPanel({
  selectedSesion,
  selectedDay,
  hoyISO,
  alumnoId,
  isReadOnly,
  isClosingSession,
  isSessionCompleted,
  savingIds,
  copy,
  onComplete,
  onUpdateMetric,
  onSwap,
  onRemove,
  onAddExercise
}: Props) {
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");
  const [expandedExId, setExpandedExId] = useState<string | null>(null);

  const formatFechaDisplay = (fechaISO: string) => {
    return new Date(fechaISO + "T12:00:00").toLocaleDateString("es-AR", { 
      weekday: "long", day: "numeric", month: "long" 
    });
  };

  return (
    <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-2">
      <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div className="space-y-1 w-full xl:w-auto">
          <div className="flex items-center gap-3">
            <h4 className="font-bold text-2xl text-zinc-950 dark:text-white uppercase tracking-tighter shrink-0">
              {selectedSesion.nombre_dia}
            </h4>
            <SessionStatusBadge estado={selectedSesion.estado} />
            {selectedSesion.numero_dia_plan === 1 && (
              <span className="px-2 py-0.5 rounded-lg bg-lime-500/10 text-lime-500 text-[10px] font-bold uppercase tracking-widest border border-lime-500/20 animate-pulse">
                Día 1
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-400 uppercase tracking-widest" suppressHydrationWarning>
            <span>{formatFechaDisplay(selectedDay)}</span>
            <span className="text-zinc-700">•</span>
            <span className="text-lime-500/80 font-bold">
              {selectedSesion.cycle_number && selectedSesion.cycle_number > 1
                ? `S${selectedSesion.semana_numero} (Ciclo ${selectedSesion.cycle_number} • S${selectedSesion.relative_week})`
                : `Semana ${selectedSesion.semana_numero}`
              }
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto no-scrollbar pb-1 xl:pb-0">
          <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
            <button
              onClick={() => setViewMode("detailed")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "detailed" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("compact")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "compact" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {(selectedSesion.ejercicios.length > 0 && selectedDay <= hoyISO) && (
            <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-1 md:flex-none">
              <Button
                onClick={onComplete}
                disabled={isClosingSession || isSessionCompleted}
                className={cn(
                  "h-10 px-6 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 w-full",
                  isSessionCompleted
                    ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-default shadow-none"
                    : "bg-lime-500 hover:bg-lime-600 text-zinc-950"
                )}
              >
                {isClosingSession ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isSessionCompleted ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-lime-500" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                {isSessionCompleted ? "Sesión realizada" : copy.actions.complete}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
        {selectedSesion.ejercicios.map((ej: any, idx: number) => (
          <ExerciseExpandibleRow
            key={ej.id}
            ej={ej}
            idx={idx}
            alumnoId={alumnoId}
            isSaving={savingIds.has(ej.id)}
            isExpanded={expandedExId === ej.id}
            readOnly={isReadOnly || ej.completado}
            isCompact={viewMode === "compact"}
            onToggle={() => setExpandedExId(expandedExId === ej.id ? null : ej.id)}
            onSave={(fields) => onUpdateMetric(ej, fields)}
            onSwap={() => onSwap(ej.id)}
            onRemove={() => onRemove(ej.id)}
          />
        ))}

        {!isReadOnly && (
          <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/10">
            <Button
              onClick={onAddExercise}
              variant="ghost"
              className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-500/5 transition-all group"
            >
              <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                {copy.actions.addExercise}
              </span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

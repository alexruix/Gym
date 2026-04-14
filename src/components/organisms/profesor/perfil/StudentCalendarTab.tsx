import React, { useState } from "react";
import {
  CalendarDays,
  Dumbbell,
  Loader2,
  History,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Coffee,
  Copy,
  ChevronRight,
  LayoutGrid,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// Componentes del Dominio (Molecules/Atoms)
import { DayCalendarStrip } from "@/components/molecules/DayCalendarStrip";
import { toast } from "sonner";

import { StatBadge } from "@/components/atoms/profesor/StatBadge";
import { SessionStatusBadge } from "@/components/atoms/profesor/SessionStatusBadge";
import { LoaderState } from "@/components/atoms/LoaderState";
import { RestDayHUD } from "@/components/molecules/profesor/calendar/RestDayHUD";
import { ExerciseExpandibleRow } from "@/components/molecules/profesor/calendar/ExerciseExpandibleRow";

import { ScopeSelectorDialog } from "@/components/molecules/profesor/calendar/ScopeSelectorDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

// Lógica de Estado (Hook)
import { useStudentCalendar } from "@/hooks/profesor/useStudentCalendar";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { getTodayISO } from "@/lib/schedule";


import type { AssignedPlanMetric } from "@/types/student";

interface Props {
  alumnoId: string;
  fechaInicio: string | null;
  planData: AssignedPlanMetric | null;
  diasAsistencia?: string[];
  onPlanChange?: (ejercicioPlanId: string, updates: any) => void;
}

/**
 * StudentCalendarTab: Organismo principal que orquestra la agenda del alumno.
 * Utiliza Atomic Design y un hook centralizado para evitar problemas de sincronización.
 */
export function StudentCalendarTab({ alumnoId, fechaInicio, planData, diasAsistencia = [], onPlanChange }: Props) {
  const {
    loading,
    calendarDays,
    selectedDay,
    setSelectedDay,
    selectedSesion,
    loadingDetalle,
    stats,
    savingIds,
    hasOmissions,
    isRealigning,
    isClosingSession,
    // Actions
    updateMetric,
    completeSession,
    swapExercise,
    addExercise,
    removeExercise,
    addExtraSession,
    realignCalendar,
    planRoutines,
    isInstantiatingExtra,
    refreshCalendar
  } = useStudentCalendar(alumnoId, fechaInicio, planData, diasAsistencia, onPlanChange);

  const copy = athleteProfileCopy.workspace.calendar;

  // Estados de UI local para diálogos
  const [expandedExId, setExpandedExId] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState<"swap" | "add">("swap");
  const [swapExId, setSwapExId] = useState<string | null>(null);
  const [scopeData, setScopeData] = useState<{
    type: "add" | "remove" | "swap";
    id: string;
    nuevoId?: string;
    nombre: string;
  } | null>(null);
  const [viewMode, setViewMode] = useState<"detailed" | "compact">("detailed");

  const hoyISO = getTodayISO();
  const isPastDay = !!selectedDay && selectedDay < hoyISO;
  const isSessionCompleted = selectedSesion?.estado === 'completada';
  const isReadOnly = isPastDay || isSessionCompleted;




  // Handlers de UI
  const handleExerciseSelected = (exerciseId: string) => {
    if (selectorMode === "swap") {
      if (!swapExId) return;
      swapExercise(swapExId, exerciseId, false);
    } else {
      addExercise(exerciseId, false);
    }
    setIsSelectorOpen(false);
  };

  const handleBlockSelected = (blockId: string) => {
    toast.info("La importación de bloques en el calendario (sólo por hoy) estará disponible próximamente.");
    setIsSelectorOpen(false);
  };


  const variacionesCount = selectedSesion?.ejercicios.filter(e => e.is_variation).length || 0;
  const showStructuralWarning = variacionesCount >= 2;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      {/* Header Operativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl font-bold tracking-tighter text-zinc-950 dark:text-white leading-none mb-1 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-lime-500" />
            {copy.title}
          </h3>
        </div>
        <div className="flex flex-row items-center gap-2 self-end sm:self-auto">
          {/* <StatBadge label={copy.metrics.compliance} value={`${stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0}%`} /> */}
          <StatBadge label={copy.metrics.sessions} value={stats.completadas} color="lime" />
        </div>
      </div>

      {/* Calendario Strip */}
      {loading ? <LoaderState label={copy.status.loading} /> : (
        <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl">
          <DayCalendarStrip dias={calendarDays} diaSeleccionado={selectedDay || hoyISO} onSelectDia={setSelectedDay} />
        </div>
      )}

      {/* Banner de Alerta de Desfase */}
      {hasOmissions && (
        <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg shrink-0">
              <History className="w-6 h-6 text-lime-400" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{copy.banners.omissions.tag}</p>
              <h5 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight">{copy.banners.omissions.title}</h5>
            </div>
          </div>
          <Button
            onClick={realignCalendar}
            disabled={isRealigning}
            className="bg-zinc-950 hover:bg-zinc-800 text-white font-bold uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl shadow-xl transition-all active:scale-95 border border-zinc-800 flex items-center justify-center whitespace-nowrap"
          >
            {isRealigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2 text-lime-400" />}
            {copy.banners.omissions.action}
          </Button>
        </div>
      )}

      {/* Banner de Aviso Estructural */}
      {showStructuralWarning && (
        <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-bold text-fuchsia-400 uppercase tracking-widest">{copy.banners.structural.tag}</p>
              <h5 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight leading-tight">{copy.banners.structural.title}</h5>
            </div>
          </div>
          <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold uppercase text-[10px] tracking-widest h-11 px-8 rounded-2xl shadow-lg transition-all active:scale-95">
            <Sparkles className="w-4 h-4 mr-2" /> {copy.banners.structural.action}
          </Button>
        </div>
      )}

      {/* Detalle del Día o HUD de Descanso (Fallback Industrial) */}
      {selectedDay && (
        (selectedSesion?.isRestDay || !selectedSesion) && !loadingDetalle && planData ? (

          <RestDayHUD
            title={copy.restDay.title}
            description={copy.restDay.description}
            tag={copy.restDay.tag}
            planRoutines={planRoutines}
            onAddExtra={(rutinaId) => addExtraSession(selectedDay, rutinaId)}
            isPending={isInstantiatingExtra}
          />
        ) : selectedSesion ? (

          <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-2">
            {loadingDetalle ? <LoaderState label={copy.status.fetching} /> : (
              <>
                <div className="p-5 md:p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                  <div className="space-y-1 w-full xl:w-auto">
                    <div className="flex items-center gap-3">
                      <h4 className="font-bold text-2xl text-zinc-950 dark:text-white uppercase tracking-tighter shrink-0">{selectedSesion.nombre_dia}</h4>
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
                    {/* Toggle Vista (Industrial Switch) */}
                    <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shrink-0">
                      <button
                        onClick={() => setViewMode("detailed")}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          viewMode === "detailed" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                        title="Vista detallada"
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("compact")}
                        className={cn(
                          "p-2 rounded-xl transition-all",
                          viewMode === "compact" ? "bg-white dark:bg-zinc-950 text-lime-500 shadow-sm" : "text-zinc-400 hover:text-zinc-600"
                        )}
                        title="Vista compacta"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Botón de Completar: Disponible para hoy y pasado si hay ejercicios */}
                    {(selectedSesion.ejercicios.length > 0 && (selectedDay && selectedDay <= hoyISO)) && (
                      <div className="p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-1 md:flex-none">
                        <Button
                          onClick={completeSession}
                          disabled={isClosingSession || isSessionCompleted}
                          className={cn(
                            "h-10 px-6 font-bold uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50 w-full",
                            isSessionCompleted
                              ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-500 cursor-default shadow-none"
                              : "bg-lime-500 hover:bg-lime-500 text-zinc-950"
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
                  {selectedSesion.ejercicios.map((ej, idx) => (
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
                      onSave={(fields) => updateMetric(ej, fields)}
                      onSwap={() => { setSwapExId(ej.id); setSelectorMode("swap"); setIsSelectorOpen(true); }}
                      onRemove={() => removeExercise(ej.id, false)}

                    />
                  ))}

                  {!isReadOnly && (
                    <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/10">
                      <Button
                        onClick={() => { setSelectorMode("add"); setIsSelectorOpen(true); }}
                        variant="ghost"
                        className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-500/5 transition-all group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">{copy.actions.addExercise}</span>
                      </Button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ) : null)}

      {/* Selector de Ejercicios de Biblioteca (Deshabilitado temporalmente: refactorización a panel lateral) */}


      {/* Selector de Alcance (ELIMINADO: ahora es siempre Solo Hoy) */}

    </div>
  );
}

function formatFechaDisplay(fechaISO: string): string {
  return new Date(fechaISO + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

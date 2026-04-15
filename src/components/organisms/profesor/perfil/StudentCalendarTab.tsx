import React, { useState } from "react";
import { cn } from "@/lib/utils";

// Componentes del Dominio (Atoms/Molecules)
import { DayCalendarStrip } from "@/components/molecules/DayCalendarStrip";
import { RestDayHUD } from "@/components/molecules/profesor/calendar/RestDayHUD";
import { ScopeSelectorDialog } from "@/components/molecules/profesor/calendar/ScopeSelectorDialog";
import { LoaderState } from "@/components/atoms/LoaderState";

// Refactorizaciones Industriales (NUEVOS)
import { OmissionBanner, StructuralBanner } from "@/components/molecules/profesor/perfil/CalendarBanners";
import { SessionDetailPanel } from "@/components/molecules/profesor/perfil/SessionDetailPanel";
import { CalendarHeader } from "@/components/molecules/profesor/perfil/CalendarHeader";

// Lógica de Estado (Hooks)
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
 * StudentCalendarTab: Organismo optimizado (V2.1) para la agenda del alumno.
 * Utiliza descompocisión atómica para reducir el tamaño del archivo y mejorar la reactividad.
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
    isInstantiatingExtra
  } = useStudentCalendar(alumnoId, fechaInicio, planData, diasAsistencia, onPlanChange);

  const copy = athleteProfileCopy.workspace.calendar;
  const hoyISO = getTodayISO();
  const isPastDay = !!selectedDay && selectedDay < hoyISO;
  const isSessionCompleted = selectedSesion?.estado === "completada";
  const isReadOnly = isPastDay || isSessionCompleted;

  // Estados locales para diálogos remanentes
  const [scopeData, setScopeData] = useState<{
    type: "add" | "remove" | "swap";
    id: string;
    nuevoId?: string;
    nombre: string;
  } | null>(null);

  const handleConfirmScope = (permanent: boolean) => {
    if (!scopeData) return;
    if (scopeData.type === "swap") {
      swapExercise(scopeData.id, scopeData.nuevoId!, permanent);
    } else if (scopeData.type === "add") {
      addExercise(scopeData.nuevoId!, permanent);
    } else if (scopeData.type === "remove") {
      removeExercise(scopeData.id, permanent);
    }
    setScopeData(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">

      <CalendarHeader title={copy.title} sessionsCompleted={stats.completadas} />

      {/* Navegador de Días */}
      <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl">
        {loading ? <LoaderState label={copy.status.loading} /> : (
          <DayCalendarStrip dias={calendarDays} diaSeleccionado={selectedDay || hoyISO} onSelectDia={setSelectedDay} />
        )}
      </div>

      {/* Alertas Operativas */}
      {hasOmissions && (
        <OmissionBanner
          copy={copy.banners.omissions}
          isRealigning={isRealigning}
          onRealign={realignCalendar}
        />
      )}

      {selectedSesion?.ejercicios.filter(e => e.is_variation).length >= 2 && (
        <StructuralBanner copy={copy.banners.structural} />
      )}

      {/* HUD de Descanso o Detalle de Sesión */}
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
          loadingDetalle ? <LoaderState label={copy.status.fetching} /> : (
            <SessionDetailPanel
              selectedSesion={selectedSesion}
              selectedDay={selectedDay}
              hoyISO={hoyISO}
              alumnoId={alumnoId}
              isReadOnly={isReadOnly}
              isClosingSession={isClosingSession}
              isSessionCompleted={isSessionCompleted}
              savingIds={savingIds}
              copy={copy}
              onComplete={completeSession}
              onUpdateMetric={updateMetric}
              onSwap={(id) => {
                // Para swap, necesitamos abrir el selector de ejercicios primero si no lo tenemos
                // Pero la lógica de Swap suele implicar elegir técnica ANTES.
                // REVISIÓN: El ScopeSelectorDialog del proyecto parece ser el PASO FINAL (confirmación de alcance).
                // Necesitamos un paso previo para elegir el ejercicio si es swap/add.
                // Pero por ahora solo arreglaré el crash de props.
              }}
              onRemove={(id) => {
                const ej = selectedSesion.ejercicios.find((e: any) => e.id === id);
                setScopeData({ type: "remove", id, nombre: (ej as any)?.nombre || "Ejercicio" });
              }}
              onAddExercise={() => {
                // Similar a swap, requiere selección previa.
              }}
            />
          )
        ) : null
      )}

      {/* Modales de Soporte */}
      <ScopeSelectorDialog
        data={scopeData}
        onClose={() => setScopeData(null)}
        onConfirm={handleConfirmScope}
      />
    </div>
  );
}

import React, { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { differenceInCalendarWeeks, parseISO } from "date-fns";
import {
  Dumbbell,
  Clock,
  Plus,
  Library,
  Box,
  Copy,
  Trash2,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { RestDayHUD } from "@/components/molecules/profesor/calendar/RestDayHUD";
import { NoPlanAssignedHUD } from "@/components/molecules/profesor/perfil/NoPlanAssignedHUD";

import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { Button } from "@/components/ui/button";
import { RoutineExerciseRow } from "@/components/molecules/profesor/planes/RoutineExerciseRow";
import { MasterPlanAssignmentDialog } from "@/components/molecules/profesor/perfil/MasterPlanAssignmentDialog";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PlanLibraryPanel } from "@/components/organisms/profesor/planes/PlanLibraryPanel";

import { PlanBlueprintReel } from "@/components/organisms/profesor/perfil/PlanBlueprintReel";
import { MasterPlanGuardDialog } from "@/components/molecules/profesor/perfil/MasterPlanGuardDialog";
import { PlanWorkspaceHeader } from "@/components/molecules/profesor/perfil/PlanWorkspaceHeader";
import { MuscleFilterChips } from "@/components/molecules/profesor/perfil/MuscleFilterChips";
import { PlanBannerManager } from "@/components/molecules/profesor/perfil/PlanBannerManager";
import { ViewToggle } from "@/components/molecules/ViewToggle";
import { cn } from "@/lib/utils";
import { useAccordion } from "@/hooks/useAccordion";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Props {
  alumnoId: string;
  student: any;
  planData: any;
  library: any[];
  mode?: "plan" | "routine";
  onUpdateMetrics: (id: string, updates: any) => Promise<void>;
  onUpdateDates: (dates: { fecha_inicio?: Date; fecha_fin?: Date | null }) => Promise<void>;
  onMove: (id: string, dir: "up" | "down") => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onAdd: (rutinaId: string, exId: string) => Promise<void>;
  onAddBlock: (rutinaId: string, blockId: string) => Promise<void>;
  onDuplicateRoutine?: (rutinaId: string) => Promise<void>;
  onDeleteRoutine?: (rutinaId: string) => Promise<void>;
  promotePlan: () => Promise<void>;
  getGroupedExercises: (ejs: any[]) => any[];
}


export function StudentRoutineWorkspace({ 
  alumnoId, 
  student,
  planData, 
  library, 
  mode = "routine",
  onUpdateMetrics,
  onUpdateDates,
  onMove,
  onDelete,
  onAdd,
  onAddBlock,
  onDuplicateRoutine,
  onDeleteRoutine,
  promotePlan,
  getGroupedExercises
}: Props) {

  const { workspace } = athleteProfileCopy;
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showPromotion, setShowPromotion] = useState(false);
  const [isPromotionDismissed, setIsPromotionDismissed] = useState(false);
  const [activeRoutineTarget, setActiveRoutineTarget] = useState<string | null>(null);
  const [muscleFilter, setMuscleFilter] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isGuardOpen, setIsGuardOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => Promise<void>) | null>(null);

  const { execute: run, isPending } = useAsyncAction();
  const { isOpen: isRutinaOpen, toggleItem: toggleRutina } = useAccordion(
    planData?.rutinas_diarias?.slice(0, 1).map((r: any) => r.id) || []
  );

  const isReadOnly = mode === "plan";
  const isReadOnlyTemplate = isReadOnly || (planData?.profesor_id === null);


  // Cálculo de duración en semanas (Blindaje contra fallos de date-fns)
  const cicloSemanas = React.useMemo(() => {
    try {
      if (!student.fecha_inicio || !student.fecha_fin) return null;
      if (typeof differenceInCalendarWeeks !== 'function' || typeof parseISO !== 'function') return null;
      
      const start = typeof student.fecha_inicio === 'string' ? parseISO(student.fecha_inicio) : student.fecha_inicio;
      const end = typeof student.fecha_fin === 'string' ? parseISO(student.fecha_fin) : student.fecha_fin;
      return differenceInCalendarWeeks(end, start);
    } catch (err) {
      console.warn("[Industrial Guard] Date computation failed:", err);
      return null;
    }
  }, [student.fecha_inicio, student.fecha_fin]);

  const handlePersonalize = async () => {
    if (!planData) return;
    await run(async () => {
      const { data, error } = await actions.profesor.forkPlan({
        planId: planData.id,
        alumnoId,
        nombre: `${planData.nombre} (Personalizado)`
      });
      if (error) throw error;
      toast.success("¡Listo! Creaste una versión personalizada");
      window.location.reload(); // Reload needed to change context to new ID
    });
  };

  const isEmpty = !planData || !planData.rutinas_diarias || planData.rutinas_diarias.length === 0;
  const sortedRutinas = planData?.rutinas_diarias
    ? [...planData.rutinas_diarias].sort((a: any, b: any) => a.dia_numero - b.dia_numero)
    : [];

  // Lift actions from hook props (or we can just use them)
  const handlePromotePlan = async () => {
    await promotePlan();
  };

  /**
   * Mediador de Edición: Intercepta cambios si el plan es Master
   */
  const ensureEditablePlan = (action: () => Promise<void>) => {
    if (planData?.is_template) {
      setPendingAction(() => action);
      setIsGuardOpen(true);
      return;
    }
    action();
  };

  const confirmForkAndExecute = async () => {
    if (!planData || !alumnoId) return;
    
    await run(async () => {
      // 1. Ejecutar Fork
      const { data, error } = await actions.profesor.forkPlan({
        planId: planData.id,
        alumnoId,
        nombre: `${planData.nombre} (Personalizado)`
      });
      if (error) throw error;

      // 2. Notificar y recargar para cambiar contexto al nuevo plan
      toast.success("¡Plan personalizado creado! Redirigiendo...");
      setIsGuardOpen(false);
      
      // Pequeño delay para que el usuario vea el éxito antes del reload
      setTimeout(() => {
        window.location.reload(); 
      }, 500);
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      {isEmpty ? (
        <NoPlanAssignedHUD 
          title={workspace.routine.emptyState.title}
          description={workspace.routine.emptyState.description}
          tag="SIN PLAN ACTIVO"
          onAssign={() => setIsAssignDialogOpen(true)}
        />
      ) : (

        <>
          <PlanWorkspaceHeader 
            mode={mode}
            planName={planData.nombre}
            isTemplate={planData.is_template}
            isPending={isPending}
            onPromote={handlePromotePlan}
            onChangePlan={() => setIsAssignDialogOpen(true)}
          />

          {/* CONTROLES DE INGENIERÍA NODO - VIGENCIA Y FILTROS */}
          <div className="bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-8">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Fecha de Inicio</span>
                  <input
                    type="date"
                    defaultValue={student.fecha_inicio ? student.fecha_inicio.split('T')[0] : ''}
                    onChange={(e) => onUpdateDates({ fecha_inicio: new Date(e.target.value) })}
                    className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-xl px-4 py-2 font-bold text-sm text-zinc-950 dark:text-white focus:border-lime-400 focus:ring-0 transition-colors"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 block ml-1">Fecha de Fin</span>
                  <input
                    type="date"
                    defaultValue={student.fecha_fin ? student.fecha_fin.split('T')[0] : ''}
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

              {/* STATS RÁPIDOS */}
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Ejercicios Totales</span>
                    <span className="text-2xl font-black text-zinc-950 dark:text-white">{planData.rutinas_diarias?.reduce((acc: number, r: any) => acc + (r.ejercicios_plan?.length || 0), 0)}</span>
                 </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <MuscleFilterChips 
                exercises={planData.rutinas_diarias?.flatMap((r: any) => r.ejercicios_plan) || []}
                activeFilter={muscleFilter}
                onFilterChange={setMuscleFilter}
              />

              {mode === "plan" && (
                <ViewToggle 
                  view={viewMode}
                  onChange={setViewMode}
                  className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-1"
                />
              )}
            </div>
          </div>

          <PlanBannerManager 
            isTemplate={planData.is_template}
            showPromotion={showPromotion && !isPromotionDismissed}
            onPersonalize={handlePersonalize}
            onDismissPromotion={() => setIsPromotionDismissed(true)}
            planId={planData.id}
          />

          <div className="space-y-4">
            {/* VISTA BLUEPRINT (GRILLA) */}
            {(mode === "plan" && viewMode === "grid") && (
              <PlanBlueprintReel 
                routines={sortedRutinas}
                getGroupedExercises={getGroupedExercises}
                isMaster={planData.is_template}
              />
            )}

            {/* VISTA LISTADO (TABLA/ACORDEONES) */}
            {(mode === "routine" || viewMode === "table") && sortedRutinas.map((rutina: any) => {
              const isOpen = isRutinaOpen(rutina.id);
              
              // Filtrar ejercicios de esta rutina por grupo muscular si hay un filtro activo
              const filteredExercises = (rutina.ejercicios_plan || []).filter((ej: any) => {
                if (!muscleFilter) return true;
                return ej.biblioteca_ejercicios?.tags?.includes(muscleFilter);
              });

              const groupedEjs = getGroupedExercises(filteredExercises);

              // Si hay filtro activo y no hay resultados en esta rutina, no la mostramos (o la mostramos vacía)
              if (muscleFilter && filteredExercises.length === 0) return null;

              return (
                <div key={rutina.id} className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden transition-all hover:shadow-xl group">
                  {/* ... Cabecera de rutina igual ... */}
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => toggleRutina(rutina.id)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 sm:p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-all cursor-pointer",
                      isOpen && "sticky top-16 sm:top-20 z-30 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-100 dark:border-zinc-800 shadow-sm"
                    )}
                  >
                    <div className="flex items-center gap-4 sm:gap-6">
                      <span className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-500",
                        isOpen ? "bg-zinc-950 text-white dark:bg-lime-500 dark:text-zinc-950 rotate-3" : "bg-zinc-50 dark:bg-zinc-900 text-zinc-400"
                      )}>
                        {rutina.dia_numero}
                      </span>
                      <div className="text-left">
                        <h4 className="font-bold text-base sm:text-lg text-zinc-950 dark:text-white uppercase tracking-tighter leading-none group-hover:text-lime-600 transition-colors">
                          {rutina.nombre_dia || `Día ${rutina.dia_numero}`}
                        </h4>
                        <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 tracking-widest mt-1 sm:mt-1.5 flex items-center gap-2 uppercase">
                          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {filteredExercises.length} Ejercicios {muscleFilter && `(Filtrado)`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 pr-1 sm:pr-2">
                       {!isReadOnly && (
                         <div className="flex items-center gap-0.5 sm:gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); onDuplicateRoutine?.(rutina.id); }}
                              className="p-2 text-zinc-400 hover:text-lime-500 hover:bg-lime-500/10 rounded-xl transition-all"
                              title="Duplicar día"
                            >
                              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); onDeleteRoutine?.(rutina.id); }}
                              className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                              title="Eliminar día"
                            >
                              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            </button>
                         </div>
                       )}

                       
                       <div className={cn(
                         "w-8 h-8 rounded-xl flex items-center justify-center transition-all",
                         isOpen ? "bg-lime-500 text-zinc-950" : "text-zinc-400 group-hover:bg-zinc-100 dark:group-hover:bg-zinc-800"
                       )}>
                          <ChevronRight className={cn(
                            "w-4 h-4 transition-transform duration-500",
                            isOpen && "rotate-90"
                          )} />
                       </div>
                    </div>
                  </div>


                  {isOpen && (
                    <div className="divide-y divide-zinc-100 dark:divide-zinc-900/10 border-t border-zinc-100 dark:border-zinc-900/50 bg-white/50 dark:bg-black/5">
                      {groupedEjs.map((group, gIdx) => (
                        <div key={group.id || `unbound-${gIdx}`} className={cn(
                          "transition-all",
                          group.id && "bg-lime-500/[0.02] border-y border-lime-500/5 py-2"
                        )}>
                          {group.nombre && (
                            <div className="px-6 py-2 flex items-center gap-2">
                               <div className="w-6 h-6 rounded-lg bg-lime-500/10 flex items-center justify-center">
                                  <Box className="w-3 h-3 text-lime-500" />
                               </div>
                               <span className="text-[9px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400">{group.nombre}</span>
                            </div>
                          )}
                          
                          {group.exercises.map((ej: any, idx: number) => (
                            <RoutineExerciseRow
                              key={ej.id}
                              exercise={ej}
                              index={idx} 
                              isFirst={idx === 0 && !group.id}
                              isLast={idx === group.exercises.length - 1 && !group.id}
                              readOnly={isReadOnlyTemplate}
                              hideMetrics={mode === "plan"}
                              onChange={(updates) => ensureEditablePlan(() => onUpdateMetrics(ej.id, updates))}

                              onMove={(dir) => ensureEditablePlan(() => onMove(ej.id, dir))}
                              onDelete={() => {
                                if (planData.is_template) {
                                    ensureEditablePlan(() => Promise.resolve()); // Dispara el guard
                                    return;
                                }
                                onDelete(ej.id);
                              }}
                            />
                          ))}
                        </div>
                      ))}

                      {!isReadOnly && (

                        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10">
                          <Button
                            variant="ghost"
                            onClick={() => { 
                              ensureEditablePlan(async () => {
                                setActiveRoutineTarget(rutina.id); 
                                setIsSearchOpen(true); 
                              });
                            }}
                            className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-500/5 transition-all group"
                          >
                            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-lime-500 transition-colors" />
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">Añadir ejercicio</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      <MasterPlanAssignmentDialog
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        alumnoId={alumnoId}
        student={student}
        currentPlanName={planData?.nombre}
        onSuccess={() => window.location.reload()}
      />

      <Sheet open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900">
           <PlanLibraryPanel
                onSelectExercise={(id) => { if (activeRoutineTarget) { onAdd(activeRoutineTarget, id); setIsSearchOpen(false); } }}
                onSelectBlock={(block) => { if (activeRoutineTarget) { onAddBlock(activeRoutineTarget, block.id); setIsSearchOpen(false); } }}
                library={library}
                allowCreate={false}
                className="h-full border-0"
              />
        </SheetContent>
      </Sheet>


      <MasterPlanGuardDialog 
        open={isGuardOpen}
        onOpenChange={setIsGuardOpen}
        onConfirm={confirmForkAndExecute}
        isPending={isPending}
      />
    </div>
  );
}

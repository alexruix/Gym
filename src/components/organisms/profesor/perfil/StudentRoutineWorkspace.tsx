import React from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PlanLibraryPanel } from "@/components/organisms/profesor/planes/PlanLibraryPanel";

// Componentes del Dominio (Molecules/Atoms)
import { RestDayHUD } from "@/components/molecules/profesor/calendar/RestDayHUD";
import { NoPlanAssignedHUD } from "@/components/molecules/profesor/perfil/NoPlanAssignedHUD";
import { MasterPlanAssignmentDialog } from "@/components/molecules/profesor/perfil/MasterPlanAssignmentDialog";
import { PlanBlueprintReel } from "@/components/organisms/profesor/perfil/PlanBlueprintReel";
import { MasterPlanGuardDialog } from "@/components/molecules/profesor/perfil/MasterPlanGuardDialog";
import { PlanWorkspaceHeader } from "@/components/molecules/profesor/perfil/PlanWorkspaceHeader";
import { PlanBannerManager } from "@/components/molecules/profesor/perfil/PlanBannerManager";

// Refactorizaciones Industriales (NUEVOS)
import { RoutineAccordionItem } from "@/components/molecules/profesor/perfil/RoutineAccordionItem";
import { RoutineWorkspaceControls } from "@/components/molecules/profesor/perfil/RoutineWorkspaceControls";
import { useRoutineWorkspace } from "@/hooks/profesor/perfil/useRoutineWorkspace";

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

/**
 * StudentRoutineWorkspace: Orquestador optimizado del entrenamiento del alumno.
 * Refactorizado (V2.1) para máxima eficiencia y mínima latencia mediante descompocisión atómica.
 */
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

  const { state, computed, actions } = useRoutineWorkspace({
    alumnoId,
    student,
    planData,
    promotePlan
  });

  if (computed.isEmpty) {
    return (
      <NoPlanAssignedHUD 
        title="Sin plan asignado"
        description="Este alumno aún no tiene una estructura de entrenamiento activa."
        tag="SIN PLAN ACTIVO"
        onAssign={() => state.setIsAssignDialogOpen(true)}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-20">
      <PlanWorkspaceHeader 
        mode={mode}
        planName={planData.nombre}
        isTemplate={planData.is_template}
        isPending={state.isPending}
        onPromote={actions.handlePromotePlan}
        onChangePlan={() => state.setIsAssignDialogOpen(true)}
      />

      <RoutineWorkspaceControls 
        fechaInicio={student.fecha_inicio}
        fechaFin={student.fecha_fin}
        cicloSemanas={computed.cicloSemanas}
        totalExercises={computed.totalExercises}
        muscleFilter={state.muscleFilter}
        viewMode={state.viewMode}
        exercises={planData.rutinas_diarias?.flatMap((r: any) => r.ejercicios_plan) || []}
        onUpdateDates={onUpdateDates}
        onFilterChange={state.setMuscleFilter}
        onViewChange={state.setViewMode}
        mode={mode}
      />

      <PlanBannerManager 
        isTemplate={planData.is_template}
        showPromotion={state.showPromotion && !state.isPromotionDismissed}
        onPersonalize={actions.handlePersonalize}
        onDismissPromotion={() => state.setIsPromotionDismissed(true)}
        planId={planData.id}
      />

      <div className="space-y-4">
        {/* VISTA BLUEPRINT (GRILLA) */}
        {(mode === "plan" && state.viewMode === "grid") && (
          <PlanBlueprintReel 
            routines={computed.sortedRutinas}
            getGroupedExercises={getGroupedExercises}
            isMaster={planData.is_template}
          />
        )}

        {/* VISTA LISTADO (TABLA/ACORDEONES) */}
        {(mode === "routine" || state.viewMode === "table") && computed.sortedRutinas.map((rutina) => (
          <RoutineAccordionItem 
            key={rutina.id}
            rutina={rutina}
            isOpen={state.isRutinaOpen(rutina.id)}
            onToggle={() => actions.toggleRutina(rutina.id)}
            onAddExercise={(rid) => { 
                actions.ensureEditablePlan(async () => {
                    state.setActiveRoutineTarget(rid); 
                    state.setIsSearchOpen(true); 
                });
            }}
            onAddBlock={(rid) => {
                actions.ensureEditablePlan(async () => {
                    state.setActiveRoutineTarget(rid); 
                    state.setIsSearchOpen(true); 
                });
            }}
            onDuplicate={(rid) => onDuplicateRoutine?.(rid)}
            onDelete={(rid) => onDeleteRoutine?.(rid)}
            onUpdateMetrics={(id, updates) => actions.ensureEditablePlan(() => onUpdateMetrics(id, updates))}
            onMoveExercise={(id, dir) => actions.ensureEditablePlan(() => onMove(id, dir))}
            onDeleteExercise={(id) => {
                if (planData.is_template) {
                    actions.ensureEditablePlan(() => Promise.resolve());
                    return;
                }
                onDelete(id);
            }}
            getGroupedExercises={getGroupedExercises}
            muscleFilter={state.muscleFilter}
            isReadOnly={computed.isReadOnly || mode === "plan"}
            mode={mode}
          />
        ))}
      </div>

      {/* DIALOGOS Y SHEETS */}
      <MasterPlanAssignmentDialog
        open={state.isAssignDialogOpen}
        onOpenChange={state.setIsAssignDialogOpen}
        alumnoId={alumnoId}
        student={student}
        currentPlanName={planData?.nombre}
        onSuccess={() => window.location.reload()}
      />

      <Sheet open={state.isSearchOpen} onOpenChange={state.setIsSearchOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900">
           <PlanLibraryPanel
                onSelectExercise={(id) => { if (state.activeRoutineTarget) { onAdd(state.activeRoutineTarget, id); state.setIsSearchOpen(false); } }}
                onSelectBlock={(block) => { if (state.activeRoutineTarget) { onAddBlock(state.activeRoutineTarget, block.id); state.setIsSearchOpen(false); } }}
                library={library}
                allowCreate={false}
                className="h-full border-0"
              />
        </SheetContent>
      </Sheet>

      <MasterPlanGuardDialog 
        open={state.isGuardOpen}
        onOpenChange={state.setIsGuardOpen}
        onConfirm={actions.confirmForkAndExecute}
        isPending={state.isPending}
      />
    </div>
  );
}

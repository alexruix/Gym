import React, { useState } from "react";
import { PanelRightClose, PanelRightOpen, ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// Modular Components
import { PlanNavigator } from "@/components/molecules/profesor/planes/PlanNavigator";
import { PlanLibraryPanel } from "@/components/organisms/profesor/planes/PlanLibraryPanel";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { BulkActionDialog } from "@/components/molecules/profesor/planes/BulkActionDialog";
import { PlanFormHeader } from "@/components/molecules/profesor/planes/PlanFormHeader";
import { PlanRoutineEditor } from "./PlanRoutineEditor";
import { PlanFloatingFooter } from "@/components/molecules/profesor/planes/PlanFloatingFooter";

// Hooks
import { usePlanForm } from "@/hooks/profesor/usePlanForm";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface Props {
  library: any[];
  initialValues?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * PlanForm: Organismo optimizado (V2.1) para la gestión integral de planes de entrenamiento.
 * Descompuesto en piezas atómicas para maximizar la latencia y mantenibilidad.
 */
export function PlanForm({ library, initialValues, onSuccess, onCancel }: Props) {
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const [isLibraryVisible, setIsLibraryVisible] = useState(true);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  const {
    form,
    stats,
    isPending,
    activeDiaAbsoluto,
    setActiveDiaAbsoluto,
    currentWeek,
    setCurrentWeek,
    numWeeks,
    freqSemanal,
    localLibrary,
    actions
  } = usePlanForm({ library, initialValues, onSuccess });

  const rutinasWatch = form.watch("rutinas");
  const routineIdx = activeDiaAbsoluto - 1;
  const currentExercises = rutinasWatch?.[routineIdx]?.ejercicios || [];
  const isTemplate = initialValues?.is_template !== false;

  return (
    <Form {...form}>
      <form onSubmit={actions.onSubmit} className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
        
        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR: BIBLIOTECA (Desktop) */}
          {isDesktop && (
            <div className={cn(
              "transition-all duration-500 border-r border-zinc-100 dark:border-zinc-900 relative",
              isLibraryVisible ? "w-[400px]" : "w-0 overflow-hidden opacity-0"
            )}>
              <PlanLibraryPanel
                onSelectExercise={actions.addExercise}
                onSelectBlock={actions.addBlockToRoutine}
                library={localLibrary}
              />
            </div>
          )}

          {/* ÁREA PRINCIPAL */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            <PlanNavigator
              currentWeek={currentWeek}
              numWeeks={numWeeks}
              freqSemanal={freqSemanal}
              onWeekChange={(w) => { setCurrentWeek(w); setActiveDiaAbsoluto((w - 1) * freqSemanal + 1); }}
              activeDiaAbsoluto={activeDiaAbsoluto}
              onDiaChange={setActiveDiaAbsoluto}
              rutinas={rutinasWatch || []}
            />

            <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
              <div className="p-6 lg:p-12 space-y-12 max-w-4xl mx-auto w-full pb-56">
                
                {/* 1. Header (Nombre + Metadatos) */}
                <PlanFormHeader 
                    form={form} 
                    numWeeks={numWeeks} 
                    freqSemanal={freqSemanal} 
                    isTemplate={isTemplate} 
                />

                {/* 2. Editor de Rutina Diaria */}
                <PlanRoutineEditor 
                    form={form}
                    currentExercises={currentExercises}
                    routineIdx={routineIdx}
                    activeDiaAbsoluto={activeDiaAbsoluto}
                    currentWeek={currentWeek}
                    freqSemanal={freqSemanal}
                    isTemplate={isTemplate}
                    actions={actions}
                    onOpenLibrary={() => isDesktop ? setIsLibraryVisible(true) : setIsMobileSheetOpen(true)}
                />
              </div>
            </div>

            {/* Toggle Panel Button */}
            {isDesktop && (
              <button
                type="button"
                onClick={() => setIsLibraryVisible(!isLibraryVisible)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-zinc-950 text-white rounded-full transition-all shadow-xl hover:scale-110"
              >
                {isLibraryVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            )}

            {/* BARRA FLOTANTE DE NAVEGACIÓN */}
            <PlanFloatingFooter 
                activeDiaAbsoluto={activeDiaAbsoluto}
                setActiveDiaAbsoluto={setActiveDiaAbsoluto}
                currentWeek={currentWeek}
                numWeeks={numWeeks}
                freqSemanal={freqSemanal}
                isPending={isPending}
                isValid={stats.isValid}
                onSave={actions.onSubmit}
            />
          </main>
        </div>
      </form>

      {/* SIDEBAR MÓVIL */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="left" className="p-0 sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900">
           <PlanLibraryPanel
                onSelectExercise={actions.addExercise}
                onSelectBlock={actions.addBlockToRoutine}
                library={localLibrary}
                className="h-full border-0"
              />
        </SheetContent>
      </Sheet>

      {/* DIÁLOGOS DE APOYO */}
      <RotationDialog
        open={actions.rotationEditing !== null}
        onOpenChange={(open) => !open && actions.setRotationEditing(null)}
        exercise={actions.rotationEditing ? form.getValues(`rutinas.${actions.rotationEditing.routineIdx}.ejercicios.${actions.rotationEditing.exerciseIdx}`) : null}
        library={localLibrary}
        onSetRotation={actions.handleSetRotation}
        onAutoPilot={() => { }}
      />

      <BulkActionDialog
        open={actions.isBulkOpen}
        onOpenChange={actions.setIsBulkOpen}
        sourceDayNum={activeDiaAbsoluto}
        totalWeeks={numWeeks}
        onConfirm={actions.handleDuplicateMulti}
        rutinas={rutinasWatch || []}
      />
    </Form>
  );
}

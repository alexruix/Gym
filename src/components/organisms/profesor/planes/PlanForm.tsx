import React, { useState } from "react";
import { planesCopy } from "@/data/es/profesor/planes";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";

import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Copy, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Box, ClipboardList, PanelRightClose, PanelRightOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { PlanNavigator } from "@/components/molecules/profesor/planes/PlanNavigator";
import { PlanLibraryPanel } from "@/components/organisms/profesor/planes/PlanLibraryPanel";
import { BulkActionDialog } from "@/components/molecules/profesor/planes/BulkActionDialog";
import { usePlanForm } from "@/hooks/profesor/usePlanForm";
import { PlanPill } from "@/components/atoms/profesor/planes/PlanPill";
import { ActionBridge } from "@/components/molecules/profesor/planes/ActionBridge"
import { Layers, TrendingUp } from "lucide-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
  is_template_base?: boolean;
  profesor_id?: string | null;
}

interface PlanFormProps {
  library: Exercise[];
  initialValues?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PlanForm({ library, initialValues, onSuccess, onCancel }: PlanFormProps) {
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

  // Helpers derived from hook state
  const routineIdx = activeDiaAbsoluto - 1;
  const rutinasWatch = form.watch("rutinas");
  const currentExercises = rutinasWatch?.[routineIdx]?.ejercicios || [];

  const isTemplate = initialValues?.is_template !== false;

  const handleAddFromLibrary = (exerciseId: string) => {
    actions.addExercise(exerciseId);
    // Visual feedback handled by card animations
  };

  const handleAddBlockFromLibrary = (block: any) => {
    actions.addBlockToRoutine(block);
  };

  return (
    <Form {...form}>
      <form onSubmit={actions.onSubmit} className="h-screen flex flex-col bg-white dark:bg-zinc-950 overflow-hidden">
        
        {/* Workspace Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* SIDEBAR: LIBRARY (Desktop Only) */}
          {isDesktop && (
            <div className={cn(
              "transition-all duration-500 ease-in-out border-r border-zinc-100 dark:border-zinc-900 relative",
              isLibraryVisible ? "w-[400px]" : "w-0 overflow-hidden opacity-0 p-0 m-0 border-l-0"
            )}>
              <PlanLibraryPanel
                onSelectExercise={handleAddFromLibrary}
                onSelectBlock={handleAddBlockFromLibrary}
                library={localLibrary}
              />
            </div>
          )}

          {/* MAIN EDITOR AREA */}
          <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
            
            {/* TOP NAVIGATOR (Sticky in its container) */}
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
                
                {/* 1. Header (Nombre del Plan) */}
                <header className="space-y-6 animate-in fade-in duration-700">
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="nombre"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input
                              placeholder={planesCopy.form.basic.placeholders.nombre}
                              {...field}
                              className="text-2xl md:text-3xl lg:text-4xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tighter placeholder:opacity-20 text-zinc-950 dark:text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-[10px] font-bold uppercase text-red-500 tracking-widest mt-2" />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <PlanPill
                        icon={TrendingUp}
                        value={numWeeks === 0 ? "∞" : numWeeks}
                        label={numWeeks === 0 ? "Sin fin" : "sem"}
                        variant="accent"
                      />
                      <PlanPill
                        icon={Layers}
                        value={freqSemanal}
                        label="días/sem"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Duración</span>
                      <div className="industrial-select-trigger h-10">
                        <select
                          className="industrial-select text-[11px]"
                          value={numWeeks}
                          onChange={(e) => form.setValue("duracion_semanas", parseInt(e.target.value))}
                        >
                          <option value={0}>Indefinida (Sin fin)</option>
                          {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} semanas</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1 min-w-[120px]">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Frecuencia</span>
                      <div className="industrial-select-trigger h-10">
                        <select
                          className="industrial-select text-[11px]"
                          value={freqSemanal}
                          onChange={(e) => form.setValue("frecuencia_semanal", parseInt(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>{s} días x sem</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </header>

                {/* 2. Nudge ADN Maestro */}
                {isTemplate && (
                  <div className="bg-lime-500/10 border border-lime-500/20 rounded-3xl p-6 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="w-10 h-10 rounded-2xl bg-lime-500 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/20">
                      <ClipboardList className="w-5 h-5 text-zinc-950" />
                    </div>
                    <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                      Planificá la estructura base. Ajustarás series/reps finales en el perfil de cada alumno.
                    </p>
                  </div>
                )}

                {/* 3. Zona de Edición del Día */}
                <section className="space-y-8">
                  <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
                    <div className="space-y-1">
                      <span className="industrial-label-accent">Semana {currentWeek}</span>
                      <h2 className="industrial-title-lg text-zinc-950 dark:text-zinc-100">
                        Rutina {activeDiaAbsoluto - (currentWeek - 1) * freqSemanal}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                       {currentExercises.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => actions.setIsBulkOpen(true)}
                          className="rounded-xl border-zinc-200 dark:border-zinc-800 text-[10px] font-bold uppercase tracking-widest gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </Button>
                      )}
                      {!isDesktop && (
                        <Button
                          type="button"
                          variant="industrial"
                          size="sm"
                          onClick={() => setIsMobileSheetOpen(true)}
                          className="rounded-xl"
                        >
                          <Plus className="w-3.5 h-3.5 mr-2" />
                          Biblioteca
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 min-h-[300px]">
                    {currentExercises.length === 0 ? (
                        <ActionBridge
                          icon={Dumbbell}
                          title="Rutina vacía"
                          description="Diseñá un entrenamiento de alto rendimiento desde el panel derecho."
                          actionLabel="Acceder a biblioteca"
                          onAction={() => isDesktop ? setIsLibraryVisible(true) : setIsMobileSheetOpen(true)}
                        />
                    ) : (
                      <div className="space-y-4">
                        {currentExercises.map((ex: any, exIdx: number) => {
                          const isPrevInSameBlock = exIdx > 0 && currentExercises[exIdx - 1]?.grupo_bloque_id === ex.grupo_bloque_id && !!ex.grupo_bloque_id;
                          const isNextInSameBlock = exIdx < currentExercises.length - 1 && currentExercises[exIdx + 1]?.grupo_bloque_id === ex.grupo_bloque_id && !!ex.grupo_bloque_id;

                          return (
                            <ExerciseCard
                              key={ex.position || exIdx}
                              form={form}
                              routineIdx={routineIdx}
                              exerciseIdx={exIdx}
                              exercise={ex}
                              isTemplate={isTemplate}
                              getExerciseName={actions.getExerciseName}
                              removeExercise={actions.removeExercise}
                              onMove={(dir) => actions.moveExercise(routineIdx, exIdx, dir)}
                              isFirst={exIdx === 0}
                              isLast={exIdx === currentExercises.length - 1}
                              onEditRotation={(ri, ei) => actions.setRotationEditing({ routineIdx: ri, exerciseIdx: ei })}
                              hasRotation={(pos) => form.watch("rotaciones")?.some((r: any) => r.position === pos)}
                              getRotationForPosition={(pos) => form.watch("rotaciones")?.find((r: any) => r.position === pos)}
                              removeRotationExercise={actions.handleRemoveRotationExercise}
                              
                              isInBlock={!!ex.grupo_bloque_id}
                              isPrevInSameBlock={isPrevInSameBlock}
                              isNextInSameBlock={isNextInSameBlock}
                              blockType={ex.grupo_tipo_bloque}
                              blockLaps={ex.grupo_vueltas}
                            />
                          );
                        })}

                        {/* BOTÓN PARA AÑADIR MÁS ITEMS */}
                        <button
                          type="button"
                          onClick={() => isDesktop ? setIsLibraryVisible(true) : setIsMobileSheetOpen(true)}
                          className="w-full py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-zinc-400 hover:text-lime-500 hover:border-lime-500/50 hover:bg-lime-500/[0.02] transition-all group"
                        >
                          <div className="w-12 h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center group-hover:bg-lime-500 group-hover:text-zinc-950 transition-colors">
                            <Plus className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Siguiente elemento</span>
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>

            {/* Toggle Panel Button (Desktop only) */}
            {isDesktop && (
              <button
                type="button"
                onClick={() => setIsLibraryVisible(!isLibraryVisible)}
                className={cn(
                  "absolute right-4 top-1/2 -translate-y-1/2 z-50 p-2 bg-zinc-950 text-white rounded-full transition-all shadow-xl hover:scale-110",
                  !isLibraryVisible && "translate-x-2"
                )}
              >
                {isLibraryVisible ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              </button>
            )}

            {/* 3. FOOTER GLOBAL: NAVEGACIÓN + GUARDAR */}
            <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 pointer-events-none">
              <div className="bg-zinc-950/90 dark:bg-zinc-900/90 border border-white/10 shadow-2xl rounded-[2.5rem] p-2 flex items-center justify-between pointer-events-auto backdrop-blur-xl">
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={activeDiaAbsoluto === 1}
                    onClick={() => setActiveDiaAbsoluto(prev => prev - 1)}
                    className="text-white hover:bg-white/10 rounded-xl h-10 w-10"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </Button>
                  <div className="flex flex-col items-center px-4 min-w-[100px]">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-white leading-none">RUTINA {activeDiaAbsoluto}</span>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mt-1">SEM {currentWeek}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={activeDiaAbsoluto === (numWeeks === 0 ? freqSemanal : numWeeks * freqSemanal)}
                    onClick={() => setActiveDiaAbsoluto(prev => prev + 1)}
                    className="text-white hover:bg-white/10 rounded-xl h-10 w-10"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                <Button
                  type="submit"
                  disabled={isPending || !stats.isValid}
                  className="bg-lime-500 text-zinc-950 hover:bg-lime-400 font-bold px-8 h-12 rounded-[1.5rem] text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/10 active:scale-95 transition-all"
                >
                  {isPending ? "..." : "Guardar"}
                  <Save className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </footer>
          </main>
        </div>
      </form>

      {/* MOBILE SIDEBAR (Sheet) */}
      <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
        <SheetContent side="left" className="p-0 sm:max-w-md bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-900">
           <PlanLibraryPanel
                onSelectExercise={handleAddFromLibrary}
                onSelectBlock={handleAddBlockFromLibrary}
                library={localLibrary}
                className="h-full border-0"
              />
        </SheetContent>
      </Sheet>

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

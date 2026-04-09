import React from "react";
import { planesCopy } from "@/data/es/profesor/planes";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Copy, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Box, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { PlanNavigator } from "@/components/molecules/profesor/planes/PlanNavigator";
import { BulkActionDialog } from "@/components/molecules/profesor/planes/BulkActionDialog";
import { BlockSearchDialog } from "@/components/molecules/profesor/planes/BlockSearchDialog";
import { AddElementDialog } from "@/components/molecules/profesor/planes/AddElementDialog";
import { usePlanForm } from "@/hooks/profesor/usePlanForm";
import { PlanPill } from "@/components/atoms/profesor/planes/PlanPill";
import { ActionBridge } from "@/components/molecules/profesor/planes/ActionBridge"
import { Calendar, Layers, TrendingUp, Users } from "lucide-react";

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
    isSearchOpen,
    setIsSearchOpen,
    isBlockSearchOpen,
    setIsBlockSearchOpen,
    isAddElementOpen,
    setIsAddElementOpen,
    isBulkOpen,
    setIsBulkOpen,
    rotationEditing,
    setRotationEditing,
    actions
  } = usePlanForm({ library, initialValues, onSuccess });

  // Helpers derived from hook state
  const routineIdx = activeDiaAbsoluto - 1;
  const rutinasWatch = form.watch("rutinas");
  const currentExercises = rutinasWatch?.[routineIdx]?.ejercicios || [];

  const isTemplate = initialValues?.is_template !== false;

  return (
    <Form {...form}>
      <form onSubmit={actions.onSubmit} className="min-h-screen bg-white dark:bg-zinc-950">

        {/* TOP NAVIGATOR: SEMANAS + DÍAS (Sticky) */}
        <PlanNavigator
          currentWeek={currentWeek}
          numWeeks={numWeeks}
          freqSemanal={freqSemanal}
          onWeekChange={(w) => { setCurrentWeek(w); setActiveDiaAbsoluto((w - 1) * freqSemanal + 1); }}
          activeDiaAbsoluto={activeDiaAbsoluto}
          onDiaChange={setActiveDiaAbsoluto}
          rutinas={rutinasWatch || []}
        />

        {/* MAIN SECTION: EDITION */}
        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-6 lg:p-12 space-y-12 max-w-4xl mx-auto w-full pb-56 lg:pb-32">

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
                          className="text-2xl md:text-4xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tighter placeholder:opacity-20 text-zinc-950 dark:text-white"
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

                <QuickOptionsGroup
                  options={planesCopy.form.basic.nameOptions}
                  selectedOptions={[form.watch("nombre")]}
                  onToggle={(name) => form.setValue("nombre", name)}
                  className="pt-2"
                />
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

            {/* 2. Nudge ADN Maestro (Uso de voseo rioplatense) */}
            {isTemplate && (
              <div className="bg-lime-500/10 border border-lime-500/20 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="w-12 h-12 rounded-2xl bg-lime-500 flex items-center justify-center shrink-0 shadow-lg shadow-lime-500/20">
                  <ClipboardList className="w-6 h-6 text-zinc-950" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400">Planificación base</h4>
                  <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    Estás creando una planificación base. Cargá los ejercicios y el orden. <br /> Las series, repeticiones y descansos las vas a personalizar después en el perfil de cada alumno.
                  </p>
                </div>
              </div>
            )}

            {/* 3. Zona de Edición del Día */}
            <section className="space-y-8">
              <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center justify-between">
                <div className="space-y-1">
                  <span className="industrial-label-accent">Semana {currentWeek}</span>
                  <h2 className="industrial-title-lg">
                    Rutina {activeDiaAbsoluto - (currentWeek - 1) * freqSemanal}
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3 shrink-0">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsBulkOpen(true)} className="">
                    <Copy className="w-5 h-5 mr-3" /> <span className="text-[10px] font-bold uppercase">Duplicar día</span>
                  </Button>
                  <Button type="button" variant="industrial" size="sm" onClick={() => setIsAddElementOpen(true)} className="">
                    <Plus className="w-5 h-5 mr-3" /> <span className="text-[10px] font-bold uppercase">Añadir item</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-4 min-h-[300px]">
                {currentExercises.length === 0 ? (
                  <ActionBridge
                    icon={Dumbbell}
                    title="Rutina vacía"
                    description="Cargá los ejercicios para este día y diseñá un entrenamiento de alto rendimiento."
                    actionLabel="Añadir item"
                    onAction={() => setIsAddElementOpen(true)}
                  />
                ) : (
                  currentExercises.map((ex: any, exIdx: number) => (
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
                      onEditRotation={(ri, ei) => setRotationEditing({ routineIdx: ri, exerciseIdx: ei })}
                      hasRotation={(pos) => form.watch("rotaciones")?.some((r: any) => r.position === pos)}
                      getRotationForPosition={(pos) => form.watch("rotaciones")?.find((r: any) => r.position === pos)}
                      removeRotationExercise={actions.handleRemoveRotationExercise}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* 3. FOOTER GLOBAL: NAVEGACIÓN + GUARDAR */}
          <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50 pointer-events-none">
            <div className="bg-zinc-950 dark:bg-zinc-900 border border-white/10 shadow-2xl rounded-[2rem] p-2 flex items-center justify-between pointer-events-auto backdrop-blur-xl">
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
                <div className="flex flex-col items-center px-4">
                  <span className="text-[10px] font-bold uppercase tracking-tighter text-white leading-none">RUTINA {activeDiaAbsoluto}</span>
                  <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mt-1">SEM {currentWeek}</span>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={activeDiaAbsoluto === numWeeks * freqSemanal}
                  onClick={() => setActiveDiaAbsoluto(prev => prev + 1)}
                  className="text-white hover:bg-white/10 rounded-xl h-10 w-10"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isPending || !stats.isValid}
                className="bg-lime-500 text-zinc-950 hover:bg-lime-400 font-bold px-6 h-12 rounded-2xl text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/10 active:scale-95 transition-all"
              >
                {isPending ? "..." : "Guardar"}
                <Save className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </footer>
        </main>
      </form>

      <ExerciseSearchDialog
        open={isSearchOpen}
        onOpenChange={setIsSearchOpen}
        library={localLibrary}
        onSelect={actions.addExercise}
        onExerciseCreated={actions.handleExerciseCreated}
        onlyBase={true}
      />

      <AddElementDialog
        open={isAddElementOpen}
        onOpenChange={setIsAddElementOpen}
        onSelectExercise={() => setIsSearchOpen(true)}
        onSelectBlock={() => setIsBlockSearchOpen(true)}
      />

      <BlockSearchDialog
        open={isBlockSearchOpen}
        onOpenChange={setIsBlockSearchOpen}
        onSelect={actions.addBlockToRoutine}
        library={localLibrary}
      />

      <RotationDialog
        open={rotationEditing !== null}
        onOpenChange={(open) => !open && setRotationEditing(null)}
        exercise={rotationEditing ? form.getValues(`rutinas.${rotationEditing.routineIdx}.ejercicios.${rotationEditing.exerciseIdx}`) : null}
        library={localLibrary}
        onSetRotation={actions.handleSetRotation}
        onAutoPilot={() => { }}
      />

      <BulkActionDialog
        open={isBulkOpen}
        onOpenChange={setIsBulkOpen}
        sourceDayNum={activeDiaAbsoluto}
        totalWeeks={numWeeks}
        onConfirm={actions.handleDuplicateMulti}
        rutinas={rutinasWatch || []}
      />
    </Form>
  );
}

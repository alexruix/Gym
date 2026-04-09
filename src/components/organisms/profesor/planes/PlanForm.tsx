import React from "react";
import { planesCopy } from "@/data/es/profesor/planes";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Copy, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Box } from "lucide-react";
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
            <header className="space-y-10 animate-in fade-in duration-700">
              <div className="space-y-4">
                <h3 className="industrial-label">Nombre</h3>
                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormControl>
                        <Input placeholder="Nombre o enfoque del plan" {...field} className="text-2xl lg:text-3xl font-bold bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tight placeholder:opacity-30" />
                      </FormControl>
                      <FormMessage className="industrial-label-sm text-red-500" />
                    </FormItem>
                  )}
                />
                <QuickOptionsGroup
                  options={["Fuerza", "Hipertrofia", "Acondicionamiento", "Postura"]}
                  selectedOptions={[form.watch("nombre")]}
                  onToggle={(name) => form.setValue("nombre", name)}
                />
              </div>

              <div className="flex flex-wrap gap-4 max-w-sm">
                <FormField
                  control={form.control}
                  name="duracion_semanas"
                  render={({ field }) => (
                    <FormItem className="space-y-3 flex-1 min-w-[140px]">
                      <FormLabel className="industrial-label">Duración total</FormLabel>
                      <div className="industrial-select-trigger">
                        <select
                          className="industrial-select"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} semanas</option>)}
                        </select>
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="frecuencia_semanal"
                  render={({ field }) => (
                    <FormItem className="space-y-3 flex-1 min-w-[140px]">
                      <FormLabel className="industrial-label">Días x Semana</FormLabel>
                      <div className="industrial-select-trigger">
                        <select
                          className="industrial-select"
                          value={field.value}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                          {[1, 2, 3, 4, 5, 6, 7].map(s => <option key={s} value={s}>{s} días</option>)}
                        </select>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </header>

            {/* 2. Zona de Edición del Día */}
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
                  <div className="industrial-card-ghost py-32" onClick={() => setIsSearchOpen(true)}>
                    <Dumbbell className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mb-6" />
                    <p className="industrial-description tracking-[0.3em] max-w-[200px]">Este día aún no tiene ejercicios.</p>
                    <span className="mt-6 text-lime-500 font-bold uppercase text-[10px] tracking-widest">Cargar rutina ahora</span>
                  </div>
                ) : (
                  currentExercises.map((ex: any, exIdx: number) => (
                    <ExerciseCard
                      key={ex.position || exIdx}
                      form={form}
                      routineIdx={routineIdx}
                      exerciseIdx={exIdx}
                      exercise={ex}
                      getExerciseName={actions.getExerciseName}
                      removeExercise={actions.removeExercise}
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

          {/* 3. FOOTER GLOBAL: NAVEGACIÃ“N + GUARDAR */}
          <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50 pointer-events-none">
            <div className="industrial-floating-bar px-6">

              {/* Navegación de Días */}
              <div className="flex items-center gap-3 pr-8 border-r border-white/10">
                <Button variant="ghost" size="icon" disabled={activeDiaAbsoluto === 1} onClick={() => setActiveDiaAbsoluto(prev => prev - 1)} className="text-white hover:bg-white/10 rounded-2xl h-12 w-12">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="industrial-label text-white/90 leading-none">Rutina {activeDiaAbsoluto}</span>
                  <span className="industrial-metadata text-zinc-500 mt-1">de {numWeeks * freqSemanal}</span>
                </div>
                <Button variant="ghost" size="icon" disabled={activeDiaAbsoluto === numWeeks * freqSemanal} onClick={() => setActiveDiaAbsoluto(prev => prev + 1)} className="text-white hover:bg-white/10 rounded-2xl h-12 w-12">
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>

              {/* Feedback de Validación y Guardado */}
              <div className="flex items-center gap-6 ml-auto">
                <Button
                  type="submit"
                  disabled={isPending || !stats.isValid}
                  variant="industrial"
                  size="xl"
                  className="px-10 shadow-2xl transition-all disabled:opacity-30 disabled:grayscale"
                >
                  <Save className="w-5 h-5 mr-3" />
                  <span className="text-[11px] font-bold uppercase">{isPending ? "Guardando..." : "Guardar"}</span>
                </Button>
              </div>
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

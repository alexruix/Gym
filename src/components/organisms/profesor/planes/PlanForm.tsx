import React from "react";
import { planesCopy } from "@/data/es/profesor/planes";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Copy, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle } from "lucide-react";
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
import { usePlanForm } from "@/hooks/profesor/usePlanForm";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
  is_template_base?: boolean;
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
    localLibrary,
    isSearchOpen,
    setIsSearchOpen,
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
            onWeekChange={(w) => { setCurrentWeek(w); setActiveDiaAbsoluto((w-1)*7 + 1); }} 
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
                 <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Identidad del Plan</h3>
                 <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input placeholder="Nombre o enfoque del plan" {...field} className="text-2xl lg:text-4xl font-black bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tight uppercase" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-black tracking-widest text-red-500 pt-2" />
                      </FormItem>
                    )}
                 />
                 <QuickOptionsGroup 
                    options={["Fuerza", "Hipertrofia", "Acondicionamiento", "Postura"]} 
                    selectedOptions={[form.watch("nombre")]} 
                    onToggle={(name) => form.setValue("nombre", name)} 
                 />
              </div>

              <div className="max-w-xs">
                 <FormField
                  control={form.control}
                  name="duracion_semanas"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">Duración total</FormLabel>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                        <select 
                            className="flex-1 bg-transparent border-none font-black text-sm uppercase px-4 h-10 outline-none cursor-pointer" 
                            value={field.value} 
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                        >
                            {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} Semanas</option>)}
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
                     <span className="text-[10px] font-black uppercase tracking-[0.4em] text-lime-500">Semana {currentWeek}</span>
                     <h2 className="text-md lg:text-md font-black bg-transparent border-none p-0 tracking-tighter text-zinc-950 dark:text-white uppercase transition-all duration-300">
                        Día {activeDiaAbsoluto}
                     </h2>
                  </div>
                  
                  <div className="flex gap-3 shrink-0">
                     <Button type="button" variant="outline" size="xl" onClick={() => setIsBulkOpen(true)} className="px-6 h-16 rounded-[24px] border-zinc-100 dark:border-zinc-800">
                        <Copy className="w-5 h-5 mr-3" /> <span className="text-[10px] font-black uppercase">Copiar día</span>
                     </Button>
                     <Button type="button" variant="industrial" size="xl" onClick={() => setIsSearchOpen(true)} className="px-10 h-16 rounded-[24px] shadow-2xl shadow-lime-500/10">
                        <Plus className="w-5 h-5 mr-3" /> <span className="text-[10px] font-black uppercase">Añadir</span>
                     </Button>
                  </div>
               </div>

               <div className="space-y-4 min-h-[300px]">
                  {currentExercises.length === 0 ? (
                    <div className="py-32 flex flex-col items-center text-center border-4 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[40px] bg-zinc-50/20">
                      <Dumbbell className="w-12 h-12 text-zinc-200 dark:text-zinc-800 mb-6" />
                      <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400 max-w-[200px]">Este día aún no tiene ejercicios.</p>
                      <Button variant="ghost" onClick={() => setIsSearchOpen(true)} className="mt-6 text-lime-500 font-black uppercase text-[10px] tracking-widest">Cargar rutina ahora</Button>
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
             <div className="bg-zinc-950/90 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-between pointer-events-auto">
                
                {/* Navegación de Días */}
                <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                   <Button variant="ghost" size="icon" disabled={activeDiaAbsoluto === 1} onClick={() => setActiveDiaAbsoluto(prev => prev - 1)} className="text-white hover:bg-white/10 rounded-2xl h-12 w-12">
                     <ArrowLeft className="w-5 h-5" />
                   </Button>
                   <div className="flex flex-col items-center min-w-[80px]">
                      <span className="text-[10px] font-black text-white leading-none">Día {activeDiaAbsoluto}</span>
                      <span className="text-[8px] font-black text-zinc-500 uppercase mt-1">de {numWeeks * 7}</span>
                   </div>
                   <Button variant="ghost" size="icon" disabled={activeDiaAbsoluto === numWeeks * 7} onClick={() => setActiveDiaAbsoluto(prev => prev + 1)} className="text-white hover:bg-white/10 rounded-2xl h-12 w-12">
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
                    className="px-10 h-16 rounded-[24px] shadow-2xl transition-all disabled:opacity-30 disabled:grayscale"
                   >
                      <Save className="w-5 h-5 mr-3" />
                      <span className="text-[11px] font-black uppercase">{isPending ? "Guardando..." : "Guardar"}</span>
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

      <RotationDialog 
        open={rotationEditing !== null} 
        onOpenChange={(open) => !open && setRotationEditing(null)} 
        exercise={rotationEditing ? form.getValues(`rutinas.${rotationEditing.routineIdx}.ejercicios.${rotationEditing.exerciseIdx}`) : null} 
        library={localLibrary} 
        onSetRotation={actions.handleSetRotation} 
        onAutoPilot={() => {}}
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

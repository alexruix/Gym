import { useState, useMemo, useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { planSchema } from "@/lib/validators";
import type { z } from "zod";
import { planesCopy } from "@/data/es/profesor/planes";
import { toast } from "sonner";
import { ExerciseCard } from "@/components/molecules/profesor/planes/ExerciseCard";
import { ExerciseSearchDialog } from "@/components/molecules/profesor/planes/ExerciseSearchDialog";
import { RotationDialog } from "@/components/molecules/profesor/planes/RotationDialog";
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Info, X, Copy, Zap, Menu, ArrowRight, ArrowLeft, Calendar, Undo2, CheckCircle2, AlertTriangle } from "lucide-react";
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

type FormValues = z.infer<typeof planSchema>;

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

// Quitamos DIAS_SEMANA_LARGOS para favorecer el sistema secuencial Día 1, Día 2...

export function PlanForm({ library, initialValues, onSuccess, onCancel }: PlanFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [activeDiaAbsoluto, setActiveDiaAbsoluto] = useState<number>(1);
  const [localLibrary, setLocalLibrary] = useState<Exercise[]>(library);
  const [rotationEditing, setRotationEditing] = useState<{ routineIdx: number; exerciseIdx: number } | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  
  // Undo Support
  const historyRef = useRef<any>(null);

  const form = useForm<any>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      id: initialValues?.id,
      nombre: initialValues?.nombre || "",
      descripcion: initialValues?.descripcion || "",
      duracion_semanas: initialValues?.duracion_semanas || 1,
      is_template: initialValues?.is_template ?? true,
      rutinas: initialValues?.rutinas || Array.from({ length: 84 }, (_, i) => ({
        dia_numero: i + 1,
        nombre_dia: `Día ${i + 1}`,
        ejercicios: [],
      })),
      rotaciones: initialValues?.rotaciones || [],
    },
  });

  const rutinasWatch = useWatch({
    control: form.control,
    name: "rutinas",
  });

  const stats = useMemo(() => {
    const uniqueDays = new Set<number>();
    let totalEjercicios = 0;
    rutinasWatch?.forEach(r => {
        const c = r.ejercicios?.length || 0;
        if (c > 0) {
            uniqueDays.add(((r.dia_numero - 1) % 7) + 1);
            totalEjercicios += c;
        }
    });
    return { 
        activeDaysCount: uniqueDays.size,
        totalEjercicios,
        isValid: uniqueDays.size > 0 && form.watch("nombre")?.length > 3
    };
  }, [rutinasWatch, form.watch("nombre")]);

  const numWeeks = form.watch("duracion_semanas") || 1;

  useEffect(() => {
    form.setValue("frecuencia_semanal", stats.activeDaysCount);
  }, [stats.activeDaysCount, form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
        if (e.key === "s" || e.key === "S") {
            const nextWeek = (currentWeek % numWeeks) + 1;
            setCurrentWeek(nextWeek);
            setActiveDiaAbsoluto((nextWeek - 1) * 7 + 1);
        }
        if (e.key === "d" || e.key === "D") {
            const nextDia = (activeDiaAbsoluto % (numWeeks * 7)) + 1;
            if (Math.ceil(nextDia / 7) !== currentWeek) setCurrentWeek(Math.ceil(nextDia / 7));
            setActiveDiaAbsoluto(nextDia);
        }
        if (e.key === "Enter" && e.ctrlKey) {
            if (stats.isValid) form.handleSubmit(onSubmit)();
        }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWeek, numWeeks, activeDiaAbsoluto, stats.isValid]);

  const onSubmit = async (data: any) => {
    setIsPending(true);
    try {
      const maxDay = numWeeks * 7;
      const activeRoutines = data.rutinas.filter((r: any) => r.ejercicios.length > 0 && r.dia_numero <= maxDay);
      const payload = { ...data, rutinas: activeRoutines };
      const { data: result, error } = initialValues?.id
        ? await actions.profesor.updatePlan({ id: initialValues.id, ...payload })
        : await actions.profesor.createPlan(payload);
      if (error) {
        toast.error(error.message || planesCopy.form.messages.error);
        return;
      }
      if (result?.success) {
        toast.success(result.mensaje);
        if (onSuccess) onSuccess();
        else setTimeout(() => window.location.assign("/profesor/planes"), 1000);
      }
    } catch (err: any) {
      toast.error(err.message || planesCopy.form.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const getExerciseName = (id: string) => localLibrary.find(e => e.id === id)?.nombre || "Ejercicio";

  const addExercise = (exerciseId: string) => {
    const routineIdx = activeDiaAbsoluto - 1;
    const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
    const newExercise = {
      ejercicio_id: exerciseId, series: 3, reps_target: "12", descanso_seg: 60, orden: currentExercises.length, exercise_type: "base" as const, position: Date.now() + Math.random(), peso_target: ""
    };
    form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, newExercise]);
    setIsSearchOpen(false);
  };

  const handleDuplicateMulti = (targetDayNums: number[]) => {
    // Guardar historial para Undo
    historyRef.current = JSON.parse(JSON.stringify(form.getValues("rutinas")));
    
    const rutinas = form.getValues("rutinas");
    const sourceRoutine = rutinas[activeDiaAbsoluto - 1];
    if (!sourceRoutine) return;
    
    const newRutinas = [...rutinas];
    targetDayNums.forEach(dNum => {
        newRutinas[dNum - 1] = { 
            ...newRutinas[dNum - 1], 
            ejercicios: JSON.parse(JSON.stringify(sourceRoutine.ejercicios || [])) 
        };
    });
    
    form.setValue("rutinas", newRutinas);
    
    toast(`${targetDayNums.length} ${targetDayNums.length === 1 ? 'Día duplicado' : 'Días duplicados'} correctamente`, {
        action: {
            label: "Deshacer",
            onClick: () => {
                if (historyRef.current) form.setValue("rutinas", historyRef.current);
                toast.success("Cambios revertidos");
            }
        }
    });
  };

  // Logic helpers
  const routineIdx = activeDiaAbsoluto - 1;
  const currentExercises = rutinasWatch?.[routineIdx]?.ejercicios || [];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="min-h-screen bg-white dark:bg-zinc-950">
        
        {/* TOP NAVIGATOR: SEMANAS + DÃAS (Sticky) */}
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
                          <Input placeholder="Nombre o enfoque del plan" {...field} className="text-2xl lg:text-4xl font-black bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tight" />
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
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">DuraciÃ³n total</FormLabel>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                        <select className="flex-1 bg-transparent border-none font-black text-sm uppercase px-4 h-10 outline-none" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                            {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} Semanas</option>)}
                        </select>
                      </div>
                    </FormItem>
                  )}
                 />
              </div>
            </header>

            {/* 2. Zona de EdiciÃ³n del Día */}
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
                        key={ex.position || exIdx} form={form} routineIdx={routineIdx} exerciseIdx={exIdx} exercise={ex} getExerciseName={getExerciseName} 
                        removeExercise={(ri, ei) => {
                            const updated = [...form.getValues(`rutinas.${ri}.ejercicios`)];
                            updated.splice(ei, 1);
                            form.setValue(`rutinas.${ri}.ejercicios`, updated);
                        }} 
                        onEditRotation={(ri, ei) => setRotationEditing({ routineIdx: ri, exerciseIdx: ei })} hasRotation={(pos) => form.watch("rotaciones")?.some((r: any) => r.position === pos)} getRotationForPosition={(pos) => form.watch("rotaciones")?.find((r: any) => r.position === pos)} removeRotationExercise={(p, id) => {
                            const updated = form.getValues("rotaciones").map((rot: any) => rot.position === p ? ({ ...rot, cycles: rot.cycles.map((c: any) => ({ ...c, exercises: c.exercises.filter((exid: string) => exid !== id) })) }) : rot).filter((rot: any) => rot.cycles[0].exercises.length > 1);
                            form.setValue("rotaciones", updated);
                        }} 
                      />
                    ))
                  )}
               </div>
            </section>
          </div>

          {/* 3. FOOTER GLOBAL: NAVEGACIÃ“N + GUARDAR */}
          <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-50 pointer-events-none">
             <div className="bg-zinc-950/90 backdrop-blur-2xl p-4 rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-between pointer-events-auto">
                
                {/* NavegaciÃ³n de Días */}
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

                {/* Feedback de ValidaciÃ³n y Guardado */}
                <div className="flex items-center gap-6 ml-auto">
                   <div className="hidden md:flex flex-col items-end">
                      {stats.isValid ? (
                        <div className="flex items-center gap-2 text-lime-500">
                           <span className="text-[10px] font-black uppercase tracking-widest leading-none">Listo para guardar</span>
                           <CheckCircle2 className="w-4 h-4" />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-zinc-500">
                           <span className="text-[10px] font-black uppercase tracking-widest leading-none">Faltan ejercicios</span>
                           <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      <span className="text-[8px] font-black text-zinc-600 uppercase mt-1 tracking-widest">{stats.totalEjercicios} ejercicios cargados</span>
                   </div>

                   <Button 
                    type="submit" disabled={isPending || !stats.isValid} variant="industrial" size="xl" 
                    className="px-10 h-16 rounded-[24px] shadow-2xl transition-all disabled:opacity-30 disabled:grayscale"
                   >
                      <Save className="w-5 h-5 mr-3" />
                      <span className="text-[11px] font-black uppercase">{isPending ? "Guardando..." : "Guardar Plan"}</span>
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
        onSelect={addExercise} 
        onExerciseCreated={(newEx) => { 
            setLocalLibrary(prev => [{ id: newEx.id, nombre: newEx.nombre, media_url: newEx.media_url || null }, ...prev]); 
            addExercise(newEx.id); 
        }} 
        onlyBase={true}
      />

      <RotationDialog 
        open={rotationEditing !== null} onOpenChange={(open) => !open && setRotationEditing(null)} exercise={rotationEditing ? form.getValues(`rutinas.${rotationEditing.routineIdx}.ejercicios.${rotationEditing.exerciseIdx}`) : null} library={localLibrary} onSetRotation={(altId, dur) => {
            const ri = rotationEditing!.routineIdx; const ei = rotationEditing!.exerciseIdx;
            const ex = form.getValues(`rutinas.${ri}.ejercicios.${ei}`);
            const currot = form.getValues("rotaciones") || [];
            const idx = currot.findIndex((r: any) => r.position === ex.position);
            if (idx >= 0) { const updated = [...currot]; updated[idx].cycles[0].exercises.push(altId); form.setValue("rotaciones", updated); }
            else { form.setValue("rotaciones", [...currot, { position: ex.position, cycles: [{ duration_weeks: dur, exercises: [ex.ejercicio_id, altId] }] }]); }
            setRotationEditing(null);
        }} onAutoPilot={(ids, dur) => { /* logic similarly */ }}
      />

      <BulkActionDialog 
        open={isBulkOpen} 
        onOpenChange={setIsBulkOpen} 
        sourceDayNum={activeDiaAbsoluto} 
        totalWeeks={numWeeks} 
        onConfirm={handleDuplicateMulti} 
        rutinas={rutinasWatch || []}
      />
    </Form>
  );
}

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
import { QuickOptionsGroup } from "@/components/molecules/profesor/planes/QuickOptionsGroup";
import { Save, Plus, Dumbbell, Copy, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/utils";

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

const DIAS_SEMANA_LARGOS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export function PlanForm({ library, initialValues, onSuccess, onCancel }: PlanFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [activeDiaAbsoluto, setActiveDiaAbsoluto] = useState<number>(1);
  const [localLibrary, setLocalLibrary] = useState<Exercise[]>(library);
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
      rutinas: initialValues?.rutinas || Array.from({ length: 365 }, (_, i) => ({
        dia_numero: i + 1,
        nombre_dia: `${DIAS_SEMANA_LARGOS[i % 7]}`,
        ejercicios: [],
      })),
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
    const nombre = form.watch("nombre") || "";
    return {
      activeDaysCount: uniqueDays.size,
      totalEjercicios,
      isValid: uniqueDays.size > 0 && nombre.length >= 3
    };
  }, [rutinasWatch, form.watch("nombre")]);

  const numWeeks = form.watch("duracion_semanas") || 1;
  const totalDays = numWeeks * 7;
  const progressPercent = (activeDiaAbsoluto / totalDays) * 100;

  useEffect(() => {
    form.setValue("frecuencia_semanal", stats.activeDaysCount);
  }, [stats.activeDaysCount, form]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "w" || e.key === "W") {
        const nextWeek = (currentWeek % numWeeks) + 1;
        setCurrentWeek(nextWeek);
        setActiveDiaAbsoluto((nextWeek - 1) * 7 + 1);
      }
      if (e.key === "d" || e.key === "D") {
        const nextDia = (activeDiaAbsoluto % totalDays) + 1;
        if (Math.ceil(nextDia / 7) !== currentWeek) setCurrentWeek(Math.ceil(nextDia / 7));
        setActiveDiaAbsoluto(nextDia);
      }
      if (e.key === "s" || e.key === "S") {
        if (stats.isValid) onSubmitHandler(e as any);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentWeek, numWeeks, activeDiaAbsoluto, stats.isValid, totalDays]);

  const onSubmit = async (data: any) => {
    setIsPending(true);
    try {
      const activeRoutines = data.rutinas.filter((r: any) => r.ejercicios.length > 0 && r.dia_numero <= totalDays);
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
        else setTimeout(() => window.location.href = "/profesor/planes", 1000);
      }
    } catch (err: any) {
      toast.error(err.message || planesCopy.form.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const onSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit, (errors) => {
      console.error("Errores de validación:", errors);
      
      const getErrorMessage = (errs: any): string | null => {
        if (!errs) return null;
        if (typeof errs.message === "string") return errs.message;
        for (const key of Object.keys(errs)) {
          const msg = getErrorMessage(errs[key]);
          if (msg) return msg;
        }
        return null;
      };

      const message = getErrorMessage(errors) || "Revisá los datos del plan";
      toast.error(message);
    })();
  };

  const getExerciseName = (id: string) => localLibrary.find(e => e.id === id)?.nombre || "Ejercicio";

  const addExercise = (exerciseId: string) => {
    const routineIdx = activeDiaAbsoluto - 1;
    const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`) || [];
    const newExercise = {
      ejercicio_id: exerciseId, 
      orden: currentExercises.length, 
      exercise_type: "base" as const, 
      position: currentExercises.length + 1
    };
    form.setValue(`rutinas.${routineIdx}.ejercicios`, [...currentExercises, newExercise]);
    setIsSearchOpen(false);
  };

  const handleDuplicateMulti = (targetDayNums: number[]) => {
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

    toast(`${targetDayNums.length} ${targetDayNums.length === 1 ? 'día duplicado' : 'días duplicados'} correctamente`, {
      action: {
        label: "Deshacer",
        onClick: () => {
          if (historyRef.current) form.setValue("rutinas", historyRef.current);
          toast.success("Cambios revertidos");
        }
      }
    });
  };

  const currentDayOfWeek = ((activeDiaAbsoluto - 1) % 7);
  const currentDayName = DIAS_SEMANA_LARGOS[currentDayOfWeek];
  const routineIdx = activeDiaAbsoluto - 1;
  const currentExercises = rutinasWatch?.[routineIdx]?.ejercicios || [];

  return (
    <Form {...form}>
      <form onSubmit={onSubmitHandler} className="min-h-screen bg-white dark:bg-zinc-950">

        <PlanNavigator
          currentWeek={currentWeek}
          numWeeks={numWeeks}
          onWeekChange={(w) => { setCurrentWeek(w); setActiveDiaAbsoluto((w - 1) * 7 + (currentDayOfWeek + 1)); }}
          activeDiaAbsoluto={activeDiaAbsoluto}
          onDiaChange={setActiveDiaAbsoluto}
          rutinas={rutinasWatch || []}
        />

        <main className="flex-1 min-w-0 flex flex-col">
          <div className="flex-1 p-6 lg:p-12 space-y-16 max-w-5xl mx-auto w-full pb-48">

            {/* Cabecera de Identidad (Mockup Style) */}
            <header className="flex flex-col lg:flex-row lg:items-start justify-between gap-12 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="space-y-6 flex-1">
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300">Identidad del Plan</h3>
                  <FormField
                    control={form.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormControl>
                          <Input placeholder="Nombre o enfoque del plan" {...field} className="text-2xl lg:text-3xl font-black bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto tracking-tighter" />
                        </FormControl>
                        <FormMessage className="text-[10px] font-black tracking-widest text-red-500 pt-2" />
                        {!form.formState.errors.nombre && <p className="text-[10px] font-medium text-zinc-400 mt-2">Mínimo 3 caracteres</p>}
                      </FormItem>
                    )}
                  />
                </div>
                <QuickOptionsGroup
                  options={["Fuerza", "Hipertrofia", "Acondicionamiento", "Postura"]}
                  selectedOptions={[form.watch("nombre")]}
                  onToggle={(name) => form.setValue("nombre", name)}
                />
              </div>

              <div className="max-w-xs w-full">
                <FormField
                  control={form.control}
                  name="duracion_semanas"
                  render={({ field }) => (
                    <FormItem className="space-y-4">
                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 px-1 lg:text-right block">Duración del plan</FormLabel>
                      <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                        <select className="flex-1 bg-transparent border-none font-black text-xs uppercase px-4 h-12 outline-none appearance-none" value={field.value} onChange={(e) => field.onChange(parseInt(e.target.value))}>
                          {[1, 2, 4, 8, 12, 24, 52].map(s => <option key={s} value={s}>{s} Semanas</option>)}
                        </select>
                        <ChevronRight className="w-4 h-4 text-zinc-300 rotate-90 mr-4" />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </header>

            {/* Sección de Rutina con Header Sticky (UX Decision) */}
            <section className="space-y-8">
              <div className="sticky top-[72px] z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl -mx-6 px-6 py-4 border-y border-zinc-100 dark:border-zinc-900 sm:rounded-[32px] sm:mx-0 sm:px-8">
                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">{currentDayName} (Semana {currentWeek})</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-lime-500" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lime-500">Día {activeDiaAbsoluto}</span>
                    </div>
                    <FormField
                      control={form.control}
                      name={`rutinas.${routineIdx}.nombre_dia`}
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormControl>
                            <Input placeholder="Nombre del día (ej: Empuje / Pecho)" {...field} className="text-2xl font-black bg-transparent border-none p-0 focus-visible:ring-0 shadow-none h-auto px-0" />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2 shrink-0">
                    <Button
                      type="button" variant="outline"
                      onClick={() => setIsBulkOpen(true)}
                      className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 rounded-2xl h-14 px-6 gap-3 hover:bg-zinc-50 transition-all font-black"
                    >
                      <Copy className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest leading-none">Copiar Día</span>
                    </Button>
                    <Button
                      type="button" variant="industrial"
                      onClick={() => setIsSearchOpen(true)}
                      className="bg-lime-400 text-zinc-950 border-none rounded-2xl h-14 px-8 gap-3 hover:bg-lime-500 transition-all font-black shadow-lg shadow-lime-500/20"
                    >
                      <Plus className="w-4 h-4" /> <span className="text-[10px] uppercase tracking-widest leading-none">Añadir</span>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Ejercicios */}
              <div className="space-y-4 min-h-[400px]">
                {currentExercises.length === 0 ? (
                  <div className="py-40 flex flex-col items-center text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[56px] bg-zinc-50/10 hover:bg-zinc-50/20 transition-colors group cursor-pointer" onClick={() => setIsSearchOpen(true)}>
                    <div className="w-20 h-20 rounded-[32px] bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                      <Dumbbell className="w-8 h-8 text-zinc-300 dark:text-zinc-600" />
                    </div>
                    <h4 className="text-lg font-black uppercase tracking-tight text-zinc-400">Sin ejercicios cargados</h4>
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-300 mt-2">Día {activeDiaAbsoluto}</p>
                  </div>
                ) : (
                  currentExercises.map((ex: any, exIdx: number) => (
                    <ExerciseCard
                      key={ex.position || exIdx}
                      routineIdx={routineIdx}
                      exerciseIdx={exIdx}
                      exercise={ex}
                      getExerciseName={getExerciseName}
                      removeExercise={(ri, ei) => {
                        const updated = [...form.getValues(`rutinas.${ri}.ejercicios`)];
                        updated.splice(ei, 1);
                        form.setValue(`rutinas.${ri}.ejercicios`, updated);
                      }}
                    />
                  ))
                )}
              </div>
            </section>
          </div>

          {/* Footer Premium (Mockup Ref) */}
          <footer className="fixed bottom-0 left-0 w-full z-50 pointer-events-none p-6 md:p-10 flex justify-center">
            <div className="bg-zinc-950/95 backdrop-blur-2xl px-8 py-5 rounded-[40px] border border-white/10 shadow-2xl flex flex-col md:flex-row items-center gap-8 pointer-events-auto w-full max-w-5xl relative overflow-hidden">


              <div className="flex items-center gap-6">
                <div className="flex gap-2">
                  <Button
                    type="button" variant="ghost" size="icon"
                    disabled={activeDiaAbsoluto === 1}
                    onClick={() => setActiveDiaAbsoluto(prev => prev - 1)}
                    className="text-white hover:bg-white/10 rounded-2xl h-12 w-12 border border-white/5"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  <Button
                    type="button" variant="ghost" size="icon"
                    disabled={activeDiaAbsoluto === totalDays}
                    onClick={() => setActiveDiaAbsoluto(prev => prev + 1)}
                    className="text-white hover:bg-white/10 rounded-2xl h-12 w-12 border border-white/5"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>

                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-white leading-none uppercase tracking-widest">Día {activeDiaAbsoluto} <span className="text-zinc-500">DE {totalDays}</span></span>
                   </div>
              </div>

              <div className="flex-1 hidden md:flex justify-end gap-3">
                {!stats.isValid && (
                  <div className="flex items-center gap-3 px-4 py-2 bg-zinc-800 rounded-full border border-white/5">
                    <AlertTriangle className="w-4 h-4 text-zinc-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Falta información</span>
                  </div>
                )}
                <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest ml-4">{stats.totalEjercicios} ejercicios agregados</span>
              </div>

              <Button
                type="button"
                onClick={onSubmitHandler}
                disabled={isPending || !stats.isValid}
                className={cn(
                  "h-16 px-12 rounded-[28px] font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl",
                  stats.isValid
                    ? "bg-lime-400 text-zinc-950 hover:bg-lime-500 shadow-lime-500/10"
                    : "bg-zinc-800 text-zinc-500 opacity-50 grayscale"
                )}
              >
                {isPending ? (
                  <RefreshCcw className="w-4 h-4 animate-spin mr-3" />
                ) : (
                  <Save className="w-4 h-4 mr-3" />
                )}
                {isPending ? "Procesando..." : "Guardar Plan"}
              </Button>
            </div>
          </footer>
        </main>
      </form>

      <ExerciseSearchDialog
        open={isSearchOpen} onOpenChange={setIsSearchOpen} library={localLibrary} onSelect={addExercise} onExerciseCreated={(newEx) => { setLocalLibrary(prev => [{ id: newEx.id, nombre: newEx.nombre, media_url: newEx.media_url || null }, ...prev]); addExercise(newEx.id); }}
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

function RefreshCcw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  )
}

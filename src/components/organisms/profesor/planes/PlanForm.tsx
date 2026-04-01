import { useState, useMemo, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { planSchema } from "@/lib/validators";
import type { z } from "zod";
import { planesCopy } from "@/data/es/profesor/planes";
import { toast } from "sonner";
import { Plus, Trash2, Search, Dumbbell, Clock, Info, ArrowLeft, Filter, Loader2, Save, X } from "lucide-react";
import { ExerciseForm } from "@/components/molecules/profesor/ejercicios/ExerciseForm";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";

type FormValues = z.infer<typeof planSchema>;

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
}

interface PlanFormProps {
  library: Exercise[];
  initialValues?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PlanForm({ library, initialValues, onSuccess, onCancel }: PlanFormProps) {
  const [isPending, setIsPending] = useState(false);
  const [activeRoutineIndex, setActiveRoutineIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [isCreatingInline, setIsCreatingInline] = useState(false);
  const [localLibrary, setLocalLibrary] = useState<Exercise[]>(library);
  const [rotationEditing, setRotationEditing] = useState<{ routineIdx: number; exerciseIdx: number } | null>(null);
  const [rotationSearch, setRotationSearch] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<2 | 3 | 4>(2);

  const form = useForm<any>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      id: initialValues?.id,
      nombre: initialValues?.nombre || "",
      descripcion: initialValues?.descripcion || "",
      duracion_semanas: initialValues?.duracion_semanas || 0,
      is_template: initialValues?.is_template ?? true,
      rutinas: initialValues?.rutinas || Array.from({ length: 7 }, (_, i) => ({
        dia_numero: i + 1,
        nombre_dia: `${planesCopy.form.routines.selectDayTitle} ${i + 1}`,
        ejercicios: [],
      })),
      rotaciones: initialValues?.rotaciones || [],
    },
  });

  const { fields: routineFields } = useFieldArray({
    control: form.control,
    name: "rutinas",
  });

  // Suscribirse a los cambios en las rutinas para calcular la frecuencia automáticamente
  const rutinasWatch = useWatch({
    control: form.control,
    name: "rutinas",
  });

  const activeDaysCount = rutinasWatch?.filter(r => r.ejercicios && r.ejercicios.length > 0).length || 0;

  // Actualizar la frecuencia_semanal en el estado del formulario cuando cambien las rutinas
  useEffect(() => {
    form.setValue("frecuencia_semanal", activeDaysCount);
  }, [activeDaysCount, form]);

  const onSubmit = async (data: any) => {
    const formData = data as FormValues;
    if (activeDaysCount === 0) {
      toast.error("El plan debe tener al menos un ejercicio en algún día.");
      return;
    }

    setIsPending(true);
    try {
      // Enviamos solo las rutinas que tienen ejercicios
      const activeRoutines = data.rutinas.filter(r => r.ejercicios.length > 0);
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
        if (onSuccess) {
            onSuccess();
        } else {
            setTimeout(() => {
                window.location.assign("/profesor/planes");
            }, 1000);
        }
      }
    } catch (err: any) {
      toast.error(err.message || planesCopy.form.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const getExerciseName = (id: string) => localLibrary.find(e => e.id === id)?.nombre || "Ejercicio";

  const addExerciseToRoutine = (exerciseId: string) => {
    if (activeRoutineIndex === null) return;
    
    const currentExercises = form.getValues(`rutinas.${activeRoutineIndex}.ejercicios`);
    const newExercise = {
      ejercicio_id: exerciseId,
      series: 3,
      reps_target: "12",
      descanso_seg: 60,
      orden: currentExercises.length,
      exercise_type: "base" as const, // Por defecto todos son base
      position: currentExercises.length // Usamos el index relativo como posición
    };
    
    form.setValue(`rutinas.${activeRoutineIndex}.ejercicios`, [
      ...currentExercises,
      newExercise
    ]);
    
    setActiveRoutineIndex(null);
    setSearch("");
  };

  const removeExerciseFromRoutine = (routineIdx: number, exerciseIdx: number) => {
    const currentExercises = form.getValues(`rutinas.${routineIdx}.ejercicios`);
    const updated = currentExercises
      .filter((_, i) => i !== exerciseIdx)
      .map((ex, i) => ({ ...ex, orden: i }));
    
    form.setValue(`rutinas.${routineIdx}.ejercicios`, updated);
  };

  const filteredLibrary = useMemo(() => {
    if (!search) return localLibrary;
    return localLibrary.filter((ex) =>
      ex.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [localLibrary, search]);

  const handleExerciseCreated = (newEx: any) => {
    const exercise = {
        id: newEx.id,
        nombre: newEx.nombre,
        media_url: newEx.media_url || null
    };
    setLocalLibrary(prev => [exercise, ...prev]);
    addExerciseToRoutine(exercise.id);
    setIsCreatingInline(false);
  };

  const handleSetRotation = (routineIdx: number, exerciseIdx: number, altExerciseId: string, duration: number) => {
    const ex = form.getValues(`rutinas.${routineIdx}.ejercicios.${exerciseIdx}`);
    const currentRotations = form.getValues("rotaciones") || [];
    
    const existingIdx = currentRotations.findIndex((r: any) => r.position === ex.position);
    
    if (existingIdx >= 0) {
      const updated = [...currentRotations];
      const exercises = updated[existingIdx].cycles[0].exercises;
      
      if (exercises.includes(altExerciseId)) {
        toast.error("Este ejercicio ya está en la rotación");
        return;
      }
      
      if (exercises.length >= 4) {
        toast.error("Máximo 4 ejercicios por rotación");
        return;
      }

      exercises.push(altExerciseId);
      form.setValue("rotaciones", updated);
    } else {
      const newRotation = {
        position: ex.position,
        applies_to_days: [form.getValues(`rutinas.${routineIdx}.nombre_dia`) || `Día ${routineIdx + 1}`],
        cycles: [
          { duration_weeks: duration, exercises: [ex.ejercicio_id, altExerciseId] }
        ]
      };
      form.setValue("rotaciones", [...currentRotations, newRotation]);
    }
    
    setRotationEditing(null);
    setRotationSearch("");
    toast.success("Ejercicio añadido a la rotación");
  };

  const removeRotationExercise = (position: number, altExerciseId: string) => {
    const rotations = form.getValues("rotaciones") || [];
    const idx = rotations.findIndex((r: any) => r.position === position);
    if (idx < 0) return;

    const updated = [...rotations];
    updated[idx].cycles[0].exercises = updated[idx].cycles[0].exercises.filter((id: string) => id !== altExerciseId);
    
    // Si solo queda 1 ejercicio (el base), eliminamos la rotación
    if (updated[idx].cycles[0].exercises.length <= 1) {
      updated.splice(idx, 1);
    }
    
    form.setValue("rotaciones", updated);
    toast.success("Ejercicio de rotación eliminado");
  };

  const hasRotation = (position: number) => {
    const rotations = form.watch("rotaciones") || [];
    return rotations.some((r: any) => r.position === position);
  };

  const getRotationForPosition = (position: number) => {
    const rotations = form.watch("rotaciones") || [];
    return rotations.find((r: any) => r.position === position);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        
        {/* SECTION 1: BASIC INFO */}
        <section className="space-y-8">
          <div className="flex border-b border-zinc-100 dark:border-zinc-900 pb-4 items-end justify-between">
             <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">
               {planesCopy.form.basic.title}
             </h3>
             <div className="flex items-center gap-2 group">
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300 transition-colors group-hover:text-lime-500">
                  Frecuencia: {activeDaysCount} días / sem
                </span>
                <Info className="w-3 h-3 text-zinc-300 group-hover:text-lime-500 transition-colors" />
             </div>
          </div>
          
          <div className="grid gap-8 sm:grid-cols-1">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field, fieldState }) => (
                <StandardField 
                   label={planesCopy.form.basic.labels.nombre} 
                   error={fieldState.error?.message}
                   required
                >
                  <FormControl>
                    <div className="space-y-4">
                      <Input 
                          placeholder={planesCopy.form.basic.placeholders.nombre} 
                          {...field} 
                          className="text-xl font-black bg-zinc-50/50" 
                      />
                      <QuickOptionsGroup
                        options={planesCopy.form.basic.nameOptions}
                        selectedOptions={[field.value]}
                        onToggle={(name) => form.setValue("nombre", name, { shouldValidate: true })}
                        className="px-1"
                      />
                    </div>
                  </FormControl>
                </StandardField>
              )}
            />
          </div>
        </section>

        {/* SECTION 2: ROUTINES */}
        <section className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-4 px-1">
            {planesCopy.form.routines.title}
          </h3>
          
          <Tabs defaultValue="dia-0" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap rounded-2xl p-1.5 bg-zinc-100/80 dark:bg-zinc-900/50 h-auto no-scrollbar border border-zinc-200/50">
              {routineFields.map((field, idx) => {
                const hasExercises = (rutinasWatch?.[idx]?.ejercicios?.length ?? 0) > 0;
                return (
                  <TabsTrigger 
                    key={field.id} 
                    value={`dia-${idx}`}
                    className={cn(
                      "rounded-xl px-5 py-3 font-black uppercase tracking-widest text-[10px] transition-all",
                      "data-[state=active]:bg-zinc-950 data-[state=active]:text-white dark:data-[state=active]:bg-lime-400 dark:data-[state=active]:text-zinc-950 shadow-none",
                      hasExercises ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 opacity-60"
                    )}
                  >
                    {planesCopy.form.routines.selectDayTitle} {idx + 1}
                    {hasExercises && <div className="ml-2 w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-8 border border-zinc-100 dark:border-zinc-900 rounded-3xl bg-white dark:bg-zinc-950/50 shadow-xl shadow-zinc-200/20 dark:shadow-none min-h-[400px]">
              {routineFields.map((field, routineIdx) => {
                const ejercicios = form.watch(`rutinas.${routineIdx}.ejercicios`);
                const hasExercises = (ejercicios?.length ?? 0) > 0;

                return (
                  <TabsContent key={`content-${field.id}`} value={`dia-${routineIdx}`} className="space-y-8 m-0 p-6 sm:p-8 outline-none">
                    <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-6">
                       <FormField
                        control={form.control}
                        name={`rutinas.${routineIdx}.nombre_dia`}
                        render={({ field }) => (
                          <FormItem className="flex-1 w-full space-y-1.5">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 block px-1">
                                Nombre del Día {routineIdx + 1}
                             </span>
                             <FormControl>
                               <Input 
                                 placeholder={planesCopy.form.routines.dayNamePlaceholder} 
                                 className="font-black text-2xl bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-zinc-950 dark:text-zinc-50 h-auto" 
                                 {...field} 
                               />
                             </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant="industrial" 
                        size="lg"
                        onClick={() => setActiveRoutineIndex(routineIdx)}
                        className="w-full sm:w-auto px-8"
                      >
                         <Plus className="w-4 h-4 mr-2" /> {planesCopy.form.routines.addExerciseBtn}
                      </Button>
                    </div>

                    <div className="space-y-4 pt-2">
                      {!hasExercises ? (
                        <div className="py-20 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-3xl bg-zinc-50/30 dark:bg-zinc-950/20 flex flex-col items-center">
                          <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-sm mb-4">
                            <Dumbbell className="w-8 h-8 text-zinc-200 dark:text-zinc-800" />
                          </div>
                          <p className="text-sm font-black uppercase tracking-widest text-zinc-300">{planesCopy.form.routines.emptyDay}</p>
                        </div>
                      ) : (
                        ejercicios.map((ex, exerciseIdx) => (
                          <Card 
                            key={`${field.id}-${exerciseIdx}`} 
                            className={cn(
                                "p-5 rounded-2xl border-zinc-100 shadow-sm relative group bg-white dark:bg-zinc-900/50 dark:border-zinc-800 transition-all duration-500",
                                hasRotation(ex.position) 
                                    ? "border-lime-500/40 shadow-[0_0_25px_rgba(163,230,53,0.15)] ring-1 ring-lime-500/20 scale-[1.01]" 
                                    : "hover:border-zinc-950 dark:hover:border-lime-400"
                            )}
                          >
                            <button 
                                type="button"
                                onClick={() => removeExerciseFromRoutine(routineIdx, exerciseIdx)} 
                                className="absolute -top-3 -right-3 p-2.5 bg-white dark:bg-zinc-950 text-red-500 rounded-xl border border-zinc-100 dark:border-zinc-800 shadow-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-start gap-5">
                              <div className="w-10 h-10 rounded-xl bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 flex items-center justify-center shrink-0 font-black shadow-lg shadow-zinc-950/10 dark:shadow-lime-400/10">
                                  {exerciseIdx + 1}
                              </div>
                              
                              <div className="flex-1 space-y-4 w-full">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                                      <p className="font-black text-lg text-zinc-950 dark:text-zinc-50 leading-tight">
                                        {getExerciseName(ex.ejercicio_id)}
                                      </p>
                                      
                                      {/* TIPO DE EJERCICIO (B, C, A) */}
                                      <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-fit">
                                          {(["base", "complementary", "accessory"] as const).map((type) => (
                                              <button
                                                  key={type}
                                                  type="button"
                                                  onClick={() => form.setValue(`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.exercise_type`, type)}
                                                  className={cn(
                                                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                                                      ex.exercise_type === type 
                                                          ? "bg-white dark:bg-zinc-700 text-zinc-950 dark:text-zinc-50 shadow-sm"
                                                          : "text-zinc-400 hover:text-zinc-600"
                                                  )}
                                              >
                                                  {type === "base" ? "B" : type === "complementary" ? "C" : "A"}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                      <div className="col-span-2 sm:col-span-3 space-y-3">
                                          <div className={cn(
                                              "flex items-center justify-between gap-4 p-3 rounded-2xl border transition-all",
                                              hasRotation(ex.position) 
                                                ? "bg-lime-500/5 border-lime-500/20 shadow-inner" 
                                                : "bg-zinc-50 dark:bg-zinc-900/80 border-dashed border-zinc-200 dark:border-zinc-800"
                                          )}>
                                              <div className="flex items-center gap-3">
                                                  <div className={cn(
                                                      "w-2.5 h-2.5 rounded-full",
                                                      hasRotation(ex.position) ? "bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]" : "bg-zinc-200 dark:bg-zinc-800"
                                                  )} />
                                                  <span className={cn(
                                                      "text-[10px] font-black uppercase tracking-widest",
                                                      hasRotation(ex.position) ? "text-lime-600 dark:text-lime-400" : "text-zinc-400"
                                                  )}>
                                                      {planesCopy.form.routines.exerciseCard.rotation.label}
                                                  </span>
                                              </div>
                                              
                                              <Button 
                                                  type="button" 
                                                  variant="ghost" 
                                                  size="sm"
                                                  onClick={() => setRotationEditing({ routineIdx, exerciseIdx })}
                                                  className={cn(
                                                      "h-8 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all",
                                                      hasRotation(ex.position) 
                                                        ? "text-lime-600 dark:text-lime-400 hover:bg-lime-500/10" 
                                                        : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                                                  )}
                                              >
                                                  <Plus className="w-3 h-3 mr-1.5" />
                                                  {planesCopy.form.routines.exerciseCard.rotation.btn}
                                              </Button>
                                          </div>

                                          {/* LISTA DE EJERCICIOS EN ROTACIÓN */}
                                          {hasRotation(ex.position) && (
                                              <div className="flex flex-wrap gap-2 px-1">
                                                  {getRotationForPosition(ex.position)?.cycles[0].exercises.map((altId: string, idx: number) => {
                                                      if (altId === ex.ejercicio_id) return null; // No mostrar el base aquí
                                                      return (
                                                          <div 
                                                              key={altId}
                                                              className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-xl group/alt animate-in zoom-in-95 duration-200"
                                                          >
                                                              <span className="text-[10px] font-bold text-zinc-600 dark:text-zinc-300">
                                                                  {getExerciseName(altId)}
                                                              </span>
                                                              <button 
                                                                  type="button"
                                                                  onClick={() => removeRotationExercise(ex.position, altId)}
                                                                  className="text-zinc-400 hover:text-red-500 transition-colors"
                                                              >
                                                                  <X className="w-3 h-3" />
                                                              </button>
                                                          </div>
                                                      );
                                                  })}
                                              </div>
                                          )}
                                      </div>

                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.series`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-1">Series</span>
                                            <FormControl>
                                              <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} className="h-12 font-black bg-zinc-50/50 border-zinc-100" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.reps_target`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-1">Objetivo</span>
                                            <FormControl>
                                              <Input placeholder="10-12" {...field} className="h-12 font-black bg-zinc-50/50 border-zinc-100" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.descanso_seg`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-2 col-span-2 sm:col-span-1">
                                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-1">Descanso (s)</span>
                                            <FormControl>
                                              <Input type="number" step={10} min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="h-12 font-black bg-zinc-50/50 border-zinc-100" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                  </div>
                              </div>
                            </div>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </section>

        {/* SUBMIT */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-900 flex items-center justify-end gap-3">
          {onCancel && (
            <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={onCancel}
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
            >
                <X className="w-4 h-4 mr-2" /> Cancelar
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isPending} 
            variant="industrial"
            size="xl"
            className="px-12 shadow-2xl shadow-lime-400/10"
          >
            {isPending ? planesCopy.form.submit.loading : (
                <>
                    <Save className="w-5 h-5 mr-3" />
                    <span className="text-sm">
                        {initialValues?.id ? "Guardar cambios" : planesCopy.form.submit.btn}
                    </span>
                </>
            )}
          </Button>
        </div>
      </form>
      
      {/* DIALOG DE ROTACIÓN (AUTO-PILOT) */}
      <Dialog 
        open={rotationEditing !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setRotationEditing(null);
            setRotationSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
          <DialogTitle className="sr-only">Configurar Rotación</DialogTitle>
          <DialogDescription className="sr-only">
            Selecciona un ejercicio alternativo para rotar en esta posición del plan.
          </DialogDescription>
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight mb-6">
                {planesCopy.form.routines.exerciseCard.rotation.selectExercise}
            </h2>
            
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                    placeholder={planesCopy.form.exerciseModal.searchPlaceholder}
                    value={rotationSearch}
                    onChange={(e) => setRotationSearch(e.target.value)}
                    className="pl-12 h-14 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold"
                />
            </div>

            <div className="flex items-center justify-between gap-4 p-4 bg-lime-500/5 border border-lime-500/20 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                    {planesCopy.form.routines.exerciseCard.rotation.duration}
                </span>
                <div className="flex gap-2">
                    {[2, 3, 4].map((weeks) => (
                        <button
                            key={weeks}
                            type="button"
                            onClick={() => setSelectedDuration(weeks as 2|3|4)}
                            className={cn(
                                "px-4 py-2 rounded-xl font-black text-xs transition-all",
                                selectedDuration === weeks 
                                    ? "bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 shadow-lg"
                                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
                            )}
                        >
                            {weeks} {planesCopy.form.routines.exerciseCard.rotation.weeks}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-6 custom-scrollbar space-y-2">
             {localLibrary
                .filter(ex => !rotationSearch || ex.nombre.toLowerCase().includes(rotationSearch.toLowerCase()))
                .map(ex => (
                <button
                    key={ex.id}
                    type="button"
                    onClick={() => {
                        if (rotationEditing) {
                            handleSetRotation(rotationEditing.routineIdx, rotationEditing.exerciseIdx, ex.id, selectedDuration);
                        }
                    }}
                    className="w-full text-left p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-950 dark:hover:bg-lime-400 group transition-all duration-300 flex items-center justify-between border border-zinc-100 dark:border-zinc-800 shadow-sm"
                >
                    <span className="font-black text-sm text-zinc-950 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950">
                        {ex.nombre}
                    </span>
                    <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950" />
                </button>
             ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* EXERCISE SEARCH MODAL */}
      <Dialog 
        open={activeRoutineIndex !== null} 
        onOpenChange={(open) => {
          if (!open) {
            setActiveRoutineIndex(null);
            setIsCreatingInline(false);
            setSearch("");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
          <DialogTitle className="sr-only">Buscador de Ejercicios</DialogTitle>
          <DialogDescription className="sr-only">
            Busca y selecciona ejercicios de tu biblioteca para añadirlos a la rutina.
          </DialogDescription>
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight">
                    {isCreatingInline ? planesCopy.form.exerciseModal.titleCreate : planesCopy.form.exerciseModal.title}
                </h2>
                {!isCreatingInline ? (
                    <Button 
                        variant="industrial" 
                        size="sm" 
                        onClick={() => setIsCreatingInline(true)}
                        className="rounded-xl px-4 text-[10px]"
                    >
                        <Plus className="w-3 h-3 mr-2" /> {planesCopy.form.exerciseModal.createBtn}
                    </Button>
                ) : (
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setIsCreatingInline(false)}
                        className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-950"
                    >
                        <ArrowLeft className="w-3 h-3 mr-2" /> {planesCopy.form.exerciseModal.backBtn}
                    </Button>
                )}
            </div>

            {!isCreatingInline && (
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                        <Input 
                            autoFocus
                            placeholder={planesCopy.form.exerciseModal.searchPlaceholder}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-12 h-14 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="h-14 w-14 rounded-2xl border-zinc-200 dark:border-zinc-800 shrink-0">
                        <Filter className="w-5 h-5 text-zinc-400" />
                    </Button>
                </div>
            )}
          </div>
          
          <div className="max-h-[500px] overflow-y-auto p-6 custom-scrollbar">
            {isCreatingInline ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                    <ExerciseForm 
                        onSuccess={(res) => handleExerciseCreated(res.data)} 
                        onCancel={() => setIsCreatingInline(false)} 
                    />
                </div>
            ) : (
                <>
                    {filteredLibrary.length === 0 ? (
                    <div className="p-16 text-center space-y-6 animate-in fade-in duration-300">
                        <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                            <Dumbbell className="w-8 h-8 text-zinc-200" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-black uppercase tracking-widest text-zinc-300 italic">
                                {planesCopy.form.exerciseModal.empty}
                            </p>
                            <button 
                                onClick={() => setIsCreatingInline(true)}
                                className="text-lime-500 font-black uppercase text-[10px] tracking-widest hover:underline"
                            >
                                {planesCopy.form.exerciseModal.emptyAction}
                            </button>
                        </div>
                    </div>
                    ) : (
                    <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {filteredLibrary.map(ex => (
                        <button
                            key={ex.id}
                            type="button"
                            onClick={() => addExerciseToRoutine(ex.id)}
                            className="w-full text-left p-5 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-950 dark:hover:bg-lime-400 group transition-all duration-300 flex items-center justify-between border border-zinc-100 dark:border-zinc-800 hover:border-zinc-950 dark:hover:border-lime-400 shadow-sm"
                        >
                            <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-950 flex items-center justify-center transition-colors group-hover:bg-white/10">
                                <Dumbbell className="w-5 h-5 text-zinc-500 group-hover:text-white dark:group-hover:text-zinc-950" />
                            </div>
                            <span className="font-black text-zinc-950 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950 transition-colors">{ex.nombre}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-all group-hover:border-white/50 dark:group-hover:border-zinc-950/50 group-hover:rotate-90">
                            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950" />
                            </div>
                        </button>
                        ))}
                    </div>
                    )}
                </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

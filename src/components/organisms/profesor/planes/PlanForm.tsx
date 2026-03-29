import { useState, useMemo } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { planSchema } from "@/lib/validators";
import type { z } from "zod";
import { planesCopy } from "@/data/es/profesor/planes";
import { toast } from "sonner";
import { Plus, Trash2, Search, Dumbbell, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FormValues = z.infer<typeof planSchema>;

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
}

export function PlanForm({ library }: { library: Exercise[] }) {
  const [isPending, setIsPending] = useState(false);
  const [activeRoutineIndex, setActiveRoutineIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      duracion_semanas: 4,
      frecuencia_semanal: 3,
      rutinas: Array.from({ length: 7 }, (_, i) => ({
        dia_numero: i + 1,
        nombre_dia: `${planesCopy.form.routines.selectDayTitle} ${i + 1}`,
        ejercicios: [],
      })),
    },
  });

  const { fields: routineFields } = useFieldArray({
    control: form.control,
    name: "rutinas",
  });

  const frecuencia = form.watch("frecuencia_semanal");

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      // Importante: Solo enviamos las rutinas que están activas según la frecuencia
      const activeRoutines = data.rutinas.slice(0, frecuencia || 1);
      const payload = { ...data, rutinas: activeRoutines };

      const { data: result, error } = await actions.profesor.createPlan(payload);
      if (error) {
        toast.error(error.message || planesCopy.form.messages.error);
        return;
      }
      if (result?.success) {
        toast.success(result.mensaje);
        setTimeout(() => {
          window.location.assign("/profesor");
        }, 1500);
      }
    } catch (err: any) {
      toast.error(err.message || planesCopy.form.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const getExerciseName = (id: string) => library.find(e => e.id === id)?.nombre || "Ejercicio";

  const addExerciseToRoutine = (exerciseId: string) => {
    if (activeRoutineIndex === null) return;
    
    const currentExercises = form.getValues(`rutinas.${activeRoutineIndex}.ejercicios`);
    const newExercise = {
      ejercicio_id: exerciseId,
      series: 3,
      reps_target: "12",
      descanso_seg: 60,
      orden: currentExercises.length
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
    if (!search) return library;
    return library.filter((ex) =>
      ex.nombre.toLowerCase().includes(search.toLowerCase())
    );
  }, [library, search]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
        
        {/* SECTION 1: BASIC INFO */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 border-b pb-2 border-zinc-100 dark:border-zinc-800 dark:text-zinc-100">
            {planesCopy.form.basic.title}
          </h3>
          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="nombre"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="uppercase tracking-widest">{planesCopy.form.basic.labels.nombre}</FormLabel>
                  <FormControl>
                    <Input placeholder={planesCopy.form.basic.placeholders.nombre} {...field} className="text-lg font-bold" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="duracion_semanas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase tracking-widest text-xs">{planesCopy.form.basic.labels.duracion}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={52} 
                      className="bg-zinc-50 dark:bg-zinc-900"
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="frecuencia_semanal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="uppercase tracking-widest text-xs">{planesCopy.form.basic.labels.frecuencia}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min={1} 
                      max={7} 
                      className="bg-zinc-50 dark:bg-zinc-900 border-lime-400 focus-visible:ring-lime-400"
                      {...field} 
                      onChange={e => field.onChange(parseInt(e.target.value) || 1)} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        {/* SECTION 2: ROUTINES */}
        <section className="space-y-6">
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 border-b pb-2 border-zinc-100 dark:border-zinc-800 dark:text-zinc-100">
            {planesCopy.form.routines.title}
          </h3>
          
          <Tabs defaultValue="dia-0" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto flex-nowrap rounded-xl p-1 bg-zinc-100 dark:bg-zinc-900 h-auto no-scrollbar">
              {routineFields.map((field, idx) => {
                const isActive = idx < frecuencia;
                return (
                  <TabsTrigger 
                    key={field.id} 
                    value={`dia-${idx}`}
                    disabled={!isActive}
                    className="rounded-lg px-4 py-2 font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm disabled:opacity-40"
                  >
                    {isActive 
                      ? (form.watch(`rutinas.${idx}.nombre_dia`) || `Día ${idx + 1}`) 
                      : `Día ${idx + 1} (Descanso)`}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <div className="mt-6 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/50 p-4 sm:p-6 min-h-[300px]">
              {routineFields.map((field, routineIdx) => {
                const isActive = routineIdx < frecuencia;

                if (!isActive) {
                  return (
                    <TabsContent key={`content-${field.id}`} value={`dia-${routineIdx}`} className="space-y-6 m-0 outline-none">
                       <div className="py-20 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl bg-white/50 dark:bg-zinc-950/50 flex flex-col items-center justify-center">
                         <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full mb-4">
                            <Clock className="w-6 h-6 text-zinc-400" />
                         </div>
                         <p className="text-zinc-500 font-bold">Día de Descanso Programado.</p>
                         <p className="text-xs text-zinc-400 max-w-[200px] mt-1">Aumentá la frecuencia semanal para activar más días.</p>
                       </div>
                    </TabsContent>
                  );
                }

                return (
                  <TabsContent key={`content-${field.id}`} value={`dia-${routineIdx}`} className="space-y-6 m-0 outline-none">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
                       <FormField
                        control={form.control}
                        name={`rutinas.${routineIdx}.nombre_dia`}
                        render={({ field }) => (
                          <FormItem className="flex-1 w-full m-0 p-0">
                            <FormControl>
                              <Input 
                                placeholder={planesCopy.form.routines.dayNamePlaceholder} 
                                className="font-extrabold text-2xl bg-transparent border-none shadow-none focus-visible:ring-0 p-0 text-zinc-900 dark:text-zinc-100 h-auto" 
                                {...field} 
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="button" 
                        variant="default" 
                        onClick={() => setActiveRoutineIndex(routineIdx)}
                        className="rounded-xl bg-lime-400 text-zinc-950 font-bold hover:bg-lime-500 w-full sm:w-auto shadow-none"
                      >
                         <Plus className="w-4 h-4 mr-2" /> {planesCopy.form.routines.addExerciseBtn}
                      </Button>
                    </div>

                    <div className="space-y-4 pt-2">
                      {(() => {
                        const ejercicios = form.watch(`rutinas.${routineIdx}.ejercicios`);
                        
                        if (!ejercicios || ejercicios.length === 0) {
                          return (
                            <div className="py-12 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-800 rounded-2xl bg-white/30 dark:bg-zinc-950/20">
                              <Dumbbell className="w-8 h-8 mx-auto text-zinc-200 dark:text-zinc-800 mb-3" />
                              <p className="text-sm font-medium text-zinc-400">{planesCopy.form.routines.emptyDay}</p>
                            </div>
                          );
                        }

                        return ejercicios.map((ex, exerciseIdx) => (
                          <Card key={`${field.id}-${exerciseIdx}`} className="p-4 rounded-2xl border-zinc-200 shadow-sm relative group bg-white dark:bg-zinc-950 dark:border-zinc-800 hover:border-lime-400/30 transition-colors">
                            <button 
                                type="button"
                                onClick={() => removeExerciseFromRoutine(routineIdx, exerciseIdx)} 
                                className="absolute -top-2 -right-2 p-2 bg-white dark:bg-zinc-900 text-red-500 rounded-full border border-zinc-100 dark:border-zinc-800 shadow-sm hover:text-red-600 transition-all opacity-0 group-hover:opacity-100 z-10"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            
                            <div className="flex items-start gap-4">
                              <div className="w-9 h-9 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center shrink-0">
                                  <span className="font-bold text-zinc-900 dark:text-zinc-400 text-sm">{exerciseIdx + 1}</span>
                              </div>
                              
                              <div className="flex-1 space-y-4 w-full">
                                  <p className="font-bold text-base text-zinc-900 dark:text-zinc-100 pt-1">
                                    {getExerciseName(ex.ejercicio_id)}
                                  </p>
                                  
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.series`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Series</FormLabel>
                                            <FormControl>
                                              <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 1)} className="h-9 font-bold bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.reps_target`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Objetivo</FormLabel>
                                            <FormControl>
                                              <Input placeholder="10-12" {...field} className="h-9 font-bold bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                      <FormField
                                        control={form.control}
                                        name={`rutinas.${routineIdx}.ejercicios.${exerciseIdx}.descanso_seg`}
                                        render={({ field }) => (
                                          <FormItem className="space-y-1 sm:col-span-2">
                                            <FormLabel className="text-[10px] font-bold uppercase text-zinc-400 tracking-wider">Descanso (seg)</FormLabel>
                                            <FormControl>
                                              <Input type="number" step={10} min={0} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} className="h-9 font-bold bg-zinc-50 dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800" />
                                            </FormControl>
                                          </FormItem>
                                        )}
                                      />
                                  </div>
                              </div>
                            </div>
                          </Card>
                        ));
                      })()}
                    </div>
                  </TabsContent>
                );
              })}
            </div>
          </Tabs>
        </section>

        {/* SUBMIT */}
        <div className="pt-6">
          <Button 
            type="submit" 
            disabled={isPending} 
            className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-lime-400 text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-lime-500 font-extrabold uppercase tracking-widest text-base shadow-xl"
          >
            {isPending ? planesCopy.form.submit.loading : planesCopy.form.submit.btn}
          </Button>
        </div>
      </form>

      {/* EXERCISE SEARCH MODAL */}
      <Dialog open={activeRoutineIndex !== null} onOpenChange={(open) => !open && setActiveRoutineIndex(null)}>
        <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800">
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100">{planesCopy.form.exerciseModal.title}</h2>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input 
                autoFocus
                placeholder={planesCopy.form.exerciseModal.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl"
              />
            </div>
          </div>
          
          <div className="max-h-[350px] overflow-y-auto p-4 custom-scrollbar">
            {filteredLibrary.length === 0 ? (
               <div className="p-12 text-center text-sm text-zinc-400 font-medium italic">
                 {planesCopy.form.exerciseModal.empty}
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                {filteredLibrary.map(ex => (
                  <button
                    key={ex.id}
                    type="button"
                    onClick={() => addExerciseToRoutine(ex.id)}
                    className="w-full text-left p-4 rounded-2xl hover:bg-lime-50 dark:hover:bg-lime-900/10 flex items-center justify-between group transition-all border border-transparent hover:border-lime-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
                        <Dumbbell className="w-4 h-4 text-zinc-500" />
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-zinc-100">{ex.nombre}</span>
                    </div>
                    <Plus className="w-5 h-5 text-lime-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

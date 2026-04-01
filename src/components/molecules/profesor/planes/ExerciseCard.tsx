import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Trash2, Plus, Zap, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { planesCopy } from "@/data/es/profesor/planes";

interface ExerciseCardProps {
  form: UseFormReturn<any>;
  routineIdx: number;
  exerciseIdx: number;
  exercise: any;
  getExerciseName: (id: string) => string;
  removeExercise: (routineIdx: number, exerciseIdx: number) => void;
  onEditRotation: (routineIdx: number, exerciseIdx: number) => void;
  hasRotation: (position: number) => boolean;
  getRotationForPosition: (position: number) => any;
  removeRotationExercise: (position: number, altId: string) => void;
}

export function ExerciseCard({
  form,
  routineIdx,
  exerciseIdx,
  exercise: ex,
  getExerciseName,
  removeExercise,
  onEditRotation,
  hasRotation,
  getRotationForPosition,
  removeRotationExercise
}: ExerciseCardProps) {
  return (
    <Card 
      className={cn(
          "p-5 rounded-2xl border-zinc-100 shadow-sm relative group bg-white dark:bg-zinc-900/50 dark:border-zinc-800 transition-all duration-500",
          hasRotation(ex.position) 
              ? "border-lime-500/40 shadow-[0_0_25px_rgba(163,230,53,0.15)] ring-1 ring-lime-500/20 scale-[1.01]" 
              : "hover:border-zinc-950 dark:hover:border-lime-400"
      )}
    >
      <button 
          type="button"
          onClick={() => removeExercise(routineIdx, exerciseIdx)} 
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
                            onClick={() => onEditRotation(routineIdx, exerciseIdx)}
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
                            {getRotationForPosition(ex.position)?.cycles[0].exercises.map((altId: string) => {
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
                      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-[0.2em] px-1">Repeticiones</span>
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
  );
}

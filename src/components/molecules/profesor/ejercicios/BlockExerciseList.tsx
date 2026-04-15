import React from "react";
import { Trash2, Dumbbell } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { BlockFormData } from "@/lib/validators/profesor";

interface Props {
    form: UseFormReturn<BlockFormData>;
    fields: any[];
    remove: (index: number) => void;
    getExerciseName: (id: string) => string;
    showDescanso: boolean;
}

/**
 * BlockExerciseList: Listado de ejercicios seleccionados con sus métricas.
 */
export function BlockExerciseList({ form, fields, remove, getExerciseName, showDescanso }: Props) {
    if (fields.length === 0) return null;

    return (
        <div className="space-y-2">
            {fields.map((field, index) => (
                <div
                    key={field.id}
                    className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 rounded-2xl p-3 flex items-center gap-3 group transition-all"
                >
                    <div className="w-7 h-7 shrink-0 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 flex items-center justify-center font-bold text-[10px] text-zinc-400">
                        {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-zinc-950 dark:text-zinc-100 truncate uppercase mt-0.5">
                            {getExerciseName(field.ejercicio_id)}
                        </p>
                        <div className="flex gap-3 mt-1.5 overflow-x-auto no-scrollbar">
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Ser:</span>
                                <input
                                    {...form.register(`ejercicios.${index}.series`, { valueAsNumber: true })}
                                    className="w-8 bg-transparent border-none p-0 text-[10px] font-bold text-lime-600 focus:ring-0 tabular-nums"
                                />
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Rep:</span>
                                <input
                                    {...form.register(`ejercicios.${index}.reps_target`)}
                                    className="w-10 bg-transparent border-none p-0 text-[10px] font-bold text-lime-600 focus:ring-0"
                                />
                            </div>
                            {showDescanso && (
                                <div className="flex items-center gap-1 shrink-0">
                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Des:</span>
                                    <input
                                        {...form.register(`ejercicios.${index}.descanso_seg`, { valueAsNumber: true })}
                                        className="w-8 bg-transparent border-none p-0 text-[10px] font-bold text-lime-600 focus:ring-0 tabular-nums"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => remove(index)}
                        className="w-8 h-8 flex items-center justify-center text-zinc-300 hover:text-red-500 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
    );
}

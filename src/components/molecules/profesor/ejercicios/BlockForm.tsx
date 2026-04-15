import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { blockSchema, type BlockFormData } from "@/lib/validators/profesor";
import { blocksCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Loader2, Save, Plus, Trash2, Dumbbell, Box, AlertTriangle, ChevronLeft, Search, X } from "lucide-react";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    Form,
    FormControl,
    FormField,
} from "@/components/ui/form";
import { StandardField } from "@/components/molecules/StandardField";

interface BlockFormProps {
    library: any[];
    initialData?: any; // Datos del bloque a editar
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
    onExternalSearch?: (onSelect: (exId: string) => void) => void; // Para usar el buscador del workspace
}

export function BlockForm({ library, initialData, onSuccess, onCancel, onExternalSearch }: BlockFormProps) {
    const { execute, isPending } = useAsyncAction();
    const copy = blocksCopy.form;
    const isEditing = !!initialData?.id;

    const form = useForm<BlockFormData>({
        resolver: zodResolver(blockSchema) as any,
        defaultValues: initialData ? {
            id: initialData.id,
            nombre: initialData.nombre,
            tipo_bloque: initialData.tipo_bloque,
            vueltas: initialData.vueltas,
            descanso_final: initialData.descanso_final,
            tags: initialData.tags || [],
            ejercicios: initialData.bloques_ejercicios?.map((be: any) => ({
                ejercicio_id: be.ejercicio_id,
                orden: be.orden,
                series: be.series,
                reps_target: be.reps_target,
                descanso_seg: be.descanso_seg,
                notas: be.notas || ""
            })) || []
        } : {
            nombre: "",
            ejercicios: [],
            tags: [],
            tipo_bloque: "agrupador",
            vueltas: 1,
            descanso_ronda: 0,
            descanso_final: 0,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "ejercicios",
    });

    const onSubmit = (values: BlockFormData) => {
        if (values.ejercicios.length === 0) {
            toast.error("El bloque debe tener al menos un ejercicio");
            return;
        }

        execute(async () => {
            const action = isEditing ? actions.profesor.updateBlock : actions.profesor.createBlock;
            const { data: result, error } = await action(values as any);

            if (error || !result) {
                throw error || new Error("Error al procesar el bloque");
            }

            onSuccess?.(isEditing ? { ...values, id: initialData.id } : result);
        }, {
            loadingMsg: isEditing ? "Actualizando bloque..." : "Creando bloque...",
            successMsg: isEditing ? "✅ Bloque actualizado en tu biblioteca" : copy.messages.success,
        });
    };

    const addExerciseToBlock = (exerciseId: string) => {
        append({
            ejercicio_id: exerciseId,
            orden: fields.length,
            series: 3,
            reps_target: "12",
            descanso_seg: 60,
            notas: ""
        });
    };

    const [isSearching, setIsSearching] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const filteredLibrary = React.useMemo(() => {
        const lower = searchTerm.toLowerCase();
        return library
            .filter(ex => ex.nombre.toLowerCase().includes(lower))
            .slice(0, 10);
    }, [library, searchTerm]);

    const handleAddClick = () => {
        setIsSearching(true);
    };

    const getExerciseName = (id: string) => library.find(e => e.id === id)?.nombre || "Ejercicio";

    return (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-950 animate-in fade-in duration-300">
            {/* Header / Nav */}
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/10">
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={onCancel}
                    className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest hover:text-zinc-950 dark:hover:text-white -ml-2"
                >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Volver
                </Button>
                <div className="flex items-center gap-2">
                    <Box className="w-3.5 h-3.5 text-lime-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white">
                        {isEditing ? "Editar Bloque" : "Nuevo Bloque"}
                    </span>
                </div>
            </div>

            <Form {...(form as any)}>
                <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                    <div className="p-6 space-y-8">
                        {/* Aviso de Integridad para Edición */}
                        {isEditing && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex gap-3 animate-in zoom-in-95 duration-500">
                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <h4 className="text-[9px] font-bold uppercase tracking-widest text-amber-600">Aviso de Integridad</h4>
                                    <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400 leading-tight">
                                        Los cambios afectarán a futuras importaciones. Los planes ya asignados a alumnos no se verán alterados.
                                    </p>
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control as any}
                            name="nombre"
                            render={({ field, fieldState }) => (
                                <StandardField
                                    label="Nombre del bloque"
                                    error={fieldState.error?.message}
                                    required
                                >
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Circuito Metabólico A"
                                            {...field}
                                            className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 focus-visible:ring-lime-500 font-bold text-sm rounded-xl"
                                        />
                                    </FormControl>
                                </StandardField>
                            )}
                        />

                        {/* Configuración Técnica compacta */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2 space-y-2">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Tipo de ejecución</span>
                                <div className="industrial-select-trigger h-11">
                                    <select
                                        {...form.register("tipo_bloque")}
                                        className="industrial-select text-xs font-bold"
                                    >
                                        <option value="agrupador">Agrupador simple</option>
                                        <option value="superserie">Superserie (Sin descanso)</option>
                                        <option value="circuito">Circuito (N Vueltas)</option>
                                    </select>
                                </div>
                            </div>

                            {form.watch("tipo_bloque") === "circuito" && (
                                <>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">Vueltas</span>
                                        <Input
                                            type="number"
                                            {...form.register("vueltas", { valueAsNumber: true })}
                                            className="h-11 text-center font-black dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">Desc. Ronda</span>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                {...form.register("descanso_ronda", { valueAsNumber: true })}
                                                className="h-11 pl-4 pr-10 font-bold dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-400 uppercase">s</span>
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="col-span-2 space-y-2">
                                <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">
                                    {form.watch("tipo_bloque") === 'superserie' ? 'Descanso Post-Bloque' : 'Descanso Final'}
                                </span>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        {...form.register("descanso_final", { valueAsNumber: true })}
                                        className="h-11 pl-4 pr-10 font-bold dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-400 uppercase">segundos</span>
                                </div>
                            </div>
                        </div>

                        {/* Listado de Ejercicios */}
                        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-white">
                                    Ejercicios ({fields.length})
                                </label>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => isSearching ? setIsSearching(false) : handleAddClick()}
                                    className={cn(
                                        "rounded-xl h-9 px-3 border-zinc-200 dark:border-zinc-800 transition-all font-bold text-[9px] uppercase tracking-widest",
                                        isSearching ? "text-red-500 border-red-500/20" : "hover:border-lime-500 hover:text-lime-500"
                                    )}
                                >
                                    {isSearching ? (
                                        <><X className="w-3.5 h-3.5 mr-1" /> Cancelar</>
                                    ) : (
                                        <><Plus className="w-3.5 h-3.5 mr-1" /> Añadir</>
                                    )}
                                </Button>
                            </div>

                            {isSearching && (
                                <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                                        <Input
                                            autoFocus
                                            placeholder="Buscar ejercicio técnico..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="h-12 pl-11 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus-visible:ring-lime-500 font-bold text-xs rounded-2xl"
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-1.5 max-h-[300px] overflow-y-auto no-scrollbar pb-4">
                                        {filteredLibrary.map((ex) => (
                                            <button
                                                key={ex.id}
                                                type="button"
                                                onClick={() => {
                                                    addExerciseToBlock(ex.id);
                                                    setIsSearching(false);
                                                    setSearchTerm("");
                                                }}
                                                className="flex items-center gap-3 p-2 rounded-2xl border border-zinc-100 dark:border-zinc-800/50 hover:border-lime-500/50 hover:bg-lime-500/5 dark:hover:bg-lime-500/5 transition-all text-left group"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center shrink-0">
                                                    {ex.media_url ? (
                                                        <img src={ex.media_url} className="w-full h-full object-cover rounded-xl" />
                                                    ) : (
                                                        <Dumbbell className="w-4 h-4 text-zinc-300 group-hover:text-lime-500 transition-colors" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0">
                                                    <span className="text-xs font-bold text-zinc-950 dark:text-zinc-100 uppercase truncate">
                                                        {ex.nombre}
                                                    </span>
                                                    <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                                                        Seleccionar técnica
                                                    </span>
                                                </div>
                                                <Plus className="w-4 h-4 ml-auto text-zinc-200 group-hover:text-lime-500 mr-2" />
                                            </button>
                                        ))}
                                        
                                        {filteredLibrary.length === 0 && (
                                            <div className="py-8 text-center border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-2xl">
                                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Sin resultados</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="h-px bg-zinc-100 dark:bg-zinc-900 mx-2" />
                                </div>
                            )}

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
                                                {form.watch("tipo_bloque") !== "superserie" && (
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

                                {fields.length === 0 && !isSearching && (
                                    <button
                                        type="button"
                                        onClick={handleAddClick}
                                        className="w-full py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-lime-500 hover:border-lime-500/50 transition-all"
                                    >
                                        <Dumbbell className="w-8 h-8 opacity-20" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Cargar primer ejercicio</p>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Flotante del Panel */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 flex gap-3 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] z-30">
                    <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={onCancel}
                        className="flex-1 rounded-2xl text-[10px] font-bold uppercase tracking-widest h-14 border-zinc-200 dark:border-zinc-800"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        disabled={isPending || fields.length === 0}
                        variant="industrial"
                        size="xl"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            form.handleSubmit(onSubmit)();
                        }}
                        className="flex-[1.5] rounded-2xl h-14 bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:bg-lime-500 dark:hover:bg-lime-500 hover:text-zinc-950 transition-all"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <div className="flex items-center">
                                <Save className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-black uppercase tracking-widest">
                                    {isEditing ? "Guardar Cambios" : "Crear Bloque"}
                                </span>
                            </div>
                        )}
                    </Button>
                </div>
            </Form>
        </div>
    );
}

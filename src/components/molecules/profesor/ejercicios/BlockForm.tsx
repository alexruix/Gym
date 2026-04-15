import React from "react";
import { Loader2, Save, Box, AlertTriangle, ChevronLeft, Dumbbell } from "lucide-react";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StandardField } from "@/components/molecules/StandardField";

// Modular Components
import { BlockTechnicalSettings } from "./BlockTechnicalSettings";
import { BlockExerciseSearch } from "./BlockExerciseSearch";
import { BlockExerciseList } from "./BlockExerciseList";

// Hooks
import { useBlockForm } from "@/hooks/profesor/exercises/useBlockForm";

interface BlockFormProps {
    library: any[];
    initialData?: any;
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
}

/**
 * BlockForm: Organismo optimizado (V2.1) para la gestión de bloques técnicos.
 * Descompuesto en piezas atómicas para maximizar la latencia de interacción.
 */
export function BlockForm({ library, initialData, onSuccess, onCancel }: BlockFormProps) {
    const {
        form,
        fields,
        remove,
        addExercise,
        isPending,
        search,
        onSubmit,
        isEditing
    } = useBlockForm({ library, initialData, onSuccess });

    const getExerciseName = (id: string) => library.find(e => e.id === id)?.nombre || "Ejercicio";
    const tipoBloque = form.watch("tipo_bloque");

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
                                        Los cambios afectarán a futuras importaciones.
                                    </p>
                                </div>
                            </div>
                        )}

                        <FormField
                            control={form.control}
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

                        {/* Configuración Técnica (Extracted) */}
                        <BlockTechnicalSettings form={form} />

                        {/* Listado de Ejercicios y Búsqueda */}
                        <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                            <BlockExerciseSearch 
                                {...search}
                                onSelect={addExercise}
                            />

                            <BlockExerciseList 
                                form={form}
                                fields={fields}
                                remove={remove}
                                getExerciseName={getExerciseName}
                                showDescanso={tipoBloque !== "superserie"}
                            />

                            {fields.length === 0 && !search.isSearching && (
                                <button
                                    type="button"
                                    onClick={() => search.setIsSearching(true)}
                                    className="w-full py-8 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem] flex flex-col items-center justify-center gap-2 text-zinc-300 hover:text-lime-500 hover:border-lime-500/50 transition-all font-bold uppercase text-[10px] tracking-widest"
                                >
                                    <Dumbbell className="w-8 h-8 opacity-20" />
                                    Cargar primer ejercicio
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer Flotante */}
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
                            onSubmit();
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

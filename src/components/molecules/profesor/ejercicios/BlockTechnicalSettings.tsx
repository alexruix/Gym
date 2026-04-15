import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import type { BlockFormData } from "@/lib/validators/profesor";

interface Props {
    form: UseFormReturn<BlockFormData>;
}

/**
 * BlockTechnicalSettings: Panel de configuración para tipos de bloque y descansos.
 */
export function BlockTechnicalSettings({ form }: Props) {
    const tipoBloque = form.watch("tipo_bloque");

    return (
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

            {tipoBloque === "circuito" && (
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
                    {tipoBloque === 'superserie' ? 'Descanso Post-Bloque' : 'Descanso Final'}
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
    );
}

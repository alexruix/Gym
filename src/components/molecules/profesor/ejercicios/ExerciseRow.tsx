import React from "react";
import { Dumbbell, ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Exercise {
    id: string;
    nombre: string;
    media_url: string | null;
}

interface Props {
    ex: Exercise;
    onSelect: (id: string) => void;
    isVariant?: boolean;
    isNested?: boolean;
    isMiGym?: boolean;
    variantCount?: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
}

/**
 * ExerciseRow: Representación visual de un ejercicio en la lista de búsqueda.
 * Optimizado para renderizado masivo dentro de diálogos.
 */
export function ExerciseRow({
    ex,
    onSelect,
    isVariant,
    isNested,
    isMiGym,
    variantCount = 0,
    isExpanded,
    onToggleExpand
}: Props) {
    return (
        <div className={cn(
            "flex items-center gap-3 p-3 rounded-2xl border transition-all group",
            isVariant
                ? "bg-fuchsia-500/5 border-fuchsia-500/20 hover:border-fuchsia-500/40 hover:bg-fuchsia-500/10"
                : isNested
                    ? "bg-zinc-50/50 dark:bg-zinc-900/20 border-transparent hover:border-lime-400/30 hover:bg-lime-500/5"
                    : "bg-transparent border-transparent hover:border-zinc-100 dark:hover:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
        )}>
            <button
                onClick={() => onSelect(ex.id)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
            >
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform group-hover:scale-105",
                    isVariant ? "bg-zinc-950 border border-fuchsia-500/30" : "bg-zinc-100 dark:bg-zinc-900"
                )}>
                    {ex.media_url ? (
                        <img src={ex.media_url} className="w-full h-full object-cover" alt={ex.nombre} />
                    ) : (
                        <Dumbbell className={cn(
                            "w-4 h-4 transition-colors",
                            isVariant ? "text-fuchsia-400" : isMiGym ? "text-lime-500" : "text-zinc-400 group-hover:text-lime-400"
                        )} />
                    )}
                </div>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "font-bold text-sm truncate transition-colors",
                            isVariant ? "text-zinc-800 dark:text-zinc-200" : "text-zinc-950 dark:text-zinc-100 group-hover:text-lime-500"
                        )}>
                            {ex.nombre}
                        </span>
                        {isMiGym && !isVariant && !isNested && (
                            <span className="px-1.5 py-0.5 bg-lime-500 text-zinc-950 text-[7px] font-bold uppercase rounded-[4px] tracking-tighter shrink-0">
                                MiGym
                            </span>
                        )}
                    </div>
                    {isVariant && (
                        <span className="text-[7px] font-bold uppercase tracking-widest text-fuchsia-500">Sustitución rápida</span>
                    )}
                </div>
            </button>

            {variantCount > 0 && onToggleExpand && (
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                    className={cn(
                        "px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-tighter transition-all shrink-0 flex items-center gap-1",
                        isExpanded
                            ? "bg-lime-500 text-zinc-950 border-lime-500"
                            : "bg-white dark:bg-zinc-900 text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
                    )}
                >
                    {variantCount}
                    <ChevronDown className={cn("w-3 h-3 transition-transform", isExpanded && "rotate-180")} />
                </button>
            )}

            <button
                onClick={() => onSelect(ex.id)}
                className={cn(
                    "w-8 h-8 rounded-xl flex items-center justify-center shrink-0 opacity-0 group-hover:opacity-100 transition-all",
                    isVariant ? "bg-fuchsia-500/10 text-fuchsia-500" : "bg-lime-500/10 text-lime-500"
                )}
            >
                <Check className="w-4 h-4" />
            </button>
        </div>
    );
}

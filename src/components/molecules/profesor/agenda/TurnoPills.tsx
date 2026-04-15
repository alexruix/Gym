import React from "react";
import { cn } from "@/lib/utils";

interface Turno {
    id: string;
    nombre: string;
    hora_inicio: string;
}

interface TurnoPillsProps {
    turnos: Turno[];
    activeTurnoId: string | null;
    onTurnoSelect: (id: string) => void;
}

export function TurnoPills({ turnos, activeTurnoId, onTurnoSelect }: TurnoPillsProps) {
    if (turnos.length === 0) return null;

    return (
        <div className="sticky top-[136px] md:top-[164px] z-20 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 -mx-6 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto hide-scrollbar px-6 py-4 gap-3 items-center">
                {turnos.map((turno) => {
                    const isActive = activeTurnoId === turno.id;
                    return (
                        <button
                            key={turno.id}
                            onClick={() => onTurnoSelect(turno.id)}
                            className={cn(
                                "flex-none h-10 px-6 rounded-full font-bold uppercase text-[9px] tracking-[0.15em] transition-all shrink-0 flex items-center gap-2",
                                isActive
                                    ? "bg-zinc-950 text-white border-zinc-950 shadow-lg shadow-zinc-950/20"
                                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600"
                            )}
                        >
                            <span className={cn("opacity-60", isActive ? "text-lime-400" : "text-zinc-400")}>{turno.hora_inicio.slice(0, 5)}</span>
                            {turno.nombre}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

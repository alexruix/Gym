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
        <div className="sticky top-[116px] md:top-[144px] z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-50 dark:border-zinc-900 -mx-6 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto hide-scrollbar px-6 py-3 gap-2 items-center">
                {turnos.map((turno) => {
                    const isActive = activeTurnoId === turno.id;
                    return (
                        <button
                            key={turno.id}
                            onClick={() => onTurnoSelect(turno.id)}
                            className={cn(
                                "flex-none h-10 px-4 rounded-xl font-bold uppercase text-[9px] tracking-widest transition-all border shrink-0",
                                isActive
                                    ? "bg-lime-500 text-zinc-950 border-lime-500 shadow-lg shadow-lime-500/10"
                                    : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            )}
                        >
                            <span className="mr-1.5 opacity-60">{turno.hora_inicio.slice(0, 5)}</span>
                            {turno.nombre}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

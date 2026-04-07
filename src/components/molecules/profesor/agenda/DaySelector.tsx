import React from "react";
import { cn } from "@/lib/utils";

const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface DaySelectorProps {
    activeDay: string;
    setActiveDay: (day: string) => void;
    realTodayName: string;
}

export function DaySelector({ activeDay, setActiveDay, realTodayName }: DaySelectorProps) {
    return (
        <div className="bg-zinc-50/50 border-b border-zinc-100 -mx-6 mb-8 overflow-hidden">
            <div className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar px-6 py-4 gap-3 items-center">
                {dayNames.map((day) => {
                    const isActive = activeDay === day;
                    const isRealToday = day === realTodayName;

                    return (
                        <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={cn(
                                "flex-none snap-center min-w-[100px] h-12 rounded-full font-bold uppercase text-[10px] tracking-widest transition-all relative border",
                                isActive
                                    ? "bg-zinc-900 text-white border-zinc-900 shadow-lg shadow-zinc-900/10"
                                    : "bg-white text-zinc-400 border-zinc-100 hover:border-zinc-300 hover:text-zinc-600"
                            )}
                        >
                            {day}
                            {isRealToday && (
                                <span className={cn(
                                    "absolute top-2 right-3 w-1.5 h-1.5 rounded-full",
                                    isActive ? "bg-lime-500" : "bg-lime-500"
                                )} />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

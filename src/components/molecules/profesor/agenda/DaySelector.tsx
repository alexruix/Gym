import React from "react";
import { cn } from "@/lib/utils";

const dayNames = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];
const fullDayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface DaySelectorProps {
    activeDay: string;
    setActiveDay: (day: string) => void;
    realTodayName: string;
}

export function DaySelector({ activeDay, setActiveDay, realTodayName }: DaySelectorProps) {
    return (
        <div className="sticky top-[60px] md:top-[88px] z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-100 dark:border-zinc-900 -mx-6 mb-6">
            <div className="flex px-4 py-3">
                <div className="flex w-full bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl">
                    {fullDayNames.map((day, idx) => {
                        const isActive = activeDay === day;
                        const isRealToday = day === realTodayName;
                        const shortName = dayNames[idx];

                        return (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center py-2 rounded-xl transition-all relative overflow-hidden",
                                    isActive
                                        ? "bg-white dark:bg-zinc-950 text-zinc-950 dark:text-white shadow-sm ring-1 ring-zinc-200 dark:ring-zinc-800"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                                )}
                            >
                                <span className="text-[10px] font-black uppercase tracking-tighter leading-none">{shortName}</span>
                                {isRealToday && (
                                    <div className={cn(
                                        "absolute bottom-1 w-1 h-1 rounded-full",
                                        isActive ? "bg-lime-500" : "bg-zinc-300 dark:bg-zinc-700"
                                    )} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

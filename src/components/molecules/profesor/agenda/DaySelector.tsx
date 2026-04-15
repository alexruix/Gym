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
        <div className="sticky top-[60px] md:top-[88px] z-20 bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900 -mx-6 mb-6">
            <div className="flex px-4 py-3 justify-center">
                <div className="flex w-full max-w-2xl bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-[2rem]">
                    {fullDayNames.map((day, idx) => {
                        const isActive = activeDay === day;
                        const isRealToday = day === realTodayName;
                        const shortName = dayNames[idx];

                        return (
                            <button
                                key={day}
                                onClick={() => setActiveDay(day)}
                                className={cn(
                                    "flex-1 flex flex-col items-center justify-center py-2.5 rounded-[1.5rem] transition-all relative overflow-hidden",
                                    isActive
                                        ? "bg-lime-500 text-zinc-950 shadow-md font-black"
                                        : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-bold"
                                )}
                            >
                                <span className={cn(
                                    "text-[10px] uppercase tracking-widest leading-none",
                                    isActive ? "opacity-100" : "opacity-60"
                                )}>
                                    {shortName}
                                </span>
                                {isRealToday && !isActive && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-600" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

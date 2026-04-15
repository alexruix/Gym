import React from "react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  title: string;
  sessionsCompleted: number;
}

export function CalendarHeader({ title, sessionsCompleted }: Props) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-2xl font-black text-zinc-950 dark:text-white uppercase tracking-tighter">
          {title}
        </h3>
        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] mt-1">
          Historial y agenda
        </p>
      </div>
      <div className="text-right">
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block">Sesiones realizadas</span>
        <span className="text-2xl font-black text-lime-500">{sessionsCompleted}</span>
      </div>
    </div>
  );
}

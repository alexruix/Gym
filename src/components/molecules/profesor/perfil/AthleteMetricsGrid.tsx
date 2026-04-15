import React from "react";
import { CreditCard, Clock, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  alumno: any;
  lastSessionText: string;
  headerCopy: any;
}

export function AthleteMetricsGrid({ alumno, lastSessionText, headerCopy }: Props) {
  return (
    <div className="flex md:flex-row flex-col gap-3 w-full md:w-auto">
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-8 bg-zinc-50 dark:bg-zinc-900/40 p-4 sm:p-6 rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-800">
        <div className="flex-1 sm:flex-none space-y-0.5 sm:space-y-1">
          <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{headerCopy.metrics.payDay}</p>
          <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
            <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
            Día {alumno.dia_pago || 15}
          </p>
        </div>
        <div className="flex-1 sm:flex-none space-y-0.5 sm:space-y-1 text-right sm:text-left">
          <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{headerCopy.metrics.lastSession}</p>
          <p className={cn(
            "text-xs sm:text-sm font-bold flex items-center justify-end sm:justify-start gap-2",
            lastSessionText.includes("hoy") || lastSessionText.includes("ayer") ? "text-emerald-500" : "text-zinc-950 dark:text-white"
          )}>
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-40" />
            {lastSessionText}
          </p>
        </div>

        {alumno.turno && (
          <>
            <div className="col-span-2 sm:flex-none h-px sm:h-8 w-full sm:w-px bg-zinc-200 dark:bg-zinc-800 sm:block hidden" />
            <div className="col-span-2 sm:flex-none space-y-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200/50 dark:border-zinc-800/50">
              <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Agenda</p>
              <div className="flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-1">
                <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-1.5 whitespace-nowrap">
                   <CalendarIcon className="w-3 h-3 text-lime-500 shrink-0" />
                   {alumno.dias_asistencia.map((d: any) => d.slice(0, 2)).join(" - ")}
                </p>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5 uppercase tracking-widest leading-none">
                   <Clock className="w-3 h-3 opacity-50 shrink-0" />
                   {alumno.turno.hora_inicio.slice(0, 5)}hs
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {alumno.perfil_completado && (
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 sm:gap-6 bg-zinc-50 dark:bg-zinc-900/40 p-4 sm:p-6 rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-800">
          <div className="space-y-0.5 sm:space-y-1">
             <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Peso</p>
             <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white tabular-nums">
                {alumno.peso_actual ? `${alumno.peso_actual}kg` : "--"}
             </p>
          </div>
          <div className="h-6 sm:h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
          <div className="space-y-0.5 sm:space-y-1">
             <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Objetivo</p>
             <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white capitalize">
                {alumno.objetivo_principal || "--"}
             </p>
          </div>
        </div>
      )}
    </div>
  );
}

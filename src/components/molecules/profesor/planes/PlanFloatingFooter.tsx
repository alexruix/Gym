import React from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  activeDiaAbsoluto: number;
  setActiveDiaAbsoluto: (val: number | ((prev: number) => number)) => void;
  currentWeek: number;
  numWeeks: number;
  freqSemanal: number;
  isPending: boolean;
  isValid: boolean;
  onSave: () => void;
}

/**
 * PlanFloatingFooter: Barra de navegación y acción principal (Guardar) para el editor de planes.
 */
export function PlanFloatingFooter({
  activeDiaAbsoluto,
  setActiveDiaAbsoluto,
  currentWeek,
  numWeeks,
  freqSemanal,
  isPending,
  isValid,
  onSave
}: Props) {
  const totalDays = numWeeks === 0 ? freqSemanal : numWeeks * freqSemanal;

  return (
    <footer className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-40 pointer-events-none">
      <div className="bg-zinc-950/90 dark:bg-zinc-900/90 border border-white/10 shadow-2xl rounded-[2.5rem] p-2 flex items-center justify-between pointer-events-auto backdrop-blur-xl">
        <div className="flex items-center gap-1 ml-2">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={activeDiaAbsoluto === 1}
            onClick={() => setActiveDiaAbsoluto(prev => prev - 1)}
            className="text-white hover:bg-white/10 rounded-xl h-10 w-10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex flex-col items-center px-4 min-w-[100px]">
            <span className="text-[10px] font-bold uppercase tracking-tighter text-white leading-none">RUTINA {activeDiaAbsoluto}</span>
            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 mt-1">SEM {currentWeek}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={activeDiaAbsoluto === totalDays}
            onClick={() => setActiveDiaAbsoluto(prev => prev + 1)}
            className="text-white hover:bg-white/10 rounded-xl h-10 w-10"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>

        <Button
          type="button"
          disabled={isPending || !isValid}
          onClick={onSave}
          className="bg-lime-500 text-zinc-950 hover:bg-lime-400 font-bold px-8 h-12 rounded-[1.5rem] text-[10px] uppercase tracking-widest shadow-xl shadow-lime-500/10 active:scale-95 transition-all"
        >
          {isPending ? "..." : "Guardar"}
          <Save className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </footer>
  );
}

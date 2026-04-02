import React, { useState, useEffect } from "react";
import { Timer, ArrowRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricConsoleProps {
  series: number;
  reps: string;
  peso: string | number | null;
  descanso: number;
  isSaving?: boolean;
  onUpdate: (values: {
    series?: number;
    reps_target?: string;
    peso_target?: string;
    descanso_seg?: number;
  }) => void;
  className?: string;
}

/**
 * MetricConsole: Componente unificado para la edición industrial de métricas.
 * Se usa tanto en vistas semanales como en calendario operativo.
 */
export function MetricConsole({
  series,
  reps,
  peso,
  descanso,
  isSaving = false,
  onUpdate,
  className
}: MetricConsoleProps) {
  const [localValues, setLocalValues] = useState({
    series: series,
    reps: reps,
    peso: peso?.toString() || "",
    descanso: descanso
  });

  // Sincronizar con props externas por si cambian (ej. Undo)
  useEffect(() => {
    setLocalValues({
      series,
      reps,
      peso: peso?.toString() || "",
      descanso
    });
  }, [series, reps, peso, descanso]);

  const handleBlur = () => {
    const hasChanged = 
      localValues.series !== series || 
      localValues.reps !== reps || 
      localValues.peso !== (peso?.toString() || "") ||
      localValues.descanso !== descanso;

    if (hasChanged && !isSaving) {
      onUpdate({
        series: Number(localValues.series),
        reps_target: localValues.reps,
        peso_target: localValues.peso,
        descanso_seg: Number(localValues.descanso)
      });
    }
  };

  return (
    <div className={cn(
      "flex items-end gap-2 sm:gap-4 bg-zinc-100 dark:bg-zinc-950 p-2 sm:p-3 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-inner group/console relative",
      isSaving && "opacity-70 pointer-events-none",
      className
    )}>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 rounded-[2rem] z-10">
          <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
        </div>
      )}

      {/* Series */}
      <MetricField 
        label="Series"
        value={localValues.series}
        onChange={(v) => setLocalValues(p => ({ ...p, series: Number(v) }))}
        onBlur={handleBlur}
        width="w-12 sm:w-16"
      />

      <Divider />

      {/* Reps */}
      <MetricField 
        label="Reps"
        value={localValues.reps}
        onChange={(v) => setLocalValues(p => ({ ...p, reps: v }))}
        onBlur={handleBlur}
        width="w-14 sm:w-20"
      />

      <Divider />

      {/* Peso Target (Destaque Industrial) */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-lime-600 dark:text-lime-400 ml-3">Peso Target</label>
        <div className="relative group/input">
          <input 
            type="text"
            value={localValues.peso}
            onChange={(e) => setLocalValues(p => ({ ...p, peso: e.target.value }))}
            onBlur={handleBlur}
            placeholder="0kg"
            className="w-20 sm:w-32 h-10 sm:h-12 bg-lime-400 text-zinc-950 rounded-[1.25rem] border-none font-black text-sm sm:text-lg px-4 focus:ring-4 focus:ring-lime-400/20 transition-all shadow-lg shadow-lime-500/10 placeholder:text-zinc-900/30"
          />
          <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-950 opacity-20 group-hover/input:opacity-100 transition-opacity hidden sm:block" />
        </div>
      </div>

      <Divider />

      {/* Descanso */}
      <MetricField 
        label="Desc."
        value={localValues.descanso}
        onChange={(v) => setLocalValues(p => ({ ...p, descanso: Number(v) }))}
        onBlur={handleBlur}
        width="w-12 sm:w-16"
        icon={<Timer className="w-2.5 h-2.5 opacity-30" />}
      />
    </div>
  );
}

function MetricField({ label, value, onChange, onBlur, width, icon }: any) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-zinc-500 ml-2 flex items-center gap-1">
        {icon}{label}
      </label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className={cn(
          "h-10 sm:h-12 bg-white dark:bg-zinc-900 rounded-[1.25rem] border-none text-center font-black text-sm sm:text-lg focus:ring-2 focus:ring-lime-400 transition-all text-zinc-950 dark:text-white",
          width
        )}
      />
    </div>
  );
}

function Divider() {
  return <div className="h-6 w-[1px] bg-zinc-200 dark:bg-zinc-800 mb-3" />;
}

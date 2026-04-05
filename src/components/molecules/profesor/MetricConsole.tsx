import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricConsoleProps {
  series: number;
  reps: string;
  peso: string | number | null;
  descanso: number;
  isSaving?: boolean;
  readOnly?: boolean;
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
 * Optimizado para mobile touch targets y legibilidad.
 */
export function MetricConsole({
  series,
  reps,
  peso,
  descanso,
  isSaving = false,
  readOnly = false,
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
    if (readOnly) return;
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

  const copy = {
    short: { series: "S", reps: "R", weight: "P", rest: "D" }
  };

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-2 sm:gap-3 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 relative transition-opacity duration-300",
      (isSaving || readOnly) && "opacity-70",
      className
    )}>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 rounded-2xl z-10">
          <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
        </div>
      )}

      {/* 1. Series */}
      <MetricInput 
        label={copy.short.series}
        value={localValues.series}
        onChange={(v) => setLocalValues(p => ({ ...p, series: Number(v) }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        type="number"
        minWidth="min-w-[65px]"
      />

      {/* 2. Reps */}
      <MetricInput 
        label={copy.short.reps}
        value={localValues.reps}
        onChange={(v) => setLocalValues(p => ({ ...p, reps: v }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        minWidth="min-w-[70px]"
      />

      {/* 3. Peso */}
      <MetricInput 
        label={copy.short.weight}
        value={localValues.peso}
        onChange={(v) => setLocalValues(p => ({ ...p, peso: v }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        placeholder="kg"
        highlight
        minWidth="min-w-[85px]"
      />

      {/* 4. Descanso */}
      <MetricInput 
        label={copy.short.rest}
        value={localValues.descanso}
        onChange={(v) => setLocalValues(p => ({ ...p, descanso: Number(v) }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        type="number"
        minWidth="min-w-[70px]"
      />
    </div>
  );
}

interface MetricInputProps {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  onBlur: () => void;
  readOnly: boolean;
  type?: "text" | "number";
  placeholder?: string;
  highlight?: boolean;
  minWidth?: string;
}

function MetricInput({ label, value, onChange, onBlur, readOnly, type = "text", placeholder, highlight, minWidth }: MetricInputProps) {
  return (
    <div className={cn("flex flex-col gap-1.5 flex-1 md:flex-none", minWidth)}>
      <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 shadow-inner border border-zinc-200/50 dark:border-zinc-800/50 group/input focus-within:border-lime-500/30 transition-all">
        <div className={cn(
          "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm shrink-0 uppercase border transition-all",
          highlight 
            ? "bg-lime-400 text-zinc-950 border-lime-500/20" 
            : "bg-white dark:bg-zinc-950 text-zinc-400 dark:text-zinc-600 border-zinc-100 dark:border-zinc-800"
        )}>
          {label}
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 text-center font-black text-sm text-zinc-950 dark:text-white h-10 sm:h-11 placeholder:text-zinc-400/30"
        />
      </div>
    </div>
  );
}

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
    series: series ?? 1,
    reps: reps ?? "",
    peso: peso?.toString() || "",
    descanso: descanso ?? 60
  });

  // Sincronizar con props externas por si cambian (ej. Undo)
  useEffect(() => {
    setLocalValues({
      series: series ?? 1,
      reps: reps ?? "",
      peso: peso?.toString() || "",
      descanso: descanso ?? 60
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
    labels: {
      series: "Series",
      reps: "Repes",
      weight: "Peso/Tiempo",
      rest: "Descanso"
    }
  };

  return (
    <div className={cn(
      "flex flex-wrap items-end gap-3 sm:gap-4 bg-zinc-50 dark:bg-zinc-950 p-4 sm:p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 relative transition-opacity duration-300",
      (isSaving || readOnly) && "opacity-70",
      className
    )}>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/20 rounded-3xl z-10">
          <Loader2 className="w-5 h-5 text-lime-400 animate-spin" />
        </div>
      )}

      {/* 1. Series */}
      <MetricInput
        label={copy.labels.series}
        value={localValues.series}
        onChange={(v) => setLocalValues(p => ({ ...p, series: Number(v) }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        type="number"
        minWidth="min-w-[80px]"
      />

      {/* 2. Repes */}
      <MetricInput
        label={copy.labels.reps}
        value={localValues.reps}
        onChange={(v) => setLocalValues(p => ({ ...p, reps: v }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        minWidth="min-w-[80px]"
      />

      {/* 3. Peso/Tiempo */}
      <MetricInput
        label={copy.labels.weight}
        value={localValues.peso}
        onChange={(v) => setLocalValues(p => ({ ...p, peso: v }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        placeholder="kg / min"
        highlight
        minWidth="min-w-[120px]"
      />

      {/* 4. Descanso */}
      <MetricInput
        label={copy.labels.rest}
        value={localValues.descanso}
        onChange={(v) => setLocalValues(p => ({ ...p, descanso: Number(v) }))}
        onBlur={handleBlur}
        readOnly={readOnly}
        type="number"
        minWidth="min-w-[90px]"
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
    <div className={cn("flex flex-col gap-2.5 flex-1 md:flex-none", minWidth)}>
      {/* Label on top with industrial design */}
      <span className={cn(
        "industrial-label-sm px-1",
        highlight && "text-lime-500 font-black uppercase"
      )}>
        {label}
      </span>

      <div className={cn(
        "flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-1 shadow-inner border transition-all group/input focus-within:ring-2 focus-within:ring-lime-500/20",
        highlight 
          ? "border-lime-500/30 bg-lime-500/5 focus-within:border-lime-500" 
          : "border-zinc-200/50 dark:border-zinc-800/50 focus-within:border-zinc-400 dark:focus-within:border-zinc-700"
      )}>
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full bg-transparent border-none focus:ring-0 text-center font-bold text-base text-zinc-950 dark:text-white h-12 placeholder:text-zinc-400/30"
        />
      </div>
    </div>
  );
}

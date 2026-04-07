import React, { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { History, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface EjercicioLog {
  peso: string | number;
  reps: number;
  rpe: number;
  fecha: string;
}

interface Props {
  alumnoId: string;
  ejercicioId: string;
  className?: string;
}

/**
 * ExerciseHistoryPanel: Muestra la telemetría histórica de las últimas 3 ejecuciones reales.
 * Se integra en el calendario y workspace operativo para guiar el ajuste de pesos.
 */
export function ExerciseHistoryPanel({ alumnoId, ejercicioId, className }: Props) {
  const [history, setHistory] = useState<EjercicioLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchHistory() {
      if (!ejercicioId) return;
      setLoading(true);
      setError(false);
      try {
        const { data: res } = await actions.profesor.getExerciseHistory({
          alumno_id: alumnoId,
          ejercicio_id: ejercicioId
        });
        if (res?.success) setHistory(res.history);
        else setError(true);
      } catch (err) {
        console.error("Error al obtener historial:", err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [alumnoId, ejercicioId]);

  if (loading) {
    return (
      <div className={cn("bg-zinc-100/50 dark:bg-zinc-900/40 p-5 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-center gap-3", className)}>
        <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 animate-pulse">Cargando telemetría...</span>
      </div>
    );
  }

  if (error || history.length === 0) {
    return (
      <div className={cn("bg-zinc-100/50 dark:bg-zinc-900/40 p-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center gap-3", className)}>
        <AlertCircle className="w-4 h-4 text-zinc-400" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Sin ejecuciones reales registradas</span>
      </div>
    );
  }

  return (
    <div className={cn("bg-zinc-100/50 dark:bg-zinc-900/40 p-4 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-400", className)}>
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-lime-500" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Inteligencia de Progresión</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] font-bold text-zinc-400 uppercase tracking-tight">
          <History className="w-3 h-3" />
          Últimos 3 registros
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {history.map((log, i) => (
          <div key={i} className="bg-white dark:bg-zinc-950 p-4 rounded-2xl flex items-center justify-between border border-zinc-100 dark:border-zinc-800 shadow-sm transition-all hover:border-lime-500/30 group/item">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1 group-hover/item:text-lime-500/60 transition-colors">
                {new Date(log.fecha).toLocaleDateString("es-AR")}
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tight leading-none">
                  {log.peso}kg
                </span>
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  x {log.reps}
                </span>
              </div>
            </div>
            {log.rpe && (
              <div className="px-2 py-1 bg-fuchsia-500/10 rounded-lg border border-fuchsia-500/10">
                <span className="text-[9px] font-bold text-fuchsia-500 uppercase tracking-widest">RPE {log.rpe}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { MessageSquare, CheckCircle, Timer, Zap, ArrowRight, ChevronDown, ChevronUp, History, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActiveSessionProps {
  sesionBase: any[];
  sessionId: string;
  alumnoId: string;
  semanaActual: number;
}

/**
 * ActiveSession V2.5 (Industrial Minimalist)
 * Optimizada para la ejecución técnica en el salón.
 */
export function ActiveSession({ sesionBase, sessionId, alumnoId, semanaActual }: ActiveSessionProps) {
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [realWeights, setRealWeights] = useState<Record<string, string>>({});
  const [isCommenting, setIsCommenting] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [globalNota, setGlobalNota] = useState("");

  // Timer State
  const [activeTimerObj, setActiveTimerObj] = useState<{ id: string, secondsLeft: number } | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (activeTimerObj && activeTimerObj.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveTimerObj((prev: any) => ({ ...prev, secondsLeft: prev.secondsLeft - 1 }));
      }, 1000);
    } else if (activeTimerObj?.secondsLeft === 0) {
      clearInterval(interval);
      // Vibración o sonido aquí sería ideal
    }
    return () => clearInterval(interval);
  }, [activeTimerObj]);

  const startTimer = (ejId: string, seconds: number) => {
    setActiveTimerObj({ id: ejId, secondsLeft: seconds });
  };

  const updateRealWeight = (ejId: string, val: string) => {
    setRealWeights(prev => ({ ...prev, [ejId]: val }));
  };

  const markExerciseDone = async (ej: any) => {
    const sesionEjId = ej.sesion_ejercicio_id;
    const currentWeight = realWeights[sesionEjId] || ej.peso_plan;

    setCompletedExercises(prev => ({ ...prev, [sesionEjId]: true }));

    try {
      // Guardamos el log de la sesión
      await actions.alumno.logEjercicioInstanciado({
        sesion_ejercicio_id: sesionEjId,
        series_real: parseInt(String(ej.series)) || 1,
        reps_real: String(ej.reps_target) || "1",
        peso_real: parseFloat(String(currentWeight)) || undefined,
        nota_alumno: comments[sesionEjId] || undefined,
        completado: true,
      });

      // PROPAGACIÓN INTELIGENTE (Stage 4 - Early Sync)
      // Si el peso real es distinto al peso planeado, propagamos preventivamente
      if (currentWeight && currentWeight !== ej.peso_plan) {
          actions.alumno.updateStudentMetricWithPropagation({
              alumno_id: alumnoId,
              ejercicio_plan_id: ej.ejercicio_plan_id,
              semana_numero: semanaActual,
              peso_target: String(currentWeight)
          }).catch(err => console.error("Preventive propagation failed:", err));
      }
    } catch (e) {
      console.error("Error al guardar log:", e);
    }

    // Auto-avanzar al siguiente
    if (activeExerciseIndex < sesionBase.length - 1) {
      setTimeout(() => setActiveExerciseIndex(prev => prev + 1), 400);
    } else {
      setTimeout(() => setActiveExerciseIndex(sesionBase.length), 400); 
    }
  };

  const handleCompleteSession = async () => {
    setIsFinishing(true);
    try {
      // 1. Identificar si hubo cambios de peso para propagar al Organismo
      const changesToPropagate = sesionBase
        .filter(ej => {
            const real = realWeights[ej.sesion_ejercicio_id];
            return real && real !== ej.peso_plan;
        })
        .map(ej => ({
            ejercicio_plan_id: ej.ejercicio_plan_id,
            peso_target: realWeights[ej.sesion_ejercicio_id]
        }));

      // 2. Ejecutar propagaciones (Deep Sync / Overrides)
      for (const change of changesToPropagate) {
          await actions.alumno.updateStudentMetricWithPropagation({
              alumno_id: alumnoId,
              ejercicio_plan_id: change.ejercicio_plan_id,
              semana_numero: semanaActual,
              peso_target: change.peso_target
          });
      }

      // 3. Cerrar sesión
      await actions.alumno.completarSesionInstanciada({
        sesion_id: sessionId,
        notas_alumno: globalNota || undefined,
      });
      
      window.location.href = "/alumno";
    } catch (e) {
      console.error("Error al finalizar:", e);
      setIsFinishing(false);
    }
  };

  const formatTime = (totalSeconds: number) => {
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col gap-8 max-w-xl mx-auto w-full pb-40 px-2 animate-in fade-in duration-1000">
      
      {/* HEADER TÉCNICO */}
      <div className="flex items-center justify-between opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex gap-4 items-center">
            <div className="h-[1px] w-8 bg-zinc-800" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">Execution Panel V2.5</span>
        </div>
        <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
            <span className="text-[10px] font-bold text-lime-500 uppercase tracking-widest">Live Sync</span>
        </div>
      </div>

      <div className="space-y-6">
        {sesionBase.map((ej, idx) => {
          const isActive = idx === activeExerciseIndex;
          const isDone = !!completedExercises[ej.sesion_ejercicio_id] || ej.completado;
          const currentWeight = realWeights[ej.sesion_ejercicio_id] || ej.peso_plan;

          return (
            <div
              key={ej.sesion_ejercicio_id}
              className={cn(
                "group relative border transition-all duration-500 rounded-[2.5rem]",
                isActive 
                    ? "bg-white dark:bg-white border-lime-500 shadow-[0_20px_50px_rgba(163,230,53,0.15)] ring-2 ring-lime-500" 
                    : isDone 
                        ? "bg-zinc-900/40 border-zinc-800/50 opacity-40 grayscale" 
                        : "bg-zinc-900 border-zinc-800 hover:border-zinc-700"
              )}
            >
              {/* INDICADOR DE POSICIÓN (FLOTANTE) */}
              <div className={cn(
                  "absolute -left-3 top-8 w-10 h-10 rounded-2xl flex items-center justify-center font-black italic text-sm shadow-xl transition-all",
                  isActive ? "bg-lime-500 text-zinc-950 -rotate-6 scale-110" : "bg-zinc-800 text-zinc-500"
              )}>
                {idx + 1}
              </div>

              {/* CARD CONTENT */}
              <div 
                className={cn("p-8", !isActive && "cursor-pointer")}
                onClick={() => !isActive && setActiveExerciseIndex(idx)}
              >
                <div className="flex flex-col gap-6">
                    {/* NIVEL 1: ANCLA */}
                    <div className="space-y-1">
                        <div className="flex items-start justify-between">
                            <h3 className={cn(
                                "text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9]",
                                isActive ? "text-zinc-950" : "text-white"
                            )}>
                                {ej.biblioteca_ejercicios?.nombre || 'Ejercicio'}
                            </h3>
                            {isDone && <CheckCircle className="w-6 h-6 text-lime-500 shrink-0 mt-1" />}
                        </div>
                        
                        {/* NIVEL 2: SOPORTE (METRICS) */}
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                            <div className="flex items-center gap-2">
                                <span className={cn("text-xs font-bold uppercase tracking-widest", isActive ? "text-zinc-500" : "text-zinc-500")}>Prescripción</span>
                                <span className={cn("text-lg font-black", isActive ? "text-lime-600" : "text-lime-400")}>
                                    {ej.series}×{ej.reps_target}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 bg-zinc-400/10 dark:bg-zinc-500/10 px-4 py-1.5 rounded-full border border-current opacity-60">
                                <History className="w-3 h-3" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">Previsión: {ej.peso_plan || "--"}kg</span>
                            </div>
                        </div>
                    </div>

                    {/* INTERACCIÓN (SÓLO SI ESTÁ ACTIVO) */}
                    {isActive && !isDone && (
                        <div className="space-y-8 mt-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            
                            {/* CONTROL DE PESO OPERATIVO */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-100 p-6 rounded-3xl space-y-3">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Peso Real (KG)</span>
                                    <div className="flex items-center justify-between gap-4">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateRealWeight(ej.sesion_ejercicio_id, String(Math.max(0, parseFloat(currentWeight || "0") - 2.5))) }}
                                            className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-950 font-bold hover:bg-zinc-50 active:scale-95 transition-all shadow-sm"
                                        >
                                            -
                                        </button>
                                        <input 
                                            type="number" 
                                            value={currentWeight || ""}
                                            onChange={(e) => updateRealWeight(ej.sesion_ejercicio_id, e.target.value)}
                                            className="w-full bg-transparent text-4xl font-black text-zinc-950 text-center border-none outline-none focus:ring-0 p-0"
                                            placeholder={ej.peso_plan || "0"}
                                        />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); updateRealWeight(ej.sesion_ejercicio_id, String(parseFloat(currentWeight || "0") + 2.5)) }}
                                            className="w-12 h-12 rounded-xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-950 font-bold hover:bg-zinc-50 active:scale-95 transition-all shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-zinc-100 p-6 rounded-3xl flex flex-col justify-center items-center gap-2">
                                     <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Descanso</span>
                                     <div 
                                        onClick={(e) => { e.stopPropagation(); startTimer(ej.sesion_ejercicio_id, ej.descanso_seg || 60) }}
                                        className={cn(
                                            "flex items-center gap-3 px-6 py-3 rounded-2xl cursor-pointer transition-all active:scale-95",
                                            activeTimerObj?.id === ej.sesion_ejercicio_id && activeTimerObj.secondsLeft > 0
                                                ? "bg-lime-500 text-zinc-950 shadow-lg shadow-lime-500/20"
                                                : "bg-white border border-zinc-200 text-zinc-900"
                                        )}
                                     >
                                        <Timer className="w-5 h-5" />
                                        <span className="text-xl font-black tabular-nums">
                                            {activeTimerObj?.id === ej.sesion_ejercicio_id && activeTimerObj.secondsLeft >= 0
                                                ? formatTime(activeTimerObj.secondsLeft)
                                                : `${ej.descanso_seg || 60}"`}
                                        </span>
                                     </div>
                                </div>
                            </div>

                            {/* FEEDBACK Y ACCIÓN PRINCIPAL */}
                            <div className="space-y-4">
                                <div className="relative group/input">
                                    <MessageSquare className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within/input:text-lime-600 transition-colors" />
                                    <input 
                                        type="text"
                                        placeholder="Anotá alguna molestia o ajuste técnica..."
                                        value={comments[ej.sesion_ejercicio_id] || ""}
                                        onChange={(e) => setComments(prev => ({ ...prev, [ej.sesion_ejercicio_id]: e.target.value }))}
                                        className="w-full h-14 bg-zinc-100 rounded-2xl pl-14 pr-6 text-sm font-medium text-zinc-900 focus:bg-white focus:ring-2 focus:ring-lime-500 border-none transition-all outline-none"
                                    />
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); markExerciseDone(ej); }}
                                    className="w-full h-20 bg-lime-500 text-zinc-950 rounded-3xl flex items-center justify-center gap-4 group/done active:scale-[0.98] transition-all shadow-[0_20px_40px_rgba(163,230,53,0.3)]"
                                >
                                    <span className="text-xl font-black uppercase tracking-widest">¡Listo, terminando!</span>
                                    <Zap className="w-6 h-6 fill-zinc-950 group-hover/done:scale-125 transition-transform" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* FOOTER METADATA (Nivel 3) */}
                    {!isActive && !isDone && (
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                            <div className="flex items-center gap-2">
                                <Info className="w-3 h-3 text-lime-500" />
                                Ver detalles técnicos
                            </div>
                            <ChevronDown className="w-4 h-4" />
                        </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FOOTER DE FINALIZACIÓN */}
      {activeExerciseIndex >= sesionBase.length && sesionBase.length > 0 && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-lg px-4 z-50">
            <div className="bg-zinc-950 border border-lime-500/30 rounded-[3rem] p-8 shadow-2xl backdrop-blur-2xl animate-in slide-in-from-bottom-12 duration-700">
                <div className="flex flex-col items-center text-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-full bg-lime-500 flex items-center justify-center shadow-lg shadow-lime-500/20">
                        <CheckCircle className="w-8 h-8 text-zinc-950" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-white tracking-tighter uppercase leading-none">¡Liquidaste el día!</h2>
                        <p className="text-zinc-500 text-sm font-medium mt-2">¿Cómo terminó tu energía hoy?</p>
                    </div>
                </div>

                <textarea 
                    className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-sm focus:ring-2 focus:ring-lime-500 outline-none resize-none mb-6"
                    rows={2}
                    placeholder="Escribí un resumen rápido para tu entrenador..."
                    value={globalNota}
                    onChange={e => setGlobalNota(e.target.value)}
                />

                <button
                    disabled={isFinishing}
                    onClick={handleCompleteSession}
                    className="w-full h-20 bg-lime-500 text-zinc-950 rounded-3xl flex items-center justify-center gap-3 hover:bg-lime-400 active:scale-95 transition-all shadow-[0_30px_60px_rgba(163,230,53,0.2)]"
                >
                    <span className="text-xl font-black uppercase tracking-widest">{isFinishing ? 'Guardando...' : 'Finalizar Sesión'}</span>
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}

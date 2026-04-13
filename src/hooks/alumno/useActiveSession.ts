import { useState, useEffect, useCallback } from 'react';
import { actions } from 'astro:actions';
import { toast } from 'sonner';
import { triggerHapticSoft, triggerHapticPR } from '@/lib/performance';

export interface ExerciseBase {
  ejercicio_id: string;
  sesion_ejercicio_id: string;
  ejercicio_plan_id: string;
  series: number;
  reps_target: string;
  peso_plan: string | number;
  descanso_seg: number;
  completado: boolean;
  biblioteca_ejercicios?: {
    nombre: string;
    media_url?: string;
  };
}

export interface UseActiveSessionProps {
  sessionId: string;
  alumnoId: string;
  semanaActual: number;
  sesionBase: ExerciseBase[];
}

/**
 * useActiveSession: Hook centralizado para la lógica de entrenamiento del alumno.
 * Maneja persistencia local, sincronización con DB y control de timers.
 */
export function useActiveSession({ sessionId, alumnoId, semanaActual, sesionBase }: UseActiveSessionProps) {
  const STORAGE_KEY = `MIGYM_SESSION_${sessionId}`;

  // State
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [realWeights, setRealWeights] = useState<Record<string, string>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [rpeValues, setRpeValues] = useState<Record<string, number>>({});
  const [globalNota, setGlobalNota] = useState("");
  const [isFinishing, setIsFinishing] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ id: string, secondsLeft: number } | null>(null);
  const [isSyncing, setIsSyncing] = useState<Record<string, boolean>>({});

  // 1. Hidratación desde LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setActiveExerciseIndex(data.activeExerciseIndex || 0);
        setCompletedExercises(data.completedExercises || {});
        setRealWeights(data.realWeights || {});
        setComments(data.comments || {});
        setRpeValues(data.rpeValues || {});
        setGlobalNota(data.globalNota || "");
      } catch (e) {
        console.error("Error al cargar estado local:", e);
      }
    }
  }, [sessionId]);

  // 2. Persistencia automática
  useEffect(() => {
    const state = {
      activeExerciseIndex,
      completedExercises,
      realWeights,
      comments,
      rpeValues,
      globalNota
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [activeExerciseIndex, completedExercises, realWeights, comments, rpeValues, globalNota]);

  // 3. Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (activeTimer && activeTimer.secondsLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer(prev => prev ? { ...prev, secondsLeft: prev.secondsLeft - 1 } : null);
      }, 1000);
    } else if (activeTimer?.secondsLeft === 0) {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const startTimer = useCallback((id: string, seconds: number) => {
    setActiveTimer({ id, secondsLeft: seconds });
  }, []);

  const stopTimer = useCallback(() => {
    setActiveTimer(null);
  }, []);

  // 4. Acciones Operativas
  const markExerciseDone = async (idx: number) => {
    const ej = sesionBase[idx];
    if (!ej) return;

    const sesionEjId = ej.sesion_ejercicio_id;
    const currentWeight = realWeights[sesionEjId] || String(ej.peso_plan);

    // Optimismo Visual
    setCompletedExercises(prev => ({ ...prev, [sesionEjId]: true }));
    
    // Haptic Feedback
    triggerHapticSoft();
    
    // Auto-advance
    if (idx < sesionBase.length - 1) {
      setTimeout(() => setActiveExerciseIndex(idx + 1), 400);
    } else {
      setTimeout(() => setActiveExerciseIndex(sesionBase.length), 400);
    }

    try {
      setIsSyncing(prev => ({ ...prev, [sesionEjId]: true }));
      // 1. Logear ejercicio instanciado
      const { data, error } = await actions.alumno.logEjercicioInstanciado({
        sesion_ejercicio_id: sesionEjId,
        series_real: ej.series || 1,
        reps_real: String(ej.reps_target) || "1",
        peso_real: parseFloat(currentWeight) || undefined,
        nota_alumno: comments[sesionEjId] || undefined,
        rpe: rpeValues[sesionEjId] || undefined,
        completado: true,
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.message || "Error al guardar");
      }

      // 2. Sincronización proactiva de peso (Stage 4 - Early Sync)
      if (currentWeight && currentWeight !== String(ej.peso_plan)) {
        await actions.alumno.updateStudentMetricWithPropagation({
          alumno_id: alumnoId,
          ejercicio_plan_id: ej.ejercicio_plan_id,
          semana_numero: semanaActual,
          peso_target: currentWeight
        });
      }
    } catch (e) {
      console.error("Save error:", e);
      toast.error("Error al guardar progreso. Tranqui, quedó guardado localmente.");
    } finally {
      setIsSyncing(prev => ({ ...prev, [sesionEjId]: false }));
    }
  };

  const finishSession = async () => {
    setIsFinishing(true);
    try {
      // 1. Persistencia final en la sesión instanciada
      const { data, error } = await actions.alumno.completarSesionInstanciada({
        sesion_id: sessionId,
        notas_alumno: globalNota || undefined,
      });

      if (error || !data?.success) {
        throw new Error(error?.message || data?.message || "Error al cerrar");
      }
      
      // 2. Limpiar persistencia local
      localStorage.removeItem(STORAGE_KEY);
      
      // Reward Haptic
      triggerHapticPR();
      
      toast.success(data.message || "¡Sesión liquidada! Sos una máquina. 💪");
      
      // Redirect
      window.location.href = "/alumno";
    } catch (e) {
      console.error("Finish error:", e);
      toast.error("No pudimos cerrar la sesión. Reintentá.");
      setIsFinishing(false);
    }
  };

  return {
    state: {
      activeExerciseIndex,
      completedExercises,
      realWeights,
      comments,
      rpeValues,
      globalNota,
      isFinishing,
      activeTimer,
      isSyncing
    },
    actions: {
      setActiveExerciseIndex,
      setRealWeights,
      setComments,
      setRpeValues,
      setGlobalNota,
      markExerciseDone,
      finishSession,
      startTimer,
      stopTimer
    }
  };
}

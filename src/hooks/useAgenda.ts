import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { actions } from "astro:actions";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  color_tag?: string;
  capacidad_max: number;
}

interface Student {
  id: string;
  nombre: string;
  turno_id?: string;
  dias_asistencia?: string[];
}

interface Session {
  alumno_id: string;
  progress: number;
  coreExercise?: {
    nombre: string;
    peso_target?: string;
    peso_real?: string;
  };
}

const DAYS_OF_WEEK = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function useAgenda(initialTurnos: Turno[], initialStudents: Student[], initialSessions: Session[]) {
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [currentTime, setCurrentTime] = useState(new Date());

  // 1. Tick del Reloj (cada 60 segundos para refrescar bloque activo)
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // 2. Telemetría Realtime (Suscripción a cambios en ejercicios instanciados)
  useEffect(() => {
    const channel = supabase
      .channel('agenda-telemetry')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sesion_ejercicios_instanciados' },
        async (payload: any) => {
          const sessionId = payload.new?.sesion_id || payload.old?.sesion_id;
          if (!sessionId) return;

          const { data: sessionData } = await supabase
            .from("sesiones_instanciadas")
            .select("alumno_id")
            .eq("id", sessionId)
            .single();

          if (sessionData?.alumno_id) {
            refreshStudentProgress(sessionData.alumno_id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Helper para refrescar solo un alumno
  const refreshStudentProgress = async (alumno_id: string) => {
    try {
      const { data, error } = await actions.profesor.getStudentSessionProgress({ alumno_id });
      if (error || !data) return;

      setSessions(prev => {
        const index = prev.findIndex(s => s.alumno_id === alumno_id);
        if (index === -1) return [...prev, data];
        const newSessions = [...prev];
        newSessions[index] = data;
        return newSessions;
      });
    } catch (err) {
      console.error("[useAgenda] Error refreshing student progress:", err);
    }
  };

  // 3. Calculadores Memoizados
  const currentTotalMins = useMemo(() => {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }, [currentTime]);

  const todayName = useMemo(() => {
    return DAYS_OF_WEEK[currentTime.getDay()];
  }, [currentTime]);

  const activeTurnoId = useMemo(() => {
    return initialTurnos.find(t => {
      const [hStart, mStart] = t.hora_inicio.split(':').map(Number);
      const [hEnd, mEnd] = t.hora_fin.split(':').map(Number);
      const startMins = hStart * 60 + mStart;
      const endMins = hEnd * 60 + mEnd;
      return currentTotalMins >= startMins && currentTotalMins < endMins;
    })?.id;
  }, [initialTurnos, currentTotalMins]);

  const studentsByTurno = useMemo(() => {
    const map: Record<string, Student[]> = {};
    initialTurnos.forEach(t => map[t.id] = []);
    
    initialStudents.forEach(s => {
      // Filtrado por día de asistencia
      // Si no tiene días definidos (vacio o null), se muestra siempre (Legacy)
      const matchesDay = !s.dias_asistencia || 
                        s.dias_asistencia.length === 0 || 
                        s.dias_asistencia.includes(todayName);

      if (matchesDay && s.turno_id && map[s.turno_id]) {
        map[s.turno_id].push(s);
      }
    });
    return map;
  }, [initialTurnos, initialStudents, todayName]);

  return {
    sessions,
    activeTurnoId,
    studentsByTurno,
    refreshStudentProgress,
    currentTime
  };
}

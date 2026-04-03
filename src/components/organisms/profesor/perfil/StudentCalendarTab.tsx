import React, { useState, useEffect } from "react";
import { actions } from "astro:actions";
import { 
  CalendarDays, 
  Dumbbell, 
  TrendingUp, 
  AlertCircle, 
  Loader2, 
  History,
  ChevronDown,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Plus,
  Trash2
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { DayCalendarStrip } from "@/components/molecules/DayCalendarStrip";
import type { CalendarDay, DayStatus } from "@/components/molecules/DayCalendarStrip";
import { MetricConsole } from "@/components/molecules/profesor/MetricConsole";
import { ExerciseHistoryPanel } from "@/components/molecules/profesor/ExerciseHistoryPanel";
import { ExerciseSelectorDialog } from "@/components/molecules/profesor/ejercicios/ExerciseSelectorDialog";
import { getDayNumber, getWeekNumber, getCyclicDayNumber } from "@/lib/schedule";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// =============================================
// Tipos
// =============================================

interface EjercicioDetail {
  id: string; // ID en sesion_ejercicios_instanciados
  biblioteca_ejercicio_id: string;
  ejercicio_plan_id?: string | null;
  nombre: string;
  series_real?: number | null;
  reps_real?: string | null;
  peso_real?: number | null;
  series_plan: number;
  reps_plan: string;
  peso_plan?: number | null;
  descanso_plan?: number | null;
  completado: boolean;
  media_url?: string | null;
  is_variation?: boolean;
}

interface SesionDetalle {
  id: string;
  fecha_real: string;
  nombre_dia: string;
  estado: string;
  numero_dia_plan: number;
  semana_numero: number;
  ejercicios: EjercicioDetail[];
}

interface Props {
  alumnoId: string;
  fechaInicio: string | null;
  planData: {
    id: string;
    nombre: string;
    rutinas_diarias: Array<{
      id: string;
      dia_numero: number;
      nombre_dia: string | null;
      ejercicios_plan: Array<{
        id: string;
        series: number;
        reps_target: string;
        descanso_seg: number;
        peso_target: string | null;
        biblioteca_ejercicios: { id: string, nombre: string, media_url: string | null } | null;
      }>;
    }>;
  } | null;
}

// =============================================
// Helpers
// =============================================

const DIAS_SEMANA_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

function buildCalendarDays(
  sesionesMap: Record<string, any>,
  fechaInicio: string,
  desde: Date,
  hasta: Date
): CalendarDay[] {
  const hoy = new Date();
  hoy.setUTCHours(0, 0, 0, 0);
  const todayISO = hoy.toISOString().split("T")[0];

  const days: CalendarDay[] = [];
  const cur = new Date(desde);

  while (cur <= hasta) {
    const fechaISO = cur.toISOString().split("T")[0];
    const esFuturo = cur > hoy;
    const esHoy = fechaISO === todayISO;
    const sesion = sesionesMap[fechaISO];

    const numeroDia = sesion?.numero_dia_plan ?? getDayNumber(fechaInicio, new Date(cur));
    const semana = sesion?.semana_numero ?? getWeekNumber(fechaInicio, new Date(cur));

    let status: DayStatus;
    if (sesion) {
      status = sesion.estado as DayStatus;
    } else if (esFuturo && !esHoy) {
      status = "futura";
    } else if (esHoy) {
      status = "pendiente";
    } else {
      status = "omitida";
    }

    days.push({
      fecha: fechaISO,
      fechaDisplay: String(cur.getUTCDate()),
      diaSemana: DIAS_SEMANA_CORTO[cur.getUTCDay()],
      numeroDiaPlan: numeroDia,
      semana,
      status,
      nombreDia: sesion?.nombre_dia ?? undefined,
      esHoy,
      esFuturo: esFuturo && !esHoy,
      sesionId: sesion?.id ?? undefined,
    });

    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return days;
}

// =============================================
// Componente Principal
// =============================================

export function StudentCalendarTab({ alumnoId, fechaInicio, planData }: Props) {
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSesion, setSelectedSesion] = useState<SesionDetalle | null>(null);
  const [loadingDetalle, setLoadingDetalle] = useState(false);
  const [stats, setStats] = useState({ completadas: 0, total: 0 });
  const [savingIds, setSavingIds] = useState<Set<string>>(new Set());
  const [expandedExId, setExpandedExId] = useState<string | null>(null);
  const [isClosingSession, setIsClosingSession] = useState(false);
  const [hasOmissions, setHasOmissions] = useState(false);
  const [isRealigning, setIsRealigning] = useState(false);

  // Estado para la gestión de ejercicios
  const [swapExId, setSwapExId] = useState<string | null>(null);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorMode, setSelectorMode] = useState<"swap" | "add">("swap");
  
  // Estado para el selector de alcance (Solo hoy vs Para siempre)
  const [scopeData, setScopeData] = useState<{
    type: "add" | "remove" | "swap";
    id: string; // instancia_id para remove/swap, biblioteca_id para add
    nuevoId?: string; // Solo para swap
    nombre: string;
  } | null>(null);

  const hoyISO = new Date().toISOString().split("T")[0];
  const ancla = fechaInicio || hoyISO;

  useEffect(() => {
    loadSesiones();
  }, [alumnoId, ancla]);

  async function loadSesiones() {
    setLoading(true);
    try {
      const DIAS_ATRAS = 14;
      const DIAS_ADELANTE = 14;
      const desde = new Date();
      desde.setUTCDate(desde.getUTCDate() - DIAS_ATRAS);
      const hasta = new Date();
      hasta.setUTCDate(hasta.getUTCDate() + DIAS_ADELANTE);

      const { data: resultado } = await actions.alumno.getWeeklySessions({
        dias_atras: DIAS_ATRAS,
        dias_adelante: DIAS_ADELANTE,
      });

      const sesionesMap: Record<string, any> = {};
      (resultado?.dias || []).forEach((d: any) => {
        sesionesMap[d.fecha] = d;
      });

      const dias = buildCalendarDays(sesionesMap, ancla, desde, hasta);
      setCalendarDays(dias);
      setHasOmissions(resultado?.hasConsecutiveOmissions ?? false);

      const pasados = dias.filter((d) => !d.esFuturo && !d.esHoy);
      const completadas = pasados.filter((d) => d.status === "completada").length;
      setStats({ completadas, total: pasados.length });

      if (!selectedDay) setSelectedDay(hoyISO);
    } catch (err) {
      console.error("Error cargando sesiones:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!selectedDay) return;
    const dia = calendarDays.find((d) => d.fecha === selectedDay);
    if (!dia) return;

    if (dia.sesionId) loadSesionDetalle(dia.sesionId, dia);
    else setSelectedSesion(buildPreviewFromPlan(selectedDay, dia, ancla));
  }, [selectedDay, calendarDays]);

  async function loadSesionDetalle(sesionId: string, dia: CalendarDay) {
    setLoadingDetalle(true);
    try {
      const { data } = await actions.alumno.instanciarSesion({ fecha_real: dia.fecha });
      if (data?.sesion) {
        const s = data.sesion;
        const ejercicios = (s.sesion_ejercicios_instanciados || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((ej: any) => {
            const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
            return {
              id: ej.id,
              ejercicio_plan_id: ej.ejercicio_plan_id,
              biblioteca_ejercicio_id: bib?.id,
              nombre: bib?.nombre || "Ejercicio",
              series_real: ej.series_real,
              reps_real: ej.reps_real,
              peso_real: ej.peso_real,
              series_plan: ej.series_plan,
              reps_plan: ej.reps_plan,
              peso_plan: ej.peso_plan,
              descanso_plan: ej.descanso_plan,
              completado: ej.completado ?? false,
              media_url: bib?.media_url,
              is_variation: ej.is_variation
            };
          });

        setSelectedSesion({
          id: s.id,
          fecha_real: s.fecha_real,
          nombre_dia: s.nombre_dia || `Día ${s.numero_dia_plan}`,
          estado: s.estado,
          numero_dia_plan: s.numero_dia_plan,
          semana_numero: s.semana_numero,
          ejercicios,
        });
      }
    } catch (err) {
      console.error("Error cargando detalle:", err);
    } finally {
      setLoadingDetalle(false);
    }
  }

  function buildPreviewFromPlan(fecha: string, dia: CalendarDay, fechaInicio: string): SesionDetalle | null {
    if (!planData || !planData.rutinas_diarias?.length) return null;
    const totalDias = planData.rutinas_diarias.length;
    const diaCiclico = getCyclicDayNumber(dia.numeroDiaPlan, totalDias);
    const rutina = planData.rutinas_diarias.find((r) => r.dia_numero === diaCiclico);
    if (!rutina) return null;

    return {
      id: "",
      fecha_real: fecha,
      nombre_dia: rutina.nombre_dia || `Día ${diaCiclico}`,
      estado: dia.status,
      numero_dia_plan: dia.numeroDiaPlan,
      semana_numero: dia.semana,
      ejercicios: (rutina.ejercicios_plan || []).map((ej) => {
        const bib = Array.isArray(ej.biblioteca_ejercicios) ? ej.biblioteca_ejercicios[0] : ej.biblioteca_ejercicios;
        return {
          id: ej.id,
          ejercicio_plan_id: ej.id, // En preview, el ID es el del plan
          biblioteca_ejercicio_id: bib?.id,
          nombre: bib?.nombre || "Ejercicio",
          series_plan: ej.series,
          reps_plan: ej.reps_target,
          peso_plan: ej.peso_target ? parseFloat(ej.peso_target) : null,
          descanso_plan: ej.descanso_seg,
          completado: false,
          media_url: bib?.media_url,
          is_variation: false
        };
      }),
    };
  }

  const handleUpdatePropagated = async (ej: EjercicioDetail, fields: any) => {
    if (!selectedSesion) return;
    const ejPlanId = getOriginalExercisePlanId(ej.id); 
    if (!ejPlanId) {
        toast.error("No se pudo identificar el ID del plan. Instanciando sesión...");
        return;
    }

    const prevValues = { series: ej.series_plan, reps_target: ej.reps_plan, peso_target: ej.peso_plan?.toString() || "", descanso_seg: ej.descanso_plan || 60 };
    setSavingIds(prev => new Set(prev).add(ej.id));
    
    try {
      const { data, error } = await actions.alumno.updateStudentMetricWithPropagation({
        alumno_id: alumnoId,
        ejercicio_plan_id: ejPlanId,
        semana_numero: selectedSesion.semana_numero,
        ...fields
      });
      if (error) throw error;
      
      // Actualizar localmente
      setSelectedSesion(prev => prev ? { 
        ...prev, 
        ejercicios: prev.ejercicios.map(item => item.id === ej.id ? { 
          ...item, 
          series_plan: fields.series ?? item.series_plan,
          reps_plan: fields.reps_target ?? item.reps_plan,
          peso_plan: fields.peso_target ? parseFloat(fields.peso_target) : item.peso_plan,
          descanso_plan: fields.descanso_seg ?? item.descanso_plan
        } : item) 
      } : null);

      toast.success(data.mensaje, { action: { label: "Undo", onClick: () => handleUndo(ejPlanId, prevValues) } });
    } catch (err: any) {
      toast.error("Error: " + err.message);
    } finally {
      setSavingIds(prev => { const n = new Set(prev); n.delete(ej.id); return n; });
    }
  };

  const handleUndo = async (ejPlanId: string, prev: any) => {
    await actions.alumno.updateStudentMetricWithPropagation({ alumno_id: alumnoId, ejercicio_plan_id: ejPlanId, semana_numero: selectedSesion!.semana_numero, ...prev });
    loadSesiones();
  };

  // Asistencia del profesor
  const handleCompleteSession = async () => {
    if (!selectedSesion || !selectedSesion.id) return;
    setIsClosingSession(true);
    try {
      const { data, error } = await actions.alumno.completeSessionByProfessor({
        sesion_id: selectedSesion.id,
        alumno_id: alumnoId
      });
      if (error) throw error;
      toast.success(data.mensaje);
      loadSesiones(); // Recargar todo el calendario
    } catch (err: any) {
      toast.error("Error al cerrar sesión: " + err.message);
    } finally {
      setIsClosingSession(false);
    }
  };

  // Gestión de Ejercicios (Añadir / Sustituir / Eliminar)
  const handleExerciseSelected = (exerciseId: string) => {
    if (selectorMode === "swap") {
        if (!swapExId) return;
        const currentEj = selectedSesion?.ejercicios.find(e => e.id === swapExId);
        setScopeData({ 
            type: "swap", 
            id: swapExId, 
            nuevoId: exerciseId, 
            nombre: `Sustituir ${currentEj?.nombre || 'ejercicio'}` 
        });
    } else {
        setScopeData({ type: "add", id: exerciseId, nombre: "Añadir ejercicio" });
    }
  };

  const handleConfirmSwap = async (isPermanent: boolean) => {
    if (!scopeData || !scopeData.nuevoId || !selectedSesion) return;
    const tId = toast.loading(isPermanent ? "Sustituyendo en el plan maestro..." : "Sustituyendo para hoy...");
    try {
        const { data, error } = await actions.alumno.swapExerciseInStudentPlan({
            alumno_id: alumnoId,
            sesion_id: selectedSesion.id,
            ejercicio_id: scopeData.id,
            nuevo_biblioteca_id: scopeData.nuevoId,
            is_permanent: isPermanent
        });
        if (error) throw error;
        toast.success(data.mensaje, { id: tId });
        loadSesionDetalle(selectedSesion.id, calendarDays.find(d => d.fecha === selectedDay!)!);
    } catch (err: any) {
        toast.error("Error: " + err.message, { id: tId });
    } finally {
        setScopeData(null);
        setSwapExId(null);
    }
  };

  const handleConfirmAdd = async (isPermanent: boolean) => {
    if (!scopeData || !selectedSesion) return;
    const tId = toast.loading(isPermanent ? "Añadiendo al plan maestro..." : "Añadiendo para hoy...");
    try {
        const { data, error } = await actions.alumno.addExerciseToStudentPlan({
            alumno_id: alumnoId,
            sesion_id: selectedSesion.id,
            biblioteca_id: scopeData.id,
            is_permanent: isPermanent
        });
        if (error) throw error;
        toast.success(data.mensaje, { id: tId });
        loadSesionDetalle(selectedSesion.id, calendarDays.find(d => d.fecha === selectedDay!)!);
    } catch (err: any) {
        toast.error("Error: " + err.message, { id: tId });
    } finally {
        setScopeData(null);
    }
  };

  const handleConfirmRemove = async (isPermanent: boolean) => {
    if (!scopeData || !selectedSesion) return;
    const tId = toast.loading(isPermanent ? "Eliminando del plan maestro..." : "Eliminando de hoy...");
    try {
        const { data, error } = await actions.alumno.removeExerciseFromStudentPlan({
            alumno_id: alumnoId,
            sesion_id: selectedSesion.id,
            ejercicio_id: scopeData.id,
            is_permanent: isPermanent
        });
        if (error) throw error;
        toast.success(data.mensaje, { id: tId });
        loadSesionDetalle(selectedSesion.id, calendarDays.find(d => d.fecha === selectedDay!)!);
    } catch (err: any) {
        toast.error("Error: " + err.message, { id: tId });
    } finally {
        setScopeData(null);
    }
  };

  // Reajuste de Calendario (Buffer de Desfase)
  const handleRealignCalendar = async () => {
    setIsRealigning(true);
    try {
        const { data, error } = await actions.alumno.updateStudentStartDateOffset({
            alumno_id: alumnoId,
            offset_days: 3 // Por defecto 3 según la lógica de omisiones
        });
        if (error) throw error;
        toast.success(data.mensaje);
        // El ancla cambiará internamente en el próximo refresh de datos
        window.location.reload(); // Refresh bruto para recalcular todo el motor cíclico
    } catch (err: any) {
        toast.error("Error al reajustar: " + err.message);
    } finally {
        setIsRealigning(false);
    }
  };

  // Helper para identificar el ID del plan a partir del ejercicio_id instanciado
  function getOriginalExercisePlanId(sesionEjId: string): string | null {
     if (selectedSesion?.id === "") return sesionEjId;
     return selectedSesion?.ejercicios.find(e => e.id === sesionEjId)?.ejercicio_plan_id || null;
  }

  const variacionesCount = selectedSesion?.ejercicios.filter(e => e.is_variation).length || 0;
  const showStructuralWarning = variacionesCount >= 2;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Header Operativo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
        <div>
          <h3 className="text-xl font-black tracking-tighter text-zinc-950 dark:text-white leading-none mb-1 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-lime-500" />
            Agenda
          </h3>
        </div>
        <div className="flex items-center gap-4">
          <StatBadge label="Cumplimiento" value={`${stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0}%`} />
          <StatBadge label="Sesiones" value={stats.completadas} color="lime" />
        </div>
      </div>

      {/* Calendario Strip */}
      {loading ? <LoaderState label="Cargando historial..." /> : (
        <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl">
          <DayCalendarStrip dias={calendarDays} diaSeleccionado={selectedDay || hoyISO} onSelectDia={setSelectedDay} />
        </div>
      )}

      {/* Banner de Alerta de Desfase */}
      {hasOmissions && (
         <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-2">
            <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-zinc-950 flex items-center justify-center shadow-lg shrink-0">
                    <History className="w-6 h-6 text-lime-400" />
                </div>
                <div className="space-y-0.5">
                    <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Inasistencia prolongada detectada</p>
                    <h5 className="text-lg font-black text-zinc-950 dark:text-white tracking-tight">¿Querés reajustar el calendario para que no pierda contenido técnico?</h5>
                </div>
            </div>
            <button 
                onClick={handleRealignCalendar}
                disabled={isRealigning}
                className="bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase text-[10px] tracking-widest h-12 px-8 rounded-2xl shadow-xl transition-all active:scale-95 border border-zinc-800 flex items-center justify-center"
            >
                {isRealigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2 text-lime-400" />}
                Reajustar 3 días
            </button>
         </div>
      )}

      {/* Banner de Aviso Estructural */}
      {showStructuralWarning && (
        <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in slide-in-from-top-4 duration-500">
           <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-fuchsia-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
                 <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="space-y-0.5">
                 <p className="text-xs font-black text-fuchsia-400 uppercase tracking-widest">Cambios estructurales detectados</p>
                 <h5 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">¿Querés guardar esta nueva estructura como un Plan Maestro?</h5>
              </div>
           </div>
           <Button className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-black uppercase text-[10px] tracking-widest h-11 px-8 rounded-2xl shadow-lg transition-all active:scale-95">
              <Sparkles className="w-4 h-4 mr-2" /> Guardar como nuevo plan
           </Button>
        </div>
      )}

      {/* Detalle del Día */}
      {selectedDay && selectedSesion && (
        <div className="bg-white dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl animate-in slide-in-from-bottom-2">
          {loadingDetalle ? <LoaderState label="Consultando sesión..." /> : (
            <>
              <div className="p-6 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-black text-2xl text-zinc-950 dark:text-white uppercase tracking-tighter shrink-0">{selectedSesion.nombre_dia}</h4>
                    <StatusBadge estado={selectedSesion.estado} />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                    <span>{formatFechaDisplay(selectedDay)}</span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-lime-500/80">S{selectedSesion.semana_numero}</span>
                  </div>
                </div>

                {/* Acciones del Profesor para la sesión */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {(selectedSesion.estado === 'pendiente' || selectedSesion.estado === 'en_progreso') && (
                        <div className="flex items-center gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex-1 md:flex-none">
                            <Button 
                                onClick={handleCompleteSession}
                                disabled={isClosingSession || !selectedSesion.id}
                                className="h-10 px-6 bg-lime-400 hover:bg-lime-500 text-zinc-950 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-lg active:scale-95 disabled:opacity-50"
                            >
                                {isClosingSession ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                                Marcar como realizada
                            </Button>
                        </div>
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shadow-lg rotate-3 shrink-0">
                      <Dumbbell className="w-6 h-6 text-lime-400" />
                    </div>
                </div>
              </div>

              <div className="divide-y divide-zinc-100 dark:divide-zinc-900/50">
                {selectedSesion.ejercicios.map((ej, idx) => (
                  <EjercicioExpandibleRow 
                    key={ej.id}
                    ej={ej}
                    idx={idx}
                    alumnoId={alumnoId}
                    isSaving={savingIds.has(ej.id)}
                    isExpanded={expandedExId === ej.id}
                    onToggle={() => setExpandedExId(expandedExId === ej.id ? null : ej.id)}
                    onSave={(fields) => handleUpdatePropagated(ej, fields)}
                    onSwap={() => { setSwapExId(ej.id); setSelectorMode("swap"); setIsSelectorOpen(true); }}
                    onRemove={() => setScopeData({ type: "remove", id: ej.id, nombre: ej.nombre })}
                  />
                ))}

                {/* Botón Añadir Ejercicio */}
                <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/10">
                    <Button 
                        onClick={() => { setSelectorMode("add"); setIsSelectorOpen(true); }}
                        variant="ghost"
                        className="w-full h-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex items-center justify-center gap-3 hover:border-lime-400/50 hover:bg-lime-400/5 transition-all group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group-hover:bg-lime-400 group-hover:text-zinc-950 transition-colors">
                            <Plus className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-400 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">Añadir ejercicio al plan</span>
                    </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Selector de Ejercicios */}
      <ExerciseSelectorDialog 
        isOpen={isSelectorOpen}
        onOpenChange={setIsSelectorOpen}
        onSelect={handleExerciseSelected}
        title={selectorMode === "add" ? "Añadir ejercicio" : "Sustituir ejercicio"}
        description={selectorMode === "add" ? "Se añadirá al final de la rutina" : "Se perderá el progreso de hoy"}
      />

      {/* Selector de Alcance (Solo hoy vs Para siempre) */}
      <ScopeSelectorDialog 
        data={scopeData}
        onClose={() => setScopeData(null)}
        onConfirm={(permanent) => {
            if (scopeData?.type === "add") handleConfirmAdd(permanent);
            else if (scopeData?.type === "remove") handleConfirmRemove(permanent);
            else if (scopeData?.type === "swap") handleConfirmSwap(permanent);
        }}
      />
    </div>
  );
}

// =============================================
// Sub-componentes
// =============================================

function EjercicioExpandibleRow({ ej, idx, alumnoId, isSaving, isExpanded, onToggle, onSave, onSwap, onRemove }: any) {
  return (
    <div className={cn(
      "transition-all duration-300 relative",
      isExpanded ? "bg-zinc-50 dark:bg-zinc-900/40" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10",
      ej.is_variation && "border-l-4 border-fuchsia-500"
    )}>
      <div className="flex flex-col lg:flex-row items-center gap-4 px-6 py-5">
        <div className="flex items-center gap-4 flex-1 w-full relative">
           <button onClick={onToggle} className="relative group shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center font-black transition-all border",
                ej.completado ? "bg-lime-400 border-lime-500 text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-400"
              )}>
                {ej.completado ? "✓" : idx + 1}
              </div>
              <div className={cn(
                "absolute -bottom-1 -right-1 w-5 h-5 bg-zinc-950 dark:bg-white rounded-lg flex items-center justify-center border border-zinc-800 dark:border-zinc-200 transition-transform",
                isExpanded && "rotate-180"
              )}>
                <ChevronDown className={cn("w-3 h-3", isExpanded ? "text-lime-400" : "text-zinc-400")} />
              </div>
           </button>
           
           <div className="min-w-0 flex-1">
             <div className="flex items-baseline gap-2">
                <h5 className={cn("font-black text-lg tracking-tight truncate", ej.completado && "text-zinc-400 line-through")}>{ej.nombre}</h5>
                {ej.is_variation && <span className="text-[7px] font-black uppercase tracking-widest text-white bg-fuchsia-600 px-1.5 py-0.5 rounded leading-none">Variante</span>}
             </div>
             {ej.series_real && !isExpanded && (
               <span className="text-[9px] font-black text-lime-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                 <TrendingUp className="w-3 h-3" /> Real: {ej.series_real}×{ej.reps_real} @ {ej.peso_real}kg
               </span>
             )}
           </div>

           {/* Acciones de Edición */}
           <div className="flex items-center gap-1 absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                    onClick={(e) => { e.stopPropagation(); onSwap(); }}
                    className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 active:scale-90 flex items-center justify-center"
                    title="Sustituir (Solo hoy)"
                >
                 <RefreshCw className="w-4 h-4 text-zinc-500 hover:text-lime-500" />
               </button>
               <button 
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    className="h-10 w-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-red-500/10 active:scale-90 flex items-center justify-center"
                    title="Eliminar"
                >
                 <Trash2 className="w-4 h-4 text-zinc-500 hover:text-red-500" />
               </button>
           </div>
        </div>

        {/* Consola Unificada */}
        <MetricConsole 
          series={ej.series_plan}
          reps={ej.reps_plan}
          peso={ej.peso_plan}
          descanso={ej.descanso_plan || 60}
          isSaving={isSaving}
          onUpdate={onSave}
          className="w-full lg:w-auto"
        />
      </div>

      {/* Panel Expandible con Inteligencia Histórica */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-in slide-in-from-top-2">
           <ExerciseHistoryPanel 
            alumnoId={alumnoId} 
            ejercicioId={ej.biblioteca_ejercicio_id} 
            className="mt-2"
           />
        </div>
      )}
    </div>
  );
}

function StatBadge({ label, value, color = "zinc" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex flex-col items-center bg-zinc-900/50 border border-zinc-800/70 rounded-2xl px-5 py-3 min-w-[100px]">
      <span className={cn("text-2xl font-black leading-none", color === "lime" ? "text-lime-400" : "text-white")}>{value}</span>
      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function LoaderState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center py-12 gap-3 text-zinc-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span className="text-xs font-black uppercase tracking-widest text-zinc-400 animate-pulse">{label}</span>
    </div>
  );
}

function StatusBadge({ estado }: { estado: string }) {
  const map: any = {
    completada:  { label: "Completada",   cls: "text-lime-500 bg-lime-500/10 border-lime-500/20" },
    en_progreso: { label: "En progreso",  cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    pendiente:   { label: "Pendiente",    cls: "text-zinc-300 bg-zinc-800 border-zinc-700" },
    omitida:     { label: "Omitida",       cls: "text-red-400 bg-red-500/10 border-red-500/20" },
    futura:      { label: "Próximamente",   cls: "text-zinc-500 bg-zinc-900 border-zinc-800" },
  };
  const info = map[estado] || map.pendiente;
  return (
    <span className={cn("text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border", info.cls)}>{info.label}</span>
  );
}

function formatFechaDisplay(fechaISO: string): string {
  return new Date(fechaISO + "T12:00:00").toLocaleDateString("es-AR", { weekday: "long", day: "numeric", month: "long" });
}

function ScopeSelectorDialog({ data, onClose, onConfirm }: { data: any, onClose: () => void, onConfirm: (p: boolean) => void }) {
  if (!data) return null;
  const isRemove = data.type === "remove";
  const isSwap = data.type === "swap";

  let title = "¿Añadir ejercicio?";
  if (isRemove) title = "¿Eliminar ejercicio?";
  if (isSwap) title = "¿Sustituir ejercicio?";

  let Icon = Plus;
  if (isRemove) Icon = Trash2;
  if (isSwap) Icon = RefreshCw;

  return (
    <Dialog.Root open={!!data} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden p-8 animate-in zoom-in-95">
          <div className="text-center space-y-6">
            <div className={cn(
                "w-16 h-16 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg",
                isRemove ? "bg-red-500/10 text-red-500" : (isSwap ? "bg-blue-500/10 text-blue-500" : "bg-lime-500/10 text-lime-500")
            )}>
                <Icon className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">
                    {title}
                </h3>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{data.nombre}</p>
            </div>

            <div className="grid gap-3">
                <Button 
                    onClick={() => onConfirm(false)}
                    className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white font-black uppercase text-[10px] tracking-widest transition-all"
                >
                    <History className="w-4 h-4 mr-2 opacity-50" />
                    Solo por hoy
                </Button>
                <Button 
                    onClick={() => onConfirm(true)}
                    className={cn(
                        "h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl",
                        isRemove ? "bg-zinc-950 text-white" : "bg-lime-400 text-zinc-950"
                    )}
                >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Para siempre (Plan)
                </Button>
            </div>

            <button onClick={onClose} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">
                Cancelar
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import React, { useState, useMemo, useEffect } from 'react';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { cn } from '@/lib/utils';
import { actions } from 'astro:actions';
import { 
  Zap, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Target, 
  Repeat, 
  PlayCircle, 
  Info, 
  Image as ImageIcon,
  Loader2,
  Coffee,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import { dashboardStrings } from '@/data/es/alumno/dashboard';

interface Exercise {
  id?: string; // ID de la instancia real (si existe)
  ejercicio_plan_id: string; // ID estructural
  nombre: string;
  media_url?: string;
  series_plan: number;
  reps_plan: string;
  peso_plan: number | null;
  descanso_seg: number;
  completado: boolean;
}

interface RoutineData {
  nombre_dia: string;
  numero_dia_plan: number;
  ejercicios: Exercise[];
}

interface Props {
  sesionHoy: any | null;
  routinePreview: RoutineData | null;
  alumnoId: string;
}

/**
 * DashboardRoutinePreview (V2.0)
 * Consola de Preparación Resiliente con Instanciación JIT.
 */
export function DashboardRoutinePreview({ sesionHoy, routinePreview, alumnoId }: Props) {
  // Estado local para resiliencia y "Local-First"
  const [localSession, setLocalSession] = useState<any>(sesionHoy);
  const [isInstantiating, setIsInstantiating] = useState(false);
  const [pendingSync, setPendingSync] = useState<Set<string>>(new Set());

  // Mezclamos la data: Prioridad a la sesión real, fallback a la previsualización
  const activeRoutine = useMemo(() => {
    if (localSession) {
      return {
        nombre_dia: localSession.nombre_dia,
        numero_dia_plan: localSession.numero_dia_plan,
        ejercicios: localSession.sesion_ejercicios_instanciados.map((ej: any) => ({
          id: ej.id,
          ejercicio_plan_id: ej.ejercicio_plan_id,
          nombre: ej.biblioteca_ejercicios?.nombre || "Ejercicio",
          media_url: ej.biblioteca_ejercicios?.media_url,
          series_plan: ej.series_plan,
          reps_plan: ej.reps_plan,
          peso_plan: ej.peso_plan,
          descanso_seg: ej.descanso_seg,
          completado: ej.completado
        }))
      };
    }
    return routinePreview;
  }, [localSession, routinePreview]);

  if (!activeRoutine) {
    return (
      <section className="relative group overflow-hidden bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-12 shadow-2xl transition-all hover:border-fuchsia-500/20 flex flex-col items-center justify-center text-center">
        {/* Glow de Descanso (Fuchsia/Ambient) */}
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/[0.02] to-transparent pointer-events-none" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-fuchsia-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 space-y-8 max-w-xs">
          <div className="w-24 h-24 mx-auto bg-zinc-900 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center shadow-2xl rotate-3 group-hover:rotate-0 transition-all duration-700">
             <Coffee className="w-10 h-10 text-fuchsia-400" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
               {dashboardStrings.restDay.title}
            </h2>
            <p className="text-sm font-medium text-zinc-500 px-4 leading-relaxed">
               {dashboardStrings.restDay.description}
            </p>
          </div>

          <div className="pt-4">
             <a 
                href="/alumno/progreso" 
                className="inline-flex items-center gap-2 px-8 h-12 bg-zinc-900 border border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-white/10 transition-all active:scale-95"
             >
                <TrendingUp className="w-4 h-4 text-fuchsia-400" />
                {dashboardStrings.restDay.action}
             </a>
          </div>
        </div>

        {/* Technical HUD Details */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-12 opacity-10">
           <div className="text-[8px] font-bold text-white uppercase tracking-[0.3em]">Status: Recovery</div>
           <div className="text-[8px] font-bold text-white uppercase tracking-[0.3em]">Mode: Passive</div>
        </div>
      </section>
    );
  }

  const totalExercises = activeRoutine.ejercicios.length;
  const completedCount = activeRoutine.ejercicios.filter(e => e.completado).length;
  const progressPercent = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  /**
   * Manejador de Checkbox con Instanciación JIT
   */
  const handleToggleExercise = async (ej: Exercise) => {
    // 1. Optimistic Update (Local First)
    const newStatus = !ej.completado;
    
    // Si ya hay sesión, actualizamos localmente
    if (localSession) {
        const updatedEjs = localSession.sesion_ejercicios_instanciados.map((e: any) => 
            e.id === ej.id ? { ...e, completado: newStatus } : e
        );
        setLocalSession({ ...localSession, sesion_ejercicios_instanciados: updatedEjs });
    } else {
        // Si no hay sesión, marcamos tempranamente en el preview para feedback instantáneo
        // (Aunque el preview no se actualiza vía state directamente aquí, lo manejará el sync)
        setPendingSync(prev => new Set(prev).add(ej.ejercicio_plan_id));
    }

    try {
      let currentSesionId = localSession?.id;

      // 2. Instanciación JIT si es necesaria
      if (!currentSesionId) {
        setIsInstantiating(true);
        const { data: instRes, error: instErr } = await actions.alumno.instanciarSesion({ 
            alumno_id: alumnoId 
        });
        
        if (instErr || !instRes?.success) throw new Error("Fallo al instanciar sesión");
        
        const nuevaSesion = instRes.data.sesion;
        currentSesionId = nuevaSesion.id;
        
        // Actualizamos estado local con la sesión real
        setLocalSession(nuevaSesion);
        
        // Encontrar el equivalente del ejercicio en la nueva sesión
        const newEj = nuevaSesion.sesion_ejercicios_instanciados.find(
            (e: any) => e.ejercicio_plan_id === ej.ejercicio_plan_id
        );
        if (newEj) {
            await actions.alumno.logEjercicioInstanciado({
                sesion_ejercicio_id: newEj.id,
                completado: newStatus
            });
        }
        setIsInstantiating(false);
      } else {
        // Sesión ya existe, solo logueamos el cambio
        const { error: logErr } = await actions.alumno.logEjercicioInstanciado({
            sesion_ejercicio_id: ej.id!,
            completado: newStatus
        });
        if (logErr) throw logErr;
      }
    } catch (err) {
      console.error("Sync Error:", err);
      toast.error("Error de sincronización. Reintentando...");
      // Revertir optimismo si falla críticamente (Opcional, mejor reintentar)
    } finally {
        setPendingSync(prev => {
            const next = new Set(prev);
            next.delete(ej.ejercicio_plan_id);
            return next;
        });
    }
  };

  return (
    <section className="relative group overflow-hidden bg-zinc-950 border border-zinc-900 rounded-[2.5rem] p-6 shadow-2xl transition-all hover:border-lime-500/20">
      {/* GLOW DE FONDO */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-400/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-lime-400/10 transition-all duration-700"></div>

      {/* HEADER DE CONSOLA */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lime-400 font-black text-xl shadow-lg rotate-3 group-hover:rotate-0 transition-transform">
           {activeRoutine.nombre_dia.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase truncate leading-none mb-1">
             {activeRoutine.nombre_dia}
          </h2>
          <div className="flex items-center gap-2">
            <TechnicalLabel className="text-[9px] text-zinc-500">
                {completedCount} DE {totalExercises} COMPLETADOS
            </TechnicalLabel>
            <div className="flex-1 h-1 bg-zinc-900 rounded-full max-w-[100px] overflow-hidden">
                <div 
                    className="h-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.5)] transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                />
            </div>
          </div>
        </div>
        {!localSession && !isInstantiating && (
            <div className="bg-zinc-900/50 border border-white/5 px-3 py-1 rounded-full">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Preview</span>
            </div>
        )}
        {isInstantiating && <Loader2 className="w-4 h-4 text-lime-400 animate-spin" />}
      </div>

      {/* LISTA DE EJERCICIOS (REFERENCE SYNC) */}
      <div className="space-y-3 relative">
         {activeRoutine.ejercicios.map((ej, idx) => {
            const isSyncing = pendingSync.has(ej.ejercicio_plan_id);
            
            return (
                <div key={ej.ejercicio_plan_id} className={cn(
                    "relative p-4 rounded-3xl border transition-all duration-300 group/item overflow-hidden",
                    ej.completado 
                        ? "bg-zinc-900/20 border-zinc-900/50 opacity-60" 
                        : "bg-zinc-900/40 border-white/5 hover:border-white/10"
                )}>
                    {/* ACCENT BAR */}
                    {ej.completado && <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-400" />}

                    <div className="flex items-start gap-4">
                        {/* CHECKBOX INDUSTRIAL */}
                        <button 
                            onClick={() => handleToggleExercise(ej)}
                            disabled={isSyncing}
                            className={cn(
                                "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                                ej.completado 
                                    ? "bg-lime-400 border-lime-400 text-black scale-110 shadow-[0_0_12px_rgba(163,230,53,0.3)]" 
                                    : "border-zinc-700 hover:border-lime-400/50"
                            )}
                        >
                            {isSyncing ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                                ej.completado ? <CheckCircle2 className="w-4 h-4 stroke-[3px]" /> : <Circle className="w-3 h-3 opacity-20" />
                            )}
                        </button>

                        <div className="flex-1 min-w-0">
                            <h3 className={cn(
                                "text-sm font-black tracking-tight uppercase mb-2",
                                ej.completado ? "text-zinc-600 line-through" : "text-white"
                            )}>
                                {ej.nombre}
                            </h3>

                            {/* BADGES TÉCNICOS */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-white/5">
                                    <Repeat className="w-2.5 h-2.5 text-blue-400" />
                                    <span className="text-[10px] font-bold text-zinc-300">{ej.series_plan} S</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-white/5">
                                    <Target className="w-2.5 h-2.5 text-lime-400" />
                                    <span className="text-[10px] font-bold text-zinc-300">{ej.reps_plan} R</span>
                                </div>
                                <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-white/5">
                                    <Clock className="w-2.5 h-2.5 text-orange-400" />
                                    <span className="text-[10px] font-bold text-zinc-300">{ej.descanso_seg}s</span>
                                </div>
                                {ej.peso_plan && (
                                    <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2 py-0.5 rounded-lg border border-white/5">
                                        <Zap className="w-2.5 h-2.5 text-amber-400" />
                                        <span className="text-[10px] font-bold text-zinc-300">{ej.peso_plan}kg</span>
                                    </div>
                                )}
                            </div>

                            {/* ACCIONES DE DETALLE (INDUSTRIAL) */}
                            {!ej.completado && (
                                <div className="flex items-center gap-4 pt-1 opacity-40 group-hover/item:opacity-100 transition-opacity">
                                    {ej.media_url && (
                                        <>
                                            <button className="flex items-center gap-1.5 hover:text-lime-400 transition-colors">
                                                <PlayCircle className="w-3 h-3" />
                                                <span className="text-[7px] font-bold uppercase tracking-widest">Video</span>
                                            </button>
                                            <button className="flex items-center gap-1.5 hover:text-lime-400 transition-colors">
                                                <ImageIcon className="w-3 h-3" />
                                                <span className="text-[7px] font-bold uppercase tracking-widest">Media</span>
                                            </button>
                                        </>
                                    )}
                                    <button className="flex items-center gap-1.5 hover:text-lime-400 transition-colors">
                                        <Info className="w-3 h-3" />
                                        <span className="text-[7px] font-bold uppercase tracking-widest">Técnica</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            );
         })}
      </div>

      {/* ACTION FOOTER */}
      <div className="mt-8">
        <a 
            href="/alumno/sesion/hoy" 
            className={cn(
                "flex items-center justify-center gap-3 w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.2em] text-[11px] transition-all active:scale-95 shadow-xl bg-zinc-900 border border-white/5 text-zinc-400 hover:text-lime-400 hover:border-lime-500/30 group/btn"
            )}
        >
            <Zap className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
            {localSession ? "Continuar entrenamiento" : "Comenzar entrenamiento"}
        </a>
      </div>
    </section>
  );
}

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Zap, Target, ArrowLeft } from 'lucide-react';
import { TechnicalLabel } from '@/components/atoms/alumno/TechnicalLabel';
import { cn } from '@/lib/utils';
import { sesionStrings } from '@/data/es/alumno/sesion';

interface SessionDashboardHeaderProps {
  alumno: {
    nombre: string;
    id: string;
    planName: string;
    dias_asistencia: string[];
    turno?: {
      nombre: string;
      hora_inicio: string;
      hora_fin: string;
    } | null;
  };
  semanaActual: number;
  nombreDia: string;
  diaPlan: number;
}

/**
 * SessionDashboardHeader: HUD de alto rendimiento para el atleta.
 * Estética industrial, métricas rápidas y agenda de entrenamiento.
 */
export function SessionDashboardHeader({ alumno, semanaActual, nombreDia, diaPlan }: SessionDashboardHeaderProps) {
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Spacer para evitar saltos de layout cuando el header se vuelve sticky */}
      <div className={cn("transition-all duration-300", isSticky ? "h-20" : "h-0")} />

      <header className={cn(
        "z-[60] transition-all duration-500",
        isSticky 
          ? "fixed top-0 left-0 right-0 px-4 py-2 bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl" 
          : "relative p-4 md:p-8"
      )}>
        <div className={cn(
          "max-w-xl mx-auto flex items-center justify-between gap-4 transition-all duration-300",
          isSticky ? "h-16" : "flex-col md:flex-row items-start md:items-center"
        )}>
          
          {/* Identity Group */}
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className={cn(
              "rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center font-black text-lime-400 italic shadow-xl transition-all",
              isSticky ? "w-10 h-10 text-sm" : "w-16 h-16 text-2xl rotate-3"
            )}>
              {alumno.nombre.substring(0, 2).toUpperCase()}
            </div>
            
            <div className="flex-1 min-w-0">
               <div className="flex items-center gap-2">
                 <h1 className={cn(
                    "font-black tracking-tighter text-white uppercase truncate italic",
                    isSticky ? "text-base" : "text-3xl"
                  )}>
                    {alumno.nombre}
                  </h1>
                  {isSticky && (
                    <div className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-lg bg-zinc-900 border border-white/5 shrink-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                        <span className="text-[8px] font-black text-lime-400 tracking-widest uppercase italic">Live</span>
                    </div>
                  )}
               </div>
               
               {!isSticky && (
                 <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[8px] font-black uppercase tracking-widest text-lime-400 bg-lime-400/10 px-2 py-0.5 rounded border border-lime-400/20 italic">
                      {alumno.planName}
                    </span>
                    <TechnicalLabel className="text-zinc-600">#{alumno.id.split('-')[0]}</TechnicalLabel>
                 </div>
               )}
            </div>
          </div>

          {/* HUD Metrics (Only if not sticky) */}
          {!isSticky && (
            <div className="grid grid-cols-2 gap-3 w-full animate-in slide-in-from-top-4 duration-700 delay-200 mt-4 md:mt-0">
               {/* Agenda (Días y Turno) */}
               <div className="bg-zinc-900/40 p-4 rounded-3xl border border-white/5 flex items-start gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <TechnicalLabel className="text-zinc-600 block leading-none lowercase">Agenda semanal</TechnicalLabel>
                    <p className="text-[10px] font-black text-white uppercase tracking-tighter italic">
                      {alumno.dias_asistencia.map(d => d.substring(0, 2)).join(" - ")}
                    </p>
                    {alumno.turno && (
                      <p className="text-[9px] font-bold text-zinc-500 flex items-center gap-1 uppercase tracking-widest leading-none">
                        <Clock className="w-3 h-3" />
                         {alumno.turno.hora_inicio.slice(0, 5)}hs
                      </p>
                    )}
                  </div>
               </div>

               {/* Progreso de la Sesión */}
               <div className="bg-zinc-900/40 p-4 rounded-3xl border border-white/5 flex items-start gap-3 backdrop-blur-md">
                  <div className="w-8 h-8 rounded-xl bg-lime-400 text-zinc-950 flex items-center justify-center">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="space-y-1">
                    <TechnicalLabel className="text-zinc-600 block leading-none lowercase">Progreso día {diaPlan}</TechnicalLabel>
                    <h2 className="text-[11px] font-black text-white uppercase italic leading-none truncate max-w-[100px]">
                      {nombreDia}
                    </h2>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] font-black text-lime-400 uppercase tracking-widest italic">{sesionStrings.header.week} {semanaActual}</span>
                    </div>
                  </div>
               </div>
            </div>
          )}

          {/* Mini Stats (Sticky only) */}
          {isSticky && (
            <div className="flex items-center gap-4">
                <div className="text-right">
                  <TechnicalLabel className="text-zinc-600 block leading-none">Día {diaPlan}</TechnicalLabel>
                  <p className="text-[10px] font-black text-white uppercase tracking-tighter italic truncate max-w-[100px]">
                    {nombreDia}
                  </p>
                </div>
            </div>
          )}

        </div>
      </header>
    </>
  );
}

import React from "react";
import { Activity, Edit2 } from "lucide-react";
import { perfilCopy } from "@/data/es/alumno/perfil";

interface FitnessDataProps {
  alumno: {
    peso_actual: number | null;
    altura_cm: number | null;
    objetivo_principal: string | null;
    nivel_experiencia: string | null;
    profesion: string | null;
    lesiones: string | null;
    frecuencia_semanal?: number | null;
    dias_asistencia?: string[] | null;
    turno?: {
      nombre: string;
      hora_inicio: string;
      hora_fin: string;
    } | null;
    planes?: { frecuencia_semanal: number } | null;
  };
  onEdit: () => void;
}

export function FitnessDataCard({ alumno, onEdit }: FitnessDataProps) {
  const getDayLabels = () => {
    if (!alumno.dias_asistencia || alumno.dias_asistencia.length === 0) return perfilCopy.personalData.unspecified;
    return alumno.dias_asistencia
      .map(id => perfilCopy.fitnessData.dayNames.find(d => d.id === id)?.label.substring(0, 3))
      .filter(Boolean)
      .join(", ");
  };

  return (
    <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-6 backdrop-blur-sm w-full">
      <div className="flex items-center justify-between mb-8 px-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-lime-400">
            <Activity className="w-5 h-5" />
          </div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/80">{perfilCopy.fitnessData.title}</h3>
        </div>
        <button onClick={onEdit} className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
          <Edit2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="p-5 bg-zinc-950/40 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{perfilCopy.fitnessData.height}</span>
          <span className="text-xl font-black text-white">{alumno.altura_cm ? `${alumno.altura_cm}` : '-'}</span>
        </div>
        <div className="p-5 bg-zinc-950/40 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center text-center">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-2">{perfilCopy.fitnessData.weight}</span>
          <span className="text-xl font-black text-lime-400">{alumno.peso_actual ? `${alumno.peso_actual}` : '-'}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col p-5 bg-zinc-950/40 rounded-3xl border border-white/5 gap-1.5">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.objective}</span>
          <span className="text-sm font-bold text-white uppercase tracking-tight">{alumno.objetivo_principal || perfilCopy.personalData.unspecified}</span>
        </div>

        <div className="flex flex-col p-5 bg-zinc-950/40 rounded-3xl border border-white/5 gap-1.5">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.experience}</span>
          <span className="text-sm font-bold text-white uppercase tracking-tight">{alumno.nivel_experiencia || perfilCopy.personalData.unspecified}</span>
        </div>

        <div className="flex flex-col p-5 bg-zinc-950/40 rounded-3xl border border-white/5 gap-2">
            <div className="flex justify-between items-center">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.shift}</span>
                <span className="text-xs font-black text-lime-400" suppressHydrationWarning>{alumno.turno?.nombre || perfilCopy.fitnessData.noShift}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="flex flex-col">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.frequency}</span>
                    <span className="text-[7px] font-bold text-zinc-600 uppercase">Sujeto a planificación</span>
                </span>
                <span className="text-xs font-black text-white" suppressHydrationWarning>{alumno.planes?.frecuencia_semanal || alumno.frecuencia_semanal || '-'} días</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-white/5">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.days}</span>
                <span className="text-xs font-bold text-white/60" suppressHydrationWarning>{getDayLabels()}</span>
            </div>
        </div>

        <div className="flex flex-col p-5 bg-zinc-950/40 rounded-3xl border border-white/5 gap-1.5">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{perfilCopy.fitnessData.profession}</span>
          <span className="text-sm font-bold text-white/70">{alumno.profesion || perfilCopy.personalData.unspecified}</span>
        </div>

        <div className="flex flex-col p-5 bg-zinc-950/40 rounded-3xl border border-white/5 gap-2">
          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest leading-none">{perfilCopy.fitnessData.lesions}</span>
          <p className="text-xs font-bold text-amber-500/80 leading-relaxed uppercase tracking-tighter">
            {alumno.lesiones || 'Ninguna registrada'}
          </p>
        </div>
      </div>
    </div>
  );
}

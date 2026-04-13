import React from "react";
import { User, Mail, Phone, CalendarDays, Edit2, MapPin } from "lucide-react";
import { perfilCopy } from "@/data/es/alumno/perfil";

interface PersonalDataProps {
  alumno: {
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_nacimiento: string | null;
    genero?: string | null;
    gym_nombre?: string | null;
  };
  onEdit: () => void;
}

export function PersonalDataCard({ alumno, onEdit }: PersonalDataProps) {
  // Iniciales del nombre
  const initals = alumno.nombre
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  // Calcular edad
  const calcAge = (dob: string | null) => {
    if (!dob) return perfilCopy.personalData.unspecified;
    const diff = Date.now() - new Date(dob).getTime();
    return Math.abs(new Date(diff).getUTCFullYear() - 1970).toString();
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header Avatar Grande */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 flex flex-col items-center justify-center relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-fuchsia-500/10 rounded-full blur-[60px] pointer-events-none"></div>
        <div className="w-24 h-24 bg-fuchsia-500 rounded-full flex items-center justify-center text-4xl font-black text-white shadow-[0_0_30px_rgba(217,70,239,0.3)] mb-4 relative z-10">
          {initals}
          <button 
            onClick={onEdit} 
            className="absolute bottom-0 right-0 w-8 h-8 bg-zinc-800 border-2 border-zinc-900 rounded-full flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
            aria-label={perfilCopy.personalData.editAriaLabel}
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>
        <h2 className="text-3xl font-black tracking-tighter text-white mb-1 relative z-10 text-center uppercase">
          {alumno.nombre}
        </h2>
        <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">
          <MapPin className="w-3 h-3 text-fuchsia-400" /> {alumno.gym_nombre || "Atleta independiente"}
        </div>
      </div>

      {/* Tarjeta de Lista Industrial */}
      <div className="bg-zinc-900/40 border border-zinc-800 rounded-[2.5rem] p-6 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-8 px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-fuchsia-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/80">{perfilCopy.personalData.title}</h3>
          </div>
          <button onClick={onEdit} className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-white transition-colors">
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center p-5 bg-zinc-950/40 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{perfilCopy.personalData.username}</span>
            </div>
            <span className="text-sm font-bold text-white leading-none">{alumno.nombre}</span>
          </div>

          <div className="flex justify-between items-center p-5 bg-zinc-950/40 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{perfilCopy.personalData.age}</span>
            </div>
            <span className="text-sm font-bold text-white leading-none" suppressHydrationWarning>{calcAge(alumno.fecha_nacimiento)} años</span>
          </div>

          <div className="flex justify-between items-center p-5 bg-zinc-950/40 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{perfilCopy.personalData.gender}</span>
            </div>
            <span className="text-sm font-bold text-white leading-none">{alumno.genero || perfilCopy.personalData.unspecified}</span>
          </div>

          <div className="flex justify-between items-center p-5 bg-zinc-950/40 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{perfilCopy.personalData.email}</span>
            </div>
            <span className="text-sm font-bold text-zinc-400 max-w-[180px] truncate leading-none">{alumno.email || perfilCopy.personalData.unavailable}</span>
          </div>

          <div className="flex justify-between items-center p-5 bg-zinc-950/40 rounded-3xl border border-white/5">
            <div className="flex items-center gap-3 text-zinc-500">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{perfilCopy.personalData.phone}</span>
            </div>
            <span className="text-sm font-bold text-zinc-400 leading-none">{alumno.telefono || perfilCopy.personalData.unavailable}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

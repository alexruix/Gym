import React from "react";
import { Dumbbell, User, Mail, Phone, CalendarDays, MessageCircle } from "lucide-react";
import { perfilCopy } from "@/data/es/alumno/perfil";
import { formatFechaHumana } from "@/lib/schedule";

interface TeacherContactProps {
  profesor: {
    nombre: string;
    telefono: string | null;
    email: string | null;
  } | null;
  fechaInicio: string | null;
}

export function TeacherContactCard({ profesor, fechaInicio }: TeacherContactProps) {
  if (!profesor) return null;

  const phoneStripped = profesor.telefono ? profesor.telefono.replace(/\D/g, "") : "";
  const waUrl = phoneStripped ? `https://wa.me/${phoneStripped}?text=Hola profe!` : "#";

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="bg-zinc-900 border border-zinc-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-lime-400/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-lime-400/10 transition-all duration-700"></div>
        
        <div className="flex items-center gap-3 text-lime-400 mb-8 px-1">
          <div className="w-10 h-10 rounded-2xl bg-zinc-950 border border-white/5 flex items-center justify-center text-lime-400">
            <Dumbbell className="w-5 h-5" />
          </div>
          <h3 className="font-black text-xs uppercase tracking-[0.2em]">{perfilCopy.teacherData.title}</h3>
        </div>

        <div className="flex items-center gap-5 mb-10 px-1">
          <div className="w-20 h-20 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center text-3xl font-black text-white shadow-xl flex-shrink-0 relative">
            <User className="w-10 h-10 text-zinc-700" />
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-lime-500 rounded-full border-4 border-zinc-900 flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <h3 className="text-2xl font-black text-white leading-none tracking-tighter uppercase">
              {profesor.nombre}
            </h3>
            <div className="flex">
                <span className="px-3 py-1 bg-lime-400/10 border border-lime-400/20 text-lime-400 text-[9px] font-black uppercase tracking-[0.2em] rounded-lg">
                  Entrenador Personal
                </span>
            </div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          {profesor.email && (
            <div className="flex items-center justify-between p-5 bg-zinc-950/40 rounded-3xl border border-white/5 group/link">
              <div className="flex items-center gap-3 text-zinc-500">
                <Mail className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Email</span>
              </div>
              <span className="text-sm font-bold text-white leading-none truncate max-w-[180px]">{profesor.email}</span>
            </div>
          )}

          {profesor.telefono && (
            <div className="flex items-center justify-between p-5 bg-zinc-950/40 rounded-3xl border border-white/5 group/link">
               <div className="flex items-center gap-3 text-zinc-500">
                <Phone className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest leading-none">Teléfono</span>
              </div>
              <span className="text-sm font-bold text-white leading-none">{profesor.telefono}</span>
            </div>
          )}
        </div>

        <a 
          href={waUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-4 w-full bg-[#25D366] hover:scale-[1.02] active:scale-[0.98] text-black font-black text-xs uppercase tracking-[0.2em] py-5 rounded-3xl transition-all shadow-[0_15px_30px_rgba(37,211,102,0.2)]"
        >
          <MessageCircle className="w-5 h-5 fill-black" />
          {perfilCopy.teacherData.whatsappAction}
        </a>
      </div>

      {fechaInicio && (
        <div className="flex items-center justify-center gap-3 text-zinc-500 bg-zinc-900 border border-white/5 rounded-full py-4 px-8 w-fit mx-auto relative overflow-hidden group/since">
          <CalendarDays className="w-4 h-4 text-zinc-600 transition-colors group-hover/since:text-lime-400" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">
            {perfilCopy.teacherData.memberSince} <span className="text-white" suppressHydrationWarning>{formatFechaHumana(new Date(fechaInicio))}</span>
          </span>
        </div>
      )}
    </div>
  );
}

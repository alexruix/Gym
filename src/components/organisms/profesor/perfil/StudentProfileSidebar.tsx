import React from "react";
import { AlertTriangle, User, Mail, Phone, Calendar, CreditCard } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  notasCriticas?: string | null;
  alumno: {
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
  };
}

export function StudentProfileSidebar({ notasCriticas, alumno }: Props) {
  const { sidebar } = athleteProfileCopy;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric"
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex flex-col gap-6 sticky top-24 h-fit pb-12">
      
      {/* 1. NOTAS CRÍTICAS (STICKY NOTE) */}
      <div className="relative overflow-hidden bg-amber-400 dark:bg-amber-500 group rounded-3xl p-6 shadow-sm border border-amber-300 dark:border-amber-600 transition-all hover:-translate-y-1">
        <div className="flex items-start gap-4">
          <div className="bg-zinc-950 p-2.5 rounded-xl shadow-lg shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-950/50">
              {sidebar.criticalNotes.label}
            </p>
            <p className="text-sm font-bold text-zinc-950 leading-tight">
              {notasCriticas || sidebar.criticalNotes.empty}
            </p>
          </div>
        </div>
      </div>

      {/* 2. INFORMACIÓN DEL ALUMNO */}
      <div className="bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
             <User className="w-4 h-4 text-zinc-400" aria-hidden="true" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
             {sidebar.info.label}
           </p>
        </div>
        
        <div className="space-y-5">
           {/* Email */}
           <div className="flex items-center gap-4">
             <div className="w-8 shrink-0 flex justify-center">
               <Mail className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div>
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.email}</p>
               <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 truncate max-w-[180px]">
                 {alumno.email || sidebar.info.emptyEmail}
               </p>
             </div>
           </div>

           {/* Teléfono y Botón de WhatsApp */}
           <div className="flex items-center gap-4">
             <div className="w-8 shrink-0 flex justify-center">
               <Phone className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div className="flex-1">
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.phone}</p>
               {alumno.telefono ? (
                 <a 
                   href={`https://wa.me/549${alumno.telefono.replace(/\D/g, "")}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-sm font-bold text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:text-lime-300 underline underline-offset-2 transition-colors inline-block truncate max-w-[180px]"
                   title={sidebar.info.contactWhatsApp}
                 >
                   {alumno.telefono}
                 </a>
               ) : (
                 <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 truncate">
                   {sidebar.info.emptyPhone}
                 </p>
               )}
             </div>
           </div>

           {/* Fecha de Inicio */}
           <div className="flex items-center gap-4">
             <div className="w-8 shrink-0 flex justify-center">
               <Calendar className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div>
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.startDate}</p>
               <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                 {formatDate(alumno.fecha_inicio)}
               </p>
             </div>
           </div>

           {/* Día de Pago */}
           <div className="flex items-center gap-4">
             <div className="w-8 shrink-0 flex justify-center">
               <CreditCard className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div>
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.payDay}</p>
               <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                 Día {alumno.dia_pago} de cada mes
               </p>
             </div>
           </div>
        </div>

      </div>
    </div>
  );
}

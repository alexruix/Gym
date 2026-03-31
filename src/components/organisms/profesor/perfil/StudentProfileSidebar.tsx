import React from "react";
import { AlertTriangle, User, Mail, Phone, Calendar, CreditCard, Activity, Pencil } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  notasCriticas?: string | null;
  alumno: {
    id: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    notas?: string | null;
  };
}

export function StudentProfileSidebar({ alumno }: Props) {
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
    <div className="space-y-6 pb-12">
      {/* 2. INFORMACIÓN DEL ALUMNO */}
      <div className="space-y-8">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-zinc-50 dark:bg-zinc-900 rounded-lg border border-zinc-100 dark:border-zinc-800">
             <User className="w-4 h-4 text-zinc-400" aria-hidden="true" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
             {sidebar.info.label}
           </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Email */}
           <div className="flex items-center gap-4">
             <div className="shrink-0 flex justify-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
               <Mail className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div>
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.email}</p>
               <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100 truncate max-w-[250px]">
                 {alumno.email || sidebar.info.emptyEmail}
               </p>
             </div>
           </div>

           {/* Teléfono y Botón de WhatsApp */}
           <div className="flex items-center gap-4">
             <div className="shrink-0 flex justify-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
               <Phone className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div className="flex-1">
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.phone}</p>
               {alumno.telefono ? (
                 <a 
                   href={`https://wa.me/549${alumno.telefono.replace(/\D/g, "")}`} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="text-sm font-black text-lime-600 hover:text-lime-700 dark:text-lime-400 dark:hover:text-lime-300 underline underline-offset-2 transition-colors inline-block truncate"
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
             <div className="shrink-0 flex justify-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
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
             <div className="shrink-0 flex justify-center p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
               <CreditCard className="w-4 h-4 text-zinc-400" aria-hidden="true" />
             </div>
             <div>
               <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">{sidebar.info.payDay}</p>
               <p className="text-sm font-bold text-zinc-950 dark:text-zinc-100">
                 Día {alumno.dia_pago || 15} de cada mes
               </p>
             </div>
           </div>
        </div>

        {/* Notas Médicas (Health) */}
        <div className="pt-8 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
           <div className="flex items-center gap-3">
             <Activity className="w-4 h-4 text-lime-500" />
             <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Notas Médicas y Salud</p>
           </div>
           {alumno.notas ? (
             <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-2xl border border-zinc-100 dark:border-zinc-800">
               <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed italic">
                 "{alumno.notas}"
               </p>
             </div>
           ) : (
             <p className="text-xs text-zinc-400 italic px-1">Sin observaciones médicas registradas.</p>
           )}
        </div>

        {/* Action Button */}
        <div className="pt-4">
          <a 
            href={`/profesor/alumnos/${alumno.id}/edit`}
            className="flex items-center justify-center gap-2 w-full py-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98]"
          >
            <Pencil className="w-4 h-4" />
            Editar Información
          </a>
        </div>
      </div>
    </div>
  );
}

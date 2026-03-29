import React from "react";
import { MessageCircle, Link, CreditCard, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/atoms/profesor/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface Props {
  alumno: {
    id: string;
    nombre: string;
    email: string;
    estado: 'activo' | 'moroso' | 'inactivo';
    telefono?: string;
  };
  planName?: string | null;
}

export function AthleteHeader({ alumno, planName }: Props) {
  const { header } = athleteProfileCopy;

  const copyMagicLink = () => {
    // Implementación futura del link real
    const link = `${window.location.origin}/login?magic=sample`;
    navigator.clipboard.writeText(link);
    toast.success(header.actions.linkCopied);
  };

  const openWhatsApp = () => {
    if (!alumno.telefono) {
      toast.error(header.actions.noPhone);
      return;
    }
    const cleanTel = alumno.telefono.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanTel}`, "_blank");
  };

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm transition-all hover:shadow-md group">
      {/* Background Decorative Grid (Industrial) */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* 1. SECCIÓN IDENTIDAD */}
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative group/avatar">
            <div className={`w-24 h-24 rounded-2xl bg-zinc-950 flex items-center justify-center text-3xl font-black text-lime-400 shadow-xl group-hover/avatar:scale-105 transition-transform duration-500`}>
              {alumno.nombre.substring(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-2 -right-2">
               <StatusBadge status={alumno.estado} size="lg" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase leading-none">
              {alumno.nombre}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 bg-zinc-100 dark:bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-700/50 flex items-center gap-1.5">
                {planName || header.status.noPlan}
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </span>
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-white/5 px-3 py-1 rounded-full border border-zinc-100 dark:border-white/5">
                {alumno.email}
              </span>
            </div>
          </div>
        </div>

        {/* 2. ACCIONES DE RAYO */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full md:w-auto">
          <Button 
            variant="outline" 
            onClick={openWhatsApp}
            className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-2xl font-black gap-2 px-6 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-[10px]"
          >
            <MessageCircle className="w-5 h-5 text-lime-500" aria-hidden="true" />
            {header.actions.whatsapp}
          </Button>
          
          <Button 
            variant="outline"
            onClick={copyMagicLink}
            className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-2xl font-black gap-2 px-6 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-[10px]"
          >
            <Link className="w-5 h-5 text-zinc-400" aria-hidden="true" />
            {header.actions.copyLink}
          </Button>

          <Button 
            className="flex-1 md:flex-none h-14 bg-lime-400 text-zinc-950 hover:bg-lime-500 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 px-8 transition-all active:scale-95 shadow-lg shadow-lime-500/20"
          >
            <CreditCard className="w-5 h-5" aria-hidden="true" />
            {header.actions.registerPayment}
          </Button>
        </div>

      </div>
    </div>
  );
}


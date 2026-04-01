import React from "react";
import { actions } from "astro:actions";
import { MessageCircle, Link, CreditCard, ExternalLink } from "lucide-react";
import { StatusBadge } from "@/components/atoms/profesor/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Copy } from "lucide-react";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { copyToClipboard } from "@/lib/utils";

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

  const copyGuestLink = async () => {
    const promise = (async () => {
      const { data, error } = await actions.profesor.getStudentGuestLink({ id: alumno.id });
      if (error) throw new Error("Error de conexión");
      if (!data?.link) throw new Error("Link no generado");
      
      const copied = await copyToClipboard(data.link);
      if (!copied) throw new Error("Error al copiar");

      await new Promise(resolve => setTimeout(resolve, 600));
      return { name: alumno.nombre };
    })();

    toast.promise(promise, {
      loading: `GENERANDO ACCESO PERMANENTE...`,
      success: "¡LINK DE INVITADO LISTO!",
      error: (err) => `FALLÓ LA GENERACIÓN: ${err.message}`,
    });
  };

  const regenerateGuestLink = async () => {
    if (!confirm("¿Estás seguro? El link anterior dejará de funcionar permanentemente.")) return;
    
    const promise = (async () => {
      const { data, error } = await actions.profesor.regenerateStudentGuestLink({ id: alumno.id });
      if (error) throw new Error("Error en servidor");
      if (!data?.link) throw new Error("Link no regenerado");
      
      await copyToClipboard(data.link);
      await new Promise(resolve => setTimeout(resolve, 800));
      return { name: alumno.nombre };
    })();

    toast.promise(promise, {
      loading: `REGENERANDO LLAVES MAESTRAS...`,
      success: "ACCESO REESTABLECIDO CORRECTAMENTE",
      error: (err) => `FALLÓ LA REGENERACIÓN: ${err.message}`,
    });
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
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline"
                className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-2xl font-black gap-2 px-6 transition-all active:scale-95 shadow-sm uppercase tracking-widest text-[10px]"
              >
                <Link className="w-5 h-5 text-zinc-400" aria-hidden="true" />
                {header.actions.copyLink}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 shadow-2xl">
              <DropdownMenuItem onClick={copyGuestLink} className="rounded-xl py-3 font-bold text-[10px] uppercase tracking-widest gap-3 cursor-pointer">
                <Copy className="w-4 h-4 text-zinc-400" />
                Copiar Link Actual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={regenerateGuestLink} className="rounded-xl py-3 font-bold text-[10px] uppercase tracking-widest gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 cursor-pointer">
                <RefreshCw className="w-4 h-4" />
                Regenerar Acceso
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

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


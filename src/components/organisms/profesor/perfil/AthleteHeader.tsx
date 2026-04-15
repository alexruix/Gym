import React, { useState } from "react";
import { CreditCard, MoreHorizontal, Pencil, ArrowLeft, Link } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

// Domain Components
import { StudentPaymentSheet } from "@/components/organisms/profesor/pagos/StudentPaymentSheet";
import { AthleteMetricsGrid } from "@/components/molecules/profesor/perfil/AthleteMetricsGrid";

// Hooks
import { useAthleteHeader } from "@/hooks/profesor/perfil/useAthleteHeader";
import { useStudentActions } from "@/hooks/useStudentActions";

interface Props {
  alumno: any;
  planName?: string | null;
}

/**
 * AthleteHeader: Cabecera optimizada (V2.1) del perfil de alumno.
 * Utiliza lógica de sticky y métricas externalizada para reducir el volumen del componente.
 */
export function AthleteHeader({ alumno, planName }: Props) {
  const { header } = athleteProfileCopy;
  const [isPaymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const { copyGuestLink, openWhatsApp } = useStudentActions();
  
  const { 
    isSticky, 
    headerHeight, 
    headerRef, 
    lastSessionText 
  } = useAthleteHeader(alumno, header);

  const currentStatus = alumno.pago_activo?.estado === 'pagado' ? 'pagado' : alumno.estado;

  return (
    <>
      {/* Spacer para el modo sticky */}
      <div 
        style={{ height: isSticky ? `${headerHeight}px` : "0px" }} 
        className="transition-all duration-300 pointer-events-none" 
      />

      <div 
        ref={headerRef}
        className={cn(
          "transition-all duration-300",
          isSticky 
            ? "fixed top-0 left-0 right-0 z-50 px-4 py-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 shadow-xl animate-in slide-in-from-top-4" 
            : "relative z-30"
        )}
      >
        <div className={cn(
          "max-w-7xl mx-auto flex items-center justify-between gap-4 transition-all duration-300",
          isSticky 
            ? "h-16" 
            : "bg-white dark:bg-zinc-950/40 border-b md:border border-zinc-200 dark:border-zinc-800 md:rounded-[2.5rem] p-4 md:p-10 flex-col md:flex-row shadow-2xl shadow-zinc-950/5"
        )}>
          
          {/* IDENTIDAD */}
          <div className="flex items-center gap-4 min-w-0">
            {isSticky && (
              <Button variant="ghost" size="icon" onClick={() => window.history.back()} className="rounded-full shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            
            <div className="relative shrink-0">
              <div className={cn(
                "rounded-2xl bg-zinc-950 flex items-center justify-center font-bold text-lime-400 border border-zinc-800 transition-all",
                isSticky ? "w-10 h-10 text-sm" : "w-14 h-14 md:w-20 md:h-20 text-xl md:text-3xl rotate-3"
              )}>
                {alumno.nombre.substring(0, 2).toUpperCase()}
              </div>
            </div>

            <div className="min-w-0">
              <h1 className={cn(
                "font-bold tracking-tight text-zinc-950 dark:text-white uppercase truncate",
                isSticky ? "text-base max-w-[120px] sm:max-w-none" : "text-xl md:text-4xl"
              )}>
                {alumno.nombre}
              </h1>
              {!isSticky && (
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <span className="text-[7.5px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-400/20 truncate">
                    {planName || "Sin plan"}
                  </span>
                </div>
              )}
              {isSticky && (
                 <div className="text-[10px] text-zinc-500 font-medium truncate flex items-center gap-2">
                    <span className={cn("w-1.5 h-1.5 rounded-full", currentStatus === 'activo' ? "bg-emerald-500" : "bg-red-500")} />
                    {lastSessionText}
                 </div>
              )}
            </div>
          </div>

          {/* MÉTRICAS Y TELEMETRÍA */}
          {!isSticky && (
            <AthleteMetricsGrid 
                alumno={alumno}
                lastSessionText={lastSessionText}
                headerCopy={header}
            />
          )}

          {/* ACCIONES RÁPIDAS */}
          <div className="flex items-center gap-2">
             <Button
                variant="heavy"
                size={isSticky ? "icon" : "default"}
                onClick={() => copyGuestLink(alumno.id)}
                className={cn(
                    "rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-3 shadow-sm transition-all active:scale-95",
                    isSticky ? "w-10 h-10 rounded-full" : "h-12 md:h-14 px-6"
                )}
             >
                <Link className={isSticky ? "w-5 h-5 text-zinc-400" : "w-4 h-4 md:w-5 md:h-5"} />
                {!isSticky && <span className="hidden sm:inline">Link acceso</span>}
             </Button>
             
             {!isSticky && (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl hover:bg-zinc-100 dark:hover:bg-zinc-900 border-none transition-colors">
                      <MoreHorizontal className="w-6 h-6 text-zinc-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                    <DropdownMenuItem onClick={() => setPaymentSheetOpen(true)} className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3 text-zinc-950 dark:text-zinc-100">
                      <CreditCard size={18} className="text-zinc-400" /> Cobrar cuota
                    </DropdownMenuItem>
                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1 mx-2" />
                    <DropdownMenuItem onClick={() => openWhatsApp(alumno.nombre, alumno.telefono || "", { type: 'general' })} className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3">
                      <WhatsappLogoIcon size={18} className="text-emerald-500" /> WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3">
                      <a href={`/profesor/alumnos/${alumno.id}/edit`} className="flex items-center gap-3 w-full">
                        <Pencil size={18} className="text-zinc-400" />
                        Editar perfil
                      </a>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
               </DropdownMenu>
             )}
          </div>
        </div>
      </div>

      <StudentPaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={setPaymentSheetOpen}
        alumno={{
          ...alumno,
          name: alumno.nombre,
          pago_activo: alumno.pago_activo,
          historial: alumno.historial_pagos || [],
          monto: alumno.monto ?? null,
          dia_pago: alumno.dia_pago || null,
          ultimo_recordatorio_pago_at: alumno.pago_activo?.ultimo_recordatorio_at || null,
          is_moroso: alumno.pago_activo?.estado === 'vencido',
          monto_personalizado: !!alumno.monto
        } as any}
      />
    </>
  );
}

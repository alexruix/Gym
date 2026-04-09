import React, { useMemo, useState, useEffect } from "react";
import { Zap, CreditCard, ExternalLink, Calendar, Clock, CreditCard as PaymentIcon, Copy, ChevronRight, Plus, Mail, Phone, ArrowLeft } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { StatusBadge, type StatusType } from "@/components/molecules/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";
import { cn } from "@/lib/utils";
import { SubscriptionBadge } from "@/components/atoms/SubscriptionBadge";
import { StudentPaymentSheet } from "@/components/organisms/profesor/pagos/StudentPaymentSheet";
import { useStudentActions } from "@/hooks/useStudentActions";

interface Props {
  alumno: {
    id: string;
    nombre: string;
    email: string;
    estado: string;
    telefono?: string;
    monto?: number | null;
    fecha_inicio?: string;
    dia_pago?: number;
    ultima_sesion?: string | null;
    pago_activo?: any;
    historial_pagos?: any[];
    suscripcion?: {
      nombre: string;
      cantidad_dias: number;
    } | null;
  };
  planName?: string | null;
}

export function AthleteHeader({ alumno, planName }: Props) {
  const { header } = athleteProfileCopy;
  const [isPaymentSheetOpen, setPaymentSheetOpen] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const { copyGuestLink, openWhatsApp } = useStudentActions();

  // Handle scroll for PWA sticky effect
  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const lastSessionText = useMemo(() => {
    if (!alumno.ultima_sesion) return header.metrics.never;
    const last = new Date(alumno.ultima_sesion);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - last.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return header.metrics.today;
    if (diffDays === 1) return header.metrics.yesterday;
    return header.metrics.daysAgo.replace("{n}", diffDays.toString());
  }, [alumno.ultima_sesion, header.metrics]);

  const currentStatus = alumno.pago_activo?.estado === 'pagado' ? 'pagado' : alumno.estado;

  return (
    <>
      {/* Spacer to prevent layout jump when header sticks */}
      <div className={cn("h-32 md:h-48 transition-all", isSticky ? "block" : "hidden")} />

      <div className={cn(
        "z-50 transition-all duration-500",
        isSticky 
          ? "fixed top-0 left-0 right-0 px-4 py-2 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-2xl border-b border-zinc-200 dark:border-zinc-800 shadow-xl" 
          : "relative"
      )}>
        <div className={cn(
          "max-w-7xl mx-auto flex items-center justify-between gap-4 transition-all duration-300",
          isSticky 
            ? "h-16" 
            : "bg-white dark:bg-zinc-950/40 border-b md:border border-zinc-200 dark:border-zinc-800 md:rounded-[2.5rem] p-4 md:p-10 flex-col md:flex-row shadow-2xl shadow-zinc-950/5"
        )}>
          
          {/* Identity & Nav Group */}
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
              {!isSticky && (
                <div className="absolute -bottom-1.5 -right-1.5 flex flex-col gap-1 items-end">
                  {/* <StatusBadge status={currentStatus as StatusType} /> */}
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className={cn(
                "font-bold tracking-tight text-zinc-950 dark:text-white uppercase truncate",
                isSticky ? "text-base" : "text-xl md:text-4xl"
              )}>
                {alumno.nombre}
              </h1>
              {!isSticky && (
                <div className="flex items-center gap-2 mt-0.5 sm:mt-1">
                  <span className="text-[7.5px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-500/10 px-1.5 py-0.5 rounded border border-lime-400/20 truncate">
                    {planName || "Sin plan"}
                  </span>
                  <span className="text-[7.5px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                    #{alumno.id.split('-')[0]}
                  </span>
                </div>
              )}
              {isSticky && (
                 <div className="text-[10px] text-zinc-500 font-medium truncate flex items-center gap-2">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      currentStatus === 'activo' ? "bg-emerald-500" : "bg-red-500"
                    )} />
                    {lastSessionText}
                 </div>
              )}
            </div>
          </div>

          {/* Quick Stats (Mobile Inline Telemetry) */}
          {!isSticky && (
            <div className="flex md:flex-row flex-col gap-3 w-full md:w-auto">
              <div className="flex items-center gap-4 sm:gap-8 bg-zinc-50 dark:bg-zinc-900/40 p-3 sm:p-6 rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-800">
                <div className="flex-1 sm:flex-none space-y-0.5 sm:space-y-1">
                   <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{header.metrics.payDay}</p>
                   <p className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                      <CreditCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-400" />
                      Día {alumno.dia_pago || 15}
                   </p>
                </div>
                <div className="h-6 sm:h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 sm:flex-none space-y-0.5 sm:space-y-1">
                   <p className="text-[7px] sm:text-[8px] font-bold text-zinc-400 uppercase tracking-[0.2em]">{header.metrics.lastSession}</p>
                   <p className={cn(
                     "text-xs sm:text-sm font-bold flex items-center gap-2",
                     lastSessionText.includes("hoy") || lastSessionText.includes("ayer") ? "text-emerald-500" : "text-zinc-950 dark:text-white"
                   )}>
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 opacity-40" />
                      {lastSessionText}
                   </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Group */}
          <div className="flex items-center gap-2">
             {isSticky ? (
               <Button
                variant="heavy"
                size="icon"
                onClick={() => setPaymentSheetOpen(true)}
                className="w-10 h-10 rounded-full"
               >
                 <PaymentIcon className="w-5 h-5" />
               </Button>
             ) : (
                <Button
                  onClick={() => setPaymentSheetOpen(true)}
                  className="h-12 md:h-14 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-90 rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-2 px-6 shadow-xl transition-all active:scale-95"
                >
                  <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Cobrar cuota</span>
                </Button>
             )}
             
             {!isSticky && (
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon" className="h-12 w-12 md:h-14 md:w-14 rounded-2xl border-2">
                      <Plus className="w-5 h-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl">
                    <DropdownMenuItem onClick={() => openWhatsApp(alumno.nombre, alumno.telefono || "", { type: 'general' })} className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3">
                      <WhatsappLogoIcon size={18} className="text-emerald-500" /> WhatsApp
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => copyGuestLink(alumno.id)} className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3">
                      <Copy size={18} className="text-zinc-400" /> Link Acceso
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="py-3 font-bold text-[10px] uppercase tracking-widest gap-3">
                      <a href={`/profesor/alumnos/${alumno.id}/edit`}>Editar Perfil</a>
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


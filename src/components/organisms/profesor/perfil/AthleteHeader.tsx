import React, { useMemo } from "react";
import { actions } from "astro:actions";
import { MessageCircle, Zap, CreditCard, ExternalLink, Calendar, Clock, CreditCard as PaymentIcon, RefreshCw, Copy, ChevronRight } from "lucide-react";
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
import { copyToClipboard, cn } from "@/lib/utils";
import { PlanMetric } from "@/components/atoms/profesor/planes/PlanMetric";

interface Props {
  alumno: {
    id: string;
    nombre: string;
    email: string;
    estado: string;
    telefono?: string;
    fecha_inicio?: string;
    dia_pago?: number;
    ultima_sesion?: string | null;
  };
  planName?: string | null;
}

/**
 * AthleteHeader: Consola de telemetrÃ­a para el perfil del alumno.
 * Prioriza datos accionables para el coaching (Ãšltima sesiÃ³n) y KPIs administrativos (Pago).
 */
export function AthleteHeader({ alumno, planName }: Props) {
  const { header, sidebar } = athleteProfileCopy;

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

  const startDateText = useMemo(() => {
    if (!alumno.fecha_inicio) return "â€”";
    return new Date(alumno.fecha_inicio).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "2-digit"
    });
  }, [alumno.fecha_inicio]);

  const copyGuestLink = async () => {
    toast.loading("GENERANDO ACCESO...");
    try {
      const { data, error } = await actions.profesor.getStudentGuestLink({ id: alumno.id });
      if (error || !data?.link) throw new Error("Error de conexiÃ³n");
      await copyToClipboard(data.link);
      toast.dismiss();
      toast.success("Â¡LINK DE ACCESO COPIADO!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(`FALLÃ“: ${err.message}`);
    }
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
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl shadow-zinc-950/5 group">
      {/* Visual Accent Layer */}
      <div className="h-2 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 dark:from-lime-400/20 dark:to-emerald-500/10" />

      <div className="p-8 md:p-10 space-y-10 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          
          {/* Identity Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-zinc-950 flex items-center justify-center text-3xl font-black text-lime-400 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 border border-zinc-800">
                {alumno.nombre.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2">
                 <StatusBadge status={alumno.estado as StatusType} />
              </div>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-950 dark:text-white uppercase leading-none">
                {alumno.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-400/10 px-3 py-1 rounded-lg border border-lime-400/20 flex items-center gap-1.5">
                  {planName || header.status.noPlan}
                  <ExternalLink className="w-3 h-3" />
                </span>
                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 p-1 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                  {alumno.email}
                </span>
              </div>
            </div>
          </div>

          {/* Core Industrial Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button 
                variant="outline" 
                onClick={openWhatsApp}
                className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-black gap-2 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
            >
                <MessageCircle className="w-5 h-5 text-emerald-500" />
                WhatsApp
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline"
                  className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-black gap-2 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  <Zap className="w-5 h-5 text-lime-500" />
                  ACCESO
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 shadow-2xl">
                <DropdownMenuItem onClick={copyGuestLink} className="rounded-xl py-3 font-black text-[10px] uppercase tracking-[0.15em] gap-3 cursor-pointer">
                  <Copy className="w-4 h-4 text-zinc-400" />
                  Copiar Magic Link
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              className="flex-1 md:flex-none h-14 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-90 rounded-2xl font-black text-[10px] uppercase tracking-widest gap-2 px-8 transition-all active:scale-95 shadow-xl"
            >
              <CreditCard className="w-5 h-5" />
              Cobrar cuota
            </Button>
          </div>
        </div>

        {/* Telemetry Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 border-t border-zinc-100 dark:border-zinc-900 pt-0 bg-zinc-50/50 dark:bg-zinc-900/20 -mx-10 -mb-10">
          <PlanMetric 
            icon={PaymentIcon} 
            label={header.metrics.payDay} 
            value={`DÃ­a ${alumno.dia_pago || 15}`} 
            className="sm:border-r border-zinc-100 dark:border-zinc-900" 
          />
          <PlanMetric 
            icon={Calendar} 
            label={header.metrics.startDate} 
            value={startDateText} 
            className="border-t sm:border-t-0 sm:border-r border-zinc-100 dark:border-zinc-900" 
          />
          <PlanMetric 
            icon={Clock} 
            label={header.metrics.lastSession} 
            value={lastSessionText} 
            accent={lastSessionText === header.metrics.today || lastSessionText === header.metrics.yesterday}
            className="border-t sm:border-t-0 border-zinc-100 dark:border-zinc-900" 
          />
        </div>
      </div>
    </div>
  );
}


import React, { useMemo } from "react";
import { actions } from "astro:actions";
import { Zap, CreditCard, ExternalLink, Calendar, Clock, CreditCard as PaymentIcon, RefreshCw, Copy, ChevronRight } from "lucide-react";
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
import { PlanMetric } from "@/components/atoms/profesor/planes/PlanMetric";
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

/**
 * AthleteHeader: Consola de telemetría para el perfil del alumno.
 * Prioriza datos accionables para el coaching (Ãšltima sesión) y KPIs administrativos (Pago).
 */
export function AthleteHeader({ alumno, planName }: Props) {
  const { header, sidebar } = athleteProfileCopy;
  const [isPaymentSheetOpen, setPaymentSheetOpen] = React.useState(false);
  const [localPagoActivo, setLocalPagoActivo] = React.useState(alumno.pago_activo);
  const [localMonto, setLocalMonto] = React.useState(alumno.monto);

  const { copyGuestLink, openWhatsApp } = useStudentActions();

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

  const currentStatus = localPagoActivo?.estado === 'pagado' ? 'pagado' : alumno.estado;

  return (
    <div className="relative overflow-hidden bg-white dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl shadow-zinc-950/5 group">
      {/* Visual Accent Layer */}
      <div className="h-2 w-full bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-950 dark:from-lime-400/20 dark:to-emerald-500/10" />

      <div className="p-8 md:p-10 space-y-10 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">

          {/* Identity Section */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-zinc-950 flex items-center justify-center text-3xl font-bold text-lime-400 shadow-2xl rotate-3 group-hover:rotate-6 transition-transform duration-500 border border-zinc-800">
                {alumno.nombre.substring(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 flex flex-col gap-1 items-end">
                <StatusBadge status={currentStatus as StatusType} />
                {alumno.suscripcion && (
                  <SubscriptionBadge
                    status="ok"
                    label={alumno.suscripcion.nombre}
                  />
                )}
              </div>
            </div>

            <div className="space-y-2 text-left">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter text-zinc-950 dark:text-white uppercase leading-none">
                {alumno.nombre}
              </h1>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[9px] font-bold uppercase tracking-widest text-lime-600 dark:text-lime-400 bg-lime-500/10 px-3 py-1 rounded-lg border border-lime-400/20 flex items-center gap-1.5 leading-none">
                  {planName || header.status.noPlan}
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-900 p-1 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 leading-none">
                  {alumno.email}
                </span>
              </div>
            </div>
          </div>

          {/* Core Industrial Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (!alumno.telefono) {
                  window.location.assign(`/profesor/alumnos/${alumno.id}/edit`);
                  return;
                }
                openWhatsApp(alumno.nombre, alumno.telefono, { type: 'general' });
              }}
              className={cn(
                "flex-1 md:flex-none h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-bold gap-2 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]",
                !alumno.telefono ? "border-dashed text-zinc-400" : ""
              )}
            >
              <WhatsappLogoIcon
                size={20}
                weight="light"
                className={cn(!alumno.telefono ? "text-zinc-400" : "text-emerald-500")}
              />
              {!alumno.telefono ? "Agregar WhatsApp" : "WhatsApp"}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 md:flex-none h-14 bg-white dark:bg-zinc-900 border-2 border-zinc-100 dark:border-zinc-800 text-zinc-950 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-2xl font-bold gap-2 px-6 transition-all active:scale-95 uppercase tracking-widest text-[10px]"
                >
                  <Zap className="w-5 h-5 text-lime-500" />
                  ACCESO
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 bg-white dark:bg-zinc-950 border-zinc-100 dark:border-zinc-800 shadow-2xl">
                <DropdownMenuItem onClick={() => copyGuestLink(alumno.id)} className="rounded-xl py-3 font-bold text-[10px] uppercase tracking-[0.15em] gap-3 cursor-pointer">
                  <Copy className="w-4 h-4 text-zinc-400" />
                  Copiar link de acceso
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              onClick={() => setPaymentSheetOpen(true)}
              className="flex-1 md:flex-none h-14 bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 hover:opacity-90 rounded-2xl font-bold text-[10px] uppercase tracking-widest gap-2 px-8 transition-all active:scale-95 shadow-xl"
            >
              <CreditCard className="w-5 h-5" />
              Cobrar cuota
            </Button>
          </div>
        </div>

        {/* Telemetry Metrics Grid (Refactored for mobile vertical stack) */}
        <div className="flex flex-col md:flex-row border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20 -mx-8 sm:-mx-10 -mb-10 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-900">
          <PlanMetric
            icon={PaymentIcon}
            label={header.metrics.payDay}
            value={`Día ${alumno.dia_pago || 15}`}
            className="flex-1"
          />
          <PlanMetric
            icon={Calendar}
            label={header.metrics.startDate}
            value={startDateText}
            className="flex-1"
          />
          <PlanMetric
            icon={Clock}
            label={header.metrics.lastSession}
            value={lastSessionText}
            accent={lastSessionText === header.metrics.today || lastSessionText === header.metrics.yesterday}
            className="flex-1"
          />
        </div>
      </div>

      <StudentPaymentSheet
        isOpen={isPaymentSheetOpen}
        onOpenChange={setPaymentSheetOpen}
        alumno={{
          ...alumno,
          name: alumno.nombre, // Map to required 'name' field
          pago_activo: localPagoActivo,
          historial: alumno.historial_pagos || [], // Map to 'historial'
          monto: localMonto ?? null,
          dia_pago: alumno.dia_pago || null,
          ultimo_recordatorio_pago_at: alumno.pago_activo?.ultimo_recordatorio_at || null,
          is_moroso: alumno.pago_activo?.estado === 'vencido',
          monto_personalizado: !!alumno.monto
        } as any}
        onPaymentSuccess={setLocalPagoActivo}
        onStudentUpdate={(upd) => {
          if (upd.monto !== undefined) setLocalMonto(upd.monto);
        }}
      />
    </div>
  );
}


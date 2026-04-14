import * as React from "react";
import { AlertTriangle, DollarSign, Frown, FilePlus, CheckCircle2, Loader2 } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { whatsappMessages } from "@/data/es/profesor/mensajes";
import { actions } from "astro:actions";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { IconWrapper } from "@/components/atoms/IconWrapper";
import type { AlertData } from "@/types/dashboard";

interface Props {
  expiringPayments: AlertData[];
  atRiskStudents: AlertData[];
  noPlanStudents: AlertData[];
  onRefresh?: () => void;
}

export function AlertCenter({ expiringPayments, atRiskStudents, noPlanStudents, onRefresh }: Props) {
  const c = dashboardCopy.alerts;
  const [loadingId, setLoadingId] = React.useState<string | null>(null);
  const totalAlerts = expiringPayments.length + atRiskStudents.length + noPlanStudents.length;

  if (totalAlerts === 0) return null;

  return (
    <DashboardCard variant="base" className="h-full">
      <div className="px-5 py-4 sm:p-8 border-b border-border bg-ui-soft flex items-center gap-4">
        <IconWrapper icon={AlertTriangle} color="destructive" size="sm" shape="rounded" />
        <div className="flex flex-col">
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground leading-none">{c.title}</h2>
          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] text-ui-muted mt-1 sm:mt-1.5">{totalAlerts} {totalAlerts === 1 ? 'pendiente' : 'pendientes'}</span>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {expiringPayments.length > 0 && (
          <AccordionItem value="payments" className="border-b border-border px-5 sm:px-6">
            <AccordionTrigger className="hover:no-underline py-4 sm:py-6">
              <div className="flex items-center gap-3 group">
                <IconWrapper icon={DollarSign} color="destructive" size="sm" shape="circle" />
                <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-red-500 transition-colors">{c.types.payment.title}</span>
                <span className="text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{expiringPayments.length}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {expiringPayments.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-ui-soft rounded-2xl border border-border hover:border-red-400/30 transition-all duration-300 group">
                    <div className="space-y-1">
                      <p className="font-bold text-card-foreground leading-none">{alert.studentName}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full inline-block">
                        {alert.daysLate} {alert.daysLate === 1 ? 'día' : 'días'} vencido
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        {alert.pagoId && (
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-10 rounded-xl text-emerald-600 hover:bg-emerald-500/10 active:scale-95 transition-all"
                                onClick={async () => {
                                    setLoadingId(alert.id);
                                    try {
                                        const { error } = await actions.pagos.registrarCobro({ 
                                            alumno_id: alert.id, 
                                            pago_id: alert.pagoId 
                                        });
                                        if (error) throw error;
                                        toast.success("Pago registrado correctamente");
                                        if (onRefresh) onRefresh();
                                    } catch (err: any) {
                                        toast.error(err.message || "Error al registrar pago");
                                    } finally {
                                        setLoadingId(null);
                                    }
                                }}
                                disabled={loadingId === alert.id}
                            >
                                {loadingId === alert.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                )}
                                <span className="text-[10px] font-bold uppercase tracking-widest">Cobrar</span>
                            </Button>
                        )}

                        {alert.phone && (
                            <Button size="sm" variant="outline" className="rounded-xl border-border text-ui-muted hover:text-red-600 hover:border-red-400 active:scale-95 transition-all h-10 px-4" asChild>
                                <a 
                                    href={`https://wa.me/${alert.phone}?text=${encodeURIComponent(whatsappMessages.payments.overdue(alert.studentName.split(' ')[0]))}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                >
                                    <WhatsappLogoIcon size={18} className="mr-2" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{c.types.payment.action}</span>
                                </a>
                            </Button>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {atRiskStudents.length > 0 && (
          <AccordionItem value="risk" className="border-b border-border px-6">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-3 group">
                <IconWrapper icon={Frown} color="warning" size="md" shape="circle" />
                <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-amber-500 transition-colors">{c.types.risk.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{atRiskStudents.length}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {atRiskStudents.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-ui-soft rounded-2xl border border-border hover:border-amber-400/30 transition-all duration-300 group">
                    <div className="space-y-1">
                      <p className="font-bold text-card-foreground leading-none">{alert.studentName}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full inline-block">
                        Inactivo hace {alert.daysInactive} días
                      </p>
                    </div>
                    {alert.phone && (
                      <Button size="sm" variant="outline" className="rounded-xl border-border text-ui-muted hover:text-amber-600 hover:border-amber-400 active:scale-95 transition-all h-10 px-4" asChild>
                        <a 
                            href={`https://wa.me/${alert.phone}?text=${encodeURIComponent(whatsappMessages.payments.reminder(alert.studentName.split(' ')[0]))}`} 
                            target="_blank" 
                            rel="noreferrer"
                        >
                          <WhatsappLogoIcon size={18} className="mr-2" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">{c.types.risk.action}</span>
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {noPlanStudents.length > 0 && (
          <AccordionItem value="noplan" className="px-6 border-b-0">
            <AccordionTrigger className="hover:no-underline py-6">
              <div className="flex items-center gap-3 group">
                <IconWrapper icon={FilePlus} color="info" size="md" shape="circle" />
                <span className="font-bold text-sm sm:text-base text-foreground group-hover:text-blue-500 transition-colors">{c.types.noPlan.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{noPlanStudents.length}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {noPlanStudents.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-4 bg-ui-soft rounded-2xl border border-border hover:border-blue-400/30 transition-all duration-300 group">
                    <div className="space-y-1">
                      <p className="font-bold text-card-foreground leading-none">{alert.studentName}</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full inline-block">
                        Sin rutina asignada
                      </p>
                    </div>
                    <Button size="sm" variant="outline" className="rounded-xl border-border text-ui-muted hover:text-blue-600 hover:border-blue-400 active:scale-95 transition-all h-10 px-4" asChild>
                      <a href={`/profesor/planes/new?alumno=${alert.id}`}>
                        <FilePlus className="w-4 h-4 mr-2" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">{c.types.noPlan.action}</span>
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </DashboardCard>
  );
}

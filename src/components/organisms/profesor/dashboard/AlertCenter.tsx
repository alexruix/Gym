import React from "react";
import { AlertTriangle, DollarSign, Frown, FilePlus } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { IconWrapper } from "@/components/atoms/IconWrapper";

export interface AlertData {
  id: string;
  studentName: string;
  phone?: string;
  daysLate?: number;
  daysInactive?: number;
}

interface Props {
  expiringPayments: AlertData[];
  atRiskStudents: AlertData[];
  noPlanStudents: AlertData[];
}

export function AlertCenter({ expiringPayments, atRiskStudents, noPlanStudents }: Props) {
  const c = dashboardCopy.alerts;
  const totalAlerts = expiringPayments.length + atRiskStudents.length + noPlanStudents.length;

  if (totalAlerts === 0) return null;

  return (
    <DashboardCard variant="base" className="h-full">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
        <IconWrapper icon={AlertTriangle} color="destructive" size="md" shape="rounded" />
        <div>
          <h2 className="text-lg font-bold text-zinc-950">{c.title}</h2>
          <p className="text-sm text-zinc-500 font-medium">{totalAlerts} pendientes</p>
        </div>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {expiringPayments.length > 0 && (
          <AccordionItem value="payments" className="border-b border-zinc-100 px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <IconWrapper icon={DollarSign} color="destructive" size="md" shape="circle" />
                <span className="font-bold text-zinc-950">{c.types.payment.title} ({expiringPayments.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {expiringPayments.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50/50 rounded-2xl border border-red-100 hover:-translate-y-1 transition-transform duration-200">
                    <div>
                      <p className="font-bold text-zinc-950">{alert.studentName}</p>
                      <p className="text-xs text-red-600 font-medium">{alert.daysLate} días vencido</p>
                    </div>
                    {alert.phone && (
                      <Button size="sm" variant="outline" className="rounded-xl border-red-200 text-red-700 hover:bg-red-100 active:scale-95 transition-transform" asChild>
                        <a href={`https://wa.me/${alert.phone}?text=Hola%20${alert.studentName},%20te%20escribo%20por%20la%20cuota`} target="_blank" rel="noreferrer">
                          <WhatsappLogoIcon size={18} weight="light" className="mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">{c.types.payment.action}</span>
                          <span className="sm:hidden">Avisar</span>
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {atRiskStudents.length > 0 && (
          <AccordionItem value="risk" className="border-b border-zinc-100 px-6">
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <IconWrapper icon={Frown} color="warning" size="md" shape="circle" />
                <span className="font-bold text-zinc-950">{c.types.risk.title} ({atRiskStudents.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {atRiskStudents.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-orange-50/50 rounded-2xl border border-orange-100 hover:-translate-y-1 transition-transform duration-200">
                    <div>
                      <p className="font-bold text-zinc-950">{alert.studentName}</p>
                      <p className="text-xs text-orange-600 font-medium">Inactivo hace {alert.daysInactive} días</p>
                    </div>
                    {alert.phone && (
                      <Button size="sm" variant="outline" className="rounded-xl border-orange-200 text-orange-700 hover:bg-orange-100 active:scale-95 transition-transform" asChild>
                        <a href={`https://wa.me/${alert.phone}?text=Hola%20${alert.studentName},%20hace%20${alert.daysInactive}%20días%20que%20no%20entrenás.%20¿Pasó%20algo?`} target="_blank" rel="noreferrer">
                          <WhatsappLogo size={18} weight="light" className="mr-2" aria-hidden="true" />
                          <span className="hidden sm:inline">{c.types.risk.action}</span>
                          <span className="sm:hidden">Motivar</span>
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
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex items-center gap-3">
                <IconWrapper icon={FilePlus} color="info" size="md" shape="circle" />
                <span className="font-bold text-zinc-950">{c.types.noPlan.title} ({noPlanStudents.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="space-y-3 pt-2">
                {noPlanStudents.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-blue-50/50 rounded-2xl border border-blue-100 hover:-translate-y-1 transition-transform duration-200">
                    <p className="font-bold text-zinc-950">{alert.studentName}</p>
                    <Button size="sm" className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-transform" asChild>
                      <a href={`/profesor/planes/new?alumno=${alert.id}`}>
                        <FilePlus className="w-4 h-4 mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">{c.types.noPlan.action}</span>
                        <span className="sm:hidden">Crear</span>
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

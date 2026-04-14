import React from "react";
import { AlertCircle } from "lucide-react";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { VigiaTag } from "@/components/atoms/profesor/dashboard/VigiaTag";
import { dashboardCopy } from "@/data/es/profesor/dashboard";

interface Student {
  id: string;
  studentName: string;
}

interface VigiaAlertsProps {
  students: Student[];
}

/**
 * VigiaAlerts: Organismo que centraliza las alertas operativas críticas.
 * Enfoque: Alumnos sin plan (Vigía).
 */
export function VigiaAlerts({ students }: VigiaAlertsProps) {
  const c = dashboardCopy.vigia.noPlan;
  
  if (!students || students.length === 0) return null;

  return (
    <DashboardCard className="border border-red-500/20 bg-red-500/5 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 p-4">
          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="font-bold text-destructive text-sm lg:text-lg">
              {students.length} {students.length === 1 ? 'Alumno sin plan' : 'Alumnos sin plan'}
            </h3>
            <p className="text-zinc-400 text-xs lg:text-sm font-medium">
              {c.subtitle}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 px-4 pb-4 lg:p-0">
          {students.slice(0, 3).map((s) => (
            <VigiaTag key={s.id} id={s.id} name={s.studentName} />
          ))}
          {students.length > 3 && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-white/5 px-3 py-1.5 rounded-full text-zinc-500 flex items-center">
              +{students.length - 3} más
            </span>
          )}
        </div>
      </div>
    </DashboardCard>
  );
}

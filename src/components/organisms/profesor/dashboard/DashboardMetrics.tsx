import { Users, FilePlus, Activity } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { Card } from "@/components/ui/card";

interface Props {
  activeStudents: number;
  pendingRoutines: number;
  adherenceRate: number; // Porcentaje
}

export function DashboardMetrics({ activeStudents, pendingRoutines, adherenceRate }: Props) {
  const c = dashboardCopy.metrics;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Comunidad Actual */}
      <Card className="p-6 border-zinc-100 hover:shadow-xl hover:shadow-zinc-900/5 hover:-translate-y-1 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-zinc-50 rounded-2xl">
            <Users className="w-5 h-5 text-zinc-950" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500" title={c.activeStudents.tooltip}>
            {c.activeStudents.label}
          </h3>
        </div>
        <p className="text-4xl font-black text-zinc-950">{activeStudents}</p>
      </Card>

      {/* 2. Rutinas Pendientes */}
      <Card className="bg-lime-400 p-6 border-lime-500/20 shadow-lg shadow-lime-500/20 hover:shadow-2xl hover:shadow-lime-500/30 hover:-translate-y-1 transition-all group overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-32 h-32 bg-white/20 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
        <div className="relative z-10 flex items-center gap-3 mb-3">
          <div className="p-3 bg-lime-300 rounded-2xl">
            <FilePlus className="w-5 h-5 text-zinc-950" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-800" title={c.pendingRoutines.tooltip}>
            {c.pendingRoutines.label}
          </h3>
        </div>
        <p className="relative z-10 text-4xl font-black text-zinc-950">{pendingRoutines}</p>
      </Card>

      {/* 3. Tasa de Adherencia */}
      <Card className="p-6 rounded-3xl border-zinc-100 hover:shadow-xl hover:shadow-zinc-900/5 hover:-translate-y-1 transition-all">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 bg-zinc-50 rounded-2xl">
            <Activity className="w-5 h-5 text-zinc-950" aria-hidden="true" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500" title={c.adherenceRate.tooltip}>
            {c.adherenceRate.label}
          </h3>
        </div>
        <div className="flex items-baseline gap-1">
          <p className="text-4xl font-black text-zinc-950">{adherenceRate}</p>
          <span className="text-xl font-bold text-zinc-400">%</span>
        </div>
      </Card>
    </div>
  );
}

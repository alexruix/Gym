import { Users, FilePlus, Activity, DollarSign } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { StatCard } from "@/components/atoms/profesor/dashboard/StatCard";

interface Props {
  activeStudents: number;
  pendingRoutines: number;
  adherenceRate: number;
  /** Ingresos cobrados en el mes actual en ARS */
  monthlyRevenue: number;
}

/**
 * DashboardMetrics: Organismo de métricas clave del panel del profesor.
 * Usa el átomo StatCard para mantener consistencia visual.
 * 4 métricas en grid 2x2 → 4 columnas en desktop.
 */
export function DashboardMetrics({
  activeStudents,
  pendingRoutines,
  adherenceRate,
  monthlyRevenue,
}: Props) {
  const c = dashboardCopy.metrics;

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "—";
    if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
    if (amount >= 1_000) return `$${Math.round(amount / 1_000)}K`;
    return `$${amount.toLocaleString("es-AR")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label={c.activeStudents.label}
        value={activeStudents}
        icon={Users}
        tooltip={c.activeStudents.tooltip}
        href="/profesor/alumnos"
      />

      <StatCard
        label={c.pendingRoutines.label}
        value={pendingRoutines}
        icon={FilePlus}
        variant={pendingRoutines > 0 ? "accent" : "default"}
        tooltip={c.pendingRoutines.tooltip}
        href="/profesor/planes/new"
      />

      <StatCard
        label={c.adherenceRate.label}
        value={adherenceRate}
        badge="%"
        icon={Activity}
        tooltip={c.adherenceRate.tooltip}
      />

      <StatCard
        label={c.monthlyRevenue.label}
        value={formatCurrency(monthlyRevenue)}
        icon={DollarSign}
        tooltip={c.monthlyRevenue.tooltip}
        href="/profesor/pagos"
      />
    </div>
  );
}

import { Users, Activity, DollarSign } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { StatCard } from "@/components/atoms/profesor/dashboard/StatCard";

interface Props {
  activeStudents: number;
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
  adherenceRate,
  monthlyRevenue,
}: Props) {
  const c = dashboardCopy.metrics;

  const formatCurrency = (amount: number) => {
    if (amount === 0) return "—";
    
    // NODO: Estándar de Contabilidad de Precisión
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(1)}M`;
    }
    
    // Si es > $10.000: Redondeo inteligente con un decimal (12.5K)
    if (amount >= 10_000) {
      return `$${(amount / 1_000).toFixed(1)}K`;
    }
    
    // Si es < $10.000: Monto exacto ($8.450)
    return `$${Math.floor(amount).toLocaleString("es-AR")}`;
  };

  return (
    <div className="flex overflow-x-auto overflow-y-hidden lg:grid lg:grid-cols-4 gap-4 pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 scrollbar-hide snap-x snap-mandatory">
      <div className="min-w-[160] flex-1 snap-start">
        <StatCard
          label={c.activeStudents.label}
          value={activeStudents}
          icon={Users}
          tooltip={c.activeStudents.tooltip}
          href="/profesor/alumnos"
        />
      </div>

      <div className="min-w-[160] flex-1 snap-start">
        <StatCard
          label={c.adherenceRate.label}
          value={adherenceRate}
          badge="%"
          icon={Activity}
          tooltip={c.adherenceRate.tooltip}
        />
      </div>

      <div className="min-w-[160] flex-1 snap-start">
        <StatCard
          label={c.monthlyRevenue.label}
          value={formatCurrency(monthlyRevenue)}
          icon={DollarSign}
          tooltip={c.monthlyRevenue.tooltip}
          href="/profesor/pagos"
        />
      </div>
    </div>
  );
}

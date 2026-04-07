import { CheckCircle2, AlertTriangle, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * StatusBadge (V3.0): Molécula unificada para etiquetas de estado.
 * Fusiona la lógica de negocio de estados generales y estados de pago.
 */

export type StatusType =
  | "activo" | "pausado" | "inactivo"
  | "pagado" | "por_vencer" | "vencido" | "pendiente" | "moroso";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showIcon?: boolean; // Forzable, aunque por defecto solo sale en pagos
}

interface StatusConfig {
  label: string;
  variant: "success" | "warning" | "destructive" | "secondary" | "outline";
  icon?: any;
  isPayment?: boolean;
}

const statusMap: Record<StatusType, StatusConfig> = {
  activo: { label: "Activo", variant: "success" },
  pausado: { label: "Pausado", variant: "warning" },
  inactivo: { label: "Inactivo", variant: "secondary" },
  // Estados de Pago (con Iconos según preferencia del usuario)
  pagado: { label: "Pagado", variant: "success", icon: CheckCircle2, isPayment: true },
  por_vencer: { label: "Por vencer", variant: "warning", icon: Clock, isPayment: true },
  vencido: { label: "Vencido", variant: "destructive", icon: XCircle, isPayment: true },
  moroso: { label: "Moroso", variant: "destructive", icon: AlertTriangle, isPayment: true },
  pendiente: { label: "Pendiente", variant: "secondary", icon: AlertTriangle, isPayment: true },
};

export const StatusBadge = ({ status, className, showIcon }: StatusBadgeProps) => {
  const config = statusMap[status] || statusMap.pendiente;
  const Icon = config.icon;
  const shouldShowIcon = showIcon !== undefined ? showIcon : config.isPayment;

  return (
    <Badge
      variant={config.variant}
      className={cn(
        "uppercase tracking-widest font-bold text-[10px] gap-1.5 py-0.5 px-3 rounded-full border-zinc-200/50 dark:border-zinc-800/10",
        config.isPayment && "shadow-sm",
        className
      )}
    >
      {shouldShowIcon && Icon && <Icon className="w-3 h-3 shrink-0" />}
      {config.label}
    </Badge>
  );
};

StatusBadge.displayName = "StatusBadge";

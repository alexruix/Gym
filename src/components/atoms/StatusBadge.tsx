import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType = "activo" | "pausado" | "vencido" | "pendiente";

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
}

const statusMap: Record<StatusType, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
  activo: { label: "Activo", variant: "success" },
  pausado: { label: "Pausado", variant: "warning" },
  vencido: { label: "Vencido", variant: "destructive" },
  pendiente: { label: "Pendiente", variant: "secondary" },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const { label, variant } = statusMap[status] || statusMap.pendiente;
  
  return (
    <Badge variant={variant} className={cn("uppercase tracking-widest font-extrabold text-[10px]", className)}>
      {label}
    </Badge>
  );
};

StatusBadge.displayName = "StatusBadge";

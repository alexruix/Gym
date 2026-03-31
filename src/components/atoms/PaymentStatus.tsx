import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type PaymentStatusType = "pagado" | "por_vencer" | "vencido" | "pendiente";

interface PaymentStatusProps {
  status: PaymentStatusType;
  className?: string;
}

const config = {
  pagado: {
    icon: CheckCircle2,
    label: "PAGADO",
    className: "text-lime-600 bg-lime-50 border-lime-200",
  },
  por_vencer: {
    icon: AlertTriangle,
    label: "POR VENCER",
    className: "text-orange-600 bg-orange-50 border-orange-200",
  },
  vencido: {
    icon: XCircle,
    label: "VENCIDO",
    className: "text-red-600 bg-red-50 border-red-200",
  },
  pendiente: {
    icon: AlertTriangle,
    label: "PENDIENTE",
    className: "text-zinc-600 bg-zinc-50 border-zinc-200",
  },
};

export const PaymentStatus = ({ status, className }: PaymentStatusProps) => {
  const item = config[status];
  const Icon = item.icon;

  return (
    <div className={cn(
      "flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-extrabold tracking-widest",
      item.className,
      className
    )}>
      <Icon className="w-3 h-3" aria-hidden="true" />
      <span>{item.label}</span>
    </div>
  );
};

PaymentStatus.displayName = "PaymentStatus";

import * as React from "react";
import { Dumbbell, CreditCard, UserPlus, Bell, CheckCircle2 } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Notification } from "@/hooks/profesor/useNotifications";

interface NotificationItemProps {
  notification: Notification;
  onSelect: (id: string) => void;
}

export function NotificationItem({ notification, onSelect }: NotificationItemProps) {
  const Icon = React.useMemo(() => {
    switch (notification.tipo) {
      case "sesion_completada":
        return CheckCircle2;
      case "pago_vencido":
      case "pago_pendiente":
        return CreditCard;
      case "nuevo_alumno":
        return UserPlus;
      default:
        return Bell;
    }
  }, [notification.tipo]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect(notification.id);
    
    // Lógica de navegación opcional basada en el tipo
    if (notification.tipo === "sesion_completada" && notification.alumno_id) {
      window.location.href = `/profesor/alumnos/${notification.alumno_id}`;
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={cn(
        "group p-4 flex gap-3 transition-colors cursor-pointer border-b border-zinc-100 last:border-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50",
        !notification.leido && "bg-lime-50/30 dark:bg-lime-900/10"
      )}
    >
      <div className={cn(
        "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
        !notification.leido 
          ? "bg-lime-100 text-lime-600 dark:bg-lime-900/30 dark:text-lime-400" 
          : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            "text-xs leading-relaxed",
            !notification.leido ? "font-bold text-zinc-900 dark:text-zinc-50" : "text-zinc-500"
          )}>
            {notification.mensaje}
          </p>
          {!notification.leido && (
            <span className="w-2 h-2 rounded-full bg-lime-500 shrink-0 mt-1.5" aria-hidden="true" />
          )}
        </div>
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
    </div>
  );
}

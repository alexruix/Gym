import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle } from "lucide-react";

interface Props {
  status: 'activo' | 'moroso' | 'inactivo' | 'pendiente';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ status, size = 'md', className }: Props) {
  const configs = {
    activo: {
      label: "ACTIVO",
      icon: Check,
      colors: "bg-primary text-primary-foreground border-primary shadow-primary/20",
    },
    moroso: {
      label: "MOROSO",
      icon: AlertCircle,
      colors: "bg-destructive text-destructive-foreground border-destructive shadow-destructive/20",
    },
    inactivo: {
      label: "SIN PLAN",
      icon: Clock,
      colors: "bg-muted text-muted-foreground border-border shadow-sm",
    },
    pendiente: {
      label: "PENDIENTE",
      icon: Clock,
      colors: "bg-secondary text-secondary-foreground border-secondary border shadow-sm",
    }
  };

  const config = configs[status] || configs.inactivo;
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-0.5 text-[0.6rem] gap-1",
    md: "px-3 py-1 text-[0.7rem] gap-1.5",
    lg: "px-4 py-2 text-[0.85rem] gap-2 rounded-2xl",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center font-black uppercase tracking-widest rounded-full border-2 shadow-lg transition-all hover:scale-105",
        config.colors,
        sizeClasses[size],
        className
      )}
    >
      <Icon className={cn("shrink-0", size === 'lg' ? 'w-4 h-4' : 'w-3 h-3')} />
      <span>{config.label}</span>
      
      {/* Glow Effect */}
      <div className="absolute inset-x-0 bottom-0 top-0 bg-white/10 rounded-full animate-pulse-slow pointer-events-none" />
    </div>
  );
}

import React from 'react';
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  variant?: 'base' | 'neon';
  className?: string;
}

export function DashboardCard({ children, variant = 'base', className }: DashboardCardProps) {
  const variants = {
    base: "bg-card my-4 flex flex-col border border-border shadow-sm rounded-2xl overflow-hidden",
    neon: "bg-primary my-4 text-primary-foreground p-6 rounded-3xl border border-border shadow-2xl relative overflow-hidden group",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

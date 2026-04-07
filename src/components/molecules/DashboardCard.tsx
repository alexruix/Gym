import React from 'react';
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  children: React.ReactNode;
  variant?: 'base' | 'neon';
  className?: string;
}

export function DashboardCard({ children, variant = 'base', className }: DashboardCardProps) {
  const variants = {
    base: "bg-white my-4 dark:bg-zinc-950/50 flex flex-col border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-2xl overflow-hidden",
    neon: "bg-zinc-950 my-4 text-white p-6 rounded-3xl border border-zinc-900 shadow-2xl relative overflow-hidden group",
  };

  return (
    <div className={cn(variants[variant], className)}>
      {children}
    </div>
  );
}

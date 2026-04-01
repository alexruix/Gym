import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PagoMetricCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'destructive';
  className?: string;
}

export const PagoMetricCard = ({ label, value, variant = 'default', className }: PagoMetricCardProps) => {
  return (
    <Card className={cn(
      "shadow-sm border-zinc-200 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl",
      variant === 'destructive' && "shadow-xl shadow-red-900/5 border-red-100 bg-red-50/30",
      className
    )}>
      <CardHeader className="pb-2">
        <CardDescription className={cn(
          "font-medium",
          variant === 'destructive' && "text-red-700 font-semibold"
        )}>
          {label}
        </CardDescription>
        <CardTitle className={cn(
          "text-3xl tracking-tight",
          variant === 'default' ? "text-zinc-900" : "text-red-700"
        )}>
          {typeof value === 'number' && label.includes('$') 
            ? `$${value.toLocaleString()}` 
            : value}
        </CardTitle>
      </CardHeader>
    </Card>
  );
};

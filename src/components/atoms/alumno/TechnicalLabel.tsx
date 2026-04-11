import React from 'react';
import { cn } from '@/lib/utils';

interface TechnicalLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function TechnicalLabel({ children, className }: TechnicalLabelProps) {
  return (
    <span className={cn(
      "text-[10px] font-bold uppercase tracking-[0.4em] text-zinc-500",
      className
    )}>
      {children}
    </span>
  );
}

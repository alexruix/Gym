import React from 'react';
import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SubscriptionBadgeProps {
  status: 'ok' | 'alert';
  label: string;
  className?: string;
}

export const SubscriptionBadge: React.FC<SubscriptionBadgeProps> = ({ status, label, className }) => {
  const isOk = status === 'ok';

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all duration-200",
      isOk
        ? "bg-lime-50 text-lime-700 border-lime-200"
        : "bg-amber-50 text-amber-700 border-amber-200",
      className
    )}>
      {isOk ? (
        <CheckCircle2 className="w-3.5 h-3.5" />
      ) : (
        <AlertTriangle className="w-3.5 h-3.5" />
      )}
      <span>{label}</span>
    </div>
  );
};

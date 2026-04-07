import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { actions } from 'astro:actions';
import { suscripcionesCopy } from '@/data/es/profesor/suscripciones';
import { cn } from '@/lib/utils';
import { useAsyncAction } from '@/hooks/useAsyncAction';

interface InconsistencyAlertProps {
  alumnoId: string;
  actualDays: number;
  planDays: number;
  targetPlanId?: string;
  targetPlanName?: string;
  targetPlanMonto?: number;
  onSolved?: () => void;
}

export const InconsistencyAlert: React.FC<InconsistencyAlertProps> = ({
  alumnoId,
  actualDays,
  planDays,
  targetPlanId,
  targetPlanName,
  targetPlanMonto,
  onSolved
}) => {
  const { execute, isPending: isLoading } = useAsyncAction();

  const handleSolve = async () => {
    if (!targetPlanId) return;
    await execute(async () => {
      const { error } = await actions.suscripcion.linkStudentSubscription({
        alumno_id: alumnoId,
        suscripcion_id: targetPlanId,
        monto_personalizado: false
      });
      if (error) throw error;
    }, {
      successMsg: "Plan actualizado correctamente",
      onSuccess: onSolved
    });
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-1">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200/50">
          <AlertCircle className="w-5 h-5 text-amber-600" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-amber-900">
            {suscripcionesCopy.alerts.inconsistency.warn
              .replace('{actual}', actualDays.toString())
              .replace('{plan}', planDays.toString())}
          </p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600/70">
            Inconsistencia detectada
          </p>
        </div>
      </div>

      {targetPlanId && (
        <button
          onClick={handleSolve}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-600 text-white text-xs font-bold uppercase tracking-wide hover:bg-amber-700 transition-all shadow-sm shadow-amber-200 disabled:opacity-50",
            isLoading && "animate-pulse"
          )}
        >
          {suscripcionesCopy.alerts.inconsistency.solve
            .replace('{targetPlan}', targetPlanName || '')
            .replace('{monto}', `$${targetPlanMonto?.toLocaleString() || ''}`)}
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

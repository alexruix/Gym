import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sparkles, ArrowRight } from "lucide-react";

interface MasterPlanGuardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
}

/**
 * MasterPlanGuardDialog: Interceptor de seguridad para planes Master.
 * Asegura el consentimiento del profesor antes de realizar un Fork automático.
 */
export function MasterPlanGuardDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending = false,
}: MasterPlanGuardDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-white dark:bg-zinc-950 border-none rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
        {/* HEADER CON SKIN INDUSTRIAL */}
        <div className="bg-zinc-950 dark:bg-zinc-900 p-8 text-center relative overflow-hidden">
           <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.05] pointer-events-none" />
           <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-2xl rotate-3">
                 <AlertTriangle className="w-8 h-8 text-lime-400" />
              </div>
              <DialogTitle className="text-2xl font-bold text-white uppercase tracking-tighter">
                 Planificación Master
              </DialogTitle>
           </div>
        </div>

        <div className="p-8 space-y-6">
          <DialogDescription className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
             Estás intentando realizar cambios en una <span className="text-zinc-950 dark:text-white font-bold">Planificación Master</span>. 
             Para mantener la integridad de la biblioteca, crearemos una <span className="text-lime-600 dark:text-lime-400 font-bold">copia personalizada</span> para este alumno.
          </DialogDescription>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 p-4 rounded-2xl flex items-center gap-4">
             <div className="w-10 h-10 rounded-xl bg-lime-500/10 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-lime-600 dark:text-lime-400" />
             </div>
             <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                Tus cambios se aplicarán sobre la nueva copia sin afectar el original.
             </p>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 px-6 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold uppercase text-[10px] tracking-widest flex-1"
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              className="h-12 px-8 rounded-xl bg-zinc-950 dark:bg-lime-500 text-white dark:text-zinc-950 font-bold uppercase text-[10px] tracking-widest flex-1 shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
              disabled={isPending}
            >
              {isPending ? "Personalizando..." : "Confirmar y Editar"}
              {!isPending && <ArrowRight className="w-3.5 h-3.5 ml-2" />}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

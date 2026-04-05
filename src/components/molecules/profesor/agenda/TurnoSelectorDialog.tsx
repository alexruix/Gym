import React, { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Clock, Check, Loader2 } from "lucide-react";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";
import { agendaCopy } from "@/data/es/profesor/agenda";
import { useAsyncAction } from "@/hooks/useAsyncAction";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
}

interface TurnoSelectorDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: { id: string; nombre: string; currentTurnoId?: string } | null;
  turnos: Turno[];
  onSuccess?: () => void;
}

export function TurnoSelectorDialog({ 
  isOpen, 
  onOpenChange, 
  student, 
  turnos, 
  onSuccess 
}: TurnoSelectorDialogProps) {
  const [selectedId, setSelectedId] = useState<string | null>(student?.currentTurnoId || null);
  const { execute, isPending } = useAsyncAction();
  const t = agendaCopy.modals.changeTurno;

  const handleUpdate = () => {
    if (!student || !selectedId) return;
    
    execute(
        async () => {
            const { error } = await actions.profesor.updateStudent({
                id: student.id,
                turno_id: selectedId
            });
            if (error) throw error;
        },
        { 
            loadingMsg: "Actualizando turno...", 
            successMsg: t.success, 
            onSuccess: () => {
                onSuccess?.();
                onOpenChange(false);
            }
        } as any // useAsyncAction might need a small fix for onSuccess or use external handling
    );
  };

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-zinc-900 rounded-3xl max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-zinc-100 uppercase tracking-tighter">
            {t.title}
          </DialogTitle>
          <DialogDescription className="text-zinc-500 font-medium pb-2">
            Mové a <span className="text-zinc-300 font-bold">{student.nombre}</span> a otro bloque horario.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-2 py-4">
          {turnos.map((turno) => {
            const isSelected = selectedId === turno.id;
            return (
              <button
                key={turno.id}
                onClick={() => setSelectedId(turno.id)}
                className={cn(
                  "flex items-center justify-between p-4 rounded-2xl border transition-all duration-200 text-left group",
                  isSelected 
                    ? "bg-lime-400 border-lime-400 text-zinc-950" 
                    : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-800/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <Clock className={cn("w-4 h-4", isSelected ? "text-zinc-950" : "text-zinc-600")} />
                  <div>
                    <p className="font-bold text-sm uppercase tracking-tight">{turno.hora_inicio.substring(0, 5)}hs</p>
                    <p className={cn("text-[10px] font-black uppercase tracking-widest leading-none mt-0.5", isSelected ? "text-zinc-950/70" : "text-zinc-500")}>
                        {turno.nombre}
                    </p>
                  </div>
                </div>
                {isSelected && <Check className="w-5 h-5" />}
              </button>
            );
          })}
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)}
            className="rounded-2xl font-bold uppercase text-[10px] tracking-widest text-zinc-500"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={isPending || !selectedId}
            className="flex-1 rounded-2xl bg-lime-400 text-zinc-950 hover:bg-lime-500 font-bold uppercase text-xs tracking-tighter"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : t.submit}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

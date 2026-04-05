import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, RefreshCw, History, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { athleteProfileCopy } from "@/data/es/profesor/perfil";

interface ScopeSelectorDialogProps {
  data: {
    type: "add" | "remove" | "swap";
    id: string;
    nuevoId?: string;
    nombre: string;
  } | null;
  onClose: () => void;
  onConfirm: (permanent: boolean) => void;
}

/**
 * ScopeSelectorDialog: Diálogo para elegir el alcance de una modificación
 * (Solo hoy vs Plan Base).
 */
export function ScopeSelectorDialog({ data, onClose, onConfirm }: ScopeSelectorDialogProps) {
  if (!data) return null;
  const copy = athleteProfileCopy.workspace.calendar.dialogs.scope;

  const isRemove = data.type === "remove";
  const isSwap = data.type === "swap";

  let title: string = copy.addTitle;
  if (isRemove) title = copy.removeTitle;
  if (isSwap) title = copy.swapTitle;

  let Icon = Plus;
  if (isRemove) Icon = Trash2;
  if (isSwap) Icon = RefreshCw;

  return (
    <Dialog.Root open={!!data} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 animate-in fade-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-sm bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 rounded-[2.5rem] shadow-2xl z-50 overflow-hidden p-8 animate-in zoom-in-95">
          <div className="text-center space-y-6">
            <div className={cn(
                "w-16 h-16 rounded-[2rem] mx-auto flex items-center justify-center shadow-lg",
                isRemove ? "bg-red-500/10 text-red-500" : (isSwap ? "bg-blue-500/10 text-blue-500" : "bg-lime-500/10 text-lime-500")
            )}>
                <Icon className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
                <h3 className="text-xl font-black uppercase tracking-tighter text-zinc-950 dark:text-white leading-none">
                    {title}
                </h3>
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{copy.description}</p>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{data.nombre}</p>
            </div>

            <div className="grid gap-3">
                <Button 
                    onClick={() => onConfirm(false)}
                    className="h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-950 dark:text-white font-black uppercase text-[10px] tracking-widest transition-all p-4 flex flex-col items-center justify-center text-center gap-0.5"
                >
                    <span className="flex items-center">
                        <History className="w-4 h-4 mr-2 opacity-50" />
                        {copy.temporary.title}
                    </span>
                    <span className="text-[7px] font-medium normal-case tracking-normal opacity-60 max-w-[200px] leading-tight">
                        {copy.temporary.desc}
                    </span>
                </Button>
                <Button 
                    onClick={() => onConfirm(true)}
                    className={cn(
                        "h-14 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl p-4 flex flex-col items-center justify-center text-center gap-0.5",
                        isRemove ? "bg-zinc-950 text-white" : "bg-lime-400 text-zinc-950"
                    )}
                >
                    <span className="flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {copy.permanent.title} ({copy.permanent.tag})
                    </span>
                    <span className={cn(
                        "text-[7px] font-medium normal-case tracking-normal max-w-[200px] leading-tight",
                        isRemove ? "text-zinc-400" : "text-zinc-800"
                    )}>
                        {copy.permanent.desc}
                    </span>
                </Button>
            </div>

            <button onClick={onClose} className="text-[10px] font-black text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors">
                {copy.cancel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import * as React from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description: React.ReactNode;
  isDeleting?: boolean;
}

export function DeleteConfirmDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Eliminar",
  description,
  isDeleting = false,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-none bg-transparent shadow-none">
        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[32px] border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="w-8 h-8" />
            </div>
            <div className="space-y-2 w-full">
              <DialogHeader>
                <DialogTitle className="text-xl font-black uppercase tracking-tight text-center">
                  {title}
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400 text-center px-2">
                {description}
              </DialogDescription>
            </div>
          </div>

          <DialogFooter className="flex flex-row gap-3 sm:gap-3 justify-center sm:justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] border-zinc-200 dark:border-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="industrial"
              disabled={isDeleting}
              onClick={onConfirm}
              className="flex-1 rounded-2xl h-12 font-bold uppercase tracking-widest text-[10px] bg-red-600 hover:bg-red-700 text-white border-none shadow-lg shadow-red-600/20"
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}

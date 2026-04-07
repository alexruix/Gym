import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check, Info, Zap, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceDayNum: number;
  totalWeeks: number;
  onConfirm: (targetDayNums: number[]) => void;
  rutinas: any[]; // Para detectar sobrescritura
}

const DIAS_CORTOS = ["L", "M", "M", "J", "V", "S", "D"];

export function BulkActionDialog({
  open,
  onOpenChange,
  sourceDayNum,
  totalWeeks,
  onConfirm,
  rutinas
}: BulkActionDialogProps) {

  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const sourceDayOfWeekIdx = (sourceDayNum - 1) % 7;
  const dayName = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][sourceDayOfWeekIdx];

  // Detectar cuántos días seleccionados ya tienen contenido
  const overwriteCount = useMemo(() => {
    return selectedDays.filter(dNum => (rutinas[dNum - 1]?.ejercicios?.length || 0) > 0).length;
  }, [selectedDays, rutinas]);

  const toggleDay = (dNum: number) => {
    if (dNum === sourceDayNum) return;
    setSelectedDays(prev =>
      prev.includes(dNum) ? prev.filter(d => d !== dNum) : [...prev, dNum]
    );
  };

  const selectColumn = (colIdx: number) => {
    const newDays = Array.from({ length: totalWeeks }, (_, wIdx) => (wIdx * 7) + (colIdx + 1))
      .filter(d => d !== sourceDayNum);

    // Si todos los de la columna ya están seleccionados, deseleccionamos todos
    const allSelected = newDays.every(d => selectedDays.includes(d));
    if (allSelected) {
      setSelectedDays(prev => prev.filter(d => !newDays.includes(d)));
    } else {
      setSelectedDays(prev => Array.from(new Set([...prev, ...newDays])));
    }
  };

  const selectWeek = (wNum: number) => {
    const start = (wNum - 1) * 7 + 1;
    const newDays = Array.from({ length: 7 }, (_, dIdx) => start + dIdx)
      .filter(d => d !== sourceDayNum);

    const allSelected = newDays.every(d => selectedDays.includes(d));
    if (allSelected) {
      setSelectedDays(prev => prev.filter(d => !newDays.includes(d)));
    } else {
      setSelectedDays(prev => Array.from(new Set([...prev, ...newDays])));
    }
  };

  const clearAll = () => setSelectedDays([]);

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) clearAll(); }}>
      <DialogContent className="max-w-[500px] bg-white dark:bg-zinc-950 p-0 rounded-[40px] border-none shadow-3xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header con gradiente industrial */}
        <div className="p-8 bg-zinc-950 text-white space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[22px] bg-lime-500 flex items-center justify-center text-zinc-950">
              <Zap className="w-8 h-8" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="industrial-title-lg-white">Copia de rutina</DialogTitle>
              <DialogDescription className="text-lime-400/60 text-[10px] font-bold uppercase tracking-[0.2em]">
                Duplicando {dayName} (Día {sourceDayNum})
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* Mini Calendario con shortcuts */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-400">Mapa del Mesociclo</span>
              <Button
                variant="ghost" onClick={clearAll}
                className="h-8 text-[9px] font-bold uppercase tracking-widest text-red-500 hover:bg-red-500/5 rounded-lg px-2"
              >
                <Trash2 className="w-3 h-3 mr-2" /> Limpiar Selección
              </Button>
            </div>

            {/* Grid Header para Selección de Columna */}
            <div className="grid grid-cols-[60px_1fr] gap-3 mb-1">
              <div />
              <div className="grid grid-cols-7 gap-2">
                {DIAS_CORTOS.map((label, idx) => (
                  <button
                    key={idx} onClick={() => selectColumn(idx)}
                    className="text-[10px] font-bold text-zinc-400 hover:text-lime-500 transition-colors uppercase tracking-widest h-8 flex items-center justify-center"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Body */}
            <div className="space-y-3">
              {Array.from({ length: totalWeeks }, (_, wIdx) => {
                const wNum = wIdx + 1;
                return (
                  <div key={wNum} className="grid grid-cols-[60px_1fr] gap-3 group">
                    <button
                      onClick={() => selectWeek(wNum)}
                      className="text-[9px] font-bold uppercase bg-zinc-50 dark:bg-zinc-900 text-zinc-400 hover:bg-zinc-950 hover:text-white transition-all rounded-xl h-12 flex items-center justify-center border border-zinc-100 dark:border-zinc-800"
                    >
                      Sem {wNum}
                    </button>

                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }, (_, dIdx) => {
                        const dNum = (wIdx * 7) + (dIdx + 1);
                        const isSource = dNum === sourceDayNum;
                        const isSelected = selectedDays.includes(dNum);
                        const hasData = (rutinas[dNum - 1]?.ejercicios?.length || 0) > 0;

                        return (
                          <button
                            key={dNum}
                            disabled={isSource}
                            onClick={() => toggleDay(dNum)}
                            className={cn(
                              "h-12 rounded-xl border-2 transition-all flex items-center justify-center text-xs font-bold relative overflow-hidden",
                              isSource ? "bg-lime-500/10 border-lime-500/20 text-lime-600 dark:text-lime-400 cursor-not-allowed" :
                                isSelected
                                  ? "bg-zinc-950 border-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-lg scale-105 z-10"
                                  : "bg-white dark:bg-zinc-900 border-transparent text-zinc-400 hover:border-zinc-200"
                            )}
                          >
                            {dNum}
                            {hasData && !isSelected && !isSource && (
                              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700" title="Tiene contenido" />
                            )}
                            {isSelected && hasData && (
                              <AlertTriangle className="absolute top-1 right-1 w-2 h-2 text-red-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer con Alertas de Sobrescritura */}
        <div className="p-8 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 space-y-6">
          {overwriteCount > 0 && (
            <div className="bg-red-500/10 p-4 rounded-2xl flex gap-4 items-center animate-in slide-in-from-bottom-2 duration-300">
              <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-red-600 leading-tight">
                ¡Atención! Estás por sobrescribir la rutina en {overwriteCount} {overwriteCount === 1 ? "día que ya tiene" : "días que ya tienen"} contenido.
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              variant="ghost" onClick={() => onOpenChange(false)}
              className="flex-1 h-16 rounded-[24px] font-bold uppercase text-[11px] tracking-[0.2em] text-zinc-400"
            >
              Cancelar
            </Button>
            <Button
              variant={overwriteCount > 0 ? "destructive" : "industrial"}
              disabled={selectedDays.length === 0}
              onClick={() => { onConfirm(selectedDays); onOpenChange(false); }}
              className={cn(
                "flex-[1.5] h-16 rounded-[24px] shadow-2xl transition-all",
                selectedDays.length > 0 && "shadow-lime-500/20"
              )}
            >
              <Copy className="w-5 h-5 mr-3" />
              <span className="text-[11px] font-bold uppercase tracking-widest">
                {overwriteCount > 0 ? `REEMPLAZAR (${selectedDays.length})` : `DUPLICAR (${selectedDays.length})`}
              </span>
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  );
}

import { useState, useMemo } from "react";
import { 
    Dialog, 
    DialogContent, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Zap, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { planesCopy } from "@/data/es/profesor/planes";

interface Exercise {
  id: string;
  nombre: string;
  media_url: string | null;
  parent_id?: string | null;
}

interface RotationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: any;
  library: Exercise[];
  onSetRotation: (altId: string, duration: number) => void;
  onAutoPilot: (altIds: string[], duration: number) => void;
}

export function RotationDialog({
  open,
  onOpenChange,
  exercise,
  library,
  onSetRotation,
  onAutoPilot
}: RotationDialogProps) {
  const [rotationSearch, setRotationSearch] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<2 | 3 | 4>(2);

  const { familyVariants, otherExercises } = useMemo(() => {
    if (!exercise) return { familyVariants: [], otherExercises: [] };
    
    const lowerSearch = rotationSearch.toLowerCase();
    const baseExercise = library.find(e => e.id === exercise.ejercicio_id);
    const familyId = baseExercise?.parent_id || baseExercise?.id;
    
    const family = library.filter(ex => 
        ex.id !== baseExercise?.id && 
        (ex.parent_id === familyId || ex.id === familyId) &&
        (!rotationSearch || ex.nombre.toLowerCase().includes(lowerSearch))
    );

    const others = library.filter(ex => {
        const isFamily = (ex.parent_id === familyId || ex.id === familyId);
        return !isFamily && ex.id !== baseExercise?.id && (!rotationSearch || ex.nombre.toLowerCase().includes(lowerSearch));
    });

    return { familyVariants: family, otherExercises: others };
  }, [exercise, library, rotationSearch]);

  const handleClose = () => {
    onOpenChange(false);
    setRotationSearch("");
  };

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl p-0 gap-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-3xl border-none shadow-2xl">
          <DialogTitle className="sr-only">Configurar Rotación</DialogTitle>
          <DialogDescription className="sr-only">
            Selecciona un ejercicio alternativo para rotar en esta posición del plan.
          </DialogDescription>
          
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/20">
            <h2 className="text-2xl font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight mb-6">
                {planesCopy.form.routines.exerciseCard.rotation.selectExercise}
            </h2>
            
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <Input 
                    placeholder={planesCopy.form.exerciseModal.searchPlaceholder}
                    value={rotationSearch}
                    onChange={(e) => setRotationSearch(e.target.value)}
                    className="pl-12 h-14 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-2xl font-bold"
                />
            </div>

            {familyVariants.length > 0 && (
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="w-full mb-6 rounded-2xl bg-lime-500/10 text-lime-600 dark:text-lime-400 border-none hover:bg-lime-500/20 font-black uppercase text-[10px] tracking-widest h-12"
                    onClick={() => onAutoPilot(familyVariants.map(v => v.id), selectedDuration)}
                >
                    <Zap className="w-4 h-4 mr-2" /> Sugerir Variantes (Auto-Pilot)
                </Button>
            )}

            <div className="flex items-center justify-between gap-4 p-4 bg-lime-500/5 border border-lime-500/20 rounded-2xl">
                <span className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400">
                    {planesCopy.form.routines.exerciseCard.rotation.duration}
                </span>
                <div className="flex gap-2">
                    {[2, 3, 4].map((weeks) => (
                        <button
                            key={weeks}
                            type="button"
                            onClick={() => setSelectedDuration(weeks as 2|3|4)}
                            className={cn(
                                "px-4 py-2 rounded-xl font-black text-xs transition-all",
                                selectedDuration === weeks 
                                    ? "bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 shadow-lg"
                                    : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-lime-500"
                            )}
                        >
                            {weeks} {planesCopy.form.routines.exerciseCard.rotation.weeks}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-6 custom-scrollbar space-y-6">
             {familyVariants.length > 0 && (
                 <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-lime-600 dark:text-lime-400 px-1">
                        Sugerencias de la familia
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                        {familyVariants.map(ex => (
                            <button
                                key={ex.id}
                                type="button"
                                onClick={() => onSetRotation(ex.id, selectedDuration)}
                                className="w-full text-left p-4 rounded-xl bg-lime-500/5 group transition-all duration-300 flex items-center justify-between border border-lime-500/20 shadow-sm hover:bg-zinc-950 dark:hover:bg-lime-400"
                            >
                                <span className="font-black text-sm text-zinc-950 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950">
                                    {ex.nombre}
                                </span>
                                <div className="flex items-center gap-2">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[8px] font-black uppercase bg-lime-500/10 text-lime-600 px-1.5 py-0.5 rounded group-hover:bg-white/20 group-hover:text-white dark:group-hover:text-zinc-900 leading-none">Recomendado</span>
                                        <span className="text-[7px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-tighter">Misma Familia</span>
                                    </div>
                                    <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950" />
                                </div>
                            </button>
                        ))}
                    </div>
                 </div>
             )}

             <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-1">
                    Otros ejercicios
                </h4>
                <div className="grid grid-cols-1 gap-2">
                    {otherExercises.map(ex => (
                        <button
                            key={ex.id}
                            type="button"
                            onClick={() => onSetRotation(ex.id, selectedDuration)}
                            className="w-full text-left p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/30 hover:bg-zinc-950 dark:hover:bg-lime-400 group transition-all duration-300 flex items-center justify-between border border-zinc-100 dark:border-zinc-800 shadow-sm"
                        >
                            <span className="font-black text-sm text-zinc-950 dark:text-zinc-50 group-hover:text-white dark:group-hover:text-zinc-950">
                                {ex.nombre}
                            </span>
                            <Plus className="w-4 h-4 text-zinc-400 group-hover:text-white dark:group-hover:text-zinc-950" />
                        </button>
                    ))}
                </div>
             </div>
          </div>
        </DialogContent>
    </Dialog>
  );
}

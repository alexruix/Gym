import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogDescription 
} from "@/components/ui/dialog";
import { Dumbbell, Box, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { addElementCopy } from "@/data/es/profesor/ejercicios";

interface AddElementDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectExercise: () => void;
    onSelectBlock: () => void;
}

/**
 * AddElementDialog: Selector premium de tipo de ítem para la rutina.
 * Basado en la filosofÃa de Clarity Industrial y TrainerStudio flow.
 */
export function AddElementDialog({ 
    open, 
    onOpenChange, 
    onSelectExercise, 
    onSelectBlock 
}: AddElementDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-xl industrial-dialog">
                <div className="p-10 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/10">
                    <DialogHeader className="space-y-1 text-left">
                        <DialogTitle className="text-3xl font-black text-zinc-950 dark:text-zinc-50 tracking-tight leading-none">
                            {addElementCopy.title}
                        </DialogTitle>
                        <DialogDescription className="industrial-label">
                            {addElementCopy.description}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 space-y-4 bg-zinc-50/20 dark:bg-transparent">
                    {/* OpciÃ³n Ejercicio */}
                    <button
                        type="button"
                        onClick={() => {
                            onSelectExercise();
                            onOpenChange(false);
                        }}
                        className="w-full text-left gap-8 industrial-card group"
                    >
                        <div className="industrial-icon-box">
                            <Dumbbell className="w-8 h-8 text-zinc-500 group-hover:text-lime-400 transition-colors" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="industrial-title text-zinc-950 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400">
                                {addElementCopy.options.exercise.title}
                            </h4>
                            <p className="industrial-description">
                                {addElementCopy.options.exercise.description}
                            </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-lime-500 transition-all transform group-hover:translate-x-1" />
                    </button>

                    {/* OpciÃ³n Bloque (Circuito) */}
                    <button
                        type="button"
                        onClick={() => {
                            onSelectBlock();
                            onOpenChange(false);
                        }}
                        className="w-full text-left gap-8 industrial-card group"
                    >
                        <div className="industrial-icon-box">
                            <Box className="w-8 h-8 text-zinc-500 group-hover:text-lime-400 transition-colors" />
                        </div>
                        <div className="flex-1 space-y-1">
                            <h4 className="industrial-title text-zinc-950 dark:text-white group-hover:text-lime-600 dark:group-hover:text-lime-400">
                                {addElementCopy.options.block.title}
                            </h4>
                            <p className="industrial-description">
                                {addElementCopy.options.block.description}
                            </p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-zinc-300 group-hover:text-lime-500 transition-all transform group-hover:translate-x-1" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

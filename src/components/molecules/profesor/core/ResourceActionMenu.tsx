import React from "react";
import { 
    MoreHorizontal, 
    UserIcon, 
    Dumbbell, 
    Zap, 
    MessageCircle, 
    Archive, 
    Trash2, 
    Copy,
    Share2,
    CheckCircle2
} from "lucide-react";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export type EntityType = "alumno" | "plan" | "ejercicio";

interface Action {
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive" | "success" | "warning";
    className?: string;
}

interface Props {
    type: EntityType;
    id: string;
    name: string;
    /** Acciones personalizadas adicionales */
    actions?: Action[];
    /** Opciones para ocultar acciones por defecto */
    exclude?: string[];
    className?: string;
}

/**
 * ResourceActionMenu: Dropdown inteligente de acciones rÃ¡pidas (V2.2 Core).
 * Inyecta automÃ¡ticamente acciones basadas en el tipo de entidad para mantener consistencia.
 */
export function ResourceActionMenu({ type, id, name, actions: customActions = [], exclude = [], className }: Props) {
    
    // Acciones AutomÃ¡ticas por Consistencia de DiseÃ±o
    const defaultActions: Action[] = [];

    if (type === "alumno") {
        defaultActions.push(
            { 
                label: "Ver Perfil", 
                icon: <UserIcon className="w-4 h-4" />, 
                onClick: () => window.location.href = `/profesor/alumnos/${id}` 
            },
            { 
                label: "Editar Rutina", 
                icon: <Dumbbell className="w-4 h-4 text-lime-500" />, 
                onClick: () => window.location.href = `/profesor/alumnos/${id}#rutina` 
            }
        );
    }

    if (type === "plan") {
        defaultActions.push(
            { 
                label: "Editar Plan", 
                icon: <Copy className="w-4 h-4" />, 
                onClick: () => window.location.href = `/profesor/planes/${id}/edit` 
            }
        );
    }

    // Filtrar excluidas y unir con personalizadas
    const filteredDefaults = defaultActions.filter(a => !exclude.includes(a.label));
    const allActions = [...filteredDefaults, ...customActions];

    return (
        <div className={cn("shrink-0", className)} onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-white dark:hover:bg-zinc-900 rounded-2xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all shadow-sm hover:rotate-90 duration-300"
                    >
                        <MoreHorizontal className="w-5 h-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                    align="end" 
                    className="w-56 rounded-3xl shadow-2xl border-zinc-100 dark:border-zinc-800 p-2 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl animate-in zoom-in-95 duration-200"
                >
                    <div className="px-3 py-2 border-b border-zinc-50 dark:border-zinc-900 mb-1">
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 truncate">Acciones: {name}</p>
                    </div>

                    {allActions.map((action, idx) => (
                        <DropdownMenuItem 
                            key={idx}
                            onClick={action.onClick}
                            className={cn(
                                "rounded-xl cursor-pointer py-3 px-4 font-black text-[10px] uppercase tracking-widest gap-3 transition-all",
                                action.variant === "destructive" 
                                    ? "text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 focus:text-red-700" 
                                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-zinc-50",
                                action.className
                            )}
                        >
                            {action.icon}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}

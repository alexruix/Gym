import React, { useState, useEffect } from "react";
import { FileText, Layers, Users, MoreHorizontal, Pencil, Trash2, Copy, ArrowRight, Clock, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PlanCardProps {
    plan: {
        id: string;
        name: string;
        duration: number;
        frequency: number;
        studentsCount: number;
        createdAt: string;
        isMaster?: boolean;
        mainExercises?: string[];
    };
    onEdit?: (id: string) => void;
    onView?: (id: string) => void;
    onDelete?: (plan: any) => void;
    onDuplicate?: (id: string) => void;
}

export function PlanCard({ plan, onDelete, onDuplicate }: PlanCardProps) {
    // Swipe Logic (Native feel without dependencies)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [translateX, setTranslateX] = useState(0);
    const [isSwiping, setIsSwiping] = useState(false);
    const [bounceHint, setBounceHint] = useState(false);

    // Initial bounce hint for PWA feel
    useEffect(() => {
        const timer = setTimeout(() => setBounceHint(true), 800);
        const timerEnd = setTimeout(() => setBounceHint(false), 1200);
        return () => { clearTimeout(timer); clearTimeout(timerEnd); };
    }, []);

    const minSwipeDistance = 50;
    const maxActionWidth = 80;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
        setIsSwiping(true);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        if (!touchStart) return;
        const currentTouch = e.targetTouches[0].clientX;
        const diff = currentTouch - touchStart;
        const clampedDiff = Math.max(-maxActionWidth, Math.min(maxActionWidth, diff));
        setTranslateX(clampedDiff);
    };

    const onTouchEnd = () => {
        setIsSwiping(false);
        if (Math.abs(translateX) < minSwipeDistance) {
            setTranslateX(0);
        } else {
            setTranslateX(translateX > 0 ? maxActionWidth : -maxActionWidth);
        }
    };

    const resetSwipe = () => setTranslateX(0);

    return (
        <div className="relative overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-900 group shadow-sm hover:shadow-md transition-shadow duration-300 bg-white dark:bg-zinc-950">
            
            {/* BACK ACTIONS (Revealed via Swipe) */}
            <div className="absolute inset-0 flex justify-between items-center px-4">
                {/* Left Action: Duplicate */}
                <button 
                    onClick={() => { onDuplicate?.(plan.id); resetSwipe(); }}
                    className="flex flex-col items-center justify-center w-[70px] h-full bg-lime-500 text-zinc-950 transition-all active:scale-90"
                >
                    <Copy className="w-5 h-5 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tight">Duplicar</span>
                </button>

                {/* Right Action: Delete */}
                <button 
                    onClick={() => { onDelete?.(plan); resetSwipe(); }}
                    className="flex flex-col items-center justify-center w-[70px] h-full bg-red-600 text-white transition-all active:scale-90"
                >
                    <Trash2 className="w-5 h-5 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tight">
                        Borrar
                    </span>
                </button>
            </div>

            {/* FOREGROUND CONTENT */}
            <div
                className={cn(
                    "relative z-10 flex flex-col bg-white dark:bg-zinc-950 transition-all duration-300 select-none touch-pan-y h-full",
                    isSwiping ? "transition-none" : "transition-transform ease-out",
                    bounceHint && "translate-x-2"
                )}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => translateX !== 0 && resetSwipe()}
            >
                {/* Main Content Area */}
                <div className="flex flex-col p-5 md:p-6 gap-5 h-full">
                    
                    {/* Header: Name & Metadata */}
                    <div className="flex flex-col gap-2">
                        <div className="flex items-start justify-between gap-4">
                            <h3 className="font-bold text-xl md:text-2xl text-zinc-950 dark:text-zinc-50 tracking-tight leading-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                                <a href={`/profesor/planes/${plan.id}`}>{plan.name}</a>
                            </h3>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 shrink-0">
                                        <MoreHorizontal className="h-5 h-5 text-zinc-400" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 font-bold z-50">
                                    <DropdownMenuItem asChild>
                                        <a href={`/profesor/planes/${plan.id}/edit`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                            <Pencil className="h-4 w-4 text-zinc-400" />
                                            <span>Editar plan</span>
                                        </a>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => onDuplicate?.(plan.id)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-lime-600 dark:text-lime-400">
                                        <Copy className="h-4 w-4" />
                                        <span>Duplicar</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
                                    <DropdownMenuItem onClick={() => onDelete?.(plan)} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                        <span>Eliminar</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Clock className="w-3 h-3" />
                                {plan.duration} semanas
                            </span>
                            <span className="text-zinc-200 dark:text-zinc-800">•</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                                <Layers className="w-3 h-3" />
                                {plan.frequency} días/sem
                            </span>
                            {plan.isMaster && (
                                <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black bg-lime-400 text-zinc-950 uppercase tracking-widest border border-lime-500/20">
                                    MiGym Plan
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Technical Content: Exercises (The core value) */}
                    <div className="flex flex-col gap-3 py-4 border-y border-zinc-50 dark:border-zinc-900/50">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-600">
                            Estructura de ejercicios
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                            {plan.mainExercises && plan.mainExercises.length > 0 ? (
                                plan.mainExercises.map((ex, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-100 dark:border-zinc-800/50">
                                        {ex}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs text-zinc-400 italic font-medium">
                                    Sin ejercicios cargados todavía
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Operational Data: Students */}
                    <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 px-3 py-2 bg-lime-50 dark:bg-lime-950/20 rounded-xl border border-lime-100 dark:border-lime-900/30">
                            <Users className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                            <span className="text-[11px] font-black text-lime-700 dark:text-lime-400 uppercase tracking-tight">
                                {plan.studentsCount} {plan.studentsCount === 1 ? 'Alumno asignado' : 'Alumnos asignados'}
                            </span>
                        </div>
                        
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            asChild
                            className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 hover:text-lime-600 dark:hover:text-lime-400 h-9 px-4 rounded-xl"
                        >
                            <a href={`/profesor/planes/${plan.id}`} className="flex items-center gap-2">
                                Ver detalles
                                <ArrowRight className="w-3.5 h-3.5" />
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

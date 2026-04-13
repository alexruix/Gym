import React, { useState, useEffect } from "react";
import { FileText, Layers, Users, MoreHorizontal, Pencil, Trash2, Copy, MoveHorizontal, ArrowRight } from "lucide-react";
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

interface PlanCardProps {
    plan: {
        id: string;
        name: string;
        duration: number;
        frequency: number;
        studentsCount: number;
        createdAt: string;
        isMaster?: boolean;
    };
    onEdit?: (id: string) => void;
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
        <div className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-zinc-100 dark:border-zinc-900 group">
            
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
                    onClick={() => { if (!plan.isMaster) onDelete?.(plan); resetSwipe(); }}
                    disabled={plan.isMaster}
                    className={cn(
                        "flex flex-col items-center justify-center w-[70px] h-full transition-all active:scale-90",
                        plan.isMaster ? "bg-zinc-200 text-zinc-400 cursor-not-allowed" : "bg-red-600 text-white"
                    )}
                >
                    <Trash2 className="w-5 h-5 mb-1" />
                    <span className="text-[8px] font-black uppercase tracking-tight">
                        {plan.isMaster ? "Bloqueado" : "Borrar"}
                    </span>
                </button>
            </div>

            {/* FOREGROUND CONTENT */}
            <div
                className={cn(
                    "relative z-10 flex flex-col md:flex-col bg-white dark:bg-zinc-950 transition-all duration-300 select-none touch-pan-y shadow-sm h-full",
                    isSwiping ? "transition-none" : "transition-transform ease-out",
                    bounceHint && "translate-x-2"
                )}
                style={{ transform: `translateX(${translateX}px)` }}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onClick={() => translateX !== 0 && resetSwipe()}
            >
                {/* Visual Area (Desktop Only) */}
                <div className="hidden md:flex aspect-[16/10] w-full bg-zinc-50 dark:bg-zinc-900 items-center justify-center relative overflow-hidden shrink-0 border-b border-zinc-100 dark:border-zinc-800/50">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 via-transparent to-lime-500/5 dark:from-zinc-800/50 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <Layers className="w-24 h-24 text-zinc-200 dark:text-zinc-800/40 -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none" />
                </div>

                {/* Content Area */}
                <div className="flex flex-row md:flex-col items-center md:items-stretch p-3 md:p-6 gap-3 md:gap-4 flex-1">
                    {/* Name & ID Section */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                            <h3 className="font-bold text-base md:text-xl text-zinc-950 dark:text-zinc-50 line-clamp-1 capitalize tracking-tight leading-none group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">
                                <a href={`/profesor/planes/${plan.id}`}>{plan.name}</a>
                            </h3>
                            {plan.isMaster && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md text-[8px] font-black bg-lime-500 text-black uppercase tracking-widest animate-pulse">
                                    Master
                                </span>
                            )}
                            <div className="hidden md:block">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0">
                                            <MoreHorizontal className="h-4 w-4 text-zinc-400" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 font-bold z-50">
                                        <DropdownMenuItem asChild>
                                            <a href={`/profesor/planes/${plan.id}/edit`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                                <Pencil className="h-4 w-4 text-zinc-400" />
                                                <span>Editar</span>
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
                        </div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                           {plan.duration} semanas • {plan.frequency}d/sem
                        </p>
                    </div>

                    {/* Quick Stats (Horizontal on mobile) */}
                    <div className="flex items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                            <Users className="w-3 h-3 text-lime-500" />
                            <span className="text-[10px] font-black text-zinc-900 dark:text-zinc-50">{plan.studentsCount}</span>
                        </div>
                        <a 
                            href={`/profesor/planes/${plan.id}`}
                            className="flex md:hidden h-10 w-10 items-center justify-center bg-zinc-100 dark:bg-zinc-900 rounded-xl text-zinc-400 active:bg-lime-500 active:text-zinc-950 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>

                {/* Footer (Desktop Only) */}
                <div className="hidden md:flex p-6 pt-0 border-t border-zinc-50 dark:border-zinc-900 items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-tighter text-zinc-400 dark:text-zinc-500">
                        ID: {plan.id.slice(0, 8)}
                    </span>
                    <Button
                        variant="link"
                        asChild
                        className="h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-lime-600 dark:hover:text-lime-400 transition-colors no-underline"
                    >
                        <a href={`/profesor/planes/${plan.id}`}>Ver detalles</a>
                    </Button>
                </div>
            </div>
        </div>
    );
}

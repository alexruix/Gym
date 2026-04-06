import React from "react";
import { FileText, Layers, Users, MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    duration: number;
    frequency: number;
    studentsCount: number;
    createdAt: string;
  };
  onEdit?: (id: string) => void;
  onDelete?: (plan: any) => void;
  onDuplicate?: (id: string) => void;
}

export function PlanCard({ plan, onDelete, onDuplicate }: PlanCardProps) {
  return (
    <Card className="group relative bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 overflow-hidden rounded-3xl hover:shadow-2xl hover:shadow-lime-500/5 transition-all duration-500 flex flex-col h-full border-b-[6px] border-b-zinc-100 dark:border-b-zinc-900 hover:border-b-lime-500/20">
      
      {/* Media / Visual Area */}
      <a href={`/profesor/planes/${plan.id}`} className="aspect-[16/10] w-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden shrink-0 border-b border-zinc-100 dark:border-zinc-800/50">
        {/* Decorative Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-200/50 via-transparent to-lime-500/5 dark:from-zinc-800/50 opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Large Decorative Icon */}
        <Layers className="w-24 h-24 text-zinc-200 dark:text-zinc-800/40 -rotate-6 group-hover:rotate-0 group-hover:scale-110 transition-all duration-700 pointer-events-none" />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
            <div className="bg-zinc-950 text-white dark:bg-lime-400 dark:text-zinc-950 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-xl flex items-center gap-2 border border-white/10 dark:border-zinc-950/20">
                <Layers className="w-3 h-3" />
                {plan.frequency} días/sem
            </div>
            
            {plan.studentsCount > 0 && (
                <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md text-zinc-900 dark:text-zinc-50 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg flex items-center gap-2 border border-zinc-200 dark:border-zinc-700">
                    <Users className="w-3 h-3 text-lime-500" />
                    {plan.studentsCount} alumnos
                </div>
            )}
        </div>
      </a>

      {/* Content */}
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
                <a href={`/profesor/planes/${plan.id}`} className="hover:underline decoration-lime-500/50 underline-offset-4">
                    <h3 className="font-black text-xl text-zinc-950 dark:text-zinc-50 leading-tight group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors line-clamp-2 capitalize tracking-tight">
                        {plan.name}
                    </h3>
                </a>
                
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 group-hover:ring-1 group-hover:ring-zinc-200 dark:group-hover:ring-zinc-700 transition-all shrink-0">
                            <MoreHorizontal className="h-5 w-5 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-52 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-2xl bg-white dark:bg-zinc-950 font-bold z-50">
                        <DropdownMenuItem asChild>
                            <a href={`/profesor/planes/${plan.id}/edit`} className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                                <Pencil className="h-4 w-4 text-zinc-400" />
                                <span>Editar planificación</span>
                            </a>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                            onClick={() => onDuplicate?.(plan.id)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-lime-600 dark:text-lime-400"
                        >
                            <Copy className="h-4 w-4" />
                            <span>Duplicar plan</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
                        <DropdownMenuItem 
                            onClick={() => onDelete?.(plan)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/30 text-red-500 transition-colors"
                        >
                            <Trash2 className="h-4 w-4" />
                            <span>Eliminar</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                <div className="flex items-center gap-1.5 grayscale group-hover:grayscale-0 transition-all">
                    <FileText className="w-3.5 h-3.5" />
                    {plan.duration} semanas
                </div>
            </div>
        </div>

        {/* Footer Details */}
        <div className="pt-4 border-t border-zinc-50 dark:border-zinc-900 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-tighter text-zinc-300">
               ID: {plan.id.slice(0, 8)}
            </span>
            <Button 
                variant="link" 
                asChild
                className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-lime-500 transition-colors no-underline"
            >
                <a href={`/profesor/planes/${plan.id}`}>Ver detalles</a>
            </Button>
        </div>
      </div>
    </Card>
  );
}

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Search, 
  MoreHorizontal, 
  Eye, 
  Edit3, 
  Copy, 
  Trash2,
  Calendar,
  Layers,
  Users
} from "lucide-react";
import { planesCopy } from "@/data/es/profesor/planes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PlanRowData {
  id: string;
  name: string;
  duration: number;
  frequency: number;
  studentsCount: number;
  createdAt: string;
}

interface Props {
  planes: PlanRowData[];
}

export function PlanesTable({ planes }: Props) {
  const c = planesCopy.list.table;
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlanes = useMemo(() => {
    return planes.filter(plan => 
      plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [planes, searchTerm]);

  return (
    <Card className="overflow-hidden flex flex-col h-full border-zinc-200 dark:border-zinc-800 shadow-sm relative z-0">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 shadow-sm">
              <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-300" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white">{c.title}</h2>
          </div>
        </div>
        
        {/* Barra de Búsqueda */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" aria-hidden="true" />
          <input 
            type="text" 
            placeholder={c.searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition-shadow text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
          />
        </div>
      </div>

      {planes.length === 0 ? (
        <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-zinc-400" aria-hidden="true" />
          </div>
          <p className="text-zinc-500 dark:text-zinc-400 font-medium">{c.empty}</p>
        </div>
      ) : filteredPlanes.length === 0 ? (
         <div className="p-12 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-zinc-500 font-medium">{c.emptySearch}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left relative">
            <thead className="bg-white dark:bg-zinc-950/40 border-b border-zinc-200 dark:border-zinc-800 text-[10px] uppercase tracking-widest text-zinc-400 font-black">
              <tr>
                <th className="px-6 py-4">{c.columns.name}</th>
                <th className="px-6 py-4 text-center">{c.columns.duration}</th>
                <th className="px-6 py-4 text-center">{c.columns.frequency}</th>
                <th className="px-6 py-4 text-center">{c.columns.studentsCount}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {filteredPlanes.map((plan) => (
                <tr 
                  key={plan.id} 
                  className="bg-white dark:bg-zinc-950 hover:bg-zinc-50/80 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/profesor/planes/${plan.id}`}
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-zinc-950 dark:text-white text-base tracking-tight">{plan.name}</span>
                      <span className="text-xs text-zinc-400 font-medium mt-0.5" suppressHydrationWarning>
                        Creado el {new Date(plan.createdAt).toLocaleDateString("es-AR", { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                        <Calendar className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                        <span>{plan.duration} {plan.duration === 1 ? 'sem' : 'sems'}</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                        <Layers className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                        <span>{plan.frequency}x / sem</span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="flex items-center justify-center gap-2">
                        {plan.studentsCount > 0 ? (
                          <span className="inline-flex items-center gap-1.5 bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-400 px-3 py-1 rounded-full text-xs font-black tracking-widest border border-lime-200 dark:border-lime-500/20">
                            <Users className="w-3.5 h-3.5" aria-hidden="true" />
                            {plan.studentsCount}
                          </span>
                        ) : (
                          <span className="text-zinc-400 font-medium text-xs">0 alumnos</span>
                        )}
                     </div>
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg" aria-label={c.dropdownMenu.triggerAria}>
                          <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-zinc-200 dark:border-zinc-800 font-medium p-1 z-50 bg-white dark:bg-zinc-950">
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          <Eye className="w-4 h-4 mr-2 text-zinc-500" aria-hidden="true" />
                          {c.dropdownMenu.viewDetails}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900">
                          <Edit3 className="w-4 h-4 mr-2 text-zinc-500" aria-hidden="true" />
                          {c.dropdownMenu.editPlan}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-lime-600 dark:text-lime-400 focus:bg-lime-50 dark:focus:bg-lime-500/10 focus:text-lime-700">
                          <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                          {c.dropdownMenu.duplicatePlan}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 focus:text-red-700">
                          <Trash2 className="w-4 h-4 mr-2 text-red-600" aria-hidden="true" />
                          {c.dropdownMenu.deletePlan}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

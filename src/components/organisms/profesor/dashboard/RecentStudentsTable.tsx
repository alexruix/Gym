import React, { useState, useMemo } from "react";
import { Users, ChevronRight, User as UserIcon, Search, Filter, MoreHorizontal, Dumbbell, DollarSign, LineChart, Link as LinkIcon, MessageCircle, Archive } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { Card } from "@/components/ui/card";
import { StatusBadge, type StatusType } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface RecentStudent {
  id: string;
  name: string;
  planName: string | null;
  status: StatusType;
}

interface Props {
  students: RecentStudent[];
  title?: string;
  hideAction?: boolean;
}

export function RecentStudentsTable({ students, title, hideAction = false }: Props) {
  const c = dashboardCopy.recentStudents;
  const cMenu = dashboardCopy.recentStudents.dropdownMenu;
  const [searchTerm, setSearchTerm] = useState("");
  const [planFilter, setPlanFilter] = useState<string>("todos");

  // Get unique plan names for the filter dropdown
  const uniquePlans = useMemo(() => {
    const plans = students.map(s => s.planName).filter(Boolean) as string[];
    return Array.from(new Set(plans)).sort();
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (student.planName || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPlan = planFilter === "todos" || student.planName === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [students, searchTerm, planFilter]);

  return (
    <Card className="overflow-hidden flex flex-col h-full border-zinc-100 shadow-sm">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-100 rounded-xl">
              <Users className="w-5 h-5 text-zinc-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-zinc-950">{title || c.title}</h2>
          </div>
          {!hideAction && (
            <a 
              href="/profesor/alumnos" 
              className="text-sm font-bold text-zinc-500 hover:text-zinc-950 flex items-center gap-1 transition-colors"
            >
              {c.action}
              <ChevronRight className="w-4 h-4" />
            </a>
          )}
        </div>
        
        {/* Filtros Deportivos */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder={c.filters.searchPlaceholder} 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 transition-shadow"
            />
          </div>
          <div className="relative shrink-0">
            <select 
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-xl pl-3 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500 font-medium text-zinc-700 w-full sm:w-auto"
            >
              <option value="todos">{c.filters.plan.all}</option>
              {uniquePlans.map(plan => (
                <option key={plan} value={plan}>{plan}</option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
          <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
            <UserIcon className="w-5 h-5 text-zinc-400" />
          </div>
          <p className="text-zinc-500 font-medium">{c.empty}</p>
        </div>
      ) : filteredStudents.length === 0 ? (
         <div className="p-8 text-center flex-1 flex flex-col items-center justify-center">
          <p className="text-zinc-500 font-medium">{c.emptySearch}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white border-b border-zinc-100 text-xs uppercase tracking-widest text-zinc-400 font-black">
              <tr>
                <th className="px-6 py-4">{c.columns.name}</th>
                <th className="px-6 py-4">{c.columns.plan}</th>
                <th className="px-6 py-4">{c.columns.status}</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filteredStudents.map((student) => (
                <tr 
                  key={student.id} 
                  className="bg-white hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/profesor/alumnos/${student.id}`}
                >
                  <td className="px-6 py-4 font-bold text-zinc-950 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-xs shrink-0 group-hover:bg-lime-100 group-hover:text-lime-700 transition-colors">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    {student.name}
                  </td>
                  <td className="px-6 py-4 text-zinc-500 font-medium whitespace-nowrap">
                    {student.planName || <span className="text-zinc-300">Sin plan</span>}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={student.status} />
                  </td>
                  <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-950 hover:bg-zinc-100 rounded-lg" aria-label={`${cMenu.triggerAria} ${student.name}`}>
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-zinc-100 font-medium p-1">
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50">
                          <UserIcon className="w-4 h-4 mr-2 text-zinc-500" />
                          {cMenu.viewProfile}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50 font-bold text-lime-600 focus:text-lime-700 focus:bg-lime-50">
                          <Dumbbell className="w-4 h-4 mr-2" />
                          {cMenu.editRoutine}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50">
                          <DollarSign className="w-4 h-4 mr-2 text-zinc-500" />
                          {cMenu.registerPayment}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50">
                          <LineChart className="w-4 h-4 mr-2 text-zinc-500" />
                          {cMenu.viewProgress}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-100 mx-1" />
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50">
                          <LinkIcon className="w-4 h-4 mr-2 text-zinc-500" />
                          {cMenu.copyMagicLink}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-zinc-50">
                          <MessageCircle className="w-4 h-4 mr-2 text-zinc-500" />
                          {cMenu.sendWhatsApp}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="rounded-lg cursor-pointer text-red-600 hover:bg-red-50 focus:text-red-700 focus:bg-red-50">
                          <Archive className="w-4 h-4 mr-2 text-red-600" />
                          {cMenu.archive}
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

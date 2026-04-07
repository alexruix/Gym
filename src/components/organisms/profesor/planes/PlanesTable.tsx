import React, { useState, useMemo } from "react";
import {
  FileText,
  MoreHorizontal,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Layers,
  Users
} from "lucide-react";
import { planesCopy } from "@/data/es/profesor/planes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";

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
  onDelete?: (plan: PlanRowData) => void;
  onDuplicate?: (id: string) => void;
}

export function PlanesTable({ planes, onDelete, onDuplicate }: Props) {
  const c = planesCopy.list.table;

  const columns: TableColumn<PlanRowData>[] = [
    {
      header: c.columns.name,
      render: (plan) => (
        <div className="flex flex-col">
          <span className="font-bold text-zinc-950 dark:text-white text-base tracking-tight">{plan.name}</span>
          <span className="text-xs text-zinc-400 font-medium mt-0.5" suppressHydrationWarning>
            Creado el {new Date(plan.createdAt).toLocaleDateString("es-AR", { day: '2-digit', month: 'short' })}
          </span>
        </div>
      ),
    },
    {
      header: c.columns.frequency,
      align: "center",
      render: (plan) => (
        <div className="flex items-center justify-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
          <Layers className="w-4 h-4 text-zinc-400" aria-hidden="true" />
          <span>{plan.frequency}x / sem</span>
        </div>
      ),
    },
    {
      header: c.columns.studentsCount,
      align: "center",
      render: (plan) => (
        <div className="flex items-center justify-center gap-2">
          {plan.studentsCount > 0 ? (
            <span className="inline-flex items-center gap-1.5 bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-400 px-3 py-1 rounded-full text-xs font-bold tracking-widest border border-lime-200 dark:border-lime-500/20">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              {plan.studentsCount}
            </span>
          ) : (
            <span className="text-zinc-400 font-medium text-xs">0 alumnos</span>
          )}
        </div>
      ),
    },
    {
      header: "",
      align: "right",
      render: (plan) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg">
                <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-zinc-200 dark:border-zinc-800 font-medium p-1 z-50 bg-white dark:bg-zinc-950">
              <DropdownMenuItem asChild>
                <a href={`/profesor/planes/${plan.id}`} className="flex items-center rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 w-full p-2">
                  <Eye className="w-4 h-4 mr-2 text-zinc-500" aria-hidden="true" />
                  {c.dropdownMenu.viewDetails}
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={`/profesor/planes/${plan.id}/edit`} className="flex items-center rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 w-full p-2">
                  <Edit3 className="w-4 h-4 mr-2 text-zinc-500" aria-hidden="true" />
                  {c.dropdownMenu.editPlan}
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
              <DropdownMenuItem
                onClick={() => onDuplicate?.(plan.id)}
                className="rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 font-bold text-lime-600 dark:text-lime-400 focus:bg-lime-50 dark:focus:bg-lime-500/10 focus:text-lime-700"
              >
                <Copy className="w-4 h-4 mr-2" aria-hidden="true" />
                {c.dropdownMenu.duplicatePlan}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800 mx-1" />
              <DropdownMenuItem
                onClick={() => onDelete?.(plan)}
                className="rounded-lg cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 focus:bg-red-50 focus:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2 text-red-600" aria-hidden="true" />
                {c.dropdownMenu.deletePlan}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <StandardTable
      data={planes}
      columns={columns}
      onRowClick={(plan) => window.location.href = `/profesor/planes/${plan.id}`}
      emptyMessage={c.empty}
      EmptyIcon={FileText}
      entityName="Planes"
    />
  );
}


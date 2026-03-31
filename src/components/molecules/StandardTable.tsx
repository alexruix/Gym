import React from "react";
import { Search, ListFilter, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface TableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface StandardTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchTerm: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  emptySearchMessage?: string;
  /** Icono para el estado vacío */
  EmptyIcon?: LucideIcon;
  /** Nombre de la entidad (ej: "Alumnos") para el contador */
  entityName?: string;
  className?: string;
}

/**
 * StandardTable: Molécula base para todas las tablas del dashboard con estética "Industrial Minimalist".
 * Unifica el comportamiento de búsqueda, filtros y visualización de datos.
 */
export function StandardTable<T extends { id: string | number }>({
  data,
  columns,
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  onRowClick,
  emptyMessage = "No se encontraron resultados",
  emptySearchMessage = "No hay coincidencias para tu búsqueda",
  EmptyIcon,
  entityName = "Resultados",
  className,
}: StandardTableProps<T>) {
  
  const hasData = data.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Search & Filters Area */}
      <div className="flex flex-col md:flex-row items-center justify-between p-4 bg-white dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm gap-4">
        <div className="relative flex-1 max-w-lg w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
          <Input 
            placeholder={searchPlaceholder} 
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-12 h-12 bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl font-medium focus:ring-2 focus:ring-lime-400/20 w-full"
          />
        </div>
        
        <div className="flex flex-row items-center gap-2 w-full md:w-auto">
          {filters}
          
          <div className="hidden lg:flex items-center gap-2 px-4 py-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl">
             <ListFilter className="w-4 h-4 text-zinc-400" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
               {data.length} {data.length === 1 ? entityName.slice(0, -1) : entityName}
             </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none bg-white dark:bg-zinc-950 rounded-3xl">
        {!hasData ? (
          <div className="p-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 bg-zinc-50 dark:bg-zinc-900 rounded-full flex items-center justify-center">
              {EmptyIcon ? (
                <EmptyIcon className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              ) : (
                <Search className="w-8 h-8 text-zinc-300 dark:text-zinc-700" />
              )}
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
                {searchTerm ? emptySearchMessage : emptyMessage}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-black">
                <tr>
                  {columns.map((col, idx) => (
                    <th 
                      key={idx} 
                      className={cn(
                        "px-6 py-5", 
                        col.align === "center" && "text-center", 
                        col.align === "right" && "text-right",
                        col.className
                      )}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50 dark:divide-zinc-900">
                {data.map((item) => (
                  <tr 
                    key={item.id} 
                    className={cn(
                      "group transition-colors",
                      onRowClick && "cursor-pointer hover:bg-zinc-50/80 dark:hover:bg-lime-400/[0.02]"
                    )}
                    onClick={() => onRowClick?.(item)}
                  >
                    {columns.map((col, idx) => (
                      <td 
                        key={idx} 
                        className={cn(
                          "px-6 py-4", 
                          col.align === "center" && "text-center", 
                          col.align === "right" && "text-right",
                          col.className
                        )}
                      >
                        {col.render(item)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

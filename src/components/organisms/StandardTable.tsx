import React from "react";
import { Search, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SearchHeader } from "../molecules/SearchHeader";

export interface TableColumn<T> {
  header: string;
  render: (item: T) => React.ReactNode;
  align?: "left" | "center" | "right";
  className?: string;
}

interface StandardTableProps<T> {
  data: T[];
  columns: TableColumn<T>[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  onRowClick?: (item: T) => void;
  rowHref?: (item: T) => string;
  emptyMessage?: string;
  emptySearchMessage?: string;
  /** Icono para el estado vacío */
  EmptyIcon?: LucideIcon;
  /** Nombre de la entidad (ej: "Alumnos") para el contador */
  entityName?: string;
  hideSearch?: boolean;
  className?: string;
  responsiveMode?: "stack" | "scroll";
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
  rowHref,
  emptyMessage = "No se encontraron resultados",
  emptySearchMessage = "No hay coincidencias para tu búsqueda",
  EmptyIcon,
  entityName = "Resultados",
  hideSearch,
  className,
  responsiveMode = "stack",
}: StandardTableProps<T>) {

  const hasData = data.length > 0;

  return (
    <div className={cn("space-y-6", className)}>
      {(!hideSearch && searchTerm !== undefined && onSearchChange !== undefined) && (
        <SearchHeader
          value={searchTerm}
          onChange={onSearchChange}
          count={data.length}
          label={data.length === 1 ? entityName.slice(0, -1) : entityName}
          placeholder={searchPlaceholder}
          actions={filters}
          className="p-4 bg-white dark:bg-zinc-950/20 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
        />
      )}

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
          <div className={cn(responsiveMode === "scroll" ? "overflow-x-auto" : "")}>
            <table className={cn("w-full text-sm text-left border-collapse", responsiveMode === "stack" ? "block md:table" : "")}>
              <thead className={cn(
                "bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900 text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-bold",
                responsiveMode === "stack" ? "hidden md:table-header-group" : ""
              )}
              >
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
              <tbody className={cn("divide-y divide-zinc-50 dark:divide-zinc-900", responsiveMode === "stack" ? "block md:table-row-group" : "")}>
                {data.map((item) => (
                  <tr
                    key={item.id}
                    className={cn(
                      "group transition-colors relative",
                      responsiveMode === "stack" ? "block md:table-row border-b-8 border-zinc-50/50 dark:border-zinc-900/20 md:border-b-0 last:border-b-0" : "",
                      (onRowClick || rowHref) && "hover:bg-zinc-50/80 dark:hover:bg-lime-500/[0.02]"
                    )}
                    onClick={(e) => {
                      if (onRowClick) {
                        const target = e.target as HTMLElement;
                        if (!target.closest('button, a, [role="menuitem"]')) {
                          onRowClick(item);
                        }
                      }
                    }}
                  >
                    {columns.map((col, idx) => (
                      <td
                        key={idx}
                        className={cn(
                          "relative z-10",
                          responsiveMode === "scroll" ? [
                            "px-6 py-4",
                            col.align === "center" && "text-center",
                            col.align === "right" && "text-right"
                          ] : [
                            "flex sm:flex-row items-center justify-between p-4 px-5 border-b border-zinc-100/50 dark:border-zinc-800/10 last:border-0 md:table-cell md:border-0 md:px-6 md:py-4 gap-4",
                            col.align === "center" && "md:text-center",
                            col.align === "right" && "md:text-right"
                          ],
                          col.className
                        )}
                      >
                        {responsiveMode === "stack" && (
                          <span className="md:hidden text-[9px] uppercase tracking-widest text-zinc-400 font-bold w-1/3 shrink-0">
                            {col.header}
                          </span>
                        )}
                        <div className={cn(
                          "inline-flex",
                          responsiveMode === "stack" ? "flex-1 w-full sm:w-auto overflow-hidden" : "w-full",
                          col.align === "right" ? "justify-end" : col.align === "center" ? "justify-start md:justify-center" : ""
                        )}>
                          {col.render(item)}
                        </div>
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

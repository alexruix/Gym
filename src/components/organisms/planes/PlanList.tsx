import React, { useState, useMemo } from "react";
import { SearchHeader } from "@/components/molecules/SearchHeader";
import { PlanCard, type PlanCardProps } from "@/components/molecules/profesor/planes/PlanCard";
import { planesCopy } from "@/data/es/profesor/planes";
import { FilePlus } from "lucide-react";

interface PlanListProps {
  planes: PlanCardProps[];
  isProfessorView?: boolean;
}

export function PlanList({ planes, isProfessorView = true }: PlanListProps) {
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("fecha-desc");
  const c = planesCopy.list.table;

  const sortOptions = [
    { label: "Nombre A-Z", value: "nombre-asc" },
    { label: "Más Recientes", value: "fecha-desc" },
    { label: "Más Activos", value: "alumnos-desc" },
  ];

  const filteredPlanes = useMemo(() => {
    let result = planes.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

    return result.sort((a, b) => {
      if (sortOrder === "nombre-asc") return a.name.localeCompare(b.name);
      if (sortOrder === "fecha-desc" && a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      if (sortOrder === "alumnos-desc") {
        const countA = a.studentsCount || 0;
        const countB = b.studentsCount || 0;
        return countB - countA;
      }
      return 0;
    });
  }, [planes, search, sortOrder]);

  const handleEdit = (id: string) => window.location.href = `/profesor/planes/${id}/edit`;
  const handleView = (id: string) => {
    const baseUrl = isProfessorView ? "/profesor/planes" : "/alumno/mi-plan";
    window.location.href = `${baseUrl}/${id}`;
  };

  const handleDuplicate = (id: string) => {
    console.log("Duplicando plan:", id);
    // TODO: Implementar acción de duplicado real vía Astro Action
  };

  const handleDelete = (id: string) => {
    if (confirm("¿Estás seguro de que querés eliminar este plan?")) {
      console.log("Eliminando plan:", id);
      // TODO: Implementar eliminación real
    }
  };

  return (
    <div className="space-y-8">
      <SearchHeader
        value={search}
        onChange={setSearch}
        count={filteredPlanes.length}
        label={c.title}
        placeholder={c.searchPlaceholder}
        sortValue={sortOrder}
        onSortChange={setSortOrder}
        sortOptions={sortOptions}
      />

      {filteredPlanes.length === 0 ? (
        <div className="py-24 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[32px] bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col items-center animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center mb-4 shadow-sm">
            <FilePlus className="w-8 h-8 text-zinc-200" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
            {search ? c.emptySearch : c.empty}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
          {filteredPlanes.map(plan => (
            <PlanCard
              key={plan.id}
              {...plan}
              isProfessorView={isProfessorView}
              onEdit={handleEdit}
              onView={handleView}
              onDuplicate={handleDuplicate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

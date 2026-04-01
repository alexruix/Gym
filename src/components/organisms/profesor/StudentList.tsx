import React, { useState, useMemo } from "react";
import { Users, ChevronRight, User as UserIcon, Filter, MoreHorizontal, Dumbbell, DollarSign, LineChart, Link as LinkIcon, MessageCircle, Archive } from "lucide-react";
import { alumnosListCopy } from "@/data/es/profesor/alumnos";
import { StatusBadge, type StatusType } from "@/components/atoms/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { actions } from "astro:actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StandardTable, type TableColumn } from "@/components/molecules/StandardTable";

export interface Student {
  id: string;
  name: string;
  planName: string | null;
  status: StatusType;
  email: string;
  telefono?: string;
}

interface Props {
  students: Student[];
  title?: string;
  hideAction?: boolean;
  /** Si es true, usa el diseño de dashboard (más compacto) */
  isDashboard?: boolean;
}

export function StudentList({ students, title, hideAction = false, isDashboard = false }: Props) {
  const c = alumnosListCopy.list;
  const cMenu = alumnosListCopy.list.dropdownMenu;
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

  const columns: TableColumn<Student>[] = [
    {
      header: c.columns.name,
      render: (student) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex font-black text-zinc-500 dark:text-zinc-400 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all duration-300 transform group-hover:rotate-3 shadow-sm">
            {student.name.charAt(0).toUpperCase()}
          </div>
          <span className="group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">{student.name}</span>
        </div>
      ),
    },
    {
      header: c.columns.plan,
      render: (student) => (
        <span className="text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">
          {student.planName || <span className="text-zinc-300 dark:text-zinc-800 font-normal">Sin plan asignado</span>}
        </span>
      ),
    },
    {
      header: c.columns.status,
      render: (student) => <StatusBadge status={student.status} />,
    },
    {
      header: "",
      align: "right",
      className: "w-10",
      render: (student) => (
        <div onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-400 hover:text-zinc-950 dark:hover:text-zinc-50 hover:bg-white dark:hover:bg-zinc-900 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all" aria-label={`${cMenu.triggerAria} ${student.name}`}>
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl border-zinc-100 dark:border-zinc-800 p-2 bg-white dark:bg-zinc-950">
              <DropdownMenuItem 
                onClick={() => window.location.href = `/profesor/alumnos/${student.id}/edit`}
                className="rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 py-2.5 font-bold text-xs uppercase tracking-widest gap-3"
              >
                <UserIcon className="w-4 h-4 text-zinc-500" />
                {cMenu.editProfile}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => window.location.href = `/profesor/alumnos/${student.id}#rutina`}
                className="rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 py-2.5 font-bold text-xs uppercase tracking-widest gap-3 text-lime-600 dark:text-lime-400"
              >
                <Dumbbell className="w-4 h-4" />
                {cMenu.editRoutine}
              </DropdownMenuItem>

              <DropdownMenuItem 
                onClick={() => window.location.href = `/profesor/pagos?search=${encodeURIComponent(student.name)}`}
                className="rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 py-2.5 font-bold text-xs uppercase tracking-widest gap-3"
              >
                <DollarSign className="w-4 h-4 text-zinc-500" />
                {cMenu.registerPayment}
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-900 my-1" />
              
              <DropdownMenuItem 
                onClick={async () => {
                  try {
                    const link = `${window.location.origin}/login?email=${encodeURIComponent(student.email)}`;
                    await navigator.clipboard.writeText(link);
                    toast.success("Link de acceso copiado");
                  } catch (err) {
                    toast.error("No se pudo copiar el link");
                  }
                }}
                className="rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 py-2.5 font-bold text-xs uppercase tracking-widest gap-3"
              >
                <LinkIcon className="w-4 h-4 text-zinc-500" />
                {cMenu.copyMagicLink}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => {
                  if (!student.telefono) {
                    toast.error("El alumno no tiene teléfono registrado");
                    return;
                  }
                  const cleanPhone = student.telefono.replace(/\D/g, "");
                  const msg = encodeURIComponent(`¡Hola ${student.name.split(" ")[0]}! Te escribo de MiGym.`);
                  window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
                }}
                className="rounded-xl cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-900 py-2.5 font-bold text-xs uppercase tracking-widest gap-3"
              >
                <MessageCircle className="w-4 h-4 text-zinc-500" />
                {cMenu.sendWhatsApp}
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={async () => {
                  if (confirm(`¿Estás seguro de archivar a ${student.name}? El alumno dejará de aparecer en la lista activa.`)) {
                    const { error } = await actions.profesor.deleteStudent({ id: student.id });
                    if (error) {
                      toast.error("Error al archivar alumno");
                    } else {
                      toast.success("Alumno archivado");
                      window.location.reload();
                    }
                  }
                }}
                className="rounded-xl cursor-pointer py-2.5 font-bold text-xs uppercase tracking-widest gap-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 focus:text-red-700"
              >
                <Archive className="w-4 h-4" />
                {cMenu.archive}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  const filters = (
    <div className="relative flex-1 md:flex-none">
      <select 
        value={planFilter}
        onChange={(e) => setPlanFilter(e.target.value)}
        className="appearance-none bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl pl-10 pr-8 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 font-bold text-zinc-700 dark:text-zinc-300 w-full md:w-48 transition-all cursor-pointer"
      >
        <option value="todos">{c.filters.plan.all}</option>
        {uniquePlans.map(plan => (
          <option key={plan} value={plan}>{plan}</option>
        ))}
      </select>
      <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
    </div>
  );

  return (
    <div className="space-y-6">
      {isDashboard && (
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-lime-400/10 rounded-xl">
              <Users className="w-5 h-5 text-lime-600" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">{title || c.title}</h2>
          </div>
          {!hideAction && (
            <a 
              href="/profesor/alumnos" 
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-lime-600 flex items-center gap-1 transition-all group"
            >
              {c.action}
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </a>
          )}
        </div>
      )}

      <StandardTable
        data={filteredStudents}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={c.filters.searchPlaceholder}
        filters={filters}
        onRowClick={(student) => window.location.href = `/profesor/alumnos/${student.id}`}
        emptyMessage={c.empty}
        emptySearchMessage={c.emptySearch}
        EmptyIcon={UserIcon}
        entityName="Alumnos"
      />
    </div>
  );
}

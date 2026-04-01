import React from "react";
import { User as UserIcon, MessageCircle, Archive, Zap } from "lucide-react";
import { alumnosListCopy } from "@/data/es/profesor/alumnos";
import { StatusBadge, type StatusType } from "@/components/molecules/StatusBadge";
import { toast } from "sonner";
import { actions } from "astro:actions";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";
import { copyToClipboard } from "@/lib/utils";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { StudentCompactCard } from "@/components/molecules/profesor/planes/StudentCompactCard";
import { ResourceActionMenu } from "@/components/molecules/profesor/core/ResourceActionMenu";
import { useUniqueTags } from "@/hooks/useUniqueTags";

export interface Student {
  id: string;
  name: string;
  planName: string | null;
  status: StatusType;
  email: string;
  telefono?: string;
  notas?: string;
}

interface Props {
  students: Student[];
  title?: string;
  hideAction?: boolean;
}

/**
 * StudentList: Dashboard de alumnos refactorizado (V2.2 Core).
 * Utiliza el patrón de Consola Universal y el menú de acciones inteligente.
 */
export function StudentList({ students }: Props) {
  const c = alumnosListCopy.list;
  const cMenu = alumnosListCopy.list.dropdownMenu;

  // Adaptación a BaseEntity para el DashboardConsole
  const studentsWithTags = React.useMemo(() => {
    return students.map(s => ({
        ...s,
        tags: s.planName ? [s.planName] : []
    }));
  }, [students]);

  // Hooks Core
  const uniquePlans = useUniqueTags(students, (s) => s.planName ? [s.planName] : []);

  // Lógica de Ordenamiento Centralizada
  const handleSort = (items: typeof studentsWithTags, order: string) => {
    return [...items].sort((a, b) => {
        if (order === "name-asc") return a.name.localeCompare(b.name);
        if (order === "status-desc") return a.status.localeCompare(b.status);
        return 0;
    });
  };

  const columns: TableColumn<typeof studentsWithTags[0]>[] = [
    {
      header: c.columns.name,
      render: (s) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-500 dark:text-zinc-400 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all duration-300 transform group-hover:rotate-3 shadow-sm">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <span className="group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">{s.name}</span>
        </div>
      ),
    },
    {
      header: c.columns.plan,
      render: (s) => (
        <span className="text-zinc-500 dark:text-zinc-400 font-semibold whitespace-nowrap">
          {s.planName || <span className="text-zinc-300 dark:text-zinc-800 font-normal">Sin plan asignado</span>}
        </span>
      ),
    },
    {
      header: c.columns.status,
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      header: "",
      align: "right",
      className: "w-10",
      render: (s) => (
        <ResourceActionMenu 
            type="alumno"
            id={s.id}
            name={s.name}
            actions={[
                {
                    label: cMenu.copyMagicLink,
                    icon: <Zap className="w-4 h-4" />,
                    onClick: async () => {
                        toast.loading("Generando acceso...");
                        try {
                          const { data, error } = await actions.profesor.getStudentGuestLink({ id: s.id });
                          if (error || !data?.link) throw new Error("Error de conexión");
                          await copyToClipboard(data.link);
                          toast.dismiss();
                          toast.success("¡Link de invitado copiado!");
                        } catch (err: any) {
                          toast.dismiss();
                          toast.error(err.message || "Error al generar link");
                        }
                    }
                },
                {
                    label: cMenu.sendWhatsApp,
                    icon: <MessageCircle className="w-4 h-4" />,
                    className: "text-emerald-600",
                    onClick: () => {
                        if (!s.telefono) {
                            toast.error("Sin teléfono registrado");
                            return;
                        }
                        const cleanPhone = s.telefono.replace(/\D/g, "");
                        const msg = encodeURIComponent(`¡Hola ${s.name.split(" ")[0]}! Te escribo de MiGym.`);
                        window.open(`https://wa.me/${cleanPhone}?text=${msg}`, "_blank");
                    }
                },
                {
                    label: cMenu.archive,
                    icon: <Archive className="w-4 h-4" />,
                    variant: "destructive",
                    onClick: async () => {
                        if (confirm(`¿Archivar a ${s.name}?`)) {
                            const { error } = await actions.profesor.deleteStudent({ id: s.id });
                            if (error) toast.error("Error al archivar");
                            else { toast.success("Alumno archivado"); window.location.reload(); }
                        }
                    }
                }
            ]}
        />
      ),
    },
  ];

  const sortOptions = [
    { label: "Nombre A-Z", value: "name-asc" },
    { label: "Por Estado", value: "status-desc" },
  ];

  return (
    <DashboardConsole 
        items={studentsWithTags}
        itemLabel="Alumnos"
        storageKey="alumnos"
        searchPlaceholder={c.filters.searchPlaceholder}
        sortOptions={sortOptions}
        onSort={handleSort}
        allTags={uniquePlans}
        onCreateClick={() => window.location.href = "/profesor/alumnos/new"}
        createLabel={alumnosListCopy.header.actions.new}
        emptyIcon={<UserIcon className="w-12 h-12" />}
        emptyTitle={c.empty}
        renderGrid={(items: any[]) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {items.map(s => (
                    <StudentCompactCard 
                        key={s.id} 
                        student={{
                            id: s.id,
                            nombre: s.name,
                            email: s.email,
                            estado: s.status,
                            telefono: s.telefono,
                            planName: s.planName,
                            notas: s.notas
                        }} 
                        onClick={(id) => window.location.href = `/profesor/alumnos/${id}`} 
                    />
                ))}
            </div>
        )}
        renderTable={(items: any[]) => (
            <div className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl overflow-hidden p-2">
                <StandardTable 
                    data={items} 
                    columns={columns}
                    onRowClick={(s) => window.location.href = `/profesor/alumnos/${s.id}`}
                    entityName="Alumnos"
                    hideSearch={true}
                />
            </div>
        )}
    />
  );
}

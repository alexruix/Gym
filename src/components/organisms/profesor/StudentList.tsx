import React from "react";
import { User as UserIcon, Archive, Zap } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { alumnosListCopy } from "@/data/es/profesor/alumnos";
import type { StatusType } from "@/components/molecules/StatusBadge";
import { toast } from "sonner";
import { actions } from "astro:actions";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";
import { copyToClipboard, calculateAge } from "@/lib/utils";
import { DashboardConsole } from "@/components/molecules/profesor/DashboardConsole";
import { StudentCompactCard } from "@/components/molecules/profesor/planes/StudentCompactCard";
import { ResourceActionMenu } from "@/components/molecules/profesor/core/ResourceActionMenu";
import { useUniqueTags } from "@/hooks/useUniqueTags";
import { useStudentActions } from "@/hooks/useStudentActions";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";

export interface Student {
  id: string;
  name: string;
  planName: string | null;
  status: StatusType;
  email: string;
  telefono?: string;
  notas?: string;
  fecha_nacimiento?: string;
}

interface Props {
  students: Student[];
  title?: string;
  hideAction?: boolean;
  isDashboard?: boolean;
}

/**
 * StudentList: Dashboard de alumnos refactorizado (V2.2 Core).
 * Utiliza el patrón de Consola Universal y el menú de acciones inteligente.
 */
export function StudentList({ students }: Props) {
  const c = alumnosListCopy.list;
  const cMenu = alumnosListCopy.list.dropdownMenu;

  // Estado para Diálogo de Eliminación (Atomic Design)
  const [deletingStudent, setDeletingStudent] = React.useState<Student | null>(null);

  const { isArchiving, copyGuestLink, openWhatsApp, archiveStudent } = useStudentActions();

  const [localStudents, setLocalStudents] = React.useState(students);

  // Sincronizar con props si cambian desde arriba
  React.useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  // Adaptación a BaseEntity para el DashboardConsole
  const studentsWithTags = React.useMemo(() => {
    return localStudents.map(s => ({
      ...s,
      tags: s.planName ? [s.planName] : []
    }));
  }, [localStudents]);

  // Hooks Core
  const uniquePlans = useUniqueTags(students, (s) => s.planName ? [s.planName] : []);

  // Lógica de Ordenamiento Centralizada
  const handleSort = (items: typeof studentsWithTags, order: string) => {
    return [...items].sort((a, b) => {
      if (order === "name-asc") return a.name.localeCompare(b.name);
      if (order === "phone-asc") return (a.telefono || "").localeCompare(b.telefono || "");
      return 0;
    });
  };

  const columns: TableColumn<typeof studentsWithTags[0]>[] = [
    {
      header: c.columns.name,
      render: (s) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-500 dark:text-zinc-400 text-xs shrink-0 group-hover:bg-lime-500 group-hover:text-zinc-950 transition-all duration-300 transform group-hover:rotate-3 shadow-sm">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="group-hover:text-lime-600 dark:group-hover:text-lime-400 transition-colors">{s.name}</span>
            {s.fecha_nacimiento && (
              <span className="text-[10px] text-zinc-400 font-medium">
                {calculateAge(s.fecha_nacimiento)} años
              </span>
            )}
          </div>
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
      header: (c.columns as any).phone,
      render: (s) => (
        <span className="text-zinc-500 dark:text-zinc-400 font-medium font-mono text-xs tabular-nums">
          {s.telefono || <span className="text-zinc-300 dark:text-zinc-800 italic">No cargado</span>}
        </span>
      ),
    },
  ];

  // Acción Centralizada para Reutilización
  const getActions = (s: typeof studentsWithTags[0]) => [
    {
      label: cMenu.copyMagicLink,
      icon: <Zap className="w-4 h-4" />,
      onClick: () => copyGuestLink(s.id)
    },
    {
      label: cMenu.sendWhatsApp,
      icon: <WhatsappLogoIcon size={16} weight="light" />,
      className: "text-emerald-600",
      onClick: () => openWhatsApp(s.name, s.telefono, { type: 'general' })
    },
    {
      label: cMenu.archive,
      icon: <Archive className="w-4 h-4" />,
      variant: "destructive" as const,
      onClick: () => setDeletingStudent(s)
    }
  ];

  const tableColumns: TableColumn<typeof studentsWithTags[0]>[] = [
    ...columns.slice(0, 3),
    {
      header: "",
      align: "right",
      className: "w-10",
      render: (s) => (
        <ResourceActionMenu
          type="alumno"
          id={s.id}
          name={s.name}
          actions={getActions(s)}
        />
      ),
    },
  ];

  const sortOptions = [
    { label: "Nombre A-Z", value: "name-asc" },
    { label: "Por Teléfono", value: "phone-asc" },
  ];

  return (
    <>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
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
                  notas: s.notas,
                  fecha_nacimiento: s.fecha_nacimiento
                }}
                href={`/profesor/alumnos/${s.id}`}
                customActions={getActions(s)}
              />
            ))}
          </div>
        )}
        renderTable={(items: any[]) => (
          <StandardTable
            data={items}
            columns={tableColumns}
            rowHref={(s) => `/profesor/alumnos/${s.id}`}
            entityName="Alumnos"
            hideSearch={true}
          />
        )}
      />

      <DeleteConfirmDialog
        isOpen={!!deletingStudent}
        onOpenChange={(open) => !open && setDeletingStudent(null)}
        onConfirm={async () => {
          if (!deletingStudent) return;
          const studentId = deletingStudent.id;

          const result = await archiveStudent(studentId, {
            onSuccess: () => {
              // Borrado Optimista (SPA reflex) tras éxito en db
              setLocalStudents(prev => prev.filter(s => s.id !== studentId));
              setDeletingStudent(null);
            }
          });

          if (result?.success && result.data?.mensaje) {
            toast.success(result.data.mensaje);
          }

        }}
        title="Archivar"
        description={<>¿Estás seguro que querés archivar a <strong>{deletingStudent?.name}</strong>?</>}
        isDeleting={isArchiving}
      />
    </>
  );
}

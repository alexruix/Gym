import { useState } from "react";
import { actions } from "astro:actions";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useDeleteWithConfirm } from "@/hooks/useDeleteWithConfirm";

interface Turno {
  id: string;
  nombre: string;
  hora_inicio: string;
  hora_fin: string;
  capacidad_max: number;
  dias_asistencia: string[];
}

export function useTurnos(turnos: Turno[]) {
  const { execute, isPending } = useAsyncAction();
  const [editingId, setEditingId] = useState<string | null>(null);

  const deleteFlow = useDeleteWithConfirm<Turno>({
    onDelete: async (turno) => {
      const { error } = await actions.profesor.deleteTurno({ id: turno.id });
      if (error) throw error;
    },
    loadingMsg: "Eliminando turno...",
    successMsg: "Turno eliminado",
    reloadOnSuccess: true,
  });

  const handleEdit = (id: string) => {
    setEditingId(id);
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleSave = (data: any) => {
    execute(
      async () => {
        const payload = editingId === "new" ? data : { ...data, id: editingId };
        const { error } = await actions.profesor.upsertTurno(payload);
        if (error) throw error;
      },
      {
        loadingMsg: "Guardando turno...",
        successMsg: editingId === "new" ? "Turno creado" : "Turno actualizado",
        reloadOnSuccess: true,
      }
    );
  };

  const handleAdd = () => {
    setEditingId("new");
  };

  return {
    editingId,
    setEditingId,
    handleEdit,
    handleCancel,
    handleSave,
    handleAdd,
    isPending,
    deleteFlow,
  };
}

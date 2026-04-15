import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { updateStudentSchema } from "@/lib/validators";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useStudentActions } from "@/hooks/useStudentActions";
import type { z } from "zod";

type FormValues = z.infer<typeof updateStudentSchema>;

interface Student {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    monto?: number | null;
    suscripcion_id?: string | null;
    monto_personalizado: boolean;
    notas?: string | null;
    turno_id?: string | null;
    dias_asistencia?: string[];
    fecha_nacimiento?: string | null;
}

interface Props {
    alumno: Student;
    subscriptions: any[];
    onSuccess?: () => void;
}

/**
 * useStudentEditForm: Orquestador de lógica para la edición de perfiles de alumnos.
 * Desacopla la sincronización de montos y las acciones de archivado del UI.
 */
export function useStudentEditForm({ alumno, subscriptions, onSuccess }: Props) {
    const [isMounted, setIsMounted] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const { execute, isPending } = useAsyncAction();
    const { isArchiving, archiveStudent } = useStudentActions();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(updateStudentSchema) as any,
        defaultValues: {
            id: alumno.id,
            nombre: alumno.nombre,
            email: alumno.email || "",
            telefono: alumno.telefono || "",
            fecha_inicio: new Date(alumno.fecha_inicio),
            dia_pago: alumno.dia_pago,
            monto: alumno.monto || 0,
            suscripcion_id: alumno.suscripcion_id || null,
            monto_personalizado: alumno.monto_personalizado || false,
            notas: alumno.notas || "",
            turno_id: alumno.turno_id || null,
            dias_asistencia: alumno.dias_asistencia || [],
            fecha_nacimiento: alumno.fecha_nacimiento ? new Date(alumno.fecha_nacimiento) : null,
        },
    });

    const montoPersonalizado = form.watch("monto_personalizado");

    // Lógica de sincronización de monto al cambiar suscripción
    const handleSuscripcionChange = (subId: string) => {
        form.setValue("suscripcion_id", subId);
        if (!montoPersonalizado) {
            const sub = subscriptions.find(s => s.id === subId);
            if (sub) {
                form.setValue("monto", sub.monto);
            }
        }
    };

    const onSubmit = async (data: FormValues) => {
        execute(async () => {
            const { data: result, error } = await actions.profesor.updateStudent(data);
            if (error) throw error;
            if (result?.success) {
                if (onSuccess) onSuccess();
                else window.location.assign(`/profesor/alumnos/${alumno.id}`);
            }
        }, {
            successMsg: "Alumno actualizado correctamente",
        });
    };

    const handleArchive = async () => {
        await archiveStudent(alumno.id, {
            onSuccess: () => {
                window.location.assign("/profesor/alumnos");
            }
        });
    };

    return {
        form,
        isMounted,
        isPending,
        isArchiving,
        isArchiveDialogOpen,
        setIsArchiveDialogOpen,
        montoPersonalizado,
        handleSuscripcionChange,
        handleArchive,
        onSubmit: form.handleSubmit(onSubmit)
    };
}

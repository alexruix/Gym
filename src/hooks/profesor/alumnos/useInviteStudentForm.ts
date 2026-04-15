import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { inviteStudentSchema } from "@/lib/validators";
import { inviteStudentCopy } from "@/data/es/profesor/alumnos";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useStudentActions } from "@/hooks/useStudentActions";
import { formatDateLatam } from "@/lib/utils";
import type { z } from "zod";

type FormValues = z.infer<typeof inviteStudentSchema>;

/**
 * useInviteStudentForm: Lógica de negocio extraída de InviteStudentForm.tsx.
 * Optimiza la latencia separando el estado del formulario de la estructura visual pesada.
 */
export function useInviteStudentForm({ plans }: { plans: any[] }) {
    const [isMounted, setIsMounted] = useState(false);
    const { execute, isPending } = useAsyncAction();
    const { copyGuestLink, openWhatsApp } = useStudentActions();
    const [successData, setSuccessData] = useState<{ id: string; email: string; name: string; date: string; phone?: string } | null>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(inviteStudentSchema) as any,
        defaultValues: {
            nombre: "",
            email: "",
            plan_id: "",
            fecha_inicio: new Date(new Date().setHours(0, 0, 0, 0)),
            dia_pago: new Date().getDate(),
            telefono: "",
            notas: "",
        },
    });

    const selectedDate = form.watch("fecha_inicio");

    // Sincronización Inteligente: Día de Pago = Día de Inicio
    useEffect(() => {
        if (isMounted && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
            form.setValue("dia_pago", selectedDate.getDate(), { shouldValidate: true });
        }
    }, [selectedDate, isMounted]);

    const onSubmit = async (data: FormValues) => {
        execute(async () => {
            const { data: result, error } = await actions.profesor.inviteStudent(data);
            if (error) throw error;
            if (result?.success) {
                setSuccessData({
                    id: result.student_id,
                    email: data.email,
                    name: data.nombre.split(" ")[0] || data.nombre,
                    date: formatDateLatam(data.fecha_inicio),
                    phone: data.telefono
                });
            }
        }, {
            loadingMsg: "Enviando invitación...",
        });
    };

    const shareWhatsApp = async () => {
        if (!successData) return;
        await openWhatsApp(successData.name, successData.phone, {
            type: 'welcome',
            studentId: successData.id
        });
    };

    const copyLink = async () => {
        if (!successData) return;
        await copyGuestLink(successData.id);
    };

    return {
        form,
        isMounted,
        isPending,
        successData,
        setSuccessData,
        onSubmit: form.handleSubmit(onSubmit),
        actions: {
            shareWhatsApp,
            copyLink
        }
    };
}

import { useState } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { copyToClipboard } from "@/lib/utils";

interface ArchiveOptions {
    onSuccess?: () => void;
    onError?: (error: any) => void;
}

interface WhatsAppOptions {
    type: 'general' | 'welcome' | 'payment' | 'custom';
    message?: string;
    studentId?: string; // Used to fetch the guest link if type === 'welcome'
    amount?: number;    // Used for payment reminders
}

/**
 * useStudentActions: Hook centralizado para acciones operativas sobre alumnos.
 * Encapsula la generación de accesos, manejo de WhatsApp con bloqueador de popups, 
 * y la eliminación de entidades.
 */
export function useStudentActions() {
    const [isArchiving, setIsArchiving] = useState(false);

    /**
     * Genera y comparte el Magic Link del alumno usando la API nativa de compartir
     * o volviendo al portapapeles como fallback.
     */
    const copyGuestLink = async (studentId: string) => {
        const toastId = toast.loading("Generando acceso seguro...");
        try {
            const { data, error } = await actions.profesor.getStudentGuestLink({ id: studentId });
            if (error || !data?.link) throw new Error("Error de conexión");
            
            toast.dismiss(toastId);

            // Intento de Compartir Nativo (PWA 2026 Level)
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: 'Acceso MiGym',
                        text: 'Este es tu link para ver el plan de entrenamiento:',
                        url: data.link,
                    });
                    toast.success("¡Link compartido!");
                    return data.link;
                } catch (shareError: any) {
                    if (shareError.name === 'AbortError') return data.link; // User cancelled, no error
                    // Fallback to clipboard if share fails
                }
            }

            // Fallback: Portapapeles
            await copyToClipboard(data.link);
            toast.success("¡Link copiado al portapapeles!");
            return data.link;
        } catch (err: any) {
            toast.dismiss(toastId);
            toast.error(err.message || "Error al generar link");
            return null;
        }
    };

    /**
     * Abre WhatsApp web/app directo con un msj pre-formateado. 
     * Integra un sistema Anti-Popup Blocker para UX "Zero-Friction".
     */
    const openWhatsApp = async (name: string, phone: string | null | undefined, options: WhatsAppOptions) => {
        if (!phone) {
            toast.error(`Sin teléfono registrado para ${name}`);
            return;
        }

        const firstName = name.split(" ")[0] || name;
        let finalMessage = options.message || "";
        let toastId: string | number | null = null;

        // Voseo Rioplatense Templates
        if (options.type === 'welcome') {
            toastId = toast.loading("Generando link para enviar...");
            let link = "tu link de acceso";
            if (options.studentId) {
                try {
                    const { data } = await actions.profesor.getStudentGuestLink({ id: options.studentId });
                    if (data?.link) link = data.link;
                } catch {
                    console.error("No se pudo generar link para WA");
                }
            }
            finalMessage = `¡Hola ${firstName}! Ya te sumé a MiGym. Este es tu link para ver el plan: ${link}`;
            if (toastId) toast.dismiss(toastId);
        } else if (options.type === 'payment') {
            finalMessage = options.message || (options.amount 
                ? `Hola ${firstName}, ¿cómo va? Te escribo de MiGym para recordarte el vencimiento de tu cuota mensual ($${options.amount.toLocaleString('es-AR')}).`
                : `Hola ${firstName}, ¿cómo va? Te escribo de MiGym para recordarte el pago de la cuota mensualmente.`);
        } else if (options.type === 'general') {
            finalMessage = `¡Hola ${firstName}! Te escribo de MiGym.`;
        }

        const cleanPhone = phone.replace(/\D/g, "");
        if (!cleanPhone) {
            toast.error("Formato de teléfono no válido");
            return;
        }
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(finalMessage)}`;

        // Safenet contra Popup Blockers de navegadores
        const win = window.open(url, "_blank");
        if (!win || win.closed || typeof win.closed == 'undefined') {
            await navigator.clipboard.writeText(url);
            toast.success("Link generado y copiado al portapapeles. Ya podés pegarlo en el chat del alumno");
        } else {
             // Optional success if we want it, but usually the redirect is enough.
        }
    };

    /**
     * Elimina lógicamente (archiva) un alumno, con callbacks para persistencia Optimista.
     */
    const archiveStudent = async (studentId: string, options?: ArchiveOptions) => {
        setIsArchiving(true);
        try {
            const { data, error } = await actions.profesor.deleteStudent({ id: studentId });
            
            if (error) {
                toast.error(error.message || "No pudimos procesar la solicitud, intentá de nuevo");
                if (options?.onError) options.onError(error);
                return { success: false };
            }
            
            if (options?.onSuccess) options.onSuccess();
            return { success: true, data };
        } catch (error) {
            toast.error("Error de conexión al procesar");
            if (options?.onError) options.onError(error);
            return { success: false };
        } finally {
            setIsArchiving(false);
        }
    };


    return {
        isArchiving,
        copyGuestLink,
        openWhatsApp,
        archiveStudent
    };
}

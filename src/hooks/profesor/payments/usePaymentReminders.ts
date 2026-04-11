import { useCallback } from "react";
import { actions } from "astro:actions";
import { whatsappMessages } from "@/data/es/profesor/mensajes";
import { useStudentActions } from "@/hooks/useStudentActions";

interface AlumnoPago {
    id: string;
    nombre: string;
    telefono: string;
    monto?: number;
    pago_activo?: {
        monto: number;
        [key: string]: any;
    };
    [key: string]: any;
}

/**
 * usePaymentReminders: Inteligencia de cobranza proactiva.
 */
export function usePaymentReminders(
    setData: React.Dispatch<React.SetStateAction<any>>
) {
    const { openWhatsApp } = useStudentActions();

    const enviarRecordatorio = useCallback((alumno: AlumnoPago) => {
        const monto = alumno.pago_activo?.monto || alumno.monto || 0;
        const nombrePila = alumno.nombre.split(" ")[0];

        // 1. Generar Mensaje Industrial (Voseo)
        const mensaje = whatsappMessages.payments.reminder(nombrePila, monto);

        // 2. Telemetría (Fire & Forget)
        actions.pagos.registrarNotificacion({ alumno_id: alumno.id }).catch(console.error);
        
        // 3. Actualización Inmediata (Telemetría Local)
        setData((prev: any) => ({
            ...prev,
            alumnos: prev.alumnos.map((a: any) => 
                a.id === alumno.id ? { ...a, ultimo_recordatorio_pago_at: new Date().toISOString() } : a
            )
        }));

        // 4. Apertura Proactiva
        openWhatsApp(alumno.nombre, alumno.telefono, {
            type: 'custom',
            message: mensaje
        });
    }, [openWhatsApp, setData]);

    return {
        enviarRecordatorio
    };
}

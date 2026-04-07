import { useState, useMemo } from 'react';
import { actions } from 'astro:actions';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import { useStudentActions } from '@/hooks/useStudentActions';
import { pagosCopy } from '@/data/es/profesor/pagos';
import { type AlumnoPago, type PagoActivo } from '@/types/pagos';

/**
 * usePagos: Orquestador central para la gestión financiera de alumnos.
 * Integra acciones asíncronas, notificaciones de WhatsApp y cálculo de KPIs.
 * 
 * @param initialAlumnos Lista inicial de alumnos con sus estados de pago.
 */
export function usePagos(initialAlumnos: AlumnoPago[]) {
    const [alumnos, setAlumnos] = useState<AlumnoPago[]>(
        initialAlumnos.map(a => ({
            ...a,
            tags: [
                a.is_moroso ? "Deudor" :
                a.pago_activo?.estado === 'pagado' ? "Pagado" :
                a.pago_activo?.estado === 'por_vencer' ? "Por vencer" :
                "Pendiente"
            ]
        }))
    );
    const [selectedAlumno, setSelectedAlumno] = useState<AlumnoPago | null>(null);

    const { execute: executeCobro, isPending: isSavingPago } = useAsyncAction();
    const { openWhatsApp } = useStudentActions();

    // KPIs en tiempo real (Memorizados)
    const metrics = useMemo(() => {
        const ingresosPagados = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado === 'pagado' ? (a.pago_activo.monto || a.monto || 0) : 0), 0);
        const ingresosPendientes = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0);
        const totalMorosos = alumnos.filter(a => a.is_moroso).length;

        return {
            ingresosPagados,
            ingresosPendientes,
            totalMorosos,
            morosos: alumnos.filter(a => a.is_moroso).slice(0, 3)
        };
    }, [alumnos]);

    /**
     * Registra un pago de forma asíncrona con feedback industrial.
     */
    const registrarCobro = async (alumnoId: string, pagoId: string) => {
        await executeCobro(
            async () => {
                const { data, error } = await actions.pagos.registrarCobro({ alumno_id: alumnoId, pago_id: pagoId });
                if (error) throw error;
                
                if (data?.success) {
                    const now = new Date().toISOString();
                    setAlumnos(prev => prev.map(a => {
                        if (a.id === alumnoId && a.pago_activo) {
                            const updatedPago = { ...a.pago_activo, estado: 'pagado' as const, fecha_pago: now };
                            return { 
                                ...a, 
                                is_moroso: false, 
                                pago_activo: updatedPago, 
                                tags: ["Pagado"],
                                historial: a.historial.map(p => p.id === pagoId ? updatedPago : p)
                            };
                        }
                        return a;
                    }));
                }
            },
            {
                loadingMsg: pagosCopy.table.saving,
                successMsg: "Cobro registrado correctamente",
            }
        );
    };

    /**
     * Dispara el recordatorio de WhatsApp usando la lógica centralizada de useStudentActions.
     */
    const enviarRecordatorio = (alumno: AlumnoPago) => {
        const monto = alumno.pago_activo?.monto || alumno.monto || 0;
        
        // Registro de telemetría (fuego y olvido)
        actions.pagos.registrarNotificacion({ alumno_id: alumno.id }).catch(console.error);
        
        // Actualizar localmente la fecha de notificación
        setAlumnos(prev => prev.map(a => 
            a.id === alumno.id ? { ...a, ultimo_recordatorio_pago_at: new Date().toISOString() } : a
        ));

        openWhatsApp(alumno.nombre, alumno.telefono, {
            type: 'payment',
            amount: monto
        });
    };

    /**
     * Sincroniza los cambios de un alumno desde fuentes externas (ej: Sheet).
     */
    const syncStudent = (alumnoId: string, updates: Partial<AlumnoPago>) => {
        setAlumnos(prev => prev.map(a => a.id === alumnoId ? { ...a, ...updates } : a));
    };

    return {
        alumnos,
        selectedAlumno,
        setSelectedAlumno,
        metrics,
        isSavingPago,
        registrarCobro,
        enviarRecordatorio,
        syncStudent
    };
}

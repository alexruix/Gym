import { useCallback, type Dispatch, type SetStateAction } from "react";
import { actions } from "astro:actions";
import { toast } from "sonner";

interface AlumnoPago {
    id: string;
    is_moroso: boolean;
    pago_activo?: {
        monto: number;
        estado: string;
        [key: string]: any;
    };
    [key: string]: any;
}

interface PaymentsData {
    alumnos: AlumnoPago[];
    metrics: {
        totalMorosos: number;
        ingresosPendientes: number;
        [key: string]: any;
    };
}

/**
 * usePaymentOperations: Motor de mutaciones financieras y recálculo reactivo.
 */
export function usePaymentOperations(
    setData: Dispatch<SetStateAction<PaymentsData>>,
    runAction: any,
    refreshData: (silent?: boolean) => void
) {

    const registrarCobro = useCallback(async (alumnoId: string, pagoId: string) => {
        await runAction(async () => {
            const { error } = await actions.profesor.registrarCobro({ 
                alumno_id: alumnoId, 
                pago_id: pagoId 
            });
            if (error) throw error;
            
            // Haptic Feedback: Entrada de Caja
            if ('vibrate' in navigator) navigator.vibrate(10);

            // ACTUALIZACIÓN REACTIVA (Impacto Inmediato)
            setData(prev => {
                const alumno = prev.alumnos.find(a => a.id === alumnoId);
                if (!alumno || !alumno.pago_activo) return prev;

                const montoCobrado = alumno.pago_activo.monto;
                const wasMoroso = alumno.is_moroso;
                const now = new Date().toISOString();

                return {
                    ...prev,
                    alumnos: prev.alumnos.map(a => {
                        if (a.id === alumnoId) {
                            const updatedPago = { ...a.pago_activo!, estado: 'pagado', fecha_pago: now };
                            return { 
                                ...a, 
                                is_moroso: false, 
                                pago_activo: updatedPago, 
                                tags: ["Pagado"],
                                historial: [updatedPago, ...(a.historial || []).filter((p: any) => p.id !== pagoId)]
                            };
                        }
                        return a;
                    }),
                    metrics: {
                        ...prev.metrics,
                        totalMorosos: Math.max(0, prev.metrics.totalMorosos - (wasMoroso ? 1 : 0)),
                        ingresosPendientes: Math.max(0, prev.metrics.ingresosPendientes - montoCobrado)
                    }
                };
            });

            toast.success("Pago registrado correctamente");
            refreshData(true); // Sync silente final
        });
    }, [runAction, refreshData, setData]);

    const syncStudentData = useCallback((alumnoId: string, updates: Partial<AlumnoPago>) => {
        setData(prev => ({
            ...prev,
            alumnos: prev.alumnos.map(a => a.id === alumnoId ? { ...a, ...updates } : a)
        }));
    }, [setData]);

    return {
        registrarCobro,
        syncStudentData
    };
}

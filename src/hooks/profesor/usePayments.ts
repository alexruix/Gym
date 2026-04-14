import * as React from "react";
import { useAsyncAction } from "@/hooks/useAsyncAction";
import type { PaymentsData } from "@/types/pagos";

// Modular Hooks
import { usePaymentSync } from "./payments/usePaymentSync";
import { usePaymentOperations } from "./payments/usePaymentOperations";
import { usePaymentReminders } from "./payments/usePaymentReminders";

/**
 * usePayments: Orquestador reactivo para la gestión financiera industrial.
 * Desacopla la sincronización, las operaciones bancarias y la telemetría de avisos.
 */
export function usePayments(initialData: PaymentsData) {
    const [data, setData] = React.useState<PaymentsData>(initialData);
    const [selectedAlumno, setSelectedAlumno] = React.useState<any>(null);
    const { execute: run, isPending } = useAsyncAction();

    // 1. Motor de Sincronización (Consola Viva)
    const { isRefreshing, refreshData } = usePaymentSync(setData);

    // 2. Motor de Operaciones Financieras (Mutaciones + Métricas Reactivas)
    const { registrarCobro, syncStudentData } = usePaymentOperations(
        setData, 
        run, 
        refreshData
    );

    // 3. Motor de Avisos Proactivos (WhatsApp Industrial)
    const { enviarRecordatorio } = usePaymentReminders(setData);

    return {
        // State
        data,
        isRefreshing,
        isPending,
        selectedAlumno,
        setSelectedAlumno,

        // Actions
        refreshData,
        registrarCobro,
        enviarRecordatorio,
        syncStudentData
    };
}

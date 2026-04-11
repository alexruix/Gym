export type PagoEstado = 'pendiente' | 'pagado' | 'vencido' | 'por_vencer';

export interface PagoActivo {
  id: string;
  monto: number;
  fecha_vencimiento: string;
  estado: PagoEstado;
  fecha_pago: string | null;
  isVirtual?: boolean;
}

export interface AlumnoPago {
  id: string;
  name: string; // Alias for nombre, required by DashboardConsole
  nombre: string;
  email: string | null;
  telefono: string | null;
  monto: number | null;
  dia_pago: number | null;
  ultimo_recordatorio_pago_at: string | null;
  pago_activo: PagoActivo | null;
  is_moroso: boolean;
  monto_personalizado: boolean;
  historial: PagoActivo[];
  tags?: string[];
}

export interface Subscription {
  id: string;
  nombre: string;
  monto: number;
  cantidad_dias: number;
}

export interface PaymentsMetrics {
    ingresosPagados: number;
    ingresosPendientes: number;
    totalMorosos: number;
    morosos: AlumnoPago[];
}

export interface PaymentsData {
    alumnos: AlumnoPago[];
    subscriptions: Subscription[];
    metrics: PaymentsMetrics;
    lastUpdated: string;
}

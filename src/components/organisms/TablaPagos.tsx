import React from 'react';
import { WhatsappLogoIcon } from '@phosphor-icons/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone,
  CheckCircle2,
  User as UserIcon,
  DollarSign,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { pagosCopy } from '@/data/es/profesor/pagos';
import { PagoMetricCard } from '@/components/molecules/profesor/PagoMetricCard';
import { StandardTable, type TableColumn } from '@/components/organisms/StandardTable';
import { StatusBadge } from '@/components/molecules/StatusBadge';
import { DashboardConsole } from '@/components/molecules/profesor/DashboardConsole';
import { cn } from '@/lib/utils';
import { SubscriptionManager } from './SubscriptionManager';
import { StudentPaymentSheet } from './profesor/pagos/StudentPaymentSheet';
import { type AlumnoPago, type Subscription } from '@/types/pagos';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { usePagos } from '@/hooks/profesor/usePagos';

/**
 * TablaPagos V2.5: Refactorizado con el hook orquestador usePagos.
 * Desacoplamiento total de lógica de negocio y presentación industrial.
 */
export const TablaPagos = ({ initialAlumnos, initialSubscriptions }: { initialAlumnos: AlumnoPago[], initialSubscriptions: Subscription[] }) => {
  const {
    alumnos,
    selectedAlumno,
    setSelectedAlumno,
    metrics,
    isSavingPago,
    registrarCobro,
    enviarRecordatorio,
    syncStudent
  } = usePagos(initialAlumnos);

  const isRecentlyNotified = (dateString: string | null) => {
    if (!dateString) return false;
    const lastDate = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);
    return diffInHours < 24;
  };

  const handleSort = (items: AlumnoPago[], order: string) => {
    return [...items].sort((a, b) => {
      switch (order) {
        case "nombre-asc": return (a.nombre || "").localeCompare(b.nombre || "");
        case "monto-desc": return (b.monto || 0) - (a.monto || 0);
        case "vencimiento-asc": {
          const da = a.pago_activo?.fecha_vencimiento ? new Date(a.pago_activo.fecha_vencimiento).getTime() : Infinity;
          const db = b.pago_activo?.fecha_vencimiento ? new Date(b.pago_activo.fecha_vencimiento).getTime() : Infinity;
          return da - db;
        }
        case "morosos": return (b.is_moroso ? 1 : 0) - (a.is_moroso ? 1 : 0);
        default: return 0;
      }
    });
  };

  const renderAlumnoCard = (alumno: AlumnoPago) => {
    const isPaid = alumno.pago_activo?.estado === 'pagado';
    const isNotified = isRecentlyNotified(alumno.ultimo_recordatorio_pago_at);
    const estado = alumno.is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente');

    return (
      <Card
        key={alumno.id}
        onClick={() => setSelectedAlumno(alumno)}
        className={cn(
          "p-5 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-xl group bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 rounded-3xl",
          alumno.is_moroso && "border-l-4 border-l-red-500 shadow-red-900/5"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-500 text-xs shrink-0 group-hover:bg-lime-500 group-hover:text-zinc-950 transition-all transform group-hover:rotate-2">
              {alumno.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-tight text-sm group-hover:text-lime-600 transition-colors">{alumno.nombre}</p>
              {alumno.telefono && <p className="industrial-description">{alumno.telefono}</p>}
            </div>
          </div>
          <StatusBadge status={estado as any} />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <div>
            <p className="industrial-metadata">Cuota</p>
            <p className="text-lg font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter leading-tight">
              ${(alumno.pago_activo?.monto || alumno.monto || 0).toLocaleString('es-AR')}
            </p>
          </div>
          <div className="text-right">
            <p className="industrial-metadata">Vence</p>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
              {alumno.pago_activo?.fecha_vencimiento
                ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(alumno.pago_activo.fecha_vencimiento))
                : "--"}
            </p>
          </div>
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {(alumno.is_moroso || (!isPaid && alumno.pago_activo)) && (
            <Button
              size="sm"
              className="flex-1 industrial-action-btn-sm bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl"
              disabled={isSavingPago}
              onClick={() => registrarCobro(alumno.id, alumno.pago_activo!.id)}
            >
              {isSavingPago ? <TrendingUp className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <DollarSign className="w-3.5 h-3.5 mr-1.5" />}
              {isSavingPago ? "..." : pagosCopy.table.registerPayment}
            </Button>
          )}
          {alumno.is_moroso && alumno.telefono && (
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "industrial-action-btn-sm rounded-2xl border-zinc-200",
                isNotified ? "opacity-50 grayscale cursor-not-allowed" : "hover:text-green-600 hover:border-green-300"
              )}
              disabled={isNotified}
              onClick={() => enviarRecordatorio(alumno)}
            >
              <WhatsappLogoIcon className="w-3.5 h-3.5" />
            </Button>
          )}
          {isPaid && (
            <div className="flex-1 h-10 flex items-center gap-2 justify-center text-lime-500 opacity-60 industrial-metadata">
              <CheckCircle2 className="w-4 h-4" />
              Pagado
            </div>
          )}
        </div>
      </Card>
    );
  };

  const columns: TableColumn<AlumnoPago>[] = [
    {
      header: pagosCopy.table.headers.student,
      render: (alumno) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-500 text-xs shrink-0 group-hover:bg-lime-500 group-hover:text-zinc-950 transition-all transform group-hover:rotate-2">
            {alumno.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="group-hover:text-lime-600 transition-colors uppercase tracking-tight font-bold">{alumno.nombre}</span>
            {alumno.telefono && <span className="industrial-description">{alumno.telefono}</span>}
          </div>
        </div>
      )
    },
    {
      header: pagosCopy.table.headers.expiry,
      render: (alumno) => {
        const fecha = alumno.pago_activo?.fecha_vencimiento;
        return (
          <span className="text-zinc-600 dark:text-zinc-400 font-semibold text-sm">
            {fecha ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(fecha)) : "--"}
          </span>
        );
      }
    },
    {
      header: pagosCopy.table.headers.status,
      render: (alumno) => {
        const estado = alumno.is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente');
        return <StatusBadge status={estado as any} className="w-fit" />;
      }
    },
    {
      header: "",
      align: "right",
      render: (alumno) => {
        const isPending = !alumno.is_moroso && alumno.pago_activo?.estado !== 'pagado';
        const isPaid = alumno.pago_activo?.estado === 'pagado';
        const isNotified = isRecentlyNotified(alumno.ultimo_recordatorio_pago_at);
        return (
          <div className="flex gap-2 justify-end" onClick={e => e.stopPropagation()}>
            {alumno.is_moroso && alumno.telefono && (
              <Button
                variant="outline" size="sm"
                className={cn("h-10 px-4 border-zinc-200 text-zinc-600 shadow-sm font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all", isNotified ? "opacity-50 grayscale cursor-not-allowed" : "hover:text-green-600 hover:border-green-300 hover:bg-green-50")}
                disabled={isNotified}
                onClick={() => enviarRecordatorio(alumno)}
              >
                <WhatsappLogoIcon className="w-3.5 h-3.5 mr-2" />
                {isNotified ? "Notificado" : pagosCopy.table.notify}
              </Button>
            )}
            {(alumno.is_moroso || isPending) && alumno.pago_activo && (
              <Button
                className="h-10 px-5 bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 dark:shadow-none font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                disabled={isSavingPago}
                onClick={() => registrarCobro(alumno.id, alumno.pago_activo!.id)}
              >
                {isSavingPago ? <TrendingUp className="w-3.5 h-3.5 animate-spin mr-2" /> : null}
                {isSavingPago ? pagosCopy.table.saving : pagosCopy.table.registerPayment}
              </Button>
            )}
            {isPaid && (
              <div className="h-10 w-10 flex items-center justify-center text-lime-500 opacity-60">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="space-y-10">
      <Tabs defaultValue="history" className="w-full space-y-10">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-[1.2rem] w-fit h-auto">
          <TabsTrigger
            value="history"
            className="industrial-tab-trigger"
          >
            {pagosCopy.tabs.history}
          </TabsTrigger>
          <TabsTrigger
            value="subscriptions"
            className="industrial-tab-trigger"
          >
            {pagosCopy.tabs.subscriptions}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-10 mt-0 border-none p-0 outline-none">
          {/* KPI Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PagoMetricCard label={pagosCopy.metrics.collected.label} value={metrics.ingresosPagados} />
            <PagoMetricCard label={pagosCopy.metrics.pending.label} value={metrics.ingresosPendientes} />
            <PagoMetricCard label={pagosCopy.metrics.delinquent.label} value={metrics.totalMorosos} variant="destructive" />
          </div>

          {/* Alertas de Morosos */}
          {metrics.totalMorosos > 0 && (
            <section className="animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h2 className="text-sm font-bold tracking-[.2em] text-zinc-900 dark:text-zinc-100 uppercase">
                  Acción requerida hoy
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {metrics.morosos.map(moroso => {
                  const isNotified = isRecentlyNotified(moroso.ultimo_recordatorio_pago_at);
                  return (
                    <Card key={moroso.id} className="p-5 border-l-4 border-l-red-500 shadow-xl shadow-red-900/5 hover:shadow-red-900/10 transition-all flex justify-between items-center bg-white dark:bg-zinc-950/40 group cursor-pointer rounded-[2rem]" onClick={() => setSelectedAlumno(moroso)}>
                      <div className="flex flex-col">
                        <span className="industrial-metadata text-red-600">Moroso</span>
                        <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors uppercase tracking-tight">{moroso.nombre}</span>
                        <span className="industrial-metadata mt-0.5">
                          Vencido hace {moroso.pago_activo?.fecha_vencimiento ? Math.floor((new Date().getTime() - new Date(moroso.pago_activo.fecha_vencimiento).getTime()) / (1000 * 3600 * 24)) : "?"} días
                        </span>
                      </div>
                      <Button
                        size="sm" variant="ghost"
                        className={cn("industrial-label gap-2 h-10 px-4 rounded-xl", isNotified ? "text-zinc-500 grayscale opacity-50 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50")}
                        disabled={isNotified}
                        onClick={e => { e.stopPropagation(); enviarRecordatorio(moroso); }}
                      >
                        <WhatsappLogoIcon className="w-4 h-4" />
                        {isNotified ? "Enviado" : "Recordar"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Dashboard Console */}
          <DashboardConsole
            items={alumnos}
            itemLabel="Alumnos"
            storageKey="pagos"
            searchPlaceholder={pagosCopy.table.searchPlaceholder}
            allTags={["Pagado", "Pendiente", "Por vencer", "Moroso"]}
            sortOptions={[
              { label: "Nombre A-Z", value: "nombre-asc" },
              { label: "Mayor monto", value: "monto-desc" },
              { label: "Próximo vencimiento", value: "vencimiento-asc" },
              { label: "Morosos primero", value: "morosos" },
            ]}
            onSort={handleSort}
            emptyIcon={<UserIcon className="w-12 h-12" />}
            emptyTitle="Sin alumnos que coincidan"
            emptyDescription="Probá ajustando el término de búsqueda o removiendo etiquetas de estado."
            renderGrid={(items) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {items.map(alumno => renderAlumnoCard(alumno as AlumnoPago))}
              </div>
            )}
            renderTable={(items) => (
              <StandardTable
                data={items as AlumnoPago[]}
                columns={columns}
                searchTerm=""
                onSearchChange={() => { }}
                entityName="Alumnos"
                onRowClick={alumno => setSelectedAlumno(alumno)}
                emptyMessage={pagosCopy.table.emptySearchMessage}
                emptySearchMessage={pagosCopy.table.emptySearchMessage}
                EmptyIcon={UserIcon}
                hideSearch={true}
              />
            )}
          />
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-0 border-none p-0 outline-none">
          <SubscriptionManager initialSubscriptions={initialSubscriptions} />
        </TabsContent>
      </Tabs>

      {/* Student Detail Sheet (SSOT) */}
      {selectedAlumno && (
        <StudentPaymentSheet
          isOpen={!!selectedAlumno}
          onOpenChange={(open) => !open && setSelectedAlumno(null)}
          alumno={selectedAlumno}
          onPaymentSuccess={(updatedPago) => {
            syncStudent(selectedAlumno.id, {
              pago_activo: updatedPago,
              is_moroso: false,
              tags: ["Pagado"]
            });
          }}
          onStudentUpdate={(updates) => {
            syncStudent(selectedAlumno.id, updates);
          }}
        />
      )}
    </div>
  );
};

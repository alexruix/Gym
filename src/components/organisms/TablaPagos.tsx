import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone,
  CheckCircle2,
  User as UserIcon,
  DollarSign,
  AlertTriangle,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { pagosCopy } from '@/data/es/profesor/pagos';
import { PagoMetricCard } from '@/components/molecules/profesor/PagoMetricCard';
import { StandardTable, type TableColumn } from '@/components/organisms/StandardTable';
import { StatusBadge } from '@/components/molecules/StatusBadge';
import { DashboardConsole } from '@/components/molecules/profesor/DashboardConsole';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

export type PagoActivo = {
  id: string;
  monto: number;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'por_vencer';
  fecha_pago: string | null;
  isVirtual?: boolean;
};

export type Alumno = {
  id: string;
  // Alias BaseEntity (requerido por DashboardConsole)
  name: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  monto: number | null;
  dia_pago: number | null;
  ultimo_recordatorio_pago_at: string | null;
  pago_activo: PagoActivo | null;
  is_moroso: boolean;
  historial: PagoActivo[];
  // Tags para el filtro por estado de pago
  tags?: string[];
};

const isRecentlyNotified = (dateString: string | null) => {
  if (!dateString) return false;
  const lastDate = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);
  return diffInHours < 24;
};

/**
 * TablaPagos V2.2: Refactorizado para usar DashboardConsole como shell.
 * Mantiene toda la lógica de negocio de Pagos (métricas, cobrar, WhatsApp, Sheet).
 */
export const TablaPagos = ({ initialAlumnos }: { initialAlumnos: Alumno[] }) => {
  // Adaptamos a BaseEntity: injecting 'name' y 'tags' por estado de pago
  const [alumnos, setAlumnos] = useState<Alumno[]>(
    initialAlumnos.map(a => ({
      ...a,
      name: a.nombre,
      tags: [
        a.is_moroso ? "Moroso" :
        a.pago_activo?.estado === 'pagado' ? "Pagado" :
        a.pago_activo?.estado === 'por_vencer' ? "Por vencer" :
        "Pendiente"
      ]
    }))
  );
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

  // Métricas KPI: se calculan sobre TODOS los alumnos (no el filtrado)
  const ingresosPagados = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado === 'pagado' ? (a.pago_activo.monto || a.monto || 0) : 0), 0);
  const ingresosPendientes = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0);
  const totalMorosos = alumnos.filter(a => a.is_moroso).length;

  // Lógica de Ordenamiento (inyectada al DashboardConsole)
  const handleSort = (items: Alumno[], order: string) => {
    return [...items].sort((a, b) => {
      switch (order) {
        case "nombre-asc": return a.nombre.localeCompare(b.nombre);
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

  const handleCobrar = async (alumnoId: string, pagoId: string) => {
    setLoadingIds(prev => new Set(prev).add(alumnoId));
    try {
      const { data, error } = await actions.pagos.registrarCobro({ alumno_id: alumnoId, pago_id: pagoId });
      if (error) { toast.error(pagosCopy.notifications.errorRegistering); return; }
      if (data?.success) {
        toast.success(data.mensaje);
        const now = new Date().toISOString();
        setAlumnos(prev => prev.map(a => {
          if (a.id === alumnoId && a.pago_activo) {
            const updatedPago = { ...a.pago_activo, estado: 'pagado' as const, fecha_pago: now };
            return { ...a, is_moroso: false, pago_activo: updatedPago, tags: ["Pagado"], historial: a.historial.map(p => p.id === pagoId ? updatedPago : p) };
          }
          return a;
        }));
        if (selectedAlumno?.id === alumnoId) {
          setSelectedAlumno(prev => prev ? ({
            ...prev, is_moroso: false, tags: ["Pagado"],
            pago_activo: { ...prev.pago_activo!, estado: 'pagado', fecha_pago: now },
            historial: prev.historial.map(p => p.id === pagoId ? { ...p, estado: 'pagado', fecha_pago: now } : p)
          }) : null);
        }
      }
    } catch { toast.error(pagosCopy.notifications.connectionError); }
    finally {
      setLoadingIds(prev => { const next = new Set(prev); next.delete(alumnoId); return next; });
    }
  };

  const enviarWhatsApp = async (alumno: Alumno) => {
    if (!alumno.telefono) return;
    const now = new Date().toISOString();
    setAlumnos(prev => prev.map(a => a.id === alumno.id ? { ...a, ultimo_recordatorio_pago_at: now } : a));
    actions.pagos.registrarNotificacion({ alumno_id: alumno.id }).catch(console.error);
    const cleanPhone = alumno.telefono.replace(/\D/g, '');
    const monto = alumno.pago_activo?.monto || alumno.monto || 0;
    const text = pagosCopy.notifications.whatsappMessage(alumno.nombre.split(' ')[0], monto);
    window.open(`https://wa.me/549${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  // RENDER: Tarjeta individual de alumno en modo GRID
  const renderAlumnoCard = (alumno: Alumno) => {
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
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-500 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all transform group-hover:rotate-2">
              {alumno.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-black text-zinc-950 dark:text-zinc-50 uppercase tracking-tight text-sm group-hover:text-lime-600 transition-colors">{alumno.nombre}</p>
              {alumno.telefono && <p className="text-[10px] text-zinc-400 font-medium">{alumno.telefono}</p>}
            </div>
          </div>
          <StatusBadge status={estado as any} />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Cuota</p>
            <p className="text-lg font-black text-zinc-950 dark:text-zinc-50">${(alumno.pago_activo?.monto || alumno.monto || 0).toLocaleString('es-AR')}</p>
          </div>
          {alumno.pago_activo?.fecha_vencimiento && (
            <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Vence</p>
              <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400">
                {new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(alumno.pago_activo.fecha_vencimiento))}
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {(alumno.is_moroso || (!isPaid && alumno.pago_activo)) && (
            <Button
              size="sm"
              className="flex-1 h-9 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-black text-[9px] uppercase tracking-widest rounded-2xl"
              disabled={loadingIds.has(alumno.id)}
              onClick={() => handleCobrar(alumno.id, alumno.pago_activo!.id)}
            >
              <DollarSign className="w-3.5 h-3.5 mr-1.5" />
              {loadingIds.has(alumno.id) ? "..." : "Cobrar"}
            </Button>
          )}
          {alumno.is_moroso && alumno.telefono && (
            <Button
              size="sm"
              variant="outline"
              className={cn(
                "h-9 px-3 rounded-2xl border-zinc-200 font-black text-[9px] uppercase tracking-widest",
                isNotified ? "opacity-50 grayscale cursor-not-allowed" : "hover:text-green-600 hover:border-green-300"
              )}
              disabled={isNotified}
              onClick={() => enviarWhatsApp(alumno)}
            >
              <Phone className="w-3.5 h-3.5" />
            </Button>
          )}
          {isPaid && (
            <div className="flex-1 h-9 flex items-center gap-2 justify-center text-lime-500 opacity-60 text-[9px] font-black uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4" />
              Pagado
            </div>
          )}
        </div>
      </Card>
    );
  };

  // Columns para la vista TABLA (StandardTable)
  const columns: TableColumn<Alumno>[] = [
    {
      header: pagosCopy.table.headers.student,
      render: (alumno) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950 dark:text-zinc-100">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-black text-zinc-500 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all transform group-hover:rotate-2">
            {alumno.nombre.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="group-hover:text-lime-600 transition-colors uppercase tracking-tight">{alumno.nombre}</span>
            {alumno.telefono && <span className="text-[10px] text-zinc-400 font-medium">{alumno.telefono}</span>}
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
            {fecha ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(fecha)) : pagosCopy.table.noCuota}
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
                className={cn("h-9 px-4 border-zinc-200 text-zinc-600 shadow-sm font-bold text-[10px] uppercase tracking-widest", isNotified ? "opacity-50 grayscale cursor-not-allowed" : "hover:text-green-600 hover:border-green-300 hover:bg-green-50")}
                disabled={isNotified}
                onClick={() => enviarWhatsApp(alumno)}
              >
                <Phone className="w-3.5 h-3.5 mr-2" />
                {isNotified ? "Notificado" : pagosCopy.table.notify}
              </Button>
            )}
            {(alumno.is_moroso || isPending) && alumno.pago_activo && (
              <Button
                className="h-9 px-4 bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200 font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                disabled={loadingIds.has(alumno.id)}
                onClick={() => handleCobrar(alumno.id, alumno.pago_activo!.id)}
              >
                {loadingIds.has(alumno.id) ? pagosCopy.table.saving : pagosCopy.table.registerPayment}
              </Button>
            )}
            {isPaid && (
              <div className="h-9 w-9 flex items-center justify-center text-lime-500 opacity-60">
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

      {/* Ã°Å¸â€œÅ  KPI Metrics Ã¢â‚¬â€ siempre visibles, sobre el console */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PagoMetricCard label={pagosCopy.metrics.collected.label} value={ingresosPagados} />
        <PagoMetricCard label={pagosCopy.metrics.pending.label} value={ingresosPendientes} />
        <PagoMetricCard label={pagosCopy.metrics.delinquent.label} value={totalMorosos} variant="destructive" />
      </div>

      {/* Ã°Å¸Å¡Â¨ Alertas de Morosos Ã¢â‚¬â€ Banner de acción rápida */}
      {totalMorosos > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <h2 className="text-sm font-black tracking-[.2em] text-zinc-900 dark:text-zinc-100 uppercase">
              Acción requerida hoy
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alumnos.filter(a => a.is_moroso).slice(0, 3).map(moroso => {
              const isNotified = isRecentlyNotified(moroso.ultimo_recordatorio_pago_at);
              return (
                <Card key={moroso.id} className="p-4 border-l-4 border-l-red-500 shadow-xl shadow-red-900/5 hover:shadow-red-900/10 transition-all flex justify-between items-center bg-white dark:bg-zinc-950/40 group cursor-pointer rounded-3xl" onClick={() => setSelectedAlumno(moroso)}>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest mb-1">Moroso</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-red-600 transition-colors">{moroso.nombre}</span>
                    <span className="text-[10px] text-zinc-500 font-medium">
                      Vencido hace {moroso.pago_activo?.fecha_vencimiento ? Math.floor((new Date().getTime() - new Date(moroso.pago_activo.fecha_vencimiento).getTime()) / (1000 * 3600 * 24)) : "?"} días
                    </span>
                  </div>
                  <Button
                    size="sm" variant="ghost"
                    className={cn("font-black text-[10px] uppercase tracking-widest gap-2", isNotified ? "text-zinc-500 grayscale opacity-50 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50")}
                    disabled={isNotified}
                    onClick={e => { e.stopPropagation(); enviarWhatsApp(moroso); }}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {isNotified ? "Enviado" : "Recordar"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </section>
      )}

      {/* Ã°Å¸â€“Â¥Ã¯Â¸Â Dashboard Console: Search + View Toggle + Sort + Tags + Grid/Tabla */}
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
            {items.map(alumno => renderAlumnoCard(alumno))}
          </div>
        )}
        renderTable={(items) => (
          <div className="bg-white dark:bg-zinc-950/20 border border-zinc-200 dark:border-zinc-800/60 rounded-3xl overflow-hidden p-2">
            <StandardTable
              data={items}
              columns={columns}
              searchTerm=""
              onSearchChange={() => {}}
              entityName="Alumnos"
              onRowClick={alumno => setSelectedAlumno(alumno)}
              emptyMessage={pagosCopy.table.emptySearchMessage}
              emptySearchMessage={pagosCopy.table.emptySearchMessage}
              EmptyIcon={UserIcon}
              hideSearch={true}
            />
          </div>
        )}
      />

      {/* Ã°Å¸â€œâ€¹ Sheet Drawer: Detalle del Alumno */}
      <Sheet open={!!selectedAlumno} onOpenChange={() => setSelectedAlumno(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
          {selectedAlumno && (
            <div className="flex flex-col h-full min-h-screen">
              <SheetHeader className="p-8 bg-white dark:bg-zinc-950/80 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-[2rem] bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-zinc-900/20">
                    {selectedAlumno.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left">
                    <SheetTitle className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 uppercase">{selectedAlumno.nombre}</SheetTitle>
                    <SheetDescription className="font-bold text-zinc-500 uppercase tracking-widest text-[10px] flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Día de pago: {selectedAlumno.dia_pago || 15} del mes
                    </SheetDescription>
                  </div>
                </div>
              </SheetHeader>

              <div className="p-8 space-y-8 flex-1">
                {/* Estado Actual */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Estado actual</h3>
                  <Card className="p-6 border-zinc-200 dark:border-zinc-800 shadow-xl shadow-zinc-900/5 bg-white dark:bg-zinc-950/80">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Monto de cuota</p>
                        <p className="text-3xl font-black text-zinc-950 dark:text-zinc-50">${selectedAlumno.monto?.toLocaleString('es-AR') || 0}</p>
                      </div>
                      <StatusBadge status={(selectedAlumno.is_moroso ? 'vencido' : (selectedAlumno.pago_activo?.estado || 'pendiente')) as any} />
                    </div>
                    <Separator className="my-6 bg-zinc-100 dark:bg-zinc-900" />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vencimiento</p>
                        <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                          {selectedAlumno.pago_activo?.fecha_vencimiento ? new Date(selectedAlumno.pago_activo.fecha_vencimiento).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "Ã¢â‚¬â€"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">ÃƒÅ¡ltimo pago</p>
                        <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                          {selectedAlumno.pago_activo?.fecha_pago ? new Date(selectedAlumno.pago_activo.fecha_pago).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "Pendiente"}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Acciones Rápidas */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl shadow-xl shadow-zinc-950/10 active:scale-95 transition-all bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950"
                    disabled={!selectedAlumno.pago_activo || selectedAlumno.pago_activo.estado === 'pagado' || loadingIds.has(selectedAlumno.id)}
                    onClick={() => handleCobrar(selectedAlumno.id, selectedAlumno.pago_activo!.id)}
                  >
                    <DollarSign className="w-4 h-4" />
                    {loadingIds.has(selectedAlumno.id) ? "Guardando..." : "Registrar pago"}
                  </Button>
                  {(() => {
                    const isRecentlyNotifiedVal = isRecentlyNotified(selectedAlumno.ultimo_recordatorio_pago_at);
                    return (
                      <Button
                        variant="outline"
                        className={cn("h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all bg-white dark:bg-zinc-950", isRecentlyNotifiedVal ? "opacity-50 cursor-not-allowed text-zinc-400" : "hover:border-lime-400 hover:text-lime-600")}
                        disabled={isRecentlyNotifiedVal}
                        onClick={() => enviarWhatsApp(selectedAlumno)}
                      >
                        <Phone className="w-4 h-4" />
                        {isRecentlyNotifiedVal ? "Enviado" : "Notificar"}
                      </Button>
                    );
                  })()}
                </div>

                {/* Historial */}
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Historial reciente</h3>
                  <div className="space-y-3">
                    {selectedAlumno.historial.slice(1, 5).map((pago: any) => (
                      <div key={pago.id} className="flex items-center justify-between p-4 bg-white dark:bg-zinc-950/80 rounded-2xl border border-zinc-100 dark:border-zinc-900 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", pago.estado === 'pagado' ? "bg-lime-400/10 text-lime-600" : "bg-red-400/10 text-red-600")}>
                            {pago.estado === 'pagado' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{new Date(pago.fecha_vencimiento).toLocaleDateString("es-AR", { month: 'long', year: 'numeric' })}</p>
                            <p className="text-[10px] font-medium text-zinc-400">{pago.estado === 'pagado' ? `Cobrado el ${new Date(pago.fecha_pago).toLocaleDateString()}` : "No cobrado"}</p>
                          </div>
                        </div>
                        <span className="font-extrabold text-zinc-950 dark:text-zinc-50 text-sm">${pago.monto?.toLocaleString('es-AR')}</span>
                      </div>
                    ))}
                    {selectedAlumno.historial.length <= 1 && (
                      <p className="text-center py-6 text-zinc-400 text-sm italic font-medium">No hay pagos anteriores registrados.</p>
                    )}
                  </div>
                </div>

                <Separator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
                <Button
                  variant="ghost"
                  className="w-full h-12 justify-between font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-lime-600 group"
                  onClick={() => window.location.href = `/profesor/alumnos/${selectedAlumno.id}`}
                >
                  Ver perfil completo
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

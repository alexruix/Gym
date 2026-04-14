import * as React from "react";
import { 
  RefreshCcw, 
  ArrowDown, 
  DollarSign, 
  Clock, 
  AlertTriangle, 
  User,
  Search,
  CheckCircle2,
  TrendingUp,
  CreditCard
} from "lucide-react";
import { usePayments } from "@/hooks/profesor/usePayments";
import { useStudentActions } from "@/hooks/useStudentActions";
import { StudentPaymentSheet } from "./StudentPaymentSheet";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/molecules/StatusBadge";
import { DashboardConsole as FilterConsole } from "@/components/molecules/profesor/DashboardConsole";
import { StandardTable, type TableColumn } from "@/components/organisms/StandardTable";
import { cn } from "@/lib/utils";
import { pagosCopy } from "@/data/es/profesor/pagos";
import type { PaymentsData, AlumnoPago } from "@/types/pagos";

// ─── SKELETONS ───────────────────────────────────────────────────────────────

const MetricSkeleton = () => (
  <div className="p-6 bg-zinc-100 dark:bg-zinc-900/50 rounded-3xl animate-pulse space-y-3">
    <div className="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded" />
    <div className="w-32 h-8 bg-zinc-300 dark:bg-zinc-700 rounded" />
  </div>
);

const CardSkeleton = () => (
  <div className="p-5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl animate-pulse space-y-4">
    <div className="flex justify-between">
      <div className="flex gap-3">
        <div className="w-10 h-10 bg-zinc-200 dark:bg-zinc-800 rounded-2xl" />
        <div className="space-y-2">
          <div className="w-24 h-4 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="w-16 h-3 bg-zinc-100 dark:bg-zinc-900 rounded" />
        </div>
      </div>
      <div className="w-16 h-6 bg-zinc-200 dark:bg-zinc-800 rounded-lg" />
    </div>
    <div className="h-px bg-zinc-100 dark:bg-zinc-800" />
    <div className="flex justify-between items-center">
      <div className="w-20 h-6 bg-zinc-200 dark:bg-zinc-800 rounded" />
      <div className="w-12 h-4 bg-zinc-100 dark:bg-zinc-900 rounded" />
    </div>
  </div>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface Props {
  initialData: PaymentsData;
}

export function PaymentsConsole({ initialData }: Props) {
  const { 
    data, 
    isRefreshing, 
    isPending,
    selectedAlumno, 
    setSelectedAlumno, 
    refreshData, 
    registrarCobro, 
    enviarRecordatorio,
    syncStudentData
  } = usePayments(initialData);

  // 1. Pull-to-refresh Logic
  const [pullDistance, setPullDistance] = React.useState(0);
  const touchStart = React.useRef<number | null>(null);
  const isPulling = React.useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      touchStart.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isPulling.current || touchStart.current === null) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.current;
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance * 0.4, 80));
    }
  };

  const handleTouchEnd = () => {
    if (pullDistance > 60) refreshData();
    setPullDistance(0);
    isPulling.current = false;
    touchStart.current = null;
  };

  // 2. Formatting & Helpers
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);

  const lastUpdatedText = React.useMemo(() => {
    if (!data.lastUpdated) return "";
    const date = new Date(data.lastUpdated);
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  }, [data.lastUpdated]);

  const handleSort = (items: any[], order: string) => {
    return [...items].sort((a, b) => {
      switch (order) {
        case "nombre-asc": return (a.nombre || "").localeCompare(b.nombre || "");
        case "monto-desc": return (b.pago_activo?.monto || 0) - (a.pago_activo?.monto || 0);
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

  const { openWhatsApp } = useStudentActions();

  const handleEnviarRecordatorio = React.useCallback((alumno: AlumnoPago) => {
    enviarRecordatorio(alumno);
  }, [enviarRecordatorio]);

  // 3. Render Helpers
  const renderItemCard = (alumno: AlumnoPago) => {
    const isPaid = alumno.pago_activo?.estado === 'pagado';
    const estado = alumno.is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente');

    return (
      <Card
        key={alumno.id}
        onClick={() => setSelectedAlumno(alumno)}
        className={cn(
          "p-5 flex flex-col gap-4 cursor-pointer transition-all hover:shadow-2xl hover:-translate-y-1 group bg-white dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-800 rounded-3xl",
          alumno.is_moroso && "border-l-4 border-l-red-500 shadow-red-500/5 hover:shadow-red-500/10"
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center font-bold text-zinc-500 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all transform group-hover:rotate-3">
              {alumno.nombre.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-zinc-950 dark:text-zinc-50 uppercase tracking-tight text-sm group-hover:text-lime-500 transition-colors">
                {alumno.nombre}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                {alumno.telefono || "Sin contacto"}
              </p>
            </div>
          </div>
          <StatusBadge status={estado as any} />
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Cuota</p>
            <p className="text-xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter">
              {formatCurrency(alumno.pago_activo?.monto || alumno.monto || 0)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Vencimiento</p>
            <p className="text-sm font-bold text-zinc-600 dark:text-zinc-300">
              {alumno.pago_activo?.fecha_vencimiento
                ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(alumno.pago_activo.fecha_vencimiento))
                : "--"}
            </p>
          </div>
        </div>

        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
          {!isPaid && (
            <Button
              size="sm"
              className="flex-1 h-10 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold text-xs uppercase tracking-widest hover:bg-lime-400 hover:text-zinc-950 transition-all active:scale-95"
              disabled={isPending}
              onClick={() => alumno.pago_activo && registrarCobro(alumno.id, alumno.pago_activo.id)}
            >
              <DollarSign className="w-3.5 h-3.5 mr-2" />
              Cobrar
            </Button>
          )}
          {alumno.is_moroso && (
            <Button
              variant="outline"
              size="icon"
              className="w-10 h-10 rounded-2xl border-zinc-200 dark:border-zinc-800 text-zinc-600 hover:text-green-500 hover:border-green-500 transition-all active:scale-95"
              onClick={() => enviarRecordatorio(alumno)}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </Button>
          )}
          {isPaid && (
             <div className="flex-1 h-10 flex items-center justify-center gap-2 text-lime-500/60 font-medium text-xs">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cobrado</span>
             </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div 
      className="space-y-8 relative pb-20"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Pull-to-refresh Indicator */}
      <div 
        className="absolute top-0 left-0 right-0 flex justify-center pointer-events-none transition-transform duration-200 z-50"
        style={{ transform: `translateY(${pullDistance - 40}px)`, opacity: pullDistance / 60 }}
      >
        <div className="bg-white dark:bg-zinc-900 shadow-2xl rounded-full p-2 border border-zinc-100 dark:border-zinc-800">
          <ArrowDown className={cn("w-5 h-5 text-lime-500 transition-transform", pullDistance > 60 && "rotate-180")} />
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isRefreshing ? (
          <>
            <MetricSkeleton />
            <MetricSkeleton />
            <MetricSkeleton />
          </>
        ) : (
          <>
            <Card className="p-6 bg-white dark:bg-zinc-950/40 border-none rounded-3xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                Recaudado ({new Intl.DateTimeFormat('es-AR', { month: 'long' }).format(new Date())})
              </p>
              <p className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter">
                {formatCurrency(data.metrics.ingresosPagados)}
              </p>
            </Card>
            <Card className="p-6 bg-white dark:bg-zinc-950/40 border-none rounded-3xl shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Pendiente</p>
              <p className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter">
                {formatCurrency(data.metrics.ingresosPendientes)}
              </p>
            </Card>
            <Card className={cn(
                "p-6 border-none rounded-3xl shadow-sm transition-all",
                data.metrics.totalMorosos > 0 ? "bg-red-50 dark:bg-red-950/20" : "bg-white dark:bg-zinc-950/40"
            )}>
              <p className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mb-1",
                  data.metrics.totalMorosos > 0 ? "text-red-600" : "text-zinc-400"
              )}>Deuda total</p>
              <div className="flex items-center gap-2">
                <p className={cn(
                    "text-3xl font-bold tracking-tighter",
                    data.metrics.totalMorosos > 0 ? "text-red-700 dark:text-red-400" : "text-zinc-950 dark:text-zinc-50"
                )}>
                  {formatCurrency(data.metrics.morosos.reduce((acc, m) => acc + (m.pago_activo?.monto || 0), 0))}
                </p>
                {data.metrics.totalMorosos > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {data.metrics.totalMorosos}
                    </span>
                )}
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Area */}
      <FilterConsole
        items={data.alumnos}
        itemLabel="Alumnos"
        storageKey="pagos_table"
        searchPlaceholder="Buscar por nombre..."
        allTags={["Pagado", "Pendiente", "Moroso"]}
        sortOptions={[
          { label: "Nombre A-Z", value: "nombre-asc" },
          { label: "Mayor monto", value: "monto-desc" },
          { label: "Próximo vencimiento", value: "vencimiento-asc" },
          { label: "Morosos primero", value: "morosos" },
        ]}
        onSort={handleSort}
        renderGrid={(items) => (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {isRefreshing 
              ? Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)
              : items.map(a => renderItemCard(a as AlumnoPago))
            }
          </div>
        )}
        renderTable={(items) => (
            <div className="bg-white dark:bg-zinc-950/40 rounded-3xl border border-zinc-100 dark:border-zinc-800 overflow-hidden">
                <StandardTable
                    data={items as AlumnoPago[]}
                    columns={[
                        { header: "Alumno", render: (a) => <span className="font-bold">{a.nombre}</span> },
                        { header: "Estado", render: (a) => <StatusBadge status={a.is_moroso ? "vencido" : (a.pago_activo?.estado || "pendiente") as any} /> },
                        { header: "Próx. Vencimiento", render: (a) => <span className="text-zinc-500">{a.pago_activo?.fecha_vencimiento || "--"}</span> },
                        { header: "Monto", render: (a) => <span className="font-mono">{formatCurrency(a.pago_activo?.monto || a.monto || 0)}</span> },
                    ]}
                    onRowClick={(a) => setSelectedAlumno(a)}
                    searchTerm=""
                    onSearchChange={() => {}}
                />
            </div>
        )}
      />

      {/* Footer / Status */}
      <div className="flex flex-col items-center justify-center gap-3 mt-12">
        <button 
          onClick={() => refreshData()}
          disabled={isRefreshing}
          className="group flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
        >
          <RefreshCcw className={cn("w-3.5 h-3.5 text-zinc-400 group-hover:text-lime-500 transition-colors", isRefreshing && "animate-spin text-lime-500")} />
          <span className="text-[10px] font-bold uppercase tracking-[.2em] text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors">
            {isRefreshing ? "Actualizando" : "Sincronizar"}
          </span>
        </button>
        <p className="font-mono text-[9px] uppercase tracking-[.3em] text-zinc-400">
          Última sincronización • {lastUpdatedText || "--:--"}
        </p>
      </div>

      {/* Detail Sheet */}
      {selectedAlumno && (
        <StudentPaymentSheet
          isOpen={!!selectedAlumno}
          onOpenChange={(o) => !o && setSelectedAlumno(null)}
          alumno={selectedAlumno}
          onPaymentSuccess={(updatedPago) => {
            syncStudentData(selectedAlumno.id, {
              pago_activo: updatedPago,
              is_moroso: false,
              tags: ["Pagado"]
            });
            refreshData(true);
          }}
          onStudentUpdate={(updates) => {
            syncStudentData(selectedAlumno.id, updates);
          }}
        />
      )}
    </div>
  );
}

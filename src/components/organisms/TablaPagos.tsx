import React, { useState, useMemo } from 'react';
import { actions } from 'astro:actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Phone, 
  CheckCircle2, 
  User as UserIcon, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle,
  Calendar,
  Clock,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { pagosCopy } from '@/data/es/profesor/pagos';
import { PagoMetricCard } from '@/components/molecules/profesor/PagoMetricCard';
import { StandardTable, type TableColumn } from '@/components/molecules/StandardTable';
import { PaymentStatus } from '@/components/atoms/PaymentStatus';
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
  nombre: string;
  email: string | null;
  telefono: string | null;
  monto: number | null;
  dia_pago: number | null;
  ultimo_recordatorio_pago_at: string | null;
  pago_activo: PagoActivo | null;
  is_moroso: boolean;
  historial: PagoActivo[];
};

const isRecentlyNotified = (dateString: string | null) => {
  if (!dateString) return false;
  const lastDate = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);
  return diffInHours < 24;
};

export const TablaPagos = ({ initialAlumnos }: { initialAlumnos: Alumno[] }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>(initialAlumnos);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyMorosos, setShowOnlyMorosos] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  const [selectedAlumno, setSelectedAlumno] = useState<Alumno | null>(null);

  // Métricas avanzadaas
  const totalActivos = alumnos.length;
  const ingresosPagados = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado === 'pagado' ? (a.pago_activo.monto || a.monto || 0) : 0), 0);
  const ingresosPendientes = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0);
  const ingresosEsperados = ingresosPagados + ingresosPendientes;
  const porcentajeCobranza = ingresosEsperados > 0 ? Math.round((ingresosPagados / ingresosEsperados) * 100) : 0;
  const totalMorosos = alumnos.filter(a => a.is_moroso).length;

  const filteredAlumnos = useMemo(() => {
    return alumnos.filter(alumno => {
      const matchesSearch = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesMoroso = showOnlyMorosos ? alumno.is_moroso : true;
      return matchesSearch && matchesMoroso;
    });
  }, [alumnos, searchTerm, showOnlyMorosos]);

  const handleCobrar = async (alumnoId: string, pagoId: string) => {
    setLoadingIds(prev => new Set(prev).add(alumnoId));
    try {
      const { data, error } = await actions.pagos.registrarCobro({
        alumno_id: alumnoId,
        pago_id: pagoId
      });

      if (error) {
        toast.error(pagosCopy.notifications.errorRegistering);
        return;
      }

      if (data?.success) {
        toast.success(data.mensaje);
        const now = new Date().toISOString();
        setAlumnos(prev => prev.map(a => {
          if (a.id === alumnoId && a.pago_activo) {
            const updatedPago = {
              ...a.pago_activo,
              estado: 'pagado' as const,
              fecha_pago: now
            };
            return {
              ...a,
              is_moroso: false,
              pago_activo: updatedPago,
              historial: a.historial.map(p => p.id === pagoId ? updatedPago : p)
            };
          }
          return a;
        }));
        if (selectedAlumno?.id === alumnoId) {
           setSelectedAlumno(prev => prev ? ({
              ...prev,
              is_moroso: false,
              pago_activo: { ...prev.pago_activo!, estado: 'pagado', fecha_pago: now },
              historial: prev.historial.map(p => p.id === pagoId ? { ...p, estado: 'pagado', fecha_pago: now } : p)
           }) : null);
        }
      }
    } catch (e) {
      toast.error(pagosCopy.notifications.connectionError);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(alumnoId);
        return next;
      });
    }
  };

  const enviarWhatsApp = async (alumno: Alumno) => {
    if (!alumno.telefono) return;
    
    try {
      const now = new Date().toISOString();
      setAlumnos(prev => prev.map(a => 
        a.id === alumno.id ? { ...a, ultimo_recordatorio_pago_at: now } : a
      ));
      
      // Intentamos registrar la notificación, si falla igual intentamos abrir WhatsApp
      actions.pagos.registrarNotificacion({ alumno_id: alumno.id }).catch(console.error);

      const cleanPhone = alumno.telefono.replace(/\D/g, '');
      const monto = alumno.pago_activo?.monto || alumno.monto || 0;
      const text = pagosCopy.notifications.whatsappMessage(alumno.nombre.split(' ')[0], monto);
      const url = `https://wa.me/549${cleanPhone}?text=${encodeURIComponent(text)}`;
      window.open(url, '_blank');
    } catch (e) {
      toast.error("No se pudo iniciar el envío.");
    }
  };

  const columns: TableColumn<Alumno>[] = [
    {
      header: pagosCopy.table.headers.student,
      render: (alumno) => (
        <div className="flex items-center gap-3 font-bold text-zinc-950">
          <div className="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center font-black text-zinc-500 text-xs shrink-0 group-hover:bg-lime-400 group-hover:text-zinc-950 transition-all transform group-hover:rotate-2">
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
          <span className="text-zinc-600 font-semibold text-sm">
            {fecha ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short' }).format(new Date(fecha)) : pagosCopy.table.noCuota}
          </span>
        );
      }
    },
    {
      header: pagosCopy.table.headers.status,
      render: (alumno) => {
        const estado = alumno.is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente');
        return <PaymentStatus status={estado as any} className="w-fit" />;
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
                variant="outline" 
                size="sm" 
                className={cn(
                  "h-9 px-4 border-zinc-200 text-zinc-600 shadow-sm font-bold text-[10px] uppercase tracking-widest",
                  isNotified ? "opacity-50 grayscale cursor-not-allowed" : "hover:text-green-600 hover:border-green-300 hover:bg-green-50"
                )}
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
            {!isPaid && !alumno.is_moroso && !isPending && (
               <Button 
                 variant="ghost" 
                 size="icon" 
                 className="h-9 w-9 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 rounded-xl"
                 onClick={() => setSelectedAlumno(alumno)}
               >
                 <Info className="w-4 h-4" />
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

  const tableFilters = (
    <Button 
      variant={showOnlyMorosos ? "destructive" : "outline"} 
      className="h-12 px-6 rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all gap-2"
      onClick={() => setShowOnlyMorosos(!showOnlyMorosos)}
    >
      <AlertTriangle className={cn("w-4 h-4", showOnlyMorosos ? "text-white" : "text-zinc-400")} />
      {showOnlyMorosos ? pagosCopy.table.clearFilter : pagosCopy.table.filterMorosos}
    </Button>
  );

  return (
    <div className="space-y-12">
      {/* Alertas Rápidas / Acción Requerida */}
      {totalMorosos > 0 && (
        <section className="animate-in fade-in slide-in-from-top-4 duration-1000 delay-300">
           <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-black tracking-tight text-zinc-900 uppercase italic">
                Acción Requirida HoY
              </h2>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alumnos.filter(a => a.is_moroso).slice(0, 3).map(moroso => (
                 <Card key={moroso.id} className="p-4 border-l-4 border-l-red-500 shadow-xl shadow-red-900/5 hover:shadow-red-900/10 transition-all flex justify-between items-center bg-white group cursor-pointer" onClick={() => setSelectedAlumno(moroso)}>
                    <div className="flex flex-col">
                       <span className="text-xs font-black text-red-600 uppercase tracking-widest mb-1">Moroso</span>
                       <span className="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">{moroso.nombre}</span>
                       <span className="text-xs text-zinc-500 font-medium">Vencido hace {
                          moroso.pago_activo?.fecha_vencimiento 
                            ? Math.floor((new Date().getTime() - new Date(moroso.pago_activo.fecha_vencimiento).getTime()) / (1000 * 3600 * 24))
                            : "?"
                        } días</span>
                    </div>
                    {(() => {
                        const isNotified = isRecentlyNotified(moroso.ultimo_recordatorio_pago_at);
                        return (
                          <Button 
                             size="sm" 
                             variant="ghost" 
                             className={cn(
                               "font-black text-[10px] uppercase tracking-widest gap-2",
                               isNotified ? "text-zinc-500 grayscale opacity-50 cursor-not-allowed" : "text-red-600 hover:text-red-700 hover:bg-red-50"
                             )}
                             disabled={isNotified}
                             onClick={(e) => {
                                e.stopPropagation();
                                enviarWhatsApp(moroso);
                             }}
                          >
                             <Phone className="w-3.5 h-3.5" />
                             {isNotified ? "Enviado" : "Recordar"}
                          </Button>
                        );
                    })()}
                 </Card>
              ))}
           </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PagoMetricCard 
          label={pagosCopy.metrics.collected.label} 
          value={ingresosPagados} 
        />
        <PagoMetricCard 
          label={pagosCopy.metrics.pending.label} 
          value={ingresosPendientes} 
        />
        <PagoMetricCard 
          label={pagosCopy.metrics.delinquent.label} 
          value={totalMorosos} 
          variant="destructive"
        />
      </div>

      <StandardTable 
        data={filteredAlumnos}
        columns={columns}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder={pagosCopy.table.searchPlaceholder}
        filters={tableFilters}
        entityName="Alumnos"
        onRowClick={(alumno) => setSelectedAlumno(alumno)}
        emptyMessage={pagosCopy.table.emptySearchMessage}
        emptySearchMessage={pagosCopy.table.emptySearchMessage}
        EmptyIcon={UserIcon}
      />

      {/* Detalle del Alumno (Drawer) */}
      <Sheet open={!!selectedAlumno} onOpenChange={() => setSelectedAlumno(null)}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-zinc-50 border-zinc-200">
           {selectedAlumno && (
              <div className="flex flex-col h-full min-h-screen">
                 <SheetHeader className="p-8 bg-white border-b border-zinc-100">
                    <div className="flex items-center gap-4">
                       <div className="w-16 h-16 rounded-[2rem] bg-zinc-900 flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-zinc-900/20">
                          {selectedAlumno.nombre.charAt(0).toUpperCase()}
                       </div>
                       <div className="text-left">
                          <SheetTitle className="text-2xl font-black tracking-tighter text-zinc-950 uppercase">{selectedAlumno.nombre}</SheetTitle>
                          <SheetDescription className="font-bold text-zinc-500 uppercase tracking-widest text-[10px] flex items-center gap-2">
                             <Calendar className="w-3 h-3" />
                             Día de pago: {selectedAlumno.dia_pago || 15} del mes
                          </SheetDescription>
                       </div>
                    </div>
                 </SheetHeader>

                 <div className="p-8 space-y-8 flex-1">
                    {/* Info de Pago Actual */}
                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Estado Actual</h3>
                       <Card className="p-6 border-zinc-200 shadow-xl shadow-zinc-900/5 bg-white relative overflow-hidden">
                          <div className="relative z-10 flex justify-between items-center">
                             <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Monto de cuota</p>
                                <p className="text-3xl font-black text-zinc-950">${selectedAlumno.monto?.toLocaleString() || 0}</p>
                             </div>
                             <PaymentStatus status={(selectedAlumno.is_moroso ? 'vencido' : (selectedAlumno.pago_activo?.estado || 'pendiente')) as any} />
                          </div>
                          
                          <Separator className="my-6 bg-zinc-50" />
                          
                          <div className="grid grid-cols-2 gap-4">
                             <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vencimiento</p>
                                <p className="font-bold text-zinc-700 text-sm">{selectedAlumno.pago_activo?.fecha_vencimiento ? new Date(selectedAlumno.pago_activo.fecha_vencimiento).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "-"}</p>
                             </div>
                             <div>
                                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Último Pago</p>
                                <p className="font-bold text-zinc-700 text-sm">{selectedAlumno.pago_activo?.fecha_pago ? new Date(selectedAlumno.pago_activo.fecha_pago).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "Pendiente"}</p>
                             </div>
                          </div>
                       </Card>
                    </div>

                    {/* Acciones Rápidas */}
                    <div className="grid grid-cols-2 gap-3">
                       <Button 
                          className="h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl shadow-xl shadow-zinc-950/10 active:scale-95 transition-all bg-zinc-950 hover:bg-zinc-800"
                          disabled={!selectedAlumno.pago_activo || selectedAlumno.pago_activo.estado === 'pagado' || loadingIds.has(selectedAlumno.id)}
                          onClick={() => handleCobrar(selectedAlumno.id, selectedAlumno.pago_activo!.id)}
                       >
                          <DollarSign className="w-4 h-4" />
                          {loadingIds.has(selectedAlumno.id) ? "Guardando..." : "Registrar Pago"}
                       </Button>
                       {(() => {
                           const isRecentlyNotifiedVal = isRecentlyNotified(selectedAlumno.ultimo_recordatorio_pago_at);
                           return (
                             <Button 
                                variant="outline"
                                className={cn(
                                   "h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl border-zinc-200 active:scale-95 transition-all bg-white",
                                   isRecentlyNotifiedVal ? "opacity-50 cursor-not-allowed text-zinc-400" : "hover:border-lime-400 hover:text-lime-600"
                                )}
                                disabled={isRecentlyNotifiedVal}
                                onClick={() => enviarWhatsApp(selectedAlumno)}
                             >
                                <Phone className="w-4 h-4" />
                                {isRecentlyNotifiedVal ? "Enviado" : "Notificar"}
                             </Button>
                           );
                        })()}
                    </div>

                    {/* Historial de Pagos */}
                    <div className="space-y-4">
                       <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">Historial Reciente</h3>
                       <div className="space-y-3">
                          {selectedAlumno.historial.slice(1, 5).map((pago: any) => (
                             <div key={pago.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                                <div className="flex items-center gap-3">
                                   <div className={cn(
                                      "w-8 h-8 rounded-xl flex items-center justify-center",
                                      pago.estado === 'pagado' ? "bg-lime-400/10 text-lime-600" : "bg-red-400/10 text-red-600"
                                   )}>
                                      {pago.estado === 'pagado' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-zinc-900">{new Date(pago.fecha_vencimiento).toLocaleDateString("es-AR", { month: 'long', year: 'numeric' })}</p>
                                      <p className="text-[10px] font-medium text-zinc-400">{pago.estado === 'pagado' ? `Cobrado el ${new Date(pago.fecha_pago).toLocaleDateString()}` : "No cobrado"}</p>
                                   </div>
                                </div>
                                <span className="font-extrabold text-zinc-950 text-sm">${pago.monto?.toLocaleString()}</span>
                             </div>
                          ))}
                          {selectedAlumno.historial.length <= 1 && (
                             <p className="text-center py-6 text-zinc-400 text-sm italic font-medium">No hay pagos anteriores registrados</p>
                          )}
                       </div>
                    </div>

                    {/* Acciones Secundarias */}
                    <Separator className="bg-zinc-200/50" />
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

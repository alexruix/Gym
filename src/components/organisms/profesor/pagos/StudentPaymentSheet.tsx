import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Phone,
  CheckCircle2,
  DollarSign,
  Calendar,
  Clock,
  ChevronRight,
  Pencil,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { pagosCopy } from '@/data/es/profesor/pagos';
import { StatusBadge } from '@/components/molecules/StatusBadge';
import { cn } from '@/lib/utils';
import { useStudentActions } from '@/hooks/useStudentActions';
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

export interface StudentPaymentSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  alumno: {
    id: string;
    nombre: string;
    monto: number | null;
    dia_pago: number | null;
    pago_activo: PagoActivo | null;
    is_moroso?: boolean;
    historial_pagos: PagoActivo[];
    telefono?: string;
    ultimo_recordatorio_pago_at?: string | null;
  };
  onPaymentSuccess?: (updatedPago: PagoActivo) => void;
  onMontoUpdate?: (newMonto: number) => void;
}

const isRecentlyNotified = (dateString: string | null | undefined) => {
  if (!dateString) return false;
  const lastDate = new Date(dateString);
  const now = new Date();
  const diffInHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);
  return diffInHours < 24;
};

export function StudentPaymentSheet({ isOpen, onOpenChange, alumno, onPaymentSuccess, onMontoUpdate }: StudentPaymentSheetProps) {
  const [isCharging, setIsCharging] = useState(false);
  const [isEditingMonto, setIsEditingMonto] = useState(false);
  const [tempMonto, setTempMonto] = useState(alumno.monto?.toString() || "0");
  const [isSavingMonto, setIsSavingMonto] = useState(false);
  const { openWhatsApp } = useStudentActions();
  
  // Si no hay is_moroso inyectado, calculamos rudimentario basado en el pago_activo
  const is_moroso = alumno.is_moroso ?? (alumno.pago_activo?.estado === 'vencido');

  const handleCobrar = async (pagoId: string) => {
    setIsCharging(true);
    try {
      const { data, error } = await actions.pagos.registrarCobro({ alumno_id: alumno.id, pago_id: pagoId });
      if (error) { toast.error(pagosCopy.notifications.errorRegistering); return; }
      
      if (data?.success) {
        toast.success(data.mensaje);
        const now = new Date().toISOString();
        if (alumno.pago_activo && onPaymentSuccess) {
            const updatedPago = { ...alumno.pago_activo, estado: 'pagado' as const, fecha_pago: now };
            onPaymentSuccess(updatedPago);
        }
      }
    } catch { 
      toast.error(pagosCopy.notifications.connectionError); 
    } finally {
      setIsCharging(false);
    }
  };

  const handleSaveMonto = async () => {
    const newMonto = parseFloat(tempMonto);
    if (isNaN(newMonto) || newMonto < 0) {
      toast.error("El monto debe ser un numero valido");
      return;
    }

    setIsSavingMonto(true);
    try {
      const { data, error } = await actions.profesor.updateStudent({ 
        id: alumno.id, 
        monto: newMonto 
      });
      
      if (error) {
        toast.error("No se pudo actualizar el monto");
        return;
      }

      if (data?.success) {
        toast.success("Monto actualizado");
        if (onMontoUpdate) onMontoUpdate(newMonto);
        setIsEditingMonto(false);
      }
    } catch {
      toast.error("Error de conexion al actualizar");
    } finally {
      setIsSavingMonto(false);
    }
  };

  const enviarWhatsApp = async () => {
    if (!alumno.telefono) {
      toast.error("Para sincronizar recordatorios, primero agendá el número de " + alumno.nombre);
      window.location.assign(`/profesor/alumnos/${alumno.id}/edit`);
      return;
    }

    try {
        actions.pagos.registrarNotificacion({ alumno_id: alumno.id }).catch(console.error);
        
        await openWhatsApp(alumno.nombre, alumno.telefono, { type: 'payment' });
        
        if (onPaymentSuccess && alumno.pago_activo) {
            onPaymentSuccess(alumno.pago_activo);
        }
    } catch {
       toast.error("Error el ejecutar accion");
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-md p-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col h-full min-h-screen">
                <SheetHeader className="p-8 bg-white dark:bg-zinc-950/80 border-b border-zinc-100 dark:border-zinc-900">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-[2rem] bg-zinc-900 dark:bg-zinc-800 flex items-center justify-center font-black text-white text-xl shadow-2xl shadow-zinc-900/20">
                    {alumno.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="text-left">
                    <SheetTitle className="text-2xl font-black tracking-tighter text-zinc-950 dark:text-zinc-50 uppercase">{alumno.nombre}</SheetTitle>
                    <SheetDescription className="font-bold text-zinc-500 uppercase tracking-widest text-[10px] flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Día de pago: {alumno.dia_pago || 15} del mes
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
                        <div className="flex-1">
                          <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Monto de cuota</p>
                          {isEditingMonto ? (
                            <div className="flex items-center gap-2 group/edit animate-in fade-in slide-in-from-left-2 transition-all">
                              <span className="text-2xl font-black text-zinc-400">$</span>
                              <Input 
                                type="number"
                                value={tempMonto}
                                onChange={(e) => setTempMonto(e.target.value)}
                                className="h-10 text-xl font-black w-32 bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveMonto();
                                  if (e.key === 'Escape') setIsEditingMonto(false);
                                }}
                              />
                              <div className="flex items-center gap-1">
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-lg text-emerald-500 hover:bg-emerald-500/10"
                                  onClick={handleSaveMonto}
                                  disabled={isSavingMonto}
                                >
                                  {isSavingMonto ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  className="h-8 w-8 rounded-lg text-red-500 hover:bg-red-500/10"
                                  onClick={() => {
                                    setIsEditingMonto(false);
                                    setTempMonto(alumno.monto?.toString() || "0");
                                  }}
                                  disabled={isSavingMonto}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div 
                              className="group/val flex items-center gap-3 cursor-pointer hover:opacity-80 transition-all"
                              onClick={() => {
                                setTempMonto(alumno.monto?.toString() || "0");
                                setIsEditingMonto(true);
                              }}
                            >
                              <p className="text-3xl font-black text-zinc-950 dark:text-zinc-50">${alumno.monto?.toLocaleString('es-AR') || 0}</p>
                              <Pencil className="w-4 h-4 text-zinc-300 opacity-0 group-hover/val:opacity-100 transition-opacity" />
                            </div>
                          )}
                        </div>
                        <StatusBadge status={(is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente')) as any} />
                    </div>
                    <Separator className="my-6 bg-zinc-100 dark:bg-zinc-900" />
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Vencimiento</p>
                            <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                                {alumno.pago_activo?.fecha_vencimiento ? new Date(alumno.pago_activo.fecha_vencimiento).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "—"}
                            </p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Último pago</p>
                            <p className="font-bold text-zinc-700 dark:text-zinc-300 text-sm">
                                {alumno.pago_activo?.fecha_pago ? new Date(alumno.pago_activo.fecha_pago).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }) : "Pendiente"}
                            </p>
                        </div>
                    </div>
                    </Card>
                </div>

                {/* Acciones Rápidas */}
                <div className="grid grid-cols-2 gap-3">
                    <Button
                    className="h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl shadow-xl shadow-zinc-950/10 active:scale-95 transition-all bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-950"
                    disabled={!alumno.pago_activo || alumno.pago_activo.estado === 'pagado' || isCharging}
                    onClick={() => handleCobrar(alumno.pago_activo!.id)}
                    >
                    <DollarSign className="w-4 h-4" />
                    {isCharging ? "Guardando..." : "Registrar pago"}
                    </Button>
                    {(() => {
                    const isRecentlyNotifiedVal = isRecentlyNotified(alumno.ultimo_recordatorio_pago_at);
                    if (!alumno.telefono) {
                        return (
                            <Button
                                variant="outline"
                                className="h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl border-zinc-200 border-dashed text-zinc-400 hover:text-lime-600 hover:border-lime-400 dark:border-zinc-800 bg-white dark:bg-zinc-950"
                                onClick={enviarWhatsApp}
                            >
                                <Phone className="w-4 h-4" />
                                Añadir WhatsApp
                            </Button>
                        );
                    }
                    return (
                        <Button
                            variant="outline"
                            className={cn("h-14 font-black uppercase tracking-widest text-[10px] gap-2 rounded-2xl border-zinc-200 dark:border-zinc-800 active:scale-95 transition-all bg-white dark:bg-zinc-950", isRecentlyNotifiedVal ? "opacity-50 cursor-not-allowed text-zinc-400" : "hover:border-lime-400 hover:text-lime-600")}
                            disabled={isRecentlyNotifiedVal}
                            onClick={enviarWhatsApp}
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
                    {alumno.historial_pagos.slice(1, 5).map((pago: any) => (
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
                    {alumno.historial_pagos.length <= 1 && (
                        <p className="text-center py-6 text-zinc-400 text-[10px] uppercase font-black tracking-widest">No hay historial</p>
                    )}
                    </div>
                </div>

                <Separator className="bg-zinc-200/50 dark:bg-zinc-800/50" />
                <Button
                    variant="ghost"
                    className="w-full h-12 justify-between font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-lime-600 group"
                    onClick={() => {
                        onOpenChange(false);
                    }}
                >
                    Volver a la ficha
                    <ChevronRight className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                </Button>
                </div>
            </div>
        </SheetContent>
    </Sheet>
  );
}

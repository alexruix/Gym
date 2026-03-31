import React, { useState } from 'react';
import { actions } from 'astro:actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { Phone, CheckCircle2, AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

type PagoActivo = {
  id: string;
  monto: number;
  fecha_vencimiento: string;
  estado: 'pendiente' | 'pagado' | 'vencido';
  fecha_pago: string | null;
};

type Alumno = {
  id: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  monto: number | null;
  dia_pago: number | null;
  pago_activo: PagoActivo | null;
  is_moroso: boolean;
};

export const TablaPagos = ({ initialAlumnos }: { initialAlumnos: Alumno[] }) => {
  const [alumnos, setAlumnos] = useState<Alumno[]>(initialAlumnos);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOnlyMorosos, setShowOnlyMorosos] = useState(false);
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  // Métricas
  const ingresosPagados = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado === 'pagado' ? (a.pago_activo.monto || a.monto || 0) : 0), 0);
  const ingresosPendientes = alumnos.reduce((acc, a) => acc + (a.pago_activo?.estado !== 'pagado' ? (a.pago_activo?.monto || a.monto || 0) : 0), 0);
  const totalMorosos = alumnos.filter(a => a.is_moroso).length;

  const filteredAlumnos = alumnos.filter(alumno => {
    const matchesSearch = alumno.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMoroso = showOnlyMorosos ? alumno.is_moroso : true;
    return matchesSearch && matchesMoroso;
  });

  const handleCobrar = async (alumnoId: string, pagoId: string) => {
    setLoadingIds(prev => new Set(prev).add(alumnoId));
    try {
      const { data, error } = await actions.pagos.registrarCobro({
        alumno_id: alumnoId,
        pago_id: pagoId
      });

      if (error) {
        toast.error("Hubo un error al registrar el cobro");
        console.error(error);
        return;
      }

      if (data?.success) {
        toast.success(data.mensaje);
        // Refresh local data by setting this alumno's payment as pagado instantly
        setAlumnos(prev => prev.map(a => {
          if (a.id === alumnoId && a.pago_activo) {
            return {
              ...a,
              is_moroso: false,
              pago_activo: {
                ...a.pago_activo,
                estado: 'pagado',
                fecha_pago: new Date().toISOString()
              }
            };
          }
          return a;
        }));
      }
    } catch (e) {
      toast.error("Error de conexión");
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(alumnoId);
        return next;
      });
    }
  };

  const enviarWhatsApp = (alumno: Alumno) => {
    if (!alumno.telefono) return;
    const cleanPhone = alumno.telefono.replace(/\D/g, '');
    const monto = alumno.pago_activo?.monto || alumno.monto || 0;
    const text = `¡Hola ${alumno.nombre.split(' ')[0]}! Te escribo del gimnasio para recordarte el vencimiento de tu cuota mensual ($${monto}). ¡Cualquier duda avisame, muchas gracias!`;
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Zona de Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardDescription>Cobrado este mes</CardDescription>
            <CardTitle className="text-3xl text-zinc-900">${ingresosPagados.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-sm border-zinc-200">
          <CardHeader className="pb-2">
            <CardDescription>Pendiente de cobro</CardDescription>
            <CardTitle className="text-3xl text-zinc-500">${ingresosPendientes.toLocaleString()}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-xl shadow-red-900/5 border-red-100 bg-red-50/30">
          <CardHeader className="pb-2">
            <CardDescription className="text-red-700 font-semibold">Alumnos Morosos</CardDescription>
            <CardTitle className="text-3xl text-red-700">{totalMorosos}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabla Interactiva */}
      <Card className="shadow-xl shadow-zinc-900/5">
        <div className="p-4 border-b border-zinc-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-zinc-50/50 rounded-t-xl text-sm">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <Input 
              placeholder="Buscar alumno..." 
              className="pl-9 w-full bg-white shadow-sm border-zinc-300 h-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant={showOnlyMorosos ? "destructive" : "outline"} 
            className="w-full sm:w-auto text-xs h-9 font-bold tracking-wide"
            onClick={() => setShowOnlyMorosos(!showOnlyMorosos)}
          >
            {showOnlyMorosos ? "Mostrando Morosos (Borrar filtro)" : "Filtrar Morosos"}
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-xs font-semibold text-zinc-500 uppercase tracking-widest bg-white">
                <th className="p-4 rounded-tl-xl font-bold">Alumno</th>
                <th className="p-4 font-bold">Vencimiento</th>
                <th className="p-4 font-bold">Estado</th>
                <th className="p-4 font-bold text-right rounded-tr-xl">Acción</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-zinc-100">
              {filteredAlumnos.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-zinc-500">
                    No se encontraron alumnos para este filtro.
                  </td>
                </tr>
              ) : (
                filteredAlumnos.map((alumno) => {
                  const estado = alumno.is_moroso ? 'vencido' : (alumno.pago_activo?.estado || 'pendiente');
                  const fechaStr = alumno.pago_activo?.fecha_vencimiento ? new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(alumno.pago_activo.fecha_vencimiento)) : 'Sin cuota generada';
                  
                  return (
                    <tr key={alumno.id} className="hover:bg-zinc-50 transition-colors group">
                      <td className="p-4">
                        <p className="font-semibold text-zinc-900 group-hover:text-lime-600 transition-colors uppercase text-sm tracking-wide">{alumno.nombre}</p>
                        {alumno.telefono && <p className="text-xs text-zinc-500">{alumno.telefono}</p>}
                      </td>
                      <td className="p-4 text-sm text-zinc-600 font-medium whitespace-nowrap">
                        {fechaStr}
                      </td>
                      <td className="p-4">
                        {estado === 'pagado' && <Badge className="bg-lime-500/10 text-lime-700 hover:bg-lime-500/20 border-0">Pagado</Badge>}
                        {estado === 'pendiente' && <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20 border-0">Pendiente</Badge>}
                        {estado === 'vencido' && <Badge variant="destructive" className="bg-red-500/10 text-red-700 hover:bg-red-500/20 border-0 shadow-none gap-1"><AlertCircle className="w-3 h-3"/> Vencido</Badge>}
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        {alumno.is_moroso && alumno.telefono && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-zinc-600 hover:text-green-600 hover:border-green-300 hover:bg-green-50 w-full sm:w-auto shadow-sm"
                            onClick={() => enviarWhatsApp(alumno)}
                          >
                            <Phone className="w-4 h-4 mr-1 sm:mr-0" /> <span className="sm:hidden ml-1">Avisar</span>
                          </Button>
                        )}
                        {alumno.pago_activo && estado !== 'pagado' && (
                          <Button 
                            className="bg-zinc-900 hover:bg-zinc-800 text-white w-full sm:w-auto shadow-xl shadow-zinc-200"
                            size="sm"
                            disabled={loadingIds.has(alumno.id)}
                            onClick={() => handleCobrar(alumno.id, alumno.pago_activo!.id)}
                          >
                            {loadingIds.has(alumno.id) ? "Guardando..." : "Registrar Pago"}
                          </Button>
                        )}
                        {estado === 'pagado' && (
                          <Button variant="ghost" size="sm" disabled className="text-zinc-400 opacity-60 w-full sm:w-auto">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

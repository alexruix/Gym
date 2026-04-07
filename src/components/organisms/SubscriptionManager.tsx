import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, Edit2, Check, X, ShieldCheck, Users, TrendingUp, AlertTriangle, Plus, Trash2 } from 'lucide-react';
import { actions } from 'astro:actions';
import { suscripcionesCopy } from '@/data/es/profesor/suscripciones';
import { cn } from '@/lib/utils';
import { useAsyncAction } from '@/hooks/useAsyncAction';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface SubscriptionManagerProps {
    initialSubscriptions: any[];
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ initialSubscriptions }) => {
    const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMonto, setEditMonto] = useState<number>(0);
    const [editNombre, setEditNombre] = useState<string>("");
    const [editDias, setEditDias] = useState<number>(0);

    // UI States
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const { execute, isPending: isUpdating } = useAsyncAction();

    // Autofocus en el input cuando se crea uno nuevo
    useEffect(() => {
        if (editingId === 'temp' && nameInputRef.current) {
            nameInputRef.current.focus();
        }
    }, [editingId]);

    const handleAddNew = () => {
        if (editingId === 'temp') return;

        const tempSub = {
            id: 'temp',
            nombre: '',
            monto: 0,
            cantidad_dias: 0,
            isNew: true
        };

        setSubscriptions([tempSub, ...subscriptions]);
        setEditingId('temp');
        setEditNombre('');
        setEditMonto(0);
        setEditDias(0);
    };

    const handleStartEdit = (sub: any) => {
        setEditingId(sub.id);
        setEditMonto(sub.monto);
        setEditNombre(sub.nombre);
        setEditDias(sub.cantidad_dias);
    };

    const handleCancel = () => {
        if (editingId === 'temp') {
            setSubscriptions(prev => prev.filter(s => s.id !== 'temp'));
        }
        setEditingId(null);
    };

    const handleSave = async () => {
        if (!editingId) return;

        // Si es nuevo o estamos cambiando nombre/monto
        await execute(async () => {
            if (editingId === 'temp') {
                const { data, error } = await actions.suscripcion.upsertSubscription({
                    nombre: editNombre || `${suscripcionesCopy.newPlan.defaultName} ${editDias} días`,
                    monto: editMonto,
                    cantidad_dias: editDias
                });
                if (error) throw error;

                // Reemplazar el temp con el real
                setSubscriptions(prev => prev.map(s => s.id === 'temp' ? data : s));
                toast.success(suscripcionesCopy.newPlan.success);
            } else {
                const { data, error } = await actions.suscripcion.updateMassivePrices({
                    suscripcion_id: editingId,
                    nuevo_monto: editMonto,
                    nuevo_nombre: editNombre
                });
                if (error) throw error;

                // Actualizar localmente
                setSubscriptions(prev => prev.map(s => s.id === editingId ? { ...s, monto: editMonto, nombre: data?.nombre || editNombre } : s));
            }
        }, {
            successMsg: editingId !== 'temp' ? suscripcionesCopy.massiveUpdate.success : undefined,
            onSuccess: () => {
                setEditingId(null);
                setIsConfirmOpen(false);
            }
        });
    };

    const handleDelete = async () => {
        if (!isDeletingId) return;

        await execute(async () => {
            const { error } = await actions.suscripcion.deleteSubscription({ id: isDeletingId });
            if (error) throw error;

            setSubscriptions(prev => prev.filter(s => s.id !== isDeletingId));
        }, {
            successMsg: "Plan eliminado y alumnos personalizados",
            onSuccess: () => {
                setIsDeletingId(null);
            }
        });
    };

    return (
        <div className="space-y-8">
            {/* Header Industrial */}
            <div className="flex justify-between items-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-4 pr-6 shadow-sm">
                <div className="flex items-center gap-3 pl-4">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{suscripcionesCopy.headerTitle}</h2>
                </div>
                <Button
                    onClick={handleAddNew}
                    disabled={editingId === 'temp' || isUpdating}
                    className="h-11 px-6 rounded-xl bg-lime-500 hover:bg-lime-500 text-zinc-950 font-bold uppercase tracking-widest text-[10px] gap-2 shadow-lg shadow-lime-500/10 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    {suscripcionesCopy.createPlan}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subscriptions.map((sub) => {
                    const isEditing = editingId === sub.id;

                    return (
                        <div key={sub.id} className={cn(
                            "bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden",
                            isEditing && "border-zinc-950 dark:border-white ring-4 ring-zinc-100 dark:ring-zinc-900 shadow-2xl"
                        )}>
                            <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-50 dark:bg-zinc-900 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-700" />

                            <div className="relative space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 rounded-[1.2rem] bg-zinc-950 dark:bg-white flex items-center justify-center text-lime-400 dark:text-zinc-950 group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                    <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">
                                        {isEditing ? (
                                            <select
                                                value={editDias}
                                                onChange={(e) => setEditDias(Number(e.target.value))}
                                                className="bg-transparent border-none outline-none font-bold text-zinc-950 dark:text-white cursor-pointer"
                                                disabled={sub.id !== 'temp'} // Solo permitimos cambiar días en planes nuevos para no romper mapeos
                                            >
                                                {[0, 1, 2, 3, 4, 5, 6, 7].map(d => (
                                                    <option key={d} value={d}>{d === 0 ? suscripcionesCopy.fields.libre : `${d} días`}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            sub.cantidad_dias === 0 ? suscripcionesCopy.fields.libre : `${sub.cantidad_dias} ${suscripcionesCopy.fields.cantidadDias}`
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {isEditing ? (
                                        <input
                                            ref={nameInputRef}
                                            type="text"
                                            value={editNombre}
                                            onChange={(e) => setEditNombre(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl px-4 py-3 text-2xl font-bold uppercase tracking-tighter focus:border-zinc-950 dark:focus:border-white transition-all outline-none"
                                            placeholder={suscripcionesCopy.placeholders.nombre}
                                        />
                                    ) : (
                                        <h3 className="text-3xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter leading-none">{sub.nombre}</h3>
                                    )}
                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none pt-1">Cuota mensual recurrente</p>
                                </div>

                                <div className="pt-6 flex items-end justify-between border-t border-zinc-100 dark:border-zinc-900">
                                    {isEditing ? (
                                        <div className="flex flex-col gap-4 w-full">
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="relative flex-1">
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold">$</span>
                                                    <input
                                                        type="number"
                                                        value={editMonto}
                                                        onChange={(e) => setEditMonto(Number(e.target.value))}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-[1.5rem] pl-9 pr-4 py-3 text-xl font-bold focus:border-zinc-950 dark:focus:border-white transition-all outline-none"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => sub.id === 'temp' ? handleSave() : setIsConfirmOpen(true)}
                                                    className="p-4 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-[1.5rem] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-950/20"
                                                    disabled={isUpdating}
                                                >
                                                    <Check className="w-6 h-6" />
                                                </button>
                                                <button
                                                    onClick={handleCancel}
                                                    className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-400 rounded-[1.5rem] hover:bg-zinc-50 transition-colors"
                                                >
                                                    <X className="w-6 h-6" />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div>
                                                <span className="text-4xl font-bold text-zinc-950 dark:text-zinc-50 tracking-tighter">${sub.monto.toLocaleString('es-AR')}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStartEdit(sub)}
                                                    className="p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded-2xl hover:bg-zinc-950 dark:hover:bg-white hover:text-white dark:hover:text-zinc-950 transition-all duration-300"
                                                    title={suscripcionesCopy.editPlan}
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => setIsDeletingId(sub.id)}
                                                    className="p-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all duration-300"
                                                    title={suscripcionesCopy.deletePlan}
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>

                                {isEditing && sub.id !== 'temp' && (
                                    <div className="text-[9px] font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2 animate-pulse">
                                        <ShieldCheck className="w-4 h-4" />
                                        <span>{suscripcionesCopy.massiveUpdate.caution}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Blindaje */}
            <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-10 flex flex-col md:flex-row items-center gap-6 text-center md:text-left transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-400 shrink-0 shadow-sm">
                    <TrendingUp className="w-8 h-8" />
                </div>
                <div className="flex-1">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-zinc-900 dark:text-zinc-100">{suscripcionesCopy.footer.shieldTitle}</h4>
                    <p className="text-xs text-zinc-500 mt-2 leading-relaxed max-w-2xl" dangerouslySetInnerHTML={{ __html: suscripcionesCopy.footer.shieldDesc }} />
                </div>
            </div>

            {/* Dialog de Confirmación Massiva */}
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 mx-auto">
                            <AlertTriangle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">
                            {suscripcionesCopy.massiveUpdate.title}
                        </DialogTitle>
                        <DialogDescription className="text-center font-medium text-zinc-500 text-sm leading-relaxed">
                            {suscripcionesCopy.massiveUpdate.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-3 mt-6">
                        <Button
                            className="w-full h-14 rounded-2xl bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 font-bold uppercase tracking-widest text-[10px] hover:scale-102 active:scale-98 transition-all"
                            onClick={handleSave}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <TrendingUp className="w-4 h-4 animate-spin mr-2" /> : null}
                            {suscripcionesCopy.massiveUpdate.confirm}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-400 hover:text-zinc-600"
                            onClick={() => setIsConfirmOpen(false)}
                            disabled={isUpdating}
                        >
                            {suscripcionesCopy.massiveUpdate.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Dialog de Borrado (Auto-Lock Warning) */}
            <Dialog open={!!isDeletingId} onOpenChange={(open) => !open && setIsDeletingId(null)}>
                <DialogContent className="max-w-md rounded-[2.5rem] border-red-100 dark:border-red-900/30 bg-white dark:bg-zinc-950 p-8 shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-600 mx-auto animate-pulse">
                            <Trash2 className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-2xl font-bold text-center uppercase tracking-tighter text-zinc-950 dark:text-zinc-50">
                            {suscripcionesCopy.deleteDialog.title}
                        </DialogTitle>
                        <DialogDescription className="text-center font-medium text-zinc-500 text-sm leading-relaxed">
                            {suscripcionesCopy.deleteDialog.description}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-col gap-3 mt-6">
                        <Button
                            className="w-full h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold uppercase tracking-widest text-[10px] hover:scale-102 active:scale-98 transition-all shadow-lg shadow-red-500/20"
                            onClick={handleDelete}
                            disabled={isUpdating}
                        >
                            {isUpdating ? <TrendingUp className="w-4 h-4 animate-spin mr-2" /> : null}
                            {suscripcionesCopy.deleteDialog.confirm}
                        </Button>
                        <Button
                            variant="ghost"
                            className="w-full h-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] text-zinc-400 hover:text-zinc-600"
                            onClick={() => setIsDeletingId(null)}
                            disabled={isUpdating}
                        >
                            {suscripcionesCopy.deleteDialog.cancel}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

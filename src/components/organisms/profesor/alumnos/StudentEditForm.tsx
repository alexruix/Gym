import React from "react";
import { Calendar as CalendarIcon, Loader2, Save, Archive, CreditCard, Clock } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";
import { DatePicker } from "@/components/molecules/profesor/core/DatePicker";
import { DaySelector } from "@/components/atoms/profesor/DaySelector";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";

// Hooks
import { useStudentEditForm } from "@/hooks/profesor/alumnos/useStudentEditForm";

interface Props {
    alumno: any;
    turnos?: any[];
    subscriptions?: any[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

/**
 * StudentEditForm: Editor unificado de perfiles de alumnos.
 * Fragmentado en secciones modulares sincronizadas por useStudentEditForm.
 */
export function StudentEditForm({ alumno, turnos = [], subscriptions = [], onSuccess, onCancel }: Props) {
    const {
        form,
        isMounted,
        isPending,
        isArchiving,
        isArchiveDialogOpen,
        setIsArchiveDialogOpen,
        montoPersonalizado,
        handleSuscripcionChange,
        handleArchive,
        onSubmit
    } = useStudentEditForm({ alumno, subscriptions: subscriptions || [], onSuccess });

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                <p className="industrial-label text-zinc-300 uppercase text-[10px]">Cargando Edición...</p>
            </div>
        );
    }

    return (
        <Form {...(form as any)}>
            <form onSubmit={onSubmit} className="space-y-12">
                {/* 1. IDENTIDAD */}
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField control={form.control} name="nombre" render={({ field, fieldState }) => (
                        <StandardField label="Nombre Completo" error={fieldState.error?.message} required>
                            <FormControl><Input placeholder="Ej: Juan Pérez" {...field} className="font-bold h-12 rounded-xl" /></FormControl>
                        </StandardField>
                    )} />
                    <FormField control={form.control} name="email" render={({ field, fieldState }) => (
                        <StandardField label="Email" error={fieldState.error?.message} required>
                            <FormControl><Input type="email" placeholder="email@ejemplo.com" {...field} className="h-12 rounded-xl" /></FormControl>
                        </StandardField>
                    )} />
                    <FormField control={form.control} name="telefono" render={({ field, fieldState }) => (
                        <StandardField label="Teléfono" error={fieldState.error?.message} hint="Fundamental para WhatsApp">
                            <FormControl><div className="relative group/phone">
                                <WhatsappLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/phone:text-lime-500 transition-all" />
                                <Input type="tel" placeholder="+54 9..." {...field} value={field.value || ""} className="pl-11 h-12 rounded-xl" />
                            </div></FormControl>
                        </StandardField>
                    )} />
                    <FormField control={form.control} name="fecha_nacimiento" render={({ field, fieldState }) => (
                        <StandardField label="Fecha de nacimiento" error={fieldState.error?.message} hint="Para el cálculo de edad">
                            <FormControl><DatePicker date={field.value} setDate={field.onChange} label="Nacimiento" placeholder="Opcional" error={!!fieldState.error} /></FormControl>
                        </StandardField>
                    )} />
                </div>

                {/* 2. AGENDA */}
                <div className="space-y-6">
                    <div className="industrial-section-header"><Clock className="w-4 h-4" /><h3 className="industrial-label">Agenda y Horarios</h3></div>
                    <div className="grid gap-8 sm:grid-cols-2 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900">
                        <FormField control={form.control} name="turno_id" render={({ field, fieldState }) => (
                            <StandardField label="Turno Principal" error={fieldState.error?.message}>
                                <Select onValueChange={field.onChange} value={field.value || undefined}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Bloque horario" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-2xl">{turnos.map(t => <SelectItem key={t.id} value={t.id} className="rounded-lg">{t.nombre} ({t.hora_inicio.slice(0,5)} a {t.hora_fin.slice(0,5)})</SelectItem>)}</SelectContent></Select>
                            </StandardField>
                        )} />
                        <FormField control={form.control} name="dias_asistencia" render={({ field }) => (
                            <StandardField label="Días de asistencia" hint="Visibilidad en la agenda semanal">
                                <FormControl><DaySelector selectedDays={field.value || []} onChange={field.onChange} /></FormControl>
                            </StandardField>
                        )} />
                    </div>
                </div>

                {/* 3. FINANZAS */}
                <div className="space-y-6">
                    <div className="industrial-section-header"><CreditCard className="w-4 h-4" /><h3 className="industrial-label">Ciclo y Finanzas</h3></div>
                    <div className="grid gap-8 sm:grid-cols-2 bg-zinc-50/50 dark:bg-zinc-900/10 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900">
                        <FormField control={form.control} name="fecha_inicio" render={({ field, fieldState }) => (
                            <FormItem className="space-y-1.5"><FormLabel className="industrial-label">Fecha de Inicio</FormLabel>
                                <div className="flex gap-2"><FormControl><DatePicker date={field.value} setDate={field.onChange} label="Inicio" error={!!fieldState.error} required /></FormControl>
                                <Button type="button" variant="outline" className="h-12 px-4 rounded-xl text-[9px] uppercase font-bold" onClick={() => form.setValue("fecha_inicio", new Date())}><CalendarIcon className="w-3.5 h-3.5 mr-1" /> Hoy</Button></div><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="dia_pago" render={({ field, fieldState }) => (
                            <StandardField label="Día de Pago" error={fieldState.error?.message} required>
                                <div className="space-y-4"><Select onValueChange={(v) => field.onChange(parseInt(v))} value={String(field.value)}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Día" /></SelectTrigger></FormControl>
                                <SelectContent className="max-h-[300px] rounded-2xl">{Array.from({length:31},(_,i)=>i+1).map(d=><SelectItem key={d} value={String(d)} className="rounded-lg">Día {d}</SelectItem>)}</SelectContent></Select>
                                <QuickOptionsGroup options={["1","5","10","15"]} selectedOptions={[String(field.value)]} onToggle={(d)=>field.onChange(parseInt(d))} /></div>
                            </StandardField>
                        )} />
                        <FormField control={form.control} name="suscripcion_id" render={({ field, fieldState }) => (
                            <StandardField label="Plan base" error={fieldState.error?.message}>
                                <Select onValueChange={handleSuscripcionChange} value={field.value || undefined}><FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Seleccioná plan" /></SelectTrigger></FormControl>
                                <SelectContent className="rounded-2xl">{subscriptions.map(s=><SelectItem key={s.id} value={s.id} className="rounded-lg">{s.nombre} (${s.monto})</SelectItem>)}</SelectContent></Select>
                            </StandardField>
                        )} />
                        <FormField control={form.control} name="monto" render={({ field, fieldState }) => (
                            <StandardField label="Monto cuota" error={fieldState.error?.message} hint={montoPersonalizado ? "Editado manualmente" : "Fijado por plan"}>
                                <FormControl><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-zinc-400">$</span><Input type="number" {...field} onChange={e=>field.onChange(parseFloat(e.target.value))} disabled={!montoPersonalizado} className={cn("pl-8 h-12 rounded-xl", !montoPersonalizado && "bg-zinc-100 opacity-70")} /></div></FormControl>
                            </StandardField>
                        )} />
                        <FormField control={form.control} name="monto_personalizado" render={({ field }) => (
                            <FormItem className="col-span-full"><div className="p-4 rounded-xl bg-white dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800 flex items-center justify-between"><div className="space-y-0.5"><Label className="text-[10px] uppercase font-bold tracking-widest">Monto personalizado</Label><p className="text-[10px] text-zinc-400">Ignora aumentos globales</p></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></div></FormItem>
                        )} />
                    </div>
                </div>

                {/* FOOTER ACCIONES */}
                <div className="flex flex-wrap gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-800 justify-between items-center">
                    <Button type="button" variant="outline" size="sm" onClick={()=>setIsArchiveDialogOpen(true)} className="rounded-xl h-11 px-4 text-red-500 hover:bg-red-50 hover:border-red-100"><Archive className="w-4 h-4 mr-2" /> Archivar alumno</Button>
                    <div className="flex gap-3"><Button type="button" variant="outline" size="lg" onClick={onCancel || (()=>window.history.back())} className="rounded-xl h-14 px-8 border-zinc-200">Cancelar</Button>
                    <Button type="submit" variant="industrial" size="xl" disabled={isPending} className="px-12 h-14 rounded-2xl">{isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /> Guardar</>}</Button></div>
                </div>
            </form>

            <DeleteConfirmDialog isOpen={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen} title="Archivar Alumno" description={<>¿Confirmás que deseás archivar a <strong>{alumno.nombre}</strong>?</>} onConfirm={handleArchive} isDeleting={isArchiving} />
        </Form>
    );
}

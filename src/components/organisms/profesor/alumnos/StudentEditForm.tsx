import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { updateStudentSchema } from "@/lib/validators";
import type { z } from "zod";
import { toast } from "sonner";
import { Calendar, Phone, Loader2, Save, X, Archive, CreditCard, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { useStudentActions } from "@/hooks/useStudentActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";
import { DeleteConfirmDialog } from "@/components/molecules/DeleteConfirmDialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

import { DaySelector } from "@/components/atoms/profesor/DaySelector";


type FormValues = z.infer<typeof updateStudentSchema>;

interface Student {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    monto?: number | null;
    suscripcion_id?: string | null;
    monto_personalizado: boolean;
    notas?: string | null;
    turno_id?: string | null;
    dias_asistencia?: string[];
}

interface Turno {
    id: string;
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
}

interface StudentEditFormProps {
    alumno: Student;
    turnos?: Turno[];
    subscriptions?: { id: string, nombre: string, monto: number }[];
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function StudentEditForm({ alumno, turnos = [], subscriptions = [], onSuccess, onCancel }: StudentEditFormProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
    const { execute, isPending } = useAsyncAction();
    const { isArchiving, archiveStudent } = useStudentActions();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const form = useForm<FormValues>({
        resolver: zodResolver(updateStudentSchema) as any,
        defaultValues: {
            id: alumno.id,
            nombre: alumno.nombre,
            email: alumno.email || "",
            telefono: alumno.telefono || "",
            fecha_inicio: new Date(alumno.fecha_inicio),
            dia_pago: alumno.dia_pago,
            monto: alumno.monto || 0,
            suscripcion_id: alumno.suscripcion_id || null,
            monto_personalizado: alumno.monto_personalizado || false,
            notas: alumno.notas || "",
            turno_id: alumno.turno_id || null,
            dias_asistencia: alumno.dias_asistencia || [],
        },
    });

    const montoPersonalizado = form.watch("monto_personalizado");

    // Lógica de sincronización de monto
    const handleSuscripcionChange = (subId: string) => {
        form.setValue("suscripcion_id", subId);
        if (!montoPersonalizado) {
            const sub = subscriptions.find(s => s.id === subId);
            if (sub) {
                form.setValue("monto", sub.monto);
            }
        }
    };

    const onSubmit = async (data: FormValues) => {
        execute(async () => {
            const { data: result, error } = await actions.profesor.updateStudent(data);
            if (error) throw error;
            if (result?.success) {
                if (onSuccess) onSuccess();
                else window.location.assign(`/profesor/alumnos/${alumno.id}`);
            }
        }, {
            successMsg: "Alumno actualizado correctamente",
        });
    };

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Cargando Formulario...</p>
            </div>
        );
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
            >
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field, fieldState }) => (
                            <StandardField
                                label="Nombre Completo"
                                error={fieldState.error?.message}
                                required
                            >
                                <FormControl>
                                    <Input placeholder="Ej: Juan Pérez" {...field} className="font-bold" />
                                </FormControl>
                            </StandardField>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                            <StandardField
                                label="Email"
                                error={fieldState.error?.message}
                                required
                            >
                                <FormControl>
                                    <Input type="email" placeholder="email@ejemplo.com" {...field} />
                                </FormControl>
                            </StandardField>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field, fieldState }) => (
                            <StandardField
                                label="Teléfono"
                                error={fieldState.error?.message}
                                hint="Fundamental para WhatsApp"
                            >
                                <FormControl>
                                    <div className="relative group/phone">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/phone:text-lime-500 transition-colors" />
                                        <Input type="tel" placeholder="+54 9..." {...field} value={field.value || ""} className="pl-11" />
                                    </div>
                                </FormControl>
                            </StandardField>
                        )}
                    />
                </div>

                <div className="grid gap-10 sm:grid-cols-2 pt-4">
                    <FormField
                        control={form.control}
                        name="fecha_inicio"
                        render={({ field, fieldState }) => (
                            <FormItem className="space-y-1.5 w-full">
                                <div className="flex justify-between items-end px-1">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 select-none">
                                        Fecha de Inicio <span className="text-lime-500 ml-0.5">*</span>
                                    </FormLabel>
                                </div>
                                <div className="flex gap-2">
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            value={(field.value instanceof Date && !isNaN(field.value.getTime())) 
                                                ? field.value.toISOString().split('T')[0] 
                                                : ''}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (!val) return;
                                                const date = new Date(val + 'T12:00:00'); // Evitar problemas de zona horaria
                                                field.onChange(date);
                                            }}
                                            className="font-bold border-zinc-200"
                                        />
                                    </FormControl>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="px-4 rounded-xl font-black uppercase text-[9px] tracking-widest text-zinc-400 hover:text-lime-600 hover:border-lime-500 transition-all active:scale-95 shrink-0"
                                        onClick={() => form.setValue("fecha_inicio", new Date(), { shouldValidate: true })}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" /> Hoy
                                    </Button>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dia_pago"
                        render={({ field, fieldState }) => (
                            <StandardField
                                label="Día de Pago"
                                error={fieldState.error?.message}
                                hint="Se ajusta cada mes"
                                required
                            >
                                <div className="space-y-4">
                                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? String(field.value) : undefined}>
                                        <FormControl>
                                            <SelectTrigger className="rounded-xl border-zinc-200 font-bold">
                                                <SelectValue placeholder="Elegí día" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="max-h-[300px] rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                            {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                <SelectItem key={day} value={String(day)} className="rounded-xl font-bold">
                                                    Día {day}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <QuickOptionsGroup
                                        options={["1", "5", "10", "15"]}
                                        selectedOptions={[String(field.value)]}
                                        onToggle={(day) => field.onChange(parseInt(day))}
                                    />
                                </div>
                            </StandardField>
                        )}
                    />
                </div>
                {/* GRUPO 3: AGENDA Y HORARIOS */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1 text-zinc-400">
                        <Clock className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Agenda y Horarios
                        </h3>
                    </div>

                    <div className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 sm:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900/50 space-y-10 transition-all hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-zinc-100/50 dark:hover:shadow-none duration-500">
                        <FormField
                            control={form.control}
                            name="turno_id"
                            render={({ field, fieldState }) => (
                                <StandardField
                                    label="Turno principal"
                                    error={fieldState.error?.message}
                                    hint="Define en qué bloque horario aparecerá en la agenda"
                                >
                                    <FormControl>
                                        <Select onValueChange={field.onChange} value={field.value || undefined}>
                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 font-bold">
                                                <SelectValue placeholder="Seleccioná un bloque" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                                {turnos.length > 0 ? (
                                                    turnos.map((turno) => (
                                                        <SelectItem key={turno.id} value={turno.id} className="rounded-xl py-3 font-bold">
                                                            {turno.nombre} ({turno.hora_inicio.slice(0, 5)} a {turno.hora_fin.slice(0, 5)})
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <div className="p-6 text-center space-y-4">
                                                        <p className="text-xs font-bold text-zinc-500">No hay bloques horarios creados</p>
                                                    </div>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </StandardField>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dias_asistencia"
                            render={({ field }) => (
                                <StandardField
                                    label="Días de asistencia"
                                    hint="Filtrará la visibilidad del alumno en la agenda diaria"
                                >
                                    <div className="space-y-6">
                                        <FormControl>
                                            <DaySelector
                                                selectedDays={field.value || []}
                                                onChange={field.onChange}
                                            />
                                        </FormControl>

                                        <div className="flex flex-wrap gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                                onClick={() => field.onChange(["Lunes", "Miércoles", "Viernes"])}
                                            >
                                                L-M-V
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                                onClick={() => field.onChange(["Martes", "Jueves"])}
                                            >
                                                M-J
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="rounded-xl font-black text-[9px] uppercase tracking-widest h-8 border-zinc-100 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                                                onClick={() => field.onChange(["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"])}
                                            >
                                                Lu a Vi
                                            </Button>
                                        </div>
                                    </div>
                                </StandardField>
                            )}
                        />
                    </div>
                </div>


                {/* GRUPO 4: FINANZAS Y SUSCRIPCIÓN */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2 px-1 text-zinc-400">
                        <CreditCard className="w-4 h-4" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                            Finanzas y Suscripción
                        </h3>
                    </div>

                    <div className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 sm:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900/50 space-y-8 transition-all hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-zinc-100/50 dark:hover:shadow-none duration-500">
                        <div className="grid gap-8 sm:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="suscripcion_id"
                                render={({ field, fieldState }) => (
                                    <StandardField
                                        label="Plan mensual"
                                        error={fieldState.error?.message}
                                        hint="Determina el monto mensual base"
                                    >
                                        <FormControl>
                                            <Select onValueChange={handleSuscripcionChange} value={field.value || undefined}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 font-bold">
                                                    <SelectValue placeholder="Seleccioná un plan" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                                    {subscriptions.length > 0 ? (
                                                        subscriptions.map((sub) => (
                                                            <SelectItem key={sub.id} value={sub.id} className="rounded-xl py-3 font-bold">
                                                                {sub.nombre} (${sub.monto.toLocaleString()})
                                                            </SelectItem>
                                                        ))
                                                    ) : (
                                                        <div className="p-4 text-center">
                                                            <p className="text-xs font-bold text-zinc-500">No hay planes configurados</p>
                                                        </div>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </StandardField>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="monto"
                                render={({ field, fieldState }) => (
                                    <StandardField
                                        label="Monto de cuota"
                                        error={fieldState.error?.message}
                                        hint={montoPersonalizado ? "Editando monto manualmente" : "Monto fijado por el plan"}
                                    >
                                        <FormControl>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-400">$</span>
                                                <Input 
                                                    type="number" 
                                                    {...field} 
                                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                                    disabled={!montoPersonalizado}
                                                    className={cn(
                                                        "h-14 pl-8 rounded-2xl font-black text-lg transition-all",
                                                        !montoPersonalizado ? "bg-zinc-100 dark:bg-zinc-900 border-transparent opacity-70" : "bg-white dark:bg-zinc-950 border-zinc-200"
                                                    )} 
                                                />
                                            </div>
                                        </FormControl>
                                    </StandardField>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="monto_personalizado"
                            render={({ field }) => (
                                <div className="flex items-center justify-between p-4 bg-zinc-100/50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200/50">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Monto personalizado</Label>
                                        <p className="text-[10px] text-zinc-500 font-medium tracking-tight">Activalo para ignorar aumentos masivos de este plan</p>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </div>
                            )}
                        />
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="notas"
                    render={({ field, fieldState }) => (
                        <StandardField
                            label="Notas Médicas"
                            error={fieldState.error?.message}
                        >
                            <FormControl>
                                <Input
                                    placeholder="Aclaraciones sobre lesiones o cuidado especial..."
                                    {...field}
                                    value={field.value || ""}
                                    className="bg-zinc-50/30 border-zinc-100 dark:bg-zinc-900/10 focus:bg-white dark:focus:bg-zinc-950 transition-all font-medium h-12"
                                />
                            </FormControl>
                        </StandardField>
                    )}
                />

                <div className="flex flex-wrap gap-3 pt-10 justify-between items-center border-t border-zinc-100 dark:border-zinc-800">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsArchiveDialogOpen(true)}
                        className="rounded-xl font-bold uppercase tracking-widest text-[9px] h-11 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
                    >
                        <Archive className="w-4 h-4 mr-2" /> Archivar Alumno
                    </Button>

                    <div className="flex gap-3 items-center">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={onCancel || (() => window.location.assign(`/profesor/alumnos/${alumno.id}`))}
                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                        >
                            <X className="w-4 h-4 mr-2" /> Cancelar
                        </Button>
                        <Button
                            type="submit"
                            variant="industrial"
                            size="xl"
                            disabled={isPending}
                            className="px-12"
                        >
                            {isPending ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5 mr-3" />
                                    <span className="text-sm">Guardar Cambios</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            <DeleteConfirmDialog
                isOpen={isArchiveDialogOpen}
                onOpenChange={setIsArchiveDialogOpen}
                onConfirm={async () => {
                    await archiveStudent(alumno.id, {
                        onSuccess: () => {
                            window.location.assign("/profesor/alumnos");
                        }
                    });
                }}
                title="Archivar"
                description={<>¿Estás seguro que querés archivar a <strong>{alumno.nombre}</strong>?</>}
                isDeleting={isArchiving}
            />
        </Form>
    );
}

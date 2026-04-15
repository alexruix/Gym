import * as React from "react";
import { inviteStudentCopy } from "@/data/es/profesor/alumnos";
import { UserCircle2, Briefcase, Info, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { WhatsappLogoIcon } from "@phosphor-icons/react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";
import { DatePicker } from "@/components/molecules/profesor/core/DatePicker";

// Modular Pieces
import { InviteSuccessDialog } from "@/components/molecules/profesor/alumnos/InviteSuccessDialog";
import { useInviteStudentForm } from "@/hooks/profesor/alumnos/useInviteStudentForm";

interface Props {
    plans: any[];
    turnos?: any[];
}

/**
 * InviteStudentForm: Organismo optimizado (V2.1) para la captación de nuevos alumnos.
 * Descompuesto en piezas atómicas para maximizar la latencia de interacción.
 */
export function InviteStudentForm({ plans, turnos = [] }: Props) {
    const {
        form,
        isMounted,
        isPending,
        successData,
        onSubmit,
        actions
    } = useInviteStudentForm({ plans });

    if (!isMounted) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-300">Cargando Formulario...</p>
            </div>
        );
    }

    return (
        <>
            <Form {...(form as any)}>
                <form onSubmit={onSubmit} className="space-y-12">
                    {/* GRUPO 1: IDENTIDAD */}
                    <div className="space-y-6">
                        <div className="industrial-section-header">
                            <UserCircle2 className="w-4 h-4" />
                            <h3 className="industrial-label">{inviteStudentCopy.sections.basicInfo}</h3>
                        </div>

                        <div className="industrial-section-container space-y-6">
                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="nombre"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.nombre} error={fieldState.error?.message} required>
                                            <FormControl>
                                                <Input placeholder={inviteStudentCopy.placeholders.nombre} {...field} autoComplete="name" className="font-bold h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                                            </FormControl>
                                        </StandardField>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.email} error={fieldState.error?.message} required>
                                            <FormControl>
                                                <Input type="email" placeholder={inviteStudentCopy.placeholders.email} {...field} autoComplete="email" className="h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                                            </FormControl>
                                        </StandardField>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="telefono"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.telefono} error={fieldState.error?.message} hint="Fundamental para WhatsApp">
                                            <FormControl>
                                                <div className="relative group/phone">
                                                    <WhatsappLogoIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/phone:text-lime-500 transition-colors" />
                                                    <Input type="tel" placeholder={inviteStudentCopy.placeholders.telefono} {...field} autoComplete="tel" className="pl-11 h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                                                </div>
                                            </FormControl>
                                        </StandardField>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="fecha_nacimiento"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.fechaNacimiento} error={fieldState.error?.message} hint={inviteStudentCopy.hints.fechaNacimiento}>
                                            <FormControl>
                                                <DatePicker date={field.value} setDate={field.onChange} label={inviteStudentCopy.labels.fechaNacimiento} placeholder="Opcional" error={!!fieldState.error} />
                                            </FormControl>
                                        </StandardField>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    {/* GRUPO 2: NEGOCIO */}
                    <div className="space-y-6">
                        <div className="industrial-section-header">
                            <Briefcase className="w-4 h-4" />
                            <h3 className="industrial-label">{inviteStudentCopy.sections.planAndDates}</h3>
                        </div>

                        <div className="industrial-section-container space-y-8">
                            <FormField
                                control={form.control}
                                name="plan_id"
                                render={({ field, fieldState }) => (
                                    <StandardField label={inviteStudentCopy.labels.plan} error={fieldState.error?.message} hint={inviteStudentCopy.hints.plan} required>
                                        <div className="space-y-4">
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="industrial-select-trigger">
                                                        <SelectValue placeholder={inviteStudentCopy.placeholders.plan} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                                    {plans.map((plan) => (
                                                        <SelectItem key={plan.id} value={plan.id} className="rounded-xl py-3 font-bold">
                                                            {plan.nombre} {plan.frecuencia_semanal ? `(${plan.frecuencia_semanal}d)` : ""}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <QuickOptionsGroup options={plans.map(p => p.nombre)} selectedOptions={plans.filter(p => p.id === field.value).map(p => p.nombre.toLowerCase())} onToggle={(name) => {
                                                const plan = plans.find(p => p.nombre.toLowerCase() === name);
                                                if (plan) form.setValue("plan_id", plan.id, { shouldValidate: true });
                                            }} />
                                        </div>
                                    </StandardField>
                                )}
                            />

                            <div className="grid gap-6 sm:grid-cols-2">
                                <FormField
                                    control={form.control}
                                    name="fecha_inicio"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.fechaInicio} error={fieldState.error?.message} hint={inviteStudentCopy.hints.fechaInicio} required>
                                            <div className="flex gap-3">
                                                <FormControl>
                                                    <DatePicker date={field.value} setDate={field.onChange} label={inviteStudentCopy.labels.fechaInicio} error={!!fieldState.error} required />
                                                </FormControl>
                                                <Button type="button" variant="outline" className="h-14 px-5 rounded-2xl font-bold uppercase text-[9px] tracking-widest text-zinc-400 hover:text-lime-600 hover:border-lime-500 transition-all active:scale-95 shrink-0" onClick={() => field.onChange(new Date())}>
                                                    <CalendarIcon className="w-4 h-4 mr-2" /> Hoy
                                                </Button>
                                            </div>
                                        </StandardField>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dia_pago"
                                    render={({ field, fieldState }) => (
                                        <StandardField label={inviteStudentCopy.labels.diaPago} error={fieldState.error?.message} hint="Se sincroniza con el inicio" required>
                                            <div className="space-y-4">
                                                <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? String(field.value) : undefined}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 font-bold">
                                                            <SelectValue placeholder="Elegí día" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-[300px] rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                                                            <SelectItem key={day} value={String(day)} className="rounded-xl font-bold">Día {day}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <QuickOptionsGroup options={["1", "5", "10", "15"]} selectedOptions={[String(field.value)]} onToggle={(day) => field.onChange(parseInt(day))} />
                                            </div>
                                        </StandardField>
                                    )}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 pt-4">
                        <div className="flex items-center gap-2 px-1 text-zinc-400">
                            <Info className="w-3.5 h-3.5" />
                            <h3 className="text-[9px] font-bold uppercase tracking-[0.3em]">{inviteStudentCopy.sections.optionalInfo}</h3>
                        </div>
                        <FormField
                            control={form.control}
                            name="notas"
                            render={({ field, fieldState }) => (
                                <StandardField label="" error={fieldState.error?.message}>
                                    <FormControl>
                                        <Input placeholder="Aclaraciones internas, médicas u objetivos del alumno..." {...field} className="h-14 rounded-2xl bg-zinc-50/30 border-zinc-100 dark:bg-zinc-900/10 focus:bg-white dark:focus:bg-zinc-950 transition-all" />
                                    </FormControl>
                                </StandardField>
                            )}
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-900 items-center justify-between">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 order-2 sm:order-1 text-center sm:text-left flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
                            Se generará un link permanente para compartir.
                        </p>
                        <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
                            <Button type="button" variant="outline" size="xl" className="w-full sm:w-auto px-10 h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px] border-zinc-200 hover:bg-zinc-100 transition-all active:scale-95" onClick={() => window.history.back()}>
                                {inviteStudentCopy.actions.cancel}
                            </Button>
                            <Button type="submit" variant="industrial" size="xl" disabled={isPending} className="w-full sm:w-auto px-14 h-14">
                                {isPending ? inviteStudentCopy.actions.submitting : inviteStudentCopy.actions.submit}
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>

            <InviteSuccessDialog
                data={successData}
                onShareWhatsApp={actions.shareWhatsApp}
                onCopyLink={actions.copyLink}
                turnosCount={turnos.length}
            />
        </>
    );
}

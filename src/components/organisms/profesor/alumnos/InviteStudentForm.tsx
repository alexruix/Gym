import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { inviteStudentSchema } from "@/lib/validators";
import type { z } from "zod";
import { inviteStudentCopy } from "@/data/es/profesor/alumnos";
import { toast } from "sonner";
import { Copy, ArrowRight, CircleCheck, Calendar, Phone, Plus, UserCircle2, Briefcase, Info, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof inviteStudentSchema>;

interface Plan {
    id: string;
    nombre: string;
    frecuencia_semanal?: number | null;
}

export function InviteStudentForm({ plans }: { plans: Plan[] }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; email: string; name: string; date: string; phone?: string } | null>(null);

  // Evitar desajustes de hidratación inicializando fechas solo en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(inviteStudentSchema) as any,
    defaultValues: {
      nombre: "",
      email: "",
      plan_id: "",
      // Usar valores estables en el servidor para evitar desajustes
      fecha_inicio: new Date(new Date().setHours(0,0,0,0)), 
      dia_pago: new Date().getDate(),
      telefono: "",
      monto: undefined,
      notas: "",
      cobrarPrimerMes: true, 
    },
  });

  const selectedPlanId = form.watch("plan_id");
  const selectedDate = form.watch("fecha_inicio");

  // Ajustar el día de pago inicial una vez montado para asegurar sincronía
  useEffect(() => {
    if (isMounted && !form.getValues("dia_pago")) {
        form.setValue("dia_pago", new Date().getDate());
    }
  }, [isMounted]);

  useEffect(() => {
    console.log("InviteStudentForm - Planes recibidos:", plans);
  }, [plans]);

  // 2. Sincronización Inteligente de Fechas (Día de Pago = Día de Inicio)
  useEffect(() => {
    if (isMounted && selectedDate instanceof Date && !isNaN(selectedDate.getTime())) {
        form.setValue("dia_pago", selectedDate.getDate(), { shouldValidate: true });
    }
  }, [selectedDate, isMounted, form]);

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const { data: result, error } = await actions.profesor.inviteStudent(data);
      if (error) {
        toast.error(error.message || inviteStudentCopy.messages.error);
        return;
      }
      if (result?.success) {
        setSuccessData({
          id: result.student_id,
          email: data.email,
          name: data.nombre.split(" ")[0] || data.nombre,
          date: new Date(data.fecha_inicio).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' }),
          phone: data.telefono
        });
      }
    } catch (err: any) {
      toast.error(err.message || inviteStudentCopy.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const shareWhatsApp = () => {
    if (!successData) return;
    const msg = `¡Hola ${successData.name}! Ya sos parte de NODO. Revisá tu email (${successData.email}) para acceder a tu plan.`;
    const url = `https://wa.me/${successData.phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  };

  const copyLink = async () => {
    const msg = `¡Hola ${successData?.name}! Ya sos parte de NODO. Revisá tu email (${successData?.email}) para acceder a tu plan.`;
    try {
      await navigator.clipboard.writeText(msg);
      toast.success(inviteStudentCopy.messages.successModal.linkCopied);
    } catch {
      toast.error("Error al copiar al portapapeles");
    }
  };

  // Si no está montado, mostramos un estado de carga o nada para evitar problemas de eventos
  if (!isMounted) {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Cargando Formulario...</p>
        </div>
    );
  }

  return (
    <>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit)} 
          className="space-y-12"
        >
          {/* GRUPO 1: IDENTIDAD */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-zinc-400">
                <UserCircle2 className="w-4 h-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {inviteStudentCopy.sections.basicInfo}
                </h3>
            </div>
            
            <div className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 sm:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900/50 space-y-6 transition-all hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-zinc-100/50 dark:hover:shadow-none duration-500">
                <div className="grid gap-6 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="nombre"
                        render={({ field, fieldState }) => (
                        <StandardField 
                            label={inviteStudentCopy.labels.nombre} 
                            error={fieldState.error?.message}
                            required
                        >
                            <FormControl>
                            <Input placeholder={inviteStudentCopy.placeholders.nombre} {...field} className="font-bold h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                            </FormControl>
                        </StandardField>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field, fieldState }) => (
                        <StandardField 
                            label={inviteStudentCopy.labels.email} 
                            error={fieldState.error?.message}
                            required
                        >
                            <FormControl>
                            <Input type="email" placeholder={inviteStudentCopy.placeholders.email} {...field} className="h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                            </FormControl>
                        </StandardField>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="telefono"
                        render={({ field, fieldState }) => (
                            <StandardField 
                                label={inviteStudentCopy.labels.telefono} 
                                error={fieldState.error?.message}
                                hint="Fundamental para WhatsApp"
                            >
                                <FormControl>
                                    <div className="relative group/phone">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-300 group-focus-within/phone:text-lime-500 transition-colors" />
                                        <Input type="tel" placeholder={inviteStudentCopy.placeholders.telefono} {...field} className="pl-11 h-14 rounded-2xl bg-white dark:bg-zinc-950" />
                                    </div>
                                </FormControl>
                            </StandardField>
                        )}
                    />
                </div>
            </div>
          </div>

          {/* GRUPO 2: NEGOCIO */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-1 text-zinc-400">
                <Briefcase className="w-4 h-4" />
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">
                    {inviteStudentCopy.sections.planAndDates}
                </h3>
            </div>

            <div className="bg-zinc-50/50 dark:bg-zinc-900/20 p-6 sm:p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900/50 space-y-10 transition-all hover:bg-white dark:hover:bg-zinc-900/40 hover:shadow-xl hover:shadow-zinc-100/50 dark:hover:shadow-none duration-500">
                <FormField
                    control={form.control}
                    name="plan_id"
                    render={({ field, fieldState }) => (
                    <StandardField 
                        label={inviteStudentCopy.labels.plan} 
                        error={fieldState.error?.message}
                        hint={inviteStudentCopy.hints.plan}
                        required
                    >
                        <div className="space-y-4">
                            <Select onValueChange={field.onChange} value={field.value} key={plans.length}>
                                <FormControl>
                                    <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 font-bold">
                                    <SelectValue placeholder={inviteStudentCopy.placeholders.plan} />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent className="rounded-2xl border-zinc-200 shadow-2xl z-[100]">
                                    {plans.length > 0 ? (
                                        plans.map((plan) => (
                                        <SelectItem key={plan.id} value={plan.id} className="rounded-xl py-3 font-bold">
                                            {plan.nombre} {plan.frecuencia_semanal ? `(${plan.frecuencia_semanal}d)` : ""}
                                        </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center space-y-4">
                                            <p className="text-xs font-bold text-zinc-500">No encontramos planes configurados</p>
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="w-full rounded-xl font-black uppercase text-[9px] tracking-widest border-zinc-200"
                                                onClick={() => window.location.assign("/profesor/planes/new")}
                                            >
                                                Crear primer plan
                                            </Button>
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>

                            {plans.length > 0 && (
                                <QuickOptionsGroup 
                                    options={plans.map(p => p.nombre)}
                                    selectedOptions={plans.filter(p => p.id === field.value).map(p => p.nombre.toLowerCase())}
                                    onToggle={(name) => {
                                        const plan = plans.find(p => p.nombre.toLowerCase() === name);
                                        if (plan) form.setValue("plan_id", plan.id, { shouldValidate: true });
                                    }}
                                />
                            )}
                        </div>
                    </StandardField>
                    )}
                />

                <div className="grid gap-10 sm:grid-cols-2">
                    <div className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="fecha_inicio"
                            render={({ field, fieldState }) => (
                            <StandardField 
                                label={inviteStudentCopy.labels.fechaInicio} 
                                error={fieldState.error?.message}
                                required
                            >
                                <div className="flex gap-2">
                                    <FormControl>
                                    <Input 
                                        type="date" 
                                        {...field} 
                                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : (field.value || '')}
                                        onChange={(e) => field.onChange(new Date(e.target.value))}
                                        className="font-bold h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200"
                                    />
                                    </FormControl>
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="h-14 px-4 rounded-2xl font-black uppercase text-[9px] tracking-widest text-zinc-400 hover:text-lime-600 hover:border-lime-500 transition-all active:scale-95"
                                        onClick={() => form.setValue("fecha_inicio", new Date(), { shouldValidate: true })}
                                    >
                                        <Calendar className="w-4 h-4 mr-2" /> Hoy
                                    </Button>
                                </div>
                            </StandardField>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dia_pago"
                            render={({ field, fieldState }) => (
                            <StandardField 
                                label={inviteStudentCopy.labels.diaPago} 
                                error={fieldState.error?.message}
                                hint="Se sincroniza con el inicio"
                                required
                            >
                                <div className="space-y-4">
                                    <Select onValueChange={(val) => field.onChange(parseInt(val))} value={field.value ? String(field.value) : undefined}>
                                        <FormControl>
                                            <SelectTrigger className="h-14 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 font-bold">
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

                    <div className="grid gap-6 content-start">
                        <FormField
                            control={form.control}
                            name="monto"
                            render={({ field, fieldState }) => (
                            <StandardField 
                                label={inviteStudentCopy.labels.monto} 
                                error={fieldState.error?.message}
                                hint="Precio sugerido por plan"
                            >
                                <FormControl>
                                    <div className="relative group/price">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-300 group-focus-within/price:text-lime-500 transition-colors">$</span>
                                        <Input 
                                            type="number" 
                                            placeholder="0.00" 
                                            {...field}
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)} 
                                            className="pl-10 h-14 rounded-2xl border-zinc-200 font-black text-xl bg-white dark:bg-zinc-950 animate-in fade-in duration-700"
                                        />
                                    </div>
                                </FormControl>
                            </StandardField>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="cobrarPrimerMes"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-2xl border border-zinc-100 dark:border-zinc-900/50 bg-white dark:bg-zinc-950 p-6 space-y-0 gap-4 shadow-sm transition-colors hover:border-zinc-200 active:scale-[0.98] duration-300">
                                <div className="space-y-1">
                                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-zinc-950 dark:text-zinc-50">
                                    {inviteStudentCopy.labels.cobrarPrimerMes}
                                    </FormLabel>
                                    <FormDescription className="text-[9px] font-medium text-zinc-400 max-w-[160px] leading-tight">
                                    {inviteStudentCopy.hints.cobrarPrimerMes}
                                    </FormDescription>
                                </div>
                                <FormControl>
                                    <Switch
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    className="data-[state=checked]:bg-lime-500"
                                    />
                                </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
            </div>
          </div>

          {/* SECCIÓN ADICIONAL */}
          <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 px-1 text-zinc-400">
                <Info className="w-3.5 h-3.5" />
                <h3 className="text-[9px] font-black uppercase tracking-[0.3em]">
                    {inviteStudentCopy.sections.optionalInfo}
                </h3>
              </div>
              <FormField
                control={form.control}
                name="notas"
                render={({ field, fieldState }) => (
                    <StandardField 
                    label={inviteStudentCopy.labels.notas} 
                    error={fieldState.error?.message}
                    >
                    <FormControl>
                        <Input 
                            placeholder="Aclaraciones internas o médicas..." 
                            {...field} 
                            className="h-14 rounded-2xl bg-zinc-50/30 border-zinc-100 dark:bg-zinc-900/10 focus:bg-white dark:focus:bg-zinc-950 transition-all" 
                        />
                    </FormControl>
                    </StandardField>
                )}
              />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-900 items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 order-2 sm:order-1 text-center sm:text-left flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
              Se enviará Magic Link por email automáticamente.
            </p>
            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
              <Button 
                type="button" 
                variant="outline" 
                size="xl"
                className="w-full sm:w-auto px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] border-zinc-200 hover:bg-zinc-100 transition-all active:scale-95" 
                onClick={() => window.history.back()}
              >
                {inviteStudentCopy.actions.cancel}
              </Button>
              <Button 
                type="submit" 
                variant="industrial"
                size="xl"
                disabled={isPending} 
                className="w-full sm:w-auto px-14 h-14"
              >
                {isPending ? inviteStudentCopy.actions.submitting : inviteStudentCopy.actions.submit}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      <Dialog open={!!successData} onOpenChange={(open) => !open && window.location.assign(`/profesor/alumnos/${successData?.id}`)}>
        <DialogContent className="sm:max-w-md text-center p-10 gap-8 border-none bg-white dark:bg-zinc-950 rounded-[3rem] shadow-2xl overflow-hidden scale-in-center">
          <div className="mx-auto bg-lime-400 text-zinc-950 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-lime-400/20 animate-bounce">
            <CircleCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <DialogTitle className="text-4xl font-black uppercase tracking-tighter text-center text-zinc-950 dark:text-zinc-50 leading-[0.8]">
              {successData ? inviteStudentCopy.messages.successModal.title.replace('{name}', successData.name) : ''}
            </DialogTitle>
            <div className="text-sm font-medium text-zinc-400 text-center leading-relaxed max-w-[280px] mx-auto pt-2">
              Invitación enviada con éxito.
              <div className="mt-8 relative group">
                <div className="absolute -inset-1 bg-lime-500/20 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <span className="relative block px-4 py-4 bg-zinc-100 dark:bg-zinc-900 rounded-2xl text-zinc-950 dark:text-lime-400 font-black tracking-widest text-lg border border-zinc-200 dark:border-zinc-800">
                    PRÓXIMO PAGO: {successData ? successData.date.toUpperCase() : ''}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3 w-full px-2 pt-4">
            {successData?.phone && (
                <Button onClick={shareWhatsApp} variant="industrial" size="xl" className="w-full bg-[#25D366] hover:bg-[#20ba59] border-[#25D366] text-white shadow-lg shadow-[#25D366]/20 py-8 text-sm group">
                    <Plus className="w-5 h-5 mr-3 group-hover:rotate-90 transition-transform" />
                    ENVIAR BIENVENIDA (WHATSAPP)
                </Button>
            )}
            <Button onClick={copyLink} variant="outline" size="xl" className="w-full border-zinc-100 dark:border-zinc-800 font-black uppercase text-[10px] tracking-[0.2em] text-zinc-400 h-14">
              <Copy className="w-4 h-4 mr-2" />
              COPIAR LINK DE BIENVENIDA
            </Button>
            <Button 
              onClick={() => window.location.assign(`/profesor/alumnos/${successData?.id}`)} 
              variant="ghost" 
              size="lg"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-zinc-400 hover:text-zinc-950 transition-all"
            >
              IR AL PERFIL DEL ALUMNO
              <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

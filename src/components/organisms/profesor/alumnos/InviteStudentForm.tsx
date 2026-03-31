import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { inviteStudentSchema } from "@/lib/validators";
import type { z } from "zod";
import { inviteStudentCopy } from "@/data/es/profesor/alumnos";
import { toast } from "sonner";
import { Copy, ArrowRight, CircleCheck } from "lucide-react";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { StandardField } from "@/components/molecules/StandardField";

type FormValues = z.infer<typeof inviteStudentSchema>;

export function InviteStudentForm({ plans }: { plans: any[] }) {
  const [isPending, setIsPending] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; email: string; name: string; date: string } | null>(null);

  const form = useForm({
    resolver: zodResolver(inviteStudentSchema),
    defaultValues: {
      nombre: "",
      email: "",
      plan_id: "",
      fecha_inicio: new Date(),
      dia_pago: 15,
      telefono: "",
      monto: undefined,
      notas: "",
    },
  });

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
          date: new Date(data.fecha_inicio).toLocaleDateString("es-AR", { day: 'numeric', month: 'long' })
        });
      }
    } catch (err: any) {
      toast.error(err.message || inviteStudentCopy.messages.error);
    } finally {
      setIsPending(false);
    }
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

  return (
    <>
      <Form {...form}>
        <form 
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.error("Validation Errors:", errors);
            toast.error("Por favor, revisa los campos en rojo.");
          })} 
          className="space-y-10 max-w-2xl mx-auto"
        >
          {/* INFORMACIÓN BÁSICA */}
          <div className="space-y-6">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">
              {inviteStudentCopy.sections.basicInfo}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field, fieldState }) => (
                  <StandardField 
                    label={inviteStudentCopy.labels.nombre} 
                    error={fieldState.error?.message}
                    hint={inviteStudentCopy.hints.nombre}
                    required
                  >
                    <FormControl>
                      <Input placeholder={inviteStudentCopy.placeholders.nombre} {...field} className="font-bold" />
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
                    hint={inviteStudentCopy.hints.email}
                    required
                  >
                    <FormControl>
                      <Input type="email" placeholder={inviteStudentCopy.placeholders.email} {...field} />
                    </FormControl>
                  </StandardField>
                )}
              />
            </div>
          </div>

          {/* PLAN Y FECHAS */}
          <div className="space-y-6 pt-10 border-t border-zinc-100 dark:border-zinc-900">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 px-1">
              {inviteStudentCopy.sections.planAndDates}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
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
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 font-bold">
                          <SelectValue placeholder={inviteStudentCopy.placeholders.plan} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-2xl border-zinc-200">
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="rounded-xl py-3 font-bold">
                            {plan.nombre} ({plan.frecuencia_semanal}d)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </StandardField>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field, fieldState }) => (
                  <StandardField 
                    label={inviteStudentCopy.labels.fechaInicio} 
                    error={fieldState.error?.message}
                    hint={inviteStudentCopy.hints.fechaInicio}
                    required
                  >
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? new Date((field.value as Date).getTime() - ((field.value as Date).getTimezoneOffset() * 60000)).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                        className="font-bold"
                      />
                    </FormControl>
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
                    hint={inviteStudentCopy.hints.diaPago}
                    required
                  >
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl bg-zinc-50/50 border-zinc-200 font-bold">
                          <SelectValue placeholder="Día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px] rounded-2xl border-zinc-200">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)} className="rounded-xl">
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </StandardField>
                )}
              />
            </div>
          </div>

          {/* OPCIONAL */}
          <Accordion type="single" collapsible className="w-full pt-4">
            <AccordionItem value="optional-info" className="border-zinc-200 dark:border-zinc-900">
              <AccordionTrigger className="hover:no-underline text-zinc-400 hover:text-zinc-950 font-black uppercase tracking-widest text-[10px] py-6">
                {inviteStudentCopy.sections.optionalInfo}
              </AccordionTrigger>
              <AccordionContent className="pt-6 pb-10 space-y-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field, fieldState }) => (
                      <StandardField 
                        label={inviteStudentCopy.labels.telefono} 
                        error={fieldState.error?.message}
                        hint={inviteStudentCopy.hints.telefono}
                      >
                        <FormControl>
                          <Input type="tel" placeholder={inviteStudentCopy.placeholders.telefono} {...field} />
                        </FormControl>
                      </StandardField>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field, fieldState }) => (
                      <StandardField 
                        label={inviteStudentCopy.labels.monto} 
                        error={fieldState.error?.message}
                        hint={inviteStudentCopy.hints.monto}
                      >
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={inviteStudentCopy.placeholders.monto} 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          />
                        </FormControl>
                      </StandardField>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field, fieldState }) => (
                    <StandardField 
                      label={inviteStudentCopy.labels.notas} 
                      error={fieldState.error?.message}
                      hint={inviteStudentCopy.hints.notas}
                    >
                      <FormControl>
                        <textarea
                          className="flex min-h-[120px] w-full rounded-2xl border border-zinc-200 bg-zinc-50/50 px-4 py-3 text-sm placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 focus-visible:border-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 transition-all font-medium"
                          placeholder={inviteStudentCopy.placeholders.notas}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                    </StandardField>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-zinc-100 dark:border-zinc-900 items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 order-2 sm:order-1">
              {inviteStudentCopy.messages.helper}
            </p>
            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
              <Button 
                type="button" 
                variant="outline" 
                size="xl"
                className="w-full sm:w-auto px-10 h-14 rounded-2xl font-black uppercase tracking-widest text-[10px]" 
                onClick={() => window.history.back()}
              >
                {inviteStudentCopy.actions.cancel}
              </Button>
              <Button 
                type="submit" 
                variant="industrial"
                size="xl"
                disabled={isPending} 
                className="w-full sm:w-auto px-12"
              >
                {isPending ? inviteStudentCopy.actions.submitting : inviteStudentCopy.actions.submit}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* SUCCESS MODAL */}
      <Dialog open={!!successData} onOpenChange={(open) => !open && window.location.assign(`/profesor/alumnos/${successData?.id}`)}>
        <DialogContent className="sm:max-w-md text-center p-10 gap-8 border-none bg-white rounded-3xl shadow-2xl">
          <div className="mx-auto bg-lime-400 text-zinc-950 p-4 rounded-2xl w-20 h-20 flex items-center justify-center shadow-lg shadow-lime-400/20">
            <CircleCheck className="w-10 h-10" />
          </div>
          
          <div className="space-y-4">
            <DialogTitle className="text-3xl font-black uppercase tracking-tight text-center text-zinc-950">
              {successData ? inviteStudentCopy.messages.successModal.title.replace('{name}', successData.name) : ''}
            </DialogTitle>
            <DialogDescription className="text-sm font-medium text-zinc-500 text-center leading-relaxed max-w-[280px] mx-auto">
              {inviteStudentCopy.messages.successModal.description1}
              <br className="my-3" />
              <span className="p-2 bg-zinc-100 rounded-lg text-zinc-950 font-black tracking-tight">
                {successData ? inviteStudentCopy.messages.successModal.description2.replace('{date}', successData.date) : ''}
              </span>
            </DialogDescription>
          </div>

          <DialogFooter className="flex-col sm:flex-col gap-3 w-full px-2">
            <Button onClick={copyLink} variant="industrial" size="xl" className="w-full">
              <Copy className="w-4 h-4 mr-2" />
              {inviteStudentCopy.messages.successModal.btnWhatsapp}
            </Button>
            <Button 
              onClick={() => window.location.assign(`/profesor/alumnos/${successData?.id}`)} 
              variant="outline" 
              size="lg"
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-[10px] text-zinc-400"
            >
              {inviteStudentCopy.messages.successModal.btnProfile}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

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
          className="space-y-8 max-w-2xl mx-auto"
        >
          {/* INFORMACIÓN BÁSICA */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {inviteStudentCopy.sections.basicInfo}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.nombre}</FormLabel>
                    <FormControl>
                      <Input placeholder={inviteStudentCopy.placeholders.nombre} {...field} />
                    </FormControl>
                    <FormDescription>{inviteStudentCopy.hints.nombre}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.email}</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder={inviteStudentCopy.placeholders.email} {...field} />
                    </FormControl>
                    <FormDescription>{inviteStudentCopy.hints.email}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* PLAN Y FECHAS */}
          <div className="space-y-6 pt-6 border-t border-zinc-200 dark:border-zinc-800">
            <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {inviteStudentCopy.sections.planAndDates}
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="plan_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.plan}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={inviteStudentCopy.placeholders.plan} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {plans.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.nombre} ({plan.frecuencia_semanal}d)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{inviteStudentCopy.hints.plan}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fecha_inicio"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="uppercase tracking-widest mb-1">{inviteStudentCopy.labels.fechaInicio}</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field} 
                        value={field.value ? new Date((field.value as Date).getTime() - ((field.value as Date).getTimezoneOffset() * 60000)).toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormDescription>{inviteStudentCopy.hints.fechaInicio}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dia_pago"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.diaPago}</FormLabel>
                    <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={String(field.value)}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Día" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[300px]">
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{inviteStudentCopy.hints.diaPago}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* OPCIONAL */}
          <Accordion type="single" collapsible className="w-full pt-2">
            <AccordionItem value="optional-info" className="border-zinc-200 dark:border-zinc-800">
              <AccordionTrigger className="hover:no-underline hover:text-lime-600 dark:hover:text-lime-400 font-bold">
                {inviteStudentCopy.sections.optionalInfo}
              </AccordionTrigger>
              <AccordionContent className="pt-4 space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="telefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.telefono}</FormLabel>
                        <FormControl>
                          <Input type="tel" placeholder={inviteStudentCopy.placeholders.telefono} {...field} />
                        </FormControl>
                        <FormDescription>{inviteStudentCopy.hints.telefono}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="monto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.monto}</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder={inviteStudentCopy.placeholders.monto} 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)} 
                          />
                        </FormControl>
                        <FormDescription>{inviteStudentCopy.hints.monto}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase tracking-widest">{inviteStudentCopy.labels.notas}</FormLabel>
                      <FormControl>
                        <textarea
                          className="flex min-h-[80px] w-full rounded-md border border-zinc-200 bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-zinc-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-800 dark:placeholder:text-zinc-400 dark:focus-visible:ring-zinc-300"
                          placeholder={inviteStudentCopy.placeholders.notas}
                          maxLength={500}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{inviteStudentCopy.hints.notas}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-200 dark:border-zinc-800 items-center justify-between">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium order-2 sm:order-1">
              {inviteStudentCopy.messages.helper}
            </p>
            <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => window.history.back()}>
                {inviteStudentCopy.actions.cancel}
              </Button>
              <Button type="submit" disabled={isPending} className="w-full sm:w-auto bg-lime-400 text-zinc-950 hover:bg-lime-500 font-bold">
                {isPending ? inviteStudentCopy.actions.submitting : inviteStudentCopy.actions.submit}
              </Button>
            </div>
          </div>
        </form>
      </Form>

      {/* SUCCESS MODAL */}
      <Dialog open={!!successData} onOpenChange={(open) => !open && window.location.assign(`/profesor/alumnos/${successData?.id}`)}>
        <DialogContent className="sm:max-w-md text-center p-8 gap-6 border-zinc-200/50 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl">
          <div className="mx-auto bg-lime-100 dark:bg-lime-900/40 p-3 rounded-full w-16 h-16 flex items-center justify-center">
            <CircleCheck className="w-8 h-8 text-lime-600 dark:text-lime-400" />
          </div>
          
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-extrabold text-center mx-auto text-zinc-900 dark:text-zinc-100">
              {successData ? inviteStudentCopy.messages.successModal.title.replace('{name}', successData.name) : ''}
            </DialogTitle>
            <DialogDescription className="text-base text-zinc-600 dark:text-zinc-400 text-center mx-auto leading-relaxed">
              {inviteStudentCopy.messages.successModal.description1}
              <br className="my-2" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {successData ? inviteStudentCopy.messages.successModal.description2.replace('{date}', successData.date) : ''}
              </span>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-col gap-3 mt-4">
            <Button onClick={copyLink} className="w-full font-bold" variant="default">
              <Copy className="w-4 h-4 mr-2" />
              {inviteStudentCopy.messages.successModal.btnWhatsapp}
            </Button>
            <Button 
              onClick={() => window.location.assign(`/profesor/alumnos/${successData?.id}`)} 
              variant="outline" 
              className="w-full"
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

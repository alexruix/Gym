import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { updateStudentSchema } from "@/lib/validators";
import type { z } from "zod";
import { toast } from "sonner";
import { Calendar, Phone, Loader2, Save, X, Archive } from "lucide-react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
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

type FormValues = z.infer<typeof updateStudentSchema>;

interface Student {
    id: string;
    nombre: string;
    email: string | null;
    telefono: string | null;
    fecha_inicio: string;
    dia_pago: number;
    notas?: string | null;
}

interface StudentEditFormProps {
    alumno: Student;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export function StudentEditForm({ alumno, onSuccess, onCancel }: StudentEditFormProps) {
  const [isMounted, setIsMounted] = useState(false);
  const { execute, isPending } = useAsyncAction();

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
      notas: alumno.notas || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    execute(async () => {
      const { data: result, error } = await actions.profesor.updateStudent(data);
      if (error) throw error;
      if (result?.success) {
        onSuccess?.();
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
                <StandardField 
                    label="Fecha de Inicio" 
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
                            className="font-bold border-zinc-200"
                        />
                        </FormControl>
                        <Button 
                            type="button" 
                            variant="outline" 
                            className="px-4 rounded-xl font-black uppercase text-[9px] tracking-widest text-zinc-400 hover:text-lime-600 hover:border-lime-500 transition-all active:scale-95"
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
                onClick={() => {
                    if (confirm(`¿Estás seguro de archivar a ${alumno.nombre}? El alumno dejará de aparecer en las listas activas.`)) {
                        execute(async () => {
                            const { error } = await actions.profesor.deleteStudent({ id: alumno.id });
                            if (error) throw error;
                            window.location.href = "/profesor/alumnos";
                        }, {
                            loadingMsg: "Archivando...",
                            successMsg: "Alumno archivado correctamente",
                        });
                    }
                }}
                className="rounded-xl font-bold uppercase tracking-widest text-[9px] h-11 px-4 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200"
            >
                <Archive className="w-4 h-4 mr-2" /> Archivar Alumno
            </Button>

            <div className="flex gap-3 items-center">
                {onCancel && (
                    <Button 
                        type="button" 
                        variant="outline" 
                        size="lg"
                        onClick={onCancel}
                        className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
                    >
                        <X className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                )}
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
    </Form>
  );
}

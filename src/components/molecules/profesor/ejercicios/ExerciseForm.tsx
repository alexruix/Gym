import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { exerciseLibrarySchema } from "@/lib/validators";
import type { z } from "zod";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Loader2, Save, X } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";

import { StandardField } from "@/components/molecules/StandardField";

type FormValues = z.infer<typeof exerciseLibrarySchema>;

interface ExerciseFormProps {
  initialValues?: Partial<FormValues>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function ExerciseForm({ initialValues, onSuccess, onCancel }: ExerciseFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const copy = exerciseLibraryCopy.form;

  const form = useForm<FormValues>({
    resolver: zodResolver(exerciseLibrarySchema),
    defaultValues: {
      id: initialValues?.id || undefined,
      nombre: initialValues?.nombre || "",
      descripcion: initialValues?.descripcion || "",
      media_url: initialValues?.media_url || "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsPending(true);
    try {
      const { data: result, error } = data.id 
        ? await actions.profesor.updateExercise(data)
        : await actions.profesor.createExercise(data);

      if (error) throw new Error(error.message);
      
      if (result?.success) {
        toast.success(result.mensaje);
        onSuccess?.(result);
        if (!data.id) form.reset();
      }
    } catch (err: any) {
      toast.error(err.message || copy.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field, fieldState }) => (
            <StandardField 
              label={copy.labels.nombre} 
              error={fieldState.error?.message}
              required
            >
              <FormControl>
                <Input 
                  placeholder={copy.placeholders.nombre} 
                  {...field} 
                  className="font-bold"
                />
              </FormControl>
            </StandardField>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field, fieldState }) => (
            <StandardField 
              label={copy.labels.descripcion} 
              error={fieldState.error?.message}
            >
              <FormControl>
                <Textarea
                  className="min-h-[140px] resize-none font-medium p-4 rounded-2xl"
                  placeholder={copy.placeholders.descripcion}
                  maxLength={1000}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
            </StandardField>
          )}
        />

        <FormField
          control={form.control}
          name="media_url"
          render={({ field, fieldState }) => (
            <StandardField 
              label={copy.labels.mediaUrl} 
              error={fieldState.error?.message}
              hint="Link a video o demo"
            >
              <FormControl>
                <Input 
                  type="url" 
                  placeholder={copy.placeholders.mediaUrl} 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
            </StandardField>
          )}
        />

        <div className="flex gap-3 pt-6 justify-end items-center">
          {onCancel && (
            <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={onCancel}
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14"
            >
                {copy.actions.cancel}
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isPending} 
            variant="industrial"
            size="xl"
            className="px-10"
          >
            {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <>
                    <Save className="w-4 h-4 mr-2" />
                    {initialValues?.id ? "Guardar cambios" : copy.actions.submit}
                </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

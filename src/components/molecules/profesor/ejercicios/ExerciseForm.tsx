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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase tracking-widest font-black text-[10px] text-zinc-500">
                {copy.labels.nombre}
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder={copy.placeholders.nombre} 
                  {...field} 
                  className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-lime-400 font-bold"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descripcion"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase tracking-widest font-black text-[10px] text-zinc-500">
                {copy.labels.descripcion}
              </FormLabel>
              <FormControl>
                <Textarea
                  className="rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-lime-400 min-h-[120px] resize-none font-medium"
                  placeholder={copy.placeholders.descripcion}
                  maxLength={1000}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="media_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="uppercase tracking-widest font-black text-[10px] text-zinc-500">
                {copy.labels.mediaUrl}
              </FormLabel>
              <FormControl>
                <Input 
                  type="url" 
                  placeholder={copy.placeholders.mediaUrl} 
                  {...field} 
                  className="h-12 rounded-2xl border-zinc-200 dark:border-zinc-800 focus:ring-lime-400"
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4 justify-end">
          {onCancel && (
            <Button 
                type="button" 
                variant="outline" 
                onClick={onCancel}
                className="h-12 px-6 rounded-2xl border-zinc-200 dark:border-zinc-800 font-bold uppercase tracking-widest text-[10px]"
            >
                {copy.actions.cancel}
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isPending} 
            className="h-12 px-8 rounded-2xl bg-lime-400 text-zinc-950 hover:bg-lime-500 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-lime-400/20"
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

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { exerciseLibrarySchema, type ExerciseLibraryFormData } from "@/lib/validators";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Loader2, Save, X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Form,
  FormControl,
  FormField,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

import { StandardField } from "@/components/molecules/StandardField";
import { QuickOptionsGroup } from "@/components/molecules/QuickOptionsGroup";

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseLibraryFormData>;
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
}

export function ExerciseForm({ initialValues, onSuccess, onCancel }: ExerciseFormProps) {
  const [isPending, setIsPending] = React.useState(false);
  const [tagInput, setTagInput] = React.useState("");
  const copy = exerciseLibraryCopy.form;

  // Use a strictly typed form to avoid common RHF + Zod issues
  const form = useForm<ExerciseLibraryFormData>({
    resolver: zodResolver(exerciseLibrarySchema),
    defaultValues: {
      id: initialValues?.id,
      nombre: initialValues?.nombre || "",
      descripcion: initialValues?.descripcion || "",
      media_url: initialValues?.media_url || "",
      tags: initialValues?.tags || [],
    },
  });

  const onSubmit = async (values: ExerciseLibraryFormData) => {
    setIsPending(true);
    try {
      const { data: result, error } = values.id 
        ? await actions.profesor.updateExercise(values)
        : await actions.profesor.createExercise(values);

      if (error) throw new Error(error.message);
      
      if (result?.success) {
        toast.success(result.mensaje);
        onSuccess?.(result);
        if (!values.id) {
          form.reset();
          setTagInput("");
        }
      }
    } catch (err: any) {
      toast.error(err.message || copy.messages.error);
    } finally {
      setIsPending(false);
    }
  };

  const addTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    const lowerTag = tag.trim().toLowerCase();
    
    if (lowerTag && !currentTags.includes(lowerTag) && currentTags.length < 6) {
      form.setValue("tags", [...currentTags, lowerTag], { shouldValidate: true });
      return true;
    }
    return false;
  };

  const toggleTag = (tag: string) => {
    const currentTags = form.getValues("tags") || [];
    const lowerTag = tag.toLowerCase();
    if (currentTags.includes(lowerTag)) {
      form.setValue("tags", currentTags.filter(t => t !== lowerTag), { shouldValidate: true });
    } else if (currentTags.length < 6) {
      form.setValue("tags", [...currentTags, lowerTag], { shouldValidate: true });
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter(t => t !== tagToRemove), { shouldValidate: true });
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
                  className="font-bold text-lg"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

            <FormField
                control={form.control}
                name="tags"
                render={({ field, fieldState }) => (
                    <StandardField 
                        label={copy.labels.tags} 
                        error={fieldState.error?.message}
                        hint={`Máx 6 etiquetas. Enter para añadir.`}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <FormControl>
                                    <Input 
                                        placeholder={copy.placeholders.tags} 
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                if (addTag(tagInput)) setTagInput("");
                                            }
                                        }}
                                        className="font-medium"
                                        disabled={field.value.length >= 6}
                                    />
                                </FormControl>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="icon" 
                                    className="shrink-0 rounded-xl"
                                    onClick={() => {
                                        if (addTag(tagInput)) setTagInput("");
                                    }}
                                >
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Quick Tags */}
                            <QuickOptionsGroup 
                                options={copy.quickTags}
                                selectedOptions={field.value || []}
                                onToggle={toggleTag}
                                maxSelections={6}
                            />

                            {/* Selected Chips */}
                            {field.value && field.value.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-2">
                                    {field.value.map(tag => (
                                        <div key={tag} className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-[9px] font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                                            {tag}
                                            <button 
                                                type="button" 
                                                onClick={() => removeTag(tag)}
                                                className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </StandardField>
                )}
            />
        </div>

        <div className="flex gap-3 pt-6 justify-end items-center">
          {onCancel && (
            <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={onCancel}
                className="rounded-2xl font-black uppercase tracking-widest text-[10px] h-14 px-8"
            >
                {copy.actions.cancel}
            </Button>
          )}
          <Button 
            type="submit" 
            disabled={isPending} 
            variant="industrial"
            size="xl"
            className="px-12"
          >
            {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
                <>
                    <Save className="w-5 h-5 mr-3" />
                    <span className="text-sm">
                      {initialValues?.id ? "Guardar cambios" : copy.actions.submit}
                    </span>
                </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

import * as React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { exerciseLibrarySchema, type ExerciseLibraryFormData } from "@/lib/validators";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { toast } from "sonner";
import { Loader2, Save, X, Plus, ArrowLeft } from "lucide-react";
import { useAsyncAction } from "@/hooks/useAsyncAction";
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

interface SimpleExercise {
  id: string;
  nombre: string;
  parent_id?: string | null;
}

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseLibraryFormData>;
  parents?: SimpleExercise[]; // Lista de ejercicios para el selector de padre
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  successHref?: string;
  cancelHref?: string;
}

export function ExerciseForm({ initialValues, parents = [], onSuccess, onCancel, successHref, cancelHref }: ExerciseFormProps) {
  const { execute, isPending } = useAsyncAction();
  const [tagInput, setTagInput] = React.useState("");
  const [variantInput, setVariantInput] = React.useState("");
  const copy = exerciseLibraryCopy.form;

  // Use a strictly typed form to avoid common RHF + Zod issues
  const form = useForm<ExerciseLibraryFormData>({
    resolver: zodResolver(exerciseLibrarySchema),
    defaultValues: {
      id: initialValues?.id,
      parent_id: initialValues?.parent_id || undefined,
      nombre: initialValues?.nombre ?? "",
      descripcion: initialValues?.descripcion ?? "",
      media_url: initialValues?.media_url ?? "",
      tags: initialValues?.tags ?? [],
      is_template_base: initialValues?.is_template_base ?? false,
      variants: [],
    } as ExerciseLibraryFormData,
  });

  const parentId = form.watch("parent_id");
  const isBaseExercise = !parentId;

  const onSubmit: SubmitHandler<ExerciseLibraryFormData> = (values) => {
    execute(async () => {
      // Inyectar is_template_base automáticamente: si no tiene padre, es base.
      const finalValues = {
        ...values,
        is_template_base: !values.parent_id
      };

      const { data: result, error } = values.id
        ? await actions.profesor.updateExercise(finalValues)
        : await actions.profesor.createExercise(finalValues);

      if (error || !result) {
        throw error || new Error("Error desconocido");
      }

      onSuccess?.(result);

      if (!values.id) {
        form.reset();
        setTagInput("");
        setVariantInput("");
      }
    }, {
      loadingMsg: values.id ? "Guardando cambios..." : "Creando ejercicio...",
      // Si el action devuelve un mensaje, useAsyncAction suele mostrarlo. 
      // Si no, usamos estos por defecto.
      successHref: successHref
    });
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

  const addVariant = (name: string) => {
    const currentVariants = form.getValues("variants") || [];
    const entry = name.trim();
    if (entry && !currentVariants.includes(entry)) {
      form.setValue("variants", [...currentVariants, entry], { shouldValidate: true });
      return true;
    }
    return false;
  };

  const removeVariant = (variantToRemove: string) => {
    const currentVariants = form.getValues("variants") || [];
    form.setValue("variants", currentVariants.filter(v => v !== variantToRemove), { shouldValidate: true });
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
    <Form {...(form as any)}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Warning de Forking para Ejercicios Base de Sistema */}
        {initialValues?.id && (initialValues as any).profesor_id === null && (
          <div className="p-4 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-xl border border-white/10">
            <div className="mt-1 bg-lime-400 p-1.5 rounded-lg shrink-0">
               <ArrowLeft className="w-4 h-4 text-zinc-900 rotate-90" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-black uppercase tracking-widest leading-none">Ejercicio de sistema</p>
              <p className="text-[13px] font-medium opacity-80 leading-snug">
                Este ejercicio pertenece a la biblioteca MiGym. Al guardarlo, se creará una **copia privada** en tu lista para que puedas personalizarlo sin afectar el original.
              </p>
            </div>
          </div>
        )}

        <FormField
          control={form.control as any}
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
                  value={field.value || ""}
                  className="font-bold text-lg"
                />
              </FormControl>
            </StandardField>
          )}
        />

        <FormField
          control={form.control as any}
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

        <div className="flex">


          {/* INLINE VARIANTS SECTION - Solo si es Base */}
          {isBaseExercise && (
            <FormField
              control={form.control as any}
              name="variants"
              render={({ field }) => (
                <StandardField
                  label="Variantes"
                  hint="Añadí variaciones rápidas (ej: Sumo, Copa, etc.)"
                >
                  <div className="space-y-4">
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Nombre de la variante..."
                          value={variantInput}
                          onChange={(e) => setVariantInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              if (addVariant(variantInput)) setVariantInput("");
                            }
                          }}
                          className="font-medium h-12"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="shrink-0 rounded-xl h-12 w-12"
                        onClick={() => {
                          if (addVariant(variantInput)) setVariantInput("");
                        }}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Existing Variants (Read-only) + New Variants */}
                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {/* Existentes */}
                      {initialValues?.existing_variants?.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 opacity-60">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                            {v.nombre}
                          </span>
                        </div>
                      ))}

                      {/* Nuevas por crear */}
                      {field.value.map(vName => (
                        <div key={vName} className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 group animate-in fade-in zoom-in duration-300">
                          <span className="text-[10px] font-black uppercase tracking-tight">
                            {vName}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeVariant(vName)}
                            className="p-1 hover:bg-lime-500/20 rounded-lg transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}

                      {!(initialValues?.existing_variants?.length) && !field.value.length && (
                        <span className="text-[10px] font-bold text-zinc-400 italic py-2">
                          Sin variantes cargadas.
                        </span>
                      )}
                    </div>
                  </div>
                </StandardField>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control as any}
          name="media_url"
          render={({ field, fieldState }) => (
            <StandardField
              label={copy.labels.mediaUrl}
              error={fieldState.error?.message}
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
          control={form.control as any}
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

        <div className="flex gap-3 pt-6 justify-end items-center">
          {(onCancel || cancelHref) && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                if (onCancel) onCancel();
                if (cancelHref) window.location.assign(cancelHref);
              }}
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
            className="px-12 shadow-2xl shadow-lime-400/10"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center">
                <Save className="w-5 h-5 mr-3" />
                <span className="text-sm font-black">
                  {initialValues?.id ? "Guardar cambios" : copy.actions.submit}
                </span>
              </div>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

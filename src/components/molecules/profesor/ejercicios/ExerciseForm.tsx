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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@/components/ui/select";

interface SimpleExercise {
  id: string;
  nombre: string;
  parent_id?: string | null;
}

interface ExerciseFormProps {
  initialValues?: Partial<ExerciseLibraryFormData>;
  parents?: SimpleExercise[]; // Lista de ejercicios para el selector de padre
  existingTags?: string[];    // Categorías ya existentes en la base
  onSuccess?: (data: any) => void;
  onCancel?: () => void;
  successHref?: string;
  cancelHref?: string;
}

export function ExerciseForm({ 
  initialValues, 
  parents = [], 
  existingTags = [],
  onSuccess, 
  onCancel, 
  successHref, 
  cancelHref 
}: ExerciseFormProps) {
  const { execute, isPending } = useAsyncAction();
  const [tagInput, setTagInput] = React.useState("");
  const [isCreatingNewTag, setIsCreatingNewTag] = React.useState(false);
  const [variantInput, setVariantInput] = React.useState("");
  const copy = exerciseLibraryCopy.form;

  // Use a strictly typed form to avoid common RHF + Zod issues
  const form = useForm<ExerciseLibraryFormData>({
    resolver: zodResolver(exerciseLibrarySchema) as any,
    defaultValues: {
      id: initialValues?.id,
      parent_id: initialValues?.parent_id || undefined,
      nombre: initialValues?.nombre ?? "",
      descripcion: initialValues?.descripcion ?? "",
      media_url: initialValues?.media_url ?? "",
      video_url: (initialValues as any)?.video_url ?? "",
      tags: initialValues?.tags ?? [],
      is_template_base: initialValues?.is_template_base ?? false,
      is_favorite: initialValues?.is_favorite ?? false,
      usage_count: initialValues?.usage_count ?? 0,
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
        is_template_base: !values.parent_id || values.parent_id === "none"
      };

      const { data: result, error } = values.id
        ? await actions.profesor.updateExercise(finalValues as any)
        : await actions.profesor.createExercise(finalValues as any);

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
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
        {/* Warning de Forking para Ejercicios Base de Sistema */}
        {initialValues?.id && (initialValues as any).profesor_id === null && (
          <div className="p-4 rounded-2xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-start gap-4 animate-in fade-in slide-in-from-top-2 duration-500 shadow-xl border border-white/10">
            <div className="mt-1 bg-lime-500 p-1.5 rounded-lg shrink-0">
              <ArrowLeft className="w-4 h-4 text-zinc-900 rotate-90" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-widest leading-none">Ejercicio de sistema</p>
              <p className="text-[13px] font-medium opacity-80 leading-snug">
                Este ejercicio pertenece a la biblioteca MiGym. Al guardarlo, se creará una **copia privada** en tu lista para que puedas personalizarlo sin afectar el original.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
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
                    className="font-bold text-lg h-14 rounded-2xl"
                  />
                </FormControl>
              </StandardField>
            )}
          />

          <FormField
            control={form.control as any}
            name="parent_id"
            render={({ field }) => (
              <StandardField
                label="Ejercicio padre (Opcional)"
                hint="Asocialo a un ejercicio base si es una variante."
              >
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                      <SelectValue placeholder="Seleccioná un padre..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-[2rem] p-2">
                    <SelectItem value="none" className="rounded-xl">Ninguno (Es ejercicio base)</SelectItem>
                    <SelectSeparator />
                    {parents.map(p => (
                      <SelectItem key={p.id} value={p.id} className="rounded-xl">
                        {p.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </StandardField>
            )}
          />
        </div>

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
                  className="min-h-[140px] resize-none font-medium p-4 rounded-[2rem] border-zinc-200 dark:border-zinc-800 focus:ring-lime-500/20"
                  placeholder={copy.placeholders.descripcion}
                  maxLength={1000}
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
            </StandardField>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* MEDIA URL */}
          <FormField
            control={form.control as any}
            name="media_url"
            render={({ field, fieldState }) => (
              <StandardField
                label="Imagen / Miniatura (URL)"
                error={fieldState.error?.message}
              >
                <FormControl>
                  <Input
                    type="url"
                    className="h-14 rounded-2xl"
                    placeholder="https://..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </StandardField>
            )}
          />

          <FormField
            control={form.control as any}
            name="video_url"
            render={({ field, fieldState }) => (
              <StandardField
                label="Video de técnica (YouTube/Vimeo)"
                error={fieldState.error?.message}
              >
                <FormControl>
                  <Input
                    type="url"
                    className="h-14 rounded-2xl"
                    placeholder="https://youtube.com/..."
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
              </StandardField>
            )}
          />

          {/* INLINE VARIANTS SECTION - Solo si es Base */}
          {isBaseExercise && (
            <FormField
              control={form.control as any}
              name="variants"
              render={({ field }) => (
                <StandardField
                  label="Variantes rápidas"
                  hint="Añadí variantes (ej: Sumo, Copa, etc.)"
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
                          className="font-medium h-12 rounded-xl"
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

                    <div className="flex flex-wrap gap-2 min-h-[40px]">
                      {initialValues?.existing_variants?.map(v => (
                        <div key={v.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 opacity-60">
                          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">
                            {v.nombre}
                          </span>
                        </div>
                      ))}

                      {field.value.map(vName => (
                        <div key={vName} className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 group animate-in fade-in zoom-in duration-300">
                          <span className="text-[10px] font-bold uppercase tracking-tight">
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
                    </div>
                  </div>
                </StandardField>
              )}
            />
          )}
        </div>

        <FormField
          control={form.control as any}
          name="tags"
          render={({ field, fieldState }) => (
            <StandardField
              label={copy.labels.tags}
              error={fieldState.error?.message}
              hint={`Seleccioná categorías existentes o creá una nueva.`}
            >
              <div className="space-y-6">
                {!isCreatingNewTag ? (
                  <div className="flex gap-2">
                    <Select
                      onValueChange={(val) => {
                        if (val === "NEW") {
                          setIsCreatingNewTag(true);
                        } else {
                          addTag(val);
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[10px]">
                          <SelectValue placeholder="Elegir categoría..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-[2rem] p-2">
                        <SelectGroup>
                          <SelectLabel>Populares</SelectLabel>
                          {copy.quickTags.map(tag => (
                            <SelectItem key={tag} value={tag} className="rounded-xl">{tag}</SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectGroup>
                          <SelectLabel>Mis categorías</SelectLabel>
                          {existingTags.filter(t => !(copy.quickTags as readonly string[]).includes(t)).map(tag => (
                            <SelectItem key={tag} value={tag} className="rounded-xl">{tag}</SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectSeparator />
                        <SelectItem value="NEW" className="rounded-xl text-lime-500 font-black">
                          + Crear nueva categoría...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                    <FormControl>
                      <Input
                        placeholder="Escribí el nombre de la categoría..."
                        value={tagInput}
                        autoFocus
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            if (addTag(tagInput)) {
                              setTagInput("");
                              setIsCreatingNewTag(false);
                            }
                          } else if (e.key === "Escape") {
                            setIsCreatingNewTag(false);
                          }
                        }}
                        className="font-medium h-14 rounded-2xl"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="industrial"
                      className="shrink-0 rounded-2xl h-14 px-6"
                      onClick={() => {
                        if (addTag(tagInput)) {
                          setTagInput("");
                          setIsCreatingNewTag(false);
                        }
                      }}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="text-[10px] font-bold uppercase">Añadir</span>
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-14 w-14 rounded-2xl"
                      onClick={() => setIsCreatingNewTag(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* Selected Chips */}
                {field.value && field.value.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {field.value.map(tag => (
                      <div key={tag} className="flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-xl border border-white/10">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="p-1 hover:bg-white/10 dark:hover:bg-zinc-100 rounded-lg transition-colors"
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

        <div className="flex gap-3 pt-12 justify-end items-center border-t border-zinc-100 dark:border-zinc-800">
          {(onCancel || cancelHref) && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => {
                if (onCancel) onCancel();
                if (cancelHref) window.location.assign(cancelHref);
              }}
              className="rounded-2xl font-bold uppercase tracking-widest text-[10px] h-14 px-8"
            >
              {copy.actions.cancel}
            </Button>
          )}
          <Button
            type="submit"
            disabled={isPending}
            variant="industrial"
            size="xl"
            className="px-12 shadow-2xl shadow-lime-400/10 h-16"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div className="flex items-center">
                <Save className="w-5 h-5 mr-3" />
                <span className="text-sm font-bold">
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

import * as React from "react";
import { Plus, Save, X, ArrowLeft, Loader2 } from "lucide-react";
import { exerciseLibraryCopy } from "@/data/es/profesor/ejercicios";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectSeparator, SelectGroup, SelectLabel } from "@/components/ui/select";
import { StandardField } from "@/components/molecules/StandardField";

// Hooks
import { useExerciseForm } from "@/hooks/profesor/exercises/useExerciseForm";

interface Props {
    initialValues?: any;
    parents?: any[];
    existingTags?: string[];
    onSuccess?: (data: any) => void;
    onCancel?: () => void;
    successHref?: string;
    cancelHref?: string;
}

/**
 * ExerciseForm: Formulario optimizado para la gestión de la biblioteca.
 * Modularizado (V2.1) para mejorar el rendimiento de renderizado en formularios con muchas etiquetas.
 */
export function ExerciseForm({ initialValues, parents = [], existingTags = [], onSuccess, onCancel, successHref, cancelHref }: Props) {
    const {
        form,
        isPending,
        isBaseExercise,
        tagInput,
        setTagInput,
        isCreatingNewTag,
        setIsCreatingNewTag,
        variantInput,
        setVariantInput,
        addTag,
        removeTag,
        addVariant,
        removeVariant,
        onSubmit
    } = useExerciseForm({ initialValues, onSuccess, successHref });

    const copy = exerciseLibraryCopy.form;

    return (
        <Form {...(form as any)}>
            <div className="space-y-10">
                {/* 1. SISTEMA ALERT */}
                {initialValues?.id && (initialValues as any).profesor_id === null && (
                    <div className="p-4 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-50 dark:text-zinc-950 flex items-start gap-4 animate-in fade-in duration-500 shadow-xl border border-zinc-200/10">
                        <div className="mt-1 bg-lime-500 p-1.5 rounded-lg shrink-0"><ArrowLeft className="w-4 h-4 text-zinc-900 rotate-90" /></div>
                        <div className="space-y-1"><p className="text-[10px] uppercase font-bold tracking-widest leading-none">Ejercicio MiGym</p><p className="text-[13px] font-medium opacity-80 leading-snug">Se creará una **copia privada** en tu biblioteca para que puedas personalizarlo.</p></div>
                    </div>
                )}

                {/* 2. IDENTIDAD & PADRE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <FormField control={form.control} name="nombre" render={({ field, fieldState }) => (
                        <StandardField label={copy.labels.nombre} error={fieldState.error?.message} required>
                            <FormControl><Input placeholder={copy.placeholders.nombre} {...field} value={field.value || ""} className="font-bold text-lg h-14 rounded-2xl" /></FormControl>
                        </StandardField>
                    )} />
                    <FormField control={form.control} name="parent_id" render={({ field }) => (
                        <StandardField label="Vínculo (Opcional)" hint="Define si es variante de otro ejercicio">
                            <Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[9px]"><SelectValue placeholder="Sin padre (Ejercicio base)" /></SelectTrigger></FormControl>
                            <SelectContent className="rounded-2xl p-2"><SelectItem value="none" className="rounded-xl">Ejercicio base</SelectItem><SelectSeparator />{parents.map(p => <SelectItem key={p.id} value={p.id} className="rounded-xl">{p.nombre}</SelectItem>)}</SelectContent></Select>
                        </StandardField>
                    )} />
                </div>

                {/* 3. DESCRIPCIÓN */}
                <FormField control={form.control} name="descripcion" render={({ field, fieldState }) => (
                    <StandardField label={copy.labels.descripcion} error={fieldState.error?.message}>
                        <FormControl><Textarea className="min-h-[140px] resize-none p-4 rounded-3xl border-zinc-200" placeholder={copy.placeholders.descripcion} maxLength={1000} {...field} value={field.value || ""} /></FormControl>
                    </StandardField>
                )} />

                {/* 4. MEDIOS & VARIANTES */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <FormField control={form.control} name="media_url" render={({ field, fieldState }) => (
                        <StandardField label="Imagen/GIF (URL)" error={fieldState.error?.message}>
                            <FormControl><Input type="url" className="h-14 rounded-2xl" placeholder="https://..." {...field} value={field.value || ""} /></FormControl>
                        </StandardField>
                    )} />

                    {isBaseExercise && (
                        <FormField control={form.control} name="variants" render={({ field }) => (
                            <StandardField label="Sub-variantes" hint="Ej: Sumo, Low-bar, Unilateral">
                                <div className="space-y-4"><div className="flex gap-2"><FormControl><Input placeholder="Añadir..." value={variantInput} onChange={(e)=>setVariantInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault(); if(addVariant(variantInput)) setVariantInput("");}}} className="h-12 rounded-xl" /></FormControl>
                                <Button type="button" variant="outline" size="icon" className="shrink-0 h-12 w-12 rounded-xl" onClick={()=>{if(addVariant(variantInput)) setVariantInput("");}}><Plus className="w-4 h-4" /></Button></div>
                                <div className="flex flex-wrap gap-2">{field.value?.map(v=><div key={v} className="flex items-center gap-1.5 pl-3 pr-1 py-1.5 rounded-xl bg-lime-500/10 border border-lime-500/20 text-lime-600 dark:text-lime-400 text-[10px] font-bold uppercase tracking-tight">{v}<button type="button" onClick={()=>removeVariant(v)} className="p-1 hover:bg-lime-500/20 rounded-lg"><X className="w-3 h-3" /></button></div>)}</div></div>
                            </StandardField>
                        )} />
                    )}
                </div>

                {/* 5. TAGS / CATEGORÍAS */}
                <FormField control={form.control} name="tags" render={({ field, fieldState }) => (
                    <StandardField label={copy.labels.tags} error={fieldState.error?.message} hint="Categorías para filtrado rápido">
                        <div className="space-y-6">
                            {!isCreatingNewTag ? (
                                <Select onValueChange={(val) => val === "NEW" ? setIsCreatingNewTag(true) : addTag(val)}>
                                    <FormControl><SelectTrigger className="h-14 rounded-2xl font-bold uppercase tracking-widest text-[9px]"><SelectValue placeholder="Elegir categoría..." /></SelectTrigger></FormControl>
                                    <SelectContent className="rounded-2xl p-2">
                                        <SelectGroup><SelectLabel>Sugeridos</SelectLabel>{copy.quickTags.map(t=><SelectItem key={t} value={t} className="rounded-xl">{t}</SelectItem>)}</SelectGroup>
                                        <SelectSeparator /><SelectGroup><SelectLabel>Tuyos</SelectLabel>{existingTags.filter(t=>!(copy.quickTags as any).includes(t)).map(t=><SelectItem key={t} value={t} className="rounded-xl">{t}</SelectItem>)}</SelectGroup>
                                        <SelectSeparator /><SelectItem value="NEW" className="rounded-xl text-lime-600 font-black">+ Nueva categoría...</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                                    <FormControl><Input placeholder="Nombre..." value={tagInput} autoFocus onChange={(e)=>setTagInput(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter"){e.preventDefault(); if(addTag(tagInput)){setTagInput(""); setIsCreatingNewTag(false);}} else if(e.key==="Escape") setIsCreatingNewTag(false);}} className="h-14 rounded-2xl" /></FormControl>
                                    <Button type="button" variant="industrial" className="shrink-0 h-14 px-6 rounded-2xl" onClick={()=>{if(addTag(tagInput)){setTagInput(""); setIsCreatingNewTag(false);}}}>Añadir</Button>
                                    <Button type="button" variant="ghost" size="icon" className="h-14 w-14 rounded-2xl" onClick={()=>setIsCreatingNewTag(false)}><X className="w-5 h-5" /></Button>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2">{field.value?.map(t=><div key={t} className="flex items-center gap-2 pl-3 pr-1 py-1.5 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest border border-white/10">{t}<button type="button" onClick={()=>removeTag(t)} className="p-1 hover:bg-white/10 dark:hover:bg-zinc-100 rounded-lg"><X className="w-3.5 h-3.5" /></button></div>)}</div>
                        </div>
                    </StandardField>
                )} />

                {/* FOOTER */}
                <div className="flex gap-3 pt-12 border-t border-zinc-100 dark:border-zinc-800 justify-end items-center">
                    {(onCancel || cancelHref) && <Button type="button" variant="outline" size="lg" onClick={()=>onCancel ? onCancel() : window.location.assign(cancelHref!)} className="rounded-2xl font-bold uppercase text-[10px] h-14 px-8 tracking-widest">Cancelar</Button>}
                    <Button type="submit" disabled={isPending} variant="industrial" size="xl" onClick={onSubmit} className="px-12 h-16 rounded-2xl shadow-xl shadow-lime-500/10">
                        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5 mr-3" /><span className="text-sm font-bold">{initialValues?.id ? "Guardar cambios" : "Crear ejercicio"}</span></>}
                    </Button>
                </div>
            </div>
        </Form>
    );
}

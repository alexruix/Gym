import { useState, type KeyboardEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Loader2, ExternalLink, X, Award } from "lucide-react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { updatePublicProfileSchema, type UpdatePublicProfileData } from "@/lib/validators";
import { configurationCopy } from "@/data/es/profesor/configuracion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export interface PublicPerfilProps {
  nombre: string | null;
  slug: string | null;
  bio: string | null;
  instagram: string | null;
  youtube: string | null;
  tiktok: string | null;
  x_twitter: string | null;
  especialidades: string[] | null;
  perfil_publico: boolean;
}

export function PublicProfileSection({ profesor }: { profesor: PublicPerfilProps }) {
  const { execute, isPending } = useAsyncAction();
  const copy = configurationCopy.publicProfile;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdatePublicProfileData>({
    resolver: zodResolver(updatePublicProfileSchema) as any,
    defaultValues: {
      nombre: profesor.nombre || "",
      slug: profesor.slug || "",
      bio: profesor.bio || "",
      instagram: profesor.instagram || "",
      youtube: profesor.youtube || "",
      tiktok: profesor.tiktok || "",
      x_twitter: profesor.x_twitter || "",
      especialidades: (profesor.especialidades as string[]) || [],
      perfil_publico: profesor.perfil_publico || false,
    },
  });

  const isPublic = watch("perfil_publico");

  const especialidades = watch("especialidades") || [];
  const [newEspecialidad, setNewEspecialidad] = useState("");

  const handleAddEspecialidad = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = newEspecialidad.trim();
      if (val && !especialidades.includes(val) && especialidades.length < 10) {
        setValue("especialidades", [...especialidades, val], { shouldDirty: true });
        setNewEspecialidad("");
      }
    }
  };

  const removeEspecialidad = (item: string) => {
    setValue(
      "especialidades",
      especialidades.filter((e: string) => e !== item),
      { shouldDirty: true }
    );
  };

  const onSubmit = async (data: UpdatePublicProfileData) => {
    execute(async () => {
      const result = await actions.profesor.updatePublicProfile(data);
      if (result.error) throw result.error;
    }, {
      successMsg: copy.toast.success,
    });
  };

  const renderDomain = typeof window !== "undefined" ? window.location.host : "migym.com";

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-bold">{copy.section}</h3>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      {/* Banner / CTA de Publicar */}
      <div className="bg-primary/10 border border-primary/20 text-primary p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all">
        <div className="space-y-4 flex-1">
          <div className="space-y-1">
            <h4 className="font-bold flex items-center gap-2 text-lg">
              <Award className="h-5 w-5" />
              {copy.banner.title}
            </h4>
            <p className="text-sm opacity-90">{copy.banner.subtitle}</p>
          </div>
          
          <div className="flex items-center gap-3 bg-white/40 dark:bg-zinc-900/40 p-3 rounded-lg border border-primary/10 w-fit">
            <Switch 
              id="perfil_publico" 
              checked={isPublic} 
              onCheckedChange={(checked) => setValue("perfil_publico", checked, { shouldDirty: true })} 
            />
            <Label htmlFor="perfil_publico" className="font-bold cursor-pointer">
              {isPublic ? "Perfil Público Activo" : "Perfil Privado"}
            </Label>
          </div>
        </div>

        {profesor.slug && isPublic && (
          <Button variant="default" size="lg" asChild className="shrink-0 shadow-lg shadow-primary/20">
            <a href={`/p/${profesor.slug}`} target="_blank" rel="noreferrer">
              {copy.banner.cta} <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        
        {/* Basic Info */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="nombre">{copy.labels.nombre}</Label>
            <Input id="nombre" {...register("nombre")} />
            {errors.nombre && <p className="text-sm text-destructive">{errors.nombre.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="slug">{copy.labels.slug}</Label>
            <div className="flex rounded-md shadow-sm">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground sm:text-sm">
                {renderDomain}/p/
              </span>
              <Input id="slug" className="rounded-l-none" {...register("slug")} placeholder="tu-estudio" />
            </div>
            <p className="text-xs text-muted-foreground">{copy.hints.slug}</p>
            {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="bio">{copy.labels.bio}</Label>
            <Textarea 
              id="bio" 
              {...register("bio")} 
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">{copy.hints.bio}</p>
            {errors.bio && <p className="text-sm text-destructive">{errors.bio.message}</p>}
          </div>
        </div>

        {/* Especialidades Array */}
        <div className="space-y-3">
          <Label htmlFor="especialidades_input">{copy.labels.especialidades}</Label>
          <div className="flex flex-wrap gap-2 mb-2 p-3 bg-muted/50 rounded-lg min-h-[50px] items-center border border-transparent focus-within:border-ring transition-colors">
            {especialidades.map((esp, i) => (
              <Badge key={i} variant="secondary" className="pl-3 pr-1 py-1 gap-1 flex items-center">
                {esp}
                <button
                  type="button"
                  onClick={() => removeEspecialidad(esp)}
                  className="rounded-full hover:bg-muted p-0.5 text-muted-foreground transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">Remover especialidad</span>
                </button>
              </Badge>
            ))}
            <input
              id="especialidades_input"
              value={newEspecialidad}
              onChange={(e) => setNewEspecialidad(e.target.value)}
              onKeyDown={handleAddEspecialidad}
              className="flex-1 bg-transparent min-w-[120px] focus:outline-none text-sm placeholder:text-muted-foreground outline-none"
              placeholder={especialidades.length < 10 ? copy.hints.especialidades : "Límite alcanzado"}
              disabled={especialidades.length >= 10}
            />
          </div>
          {errors.especialidades && <p className="text-sm text-destructive">{errors.especialidades.message}</p>}
        </div>

        {/* Redes Sociales Grid */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="font-medium text-sm">Redes Sociales & Enlaces</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="instagram">{copy.labels.instagram}</Label>
              <Input id="instagram" type="url" placeholder="https://instagram.com/..." {...register("instagram")} />
              {errors.instagram && <p className="text-sm text-destructive">{errors.instagram.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">{copy.labels.youtube}</Label>
              <Input id="youtube" type="url" placeholder="https://youtube.com/..." {...register("youtube")} />
              {errors.youtube && <p className="text-sm text-destructive">{errors.youtube.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">{copy.labels.tiktok}</Label>
              <Input id="tiktok" type="url" placeholder="https://tiktok.com/..." {...register("tiktok")} />
              {errors.tiktok && <p className="text-sm text-destructive">{errors.tiktok.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="x_twitter">{copy.labels.x_twitter}</Label>
              <Input id="x_twitter" type="url" placeholder="https://x.com/..." {...register("x_twitter")} />
              {errors.x_twitter && <p className="text-sm text-destructive">{errors.x_twitter.message}</p>}
            </div>
          </div>
        </div>

        <div className="pt-6 flex justify-end">
          <Button type="submit" size="lg" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {copy.actions.saveChanges}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { updateAccountSchema, type UpdateAccountData } from "@/lib/validators";
import { configurationCopy } from "@/data/es/profesor/configuracion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PerfilProps {
  id: string;
  nombre: string | null;
  email: string;
  telefono: string | null;
  bio: string | null;
  foto_url: string | null;
}

export function ProfileSection({ profesor }: { profesor: PerfilProps }) {
  const { execute, isPending } = useAsyncAction();
  const copy = configurationCopy.profile;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateAccountData>({
    resolver: zodResolver(updateAccountSchema),
    defaultValues: {
      email: profesor.email,
      telefono: profesor.telefono || "",
    },
  });

  const onSubmit = async (data: UpdateAccountData) => {
    execute(async () => {
      const result = await actions.profesor.updateAccount(data);
      if (result.error) throw result.error;
    }, {
      successMsg: copy.toast.success,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">{copy.section}</h3>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{copy.labels.email}</Label>
          <Input id="email" {...register("email")} readOnly className="bg-muted text-muted-foreground" />
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <Label htmlFor="telefono">{copy.labels.telefono}</Label>
          <Input id="telefono" {...register("telefono")} />
          <p className="text-xs text-muted-foreground">{copy.hints.telefono}</p>
          {errors.telefono && <p className="text-sm text-destructive">{errors.telefono.message}</p>}
        </div>

        <div className="pt-4 flex justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {copy.actions.saveChanges}
          </Button>
        </div>
      </form>
    </div>
  );
}

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { Loader2, Key, List, Info, KeyRound } from "lucide-react";

import { useAsyncAction } from "@/hooks/useAsyncAction";
import { changePasswordSchema, type ChangePasswordData } from "@/lib/validators";
import { configurationCopy } from "@/data/es/profesor/configuracion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

export function SecuritySection({ lastPasswordUpdate }: { lastPasswordUpdate?: string }) {
  const [isOpen, setIsOpen] = useState(false);

  function formatRelativeTime(dateString?: string) {
    if (!dateString) return "Desconocido";
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return "hace unos segundos";
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes !== 1 ? 's' : ''}`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours !== 1 ? 's' : ''}`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `hace ${diffInDays} día${diffInDays !== 1 ? 's' : ''}`;
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) return `hace ${diffInMonths} mes${diffInMonths !== 1 ? 'es' : ''}`;
    const diffInYears = Math.floor(diffInDays / 365);
    return `hace ${diffInYears} año${diffInYears !== 1 ? 's' : ''}`;
  }
  const { execute, isPending } = useAsyncAction();
  const copy = configurationCopy.security;
  const modalCopy = configurationCopy.modals.changePassword;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = async (data: ChangePasswordData) => {
    execute(async () => {
      const result = await actions.profesor.changePassword(data);
      if (result.error) throw result.error;
      if (result.data?.success) {
        setIsOpen(false);
        reset();
      }
    }, {
      successMsg: modalCopy.success,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold">{copy.section}</h3>
        <p className="text-sm text-muted-foreground">{copy.description}</p>
      </div>

      <div className="space-y-6">
        
        {/* Change Password Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg gap-4">
          <div className="space-y-1">
            <h4 className="font-semibold flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              {copy.changePassword}
            </h4>
            <p className="text-sm text-muted-foreground">
              {copy.passwordHint} <strong>{formatRelativeTime(lastPasswordUpdate)}</strong>
            </p>
          </div>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">{copy.actions.changePassword}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{modalCopy.title}</DialogTitle>
                <DialogDescription>{modalCopy.description}</DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{modalCopy.currentPassword}</Label>
                  <Input type="password" id="currentPassword" {...register("currentPassword")} />
                  {errors.currentPassword && (
                    <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{modalCopy.newPassword}</Label>
                  <Input type="password" id="newPassword" {...register("newPassword")} />
                  {errors.newPassword && (
                    <p className="text-sm text-destructive">{errors.newPassword.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{modalCopy.hint}</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{modalCopy.confirmPassword}</Label>
                  <Input type="password" id="confirmPassword" {...register("confirmPassword")} />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                    {modalCopy.cancel}
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {modalCopy.change}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Info Privacidad */}
        {/* <div className="p-4 bg-muted/50 rounded-lg space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Info className="h-4 w-4 text-muted-foreground" />
            {copy.privacy}
          </h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {copy.privacyHints.map((hint, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span>{hint}</span>
              </li>
            ))}
          </ul>
        </div> */}

      </div>
    </div>
  );
}

import * as React from "react";
import { 
  Bell, 
  Clock, 
  CreditCard, 
  UserCheck, 
  UserPlus, 
  Mail,
  Loader2,
  Award
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { configurationCopy } from "@/data/es/profesor/configuracion";
import { actions } from "astro:actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface NotificationsSectionProps {
  profesor: {
    notif_cuotas_vencer: boolean;
    notif_cuota_vencida: boolean;
    notif_alumno_completado: boolean;
    notif_nuevo_alumno: boolean;
    notif_email_semanal: boolean;
    notif_frecuencia: "evento" | "diario" | "semanal";
  };
}

export function NotificationsSection({ profesor }: NotificationsSectionProps) {
  const [formData, setFormData] = React.useState(profesor);
  const [loading, setLoading] = React.useState(false);

  const handleToggle = (key: keyof typeof formData) => {
    setFormData(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFrequency = (val: string) => {
    setFormData(prev => ({ ...prev, notif_frecuencia: val as any }));
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(profesor);

  const onSave = async () => {
    setLoading(true);
    try {
      const { data, error } = await actions.profesor.updateNotifications(formData);
      if (error) throw error;
      toast.success(configurationCopy.notifications.toast.success);
    } catch (err) {
      console.error("Error updating notifications:", err);
      toast.error("Error al guardar preferencias");
    } finally {
      setLoading(false);
    }
  };

  const NotificationItem = ({ 
    icon: Icon, 
    label, 
    hint, 
    checked, 
    onCheckedChange 
  }: { 
    icon: any, 
    label: string, 
    hint: string, 
    checked: boolean, 
    onCheckedChange: () => void 
  }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/50 hover:bg-muted/50 transition-all duration-200">
      <div className="flex gap-4 items-center">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-border/50",
          checked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-bold leading-none">{label}</p>
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header aligned with PublicProfileSection */}
      <div className="space-y-1">
        <h3 className="text-lg font-bold">{configurationCopy.notifications.section}</h3>
        <p className="text-sm text-muted-foreground">Controlá cómo y cuándo te avisamos sobre la actividad de tu gimnasio.</p>
      </div>

      {/* Grid aligned with PublicProfileSection structure */}
      <div className="grid gap-4 sm:grid-cols-2">
        <NotificationItem 
          icon={Clock}
          label={configurationCopy.notifications.labels.expiringPayments}
          hint={configurationCopy.notifications.hints.expiringPayments}
          checked={formData.notif_cuotas_vencer}
          onCheckedChange={() => handleToggle('notif_cuotas_vencer')}
        />
        <NotificationItem 
          icon={CreditCard}
          label={configurationCopy.notifications.labels.expiredPayments}
          hint={configurationCopy.notifications.hints.expiredPayments}
          checked={formData.notif_cuota_vencida}
          onCheckedChange={() => handleToggle('notif_cuota_vencida')}
        />
        {/* <NotificationItem 
          icon={UserCheck}
          label={configurationCopy.notifications.labels.studentCompleted}
          hint={configurationCopy.notifications.hints.studentCompleted}
          checked={formData.notif_alumno_completado}
          onCheckedChange={() => handleToggle('notif_alumno_completado')}
        /> */}
        <NotificationItem 
          icon={UserPlus}
          label={configurationCopy.notifications.labels.newStudent}
          hint={configurationCopy.notifications.hints.newStudent}
          checked={formData.notif_nuevo_alumno}
          onCheckedChange={() => handleToggle('notif_nuevo_alumno')}
        />
      </div>

      {/* Banner refactored to match PublicProfileSection banner style */}
      <div className="bg-primary/10 border border-primary/20 text-primary p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all">
        <div className="space-y-1">
           <h4 className="font-bold flex items-center gap-2 text-lg">
             <Bell className="h-5 w-5" />
             {configurationCopy.notifications.frequency}
           </h4>
           <p className="text-sm opacity-90">Configurá la frecuencia de tus resúmenes por correo electrónico.</p>
        </div>

        <div className="w-full sm:w-64 shrink-0">
          <Select value={formData.notif_frecuencia} onValueChange={handleFrequency}>
            <SelectTrigger className="bg-white/40 dark:bg-zinc-900/40 border-primary/10 h-11 rounded-lg focus:ring-primary/20 font-medium">
              <SelectValue placeholder="Seleccionar frecuencia" />
            </SelectTrigger>
            <SelectContent className="rounded-xl overflow-hidden shadow-xl border-primary/10">
              {configurationCopy.notifications.frecuencias.map(f => (
                <SelectItem key={f.value} value={f.value} className="py-2.5 font-medium">
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Save Button aligned with PublicProfileSection style */}
      <div className="pt-6 flex justify-end">
        <Button 
          onClick={onSave}
          size="lg"
          disabled={loading || !hasChanges}
          className="shadow-lg shadow-primary/10 px-8"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Guardar preferencias
        </Button>
      </div>
    </div>
  );
}

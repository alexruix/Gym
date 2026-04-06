import React from "react";
import { CheckCircle2, TrendingUp, UserPlus, Clock } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { IconWrapper } from "@/components/atoms/IconWrapper";
import { cn } from "@/lib/utils";

export interface ActivityLog {
  id: string;
  type: "session_completed" | "weight_logged" | "new_student";
  studentName: string;
  details?: string;
  timeAgo: string;
}

interface Props {
  activities: ActivityLog[];
}

const typeConfig = {
  session_completed: { icon: CheckCircle2, color: "primary" as const, label: "completó su sesión" },
  weight_logged:     { icon: TrendingUp,   color: "info"    as const, label: "registró peso en" },
  new_student:       { icon: UserPlus,     color: "warning" as const, label: "se unió al equipo" },
};

/**
 * ActivityFeed: Lista limpia de actividad reciente.
 * Estilo industrial: log vertical, sin zigzag, alta densidad de información.
 */
export function ActivityFeed({ activities }: Props) {
  const c = dashboardCopy.feed;

  return (
    <DashboardCard variant="base" className="h-full">
      {/* Header */}
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center gap-3">
        <IconWrapper icon={Clock} color="muted" size="md" shape="rounded" />
        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-700 dark:text-zinc-300">
          {c.title}
        </h2>
      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
          <IconWrapper icon={Clock} color="muted" size="xl" shape="circle" />
          <p className="text-sm text-zinc-400 font-medium max-w-[180px] leading-relaxed">
            {c.empty}
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-100 dark:divide-zinc-800/50" role="list" aria-label="Actividad reciente">
          {activities.map((log) => {
            const config = typeConfig[log.type];
            return (
              <li
                key={log.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
              >
                {/* Indicador de tipo */}
                <IconWrapper
                  icon={config.icon}
                  color={config.color}
                  size="md"
                  shape="circle"
                  className="shrink-0"
                />

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-snug truncate">
                    <span className="font-black text-zinc-950 dark:text-zinc-50">
                      {log.studentName}
                    </span>{" "}
                    {config.label}
                    {log.details && (
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {" "}{log.details}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-0.5">
                    {log.timeAgo}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </DashboardCard>
  );
}

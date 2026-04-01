import React from "react";
import { CheckCircle2, TrendingUp, UserPlus, Clock } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { DashboardCard } from "@/components/molecules/DashboardCard";
import { IconWrapper } from "@/components/atoms/IconWrapper";

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

export function ActivityFeed({ activities }: Props) {
  const c = dashboardCopy.feed;

  if (activities.length === 0) {
    return (
      <DashboardCard variant="base" className="p-6 flex-col items-center justify-center text-center py-12 h-full">
        <IconWrapper icon={Clock} color="muted" size="xl" shape="circle" className="mb-4" />
        <p className="text-zinc-500 font-medium max-w-[200px]">{c.empty}</p>
      </DashboardCard>
    );
  }

  const getLogSettings = (type: ActivityLog["type"]) => {
    switch (type) {
      case "session_completed":
        return { icon: CheckCircle2, color: "primary" as const };
      case "weight_logged":
        return { icon: TrendingUp, color: "info" as const };
      case "new_student":
        return { icon: UserPlus, color: "warning" as const };
    }
  };

  const getText = (log: ActivityLog) => {
    switch (log.type) {
      case "session_completed":
        return (
          <>
            <span className="font-bold text-zinc-950">{log.studentName}</span> {c.labels.sessionCompleted}
          </>
        );
      case "weight_logged":
        return (
          <>
            <span className="font-bold text-zinc-950">{log.studentName}</span> {c.labels.weightLogged} <span className="font-bold text-zinc-950">{log.details}</span>
          </>
        );
      case "new_student":
        return (
          <>
            <span className="font-bold text-zinc-950">{log.studentName}</span> {c.labels.newStudent}
          </>
        );
    }
  };

  return (
    <DashboardCard variant="base" className="h-full">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
        <IconWrapper icon={Clock} color="muted" size="md" shape="rounded" />
        <h2 className="text-lg font-bold text-zinc-950">{c.title}</h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {activities.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              {(() => {
                const settings = getLogSettings(log.type);
                return (
                  <IconWrapper 
                    icon={settings.icon} 
                    color={settings.color}
                    size="lg" 
                    shape="circle" 
                    className="border-4 border-white md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110"
                  />
                );
              })()}

              {/* Content card */}
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-50/50 border border-zinc-100 p-4 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
                <p className="text-sm text-zinc-600 mb-1 leading-relaxed">
                  {getText(log)}
                </p>
                <div className="text-xs font-medium text-zinc-400">
                  {log.timeAgo}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardCard>
  );
}

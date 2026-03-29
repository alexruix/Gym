import React from "react";
import { CheckCircle2, TrendingUp, UserPlus, Clock } from "lucide-react";
import { dashboardCopy } from "@/data/es/profesor/dashboard";
import { Card } from "@/components/ui/card";

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
      <Card className="p-6 border-zinc-100 shadow-sm flex flex-col items-center justify-center text-center py-12 h-full">
        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-zinc-400" aria-hidden="true" />
        </div>
        <p className="text-zinc-500 font-medium max-w-[200px]">{c.empty}</p>
      </Card>
    );
  }

  const getIcon = (type: ActivityLog["type"]) => {
    switch (type) {
      case "session_completed":
        return <CheckCircle2 className="w-5 h-5 text-lime-600" aria-hidden="true" />;
      case "weight_logged":
        return <TrendingUp className="w-5 h-5 text-blue-600" aria-hidden="true" />;
      case "new_student":
        return <UserPlus className="w-5 h-5 text-purple-600" aria-hidden="true" />;
    }
  };

  const getBgColor = (type: ActivityLog["type"]) => {
    switch (type) {
      case "session_completed":
        return "bg-lime-100";
      case "weight_logged":
        return "bg-blue-100";
      case "new_student":
        return "bg-purple-100";
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
    <Card className="overflow-hidden h-full flex flex-col border-zinc-100 shadow-sm">
      <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-3">
        <div className="p-2 bg-zinc-100 rounded-xl">
          <Clock className="w-5 h-5 text-zinc-600" aria-hidden="true" />
        </div>
        <h2 className="text-lg font-bold text-zinc-950">{c.title}</h2>
      </div>

      <div className="p-6 flex-1 overflow-y-auto">
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
          {activities.map((log) => (
            <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              {/* Timeline dot */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${getBgColor(log.type)} shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform duration-300 group-hover:scale-110`}
              >
                {getIcon(log.type)}
              </div>

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
    </Card>
  );
}

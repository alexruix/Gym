import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export const EmptyState = ({ 
  title, 
  description, 
  icon = <FolderOpen className="w-12 h-12 text-zinc-300" />, 
  action, 
  className 
}: EmptyStateProps) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-zinc-200 rounded-3xl bg-zinc-50/50",
      className
    )}>
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-extrabold text-zinc-900 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 font-medium max-w-xs mb-6">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

EmptyState.displayName = "EmptyState";

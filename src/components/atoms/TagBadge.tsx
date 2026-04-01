import { cn } from "@/lib/utils";

interface TagBadgeProps {
  children: React.ReactNode;
  className?: string;
}

export function TagBadge({ children, className }: TagBadgeProps) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-[9px] font-black uppercase tracking-widest text-zinc-500 border border-zinc-200/50 dark:border-zinc-800/50 transition-colors",
      className
    )}>
      {children}
    </span>
  );
}

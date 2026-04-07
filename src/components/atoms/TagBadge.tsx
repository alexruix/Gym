import { cn } from "@/lib/utils";

interface TagBadgeProps {
  children: React.ReactNode;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function TagBadge({ children, className, onClick }: TagBadgeProps) {
  return (
    <span
      onClick={onClick}
      className={cn(
        "industrial-tag-badge",
        onClick && "cursor-pointer hover:bg-lime-500 hover:text-zinc-950 hover:border-lime-400 active:scale-95 shadow-sm",
        className
      )}
    >
      {children}
    </span>
  );
}

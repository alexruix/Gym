import { Search, ListFilter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchHeaderProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  count: number;
  label?: string;
  className?: string;
  actions?: React.ReactNode;
}

export function SearchHeader({
  value,
  onChange,
  placeholder = "Buscar...",
  count,
  label = "Resultados",
  className,
  actions
}: SearchHeaderProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-4 items-center justify-between", className)}>
      <div className="relative w-full md:max-w-md group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-lime-500 transition-colors" />
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pl-11 h-12 rounded-2xl bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 focus:ring-lime-500/20 focus:border-lime-500 transition-all font-medium"
        />
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        {actions}
        <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest bg-zinc-50 dark:bg-zinc-900/50 px-4 py-2 rounded-xl border border-zinc-100 dark:border-zinc-800">
           <ListFilter className="w-4 h-4" />
           {count} {label}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { Filter, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[] | FilterOption[];
  placeholder: string;
  icon?: LucideIcon;
  className?: string;
  containerClassName?: string;
}

export function FilterSelect({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  icon: Icon = Filter,
  className,
  containerClassName
}: FilterSelectProps) {
  return (
    <div className={cn("relative flex-1 md:flex-none", containerClassName)}>
      <select 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-lime-400/20 font-bold text-zinc-700 dark:text-zinc-300 w-full md:min-w-48 transition-all cursor-pointer",
          className
        )}
      >
        <option value="todos">{placeholder}</option>
        {options.map((opt) => {
          const val = typeof opt === "string" ? opt : opt.value;
          const label = typeof opt === "string" ? opt : opt.label;
          return (
            <option key={val} value={val}>
              {label}
            </option>
          );
        })}
      </select>
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
      
      {/* Custom Chevron Indicator */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-zinc-500">
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}

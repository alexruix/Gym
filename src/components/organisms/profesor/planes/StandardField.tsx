import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";

interface StandardFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  required?: boolean;
  className?: string;
}

export function StandardField({ 
    label, 
    children, 
    error, 
    required,
    className 
}: StandardFieldProps) {
  return (
    <FormItem className={cn("space-y-3 animate-in fade-in slide-in-from-left-4 duration-500", className)}>
      <div className="flex items-center justify-between px-1">
        <FormLabel className="industrial-label">
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormMessage className="industrial-metadata text-red-500 animate-pulse m-0" />
      </div>
      <div className={cn(
        "relative transition-all duration-300",
        error ? "ring-1 ring-red-500/20 rounded-xl" : ""
      )}>
        {children}
      </div>
    </FormItem>
  );
}

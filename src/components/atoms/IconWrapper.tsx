import React from 'react';
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface IconWrapperProps {
  icon: LucideIcon;
  color?: 'primary' | 'destructive' | 'warning' | 'info' | 'muted' | 'base' | 'lime';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  shape?: 'circle' | 'rounded';
  className?: string;
  iconClassName?: string;
}

export function IconWrapper({ 
  icon: Icon, 
  color = 'muted', 
  size = 'md', 
  shape = 'rounded',
  className,
  iconClassName
}: IconWrapperProps) {
  const colorStyles = {
    destructive: "bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400",
    warning: "bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400",
    info: "bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400",
    muted: "bg-zinc-100/80 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
    base: "bg-white/10 text-white", // Mayormente para los neones oscuros
    lime: "bg-lime-400/20 text-lime-400 dark:bg-lime-500/10 dark:text-lime-400",
    primary: "bg-lime-400/20 text-lime-400 dark:bg-lime-500/10 dark:text-lime-400",
  };

  const sizeStyles = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12 p-3",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
    xl: "w-6 h-6",
  };

  const shapeStyles = {
    circle: "rounded-full",
    rounded: "rounded-xl",
  };

  return (
    <div className={cn("flex items-center justify-center shrink-0", colorStyles[color], sizeStyles[size], shapeStyles[shape], className)}>
      <Icon className={cn(iconSizes[size], iconClassName)} aria-hidden="true" />
    </div>
  );
}

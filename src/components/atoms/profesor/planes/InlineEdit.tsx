import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface InlineEditProps {
  value: string | number;
  type?: "text" | "number";
  onChange: (value: string | number) => void;
  className?: string;
}

/**
 * InlineEdit: Átomo técnico para edición in-place.
 * Minimalista, sin bordes hasta el foco, para integrarse en diseños densos.
 */
export function InlineEdit({ value, type = "text", onChange, className }: InlineEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (currentValue !== value) {
      onChange(type === "number" ? Number(currentValue) : currentValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
        handleBlur();
    }
    if (e.key === "Escape") {
        setCurrentValue(value);
        setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        autoFocus
        type={type}
        value={currentValue}
        onChange={(e) => setCurrentValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-md px-1 py-0.5 text-center focus:ring-2 focus:ring-lime-400 outline-none transition-all",
          className
        )}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 transition-all border-b border-transparent hover:border-zinc-300 dark:hover:border-zinc-700",
        className
      )}
    >
      {value}
    </span>
  );
}

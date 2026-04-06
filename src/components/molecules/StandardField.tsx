"use client"

import * as React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { FormItem } from "../ui/form"

interface StandardFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
  id?: string;
}

/**
 * StandardField: Molécula que unifica Label, Input y Errores.
 * Siguiendo la estética "Industrial Minimalist" (Aircraft Dashboard).
 */
export function StandardField({ 
  label, 
  error, 
  hint, 
  required, 
  className, 
  children,
  id
}: StandardFieldProps) {
  return (
    <FormItem className={cn("space-y-1.5 w-full", className)}>
      <div className="flex justify-between items-end px-1">
        <Label 
          htmlFor={id}
          className={cn(
            "industrial-label select-none",
            error && "text-red-500"
          )}
        >
          {label} {required && <span className="text-lime-500 ml-0.5">*</span>}
        </Label>
        
        {hint && !error && (
          <span className="industrial-metadata">
            {hint}
          </span>
        )}
      </div>

      <div className="relative group">
        {children}
      </div>

      {error && (
        <p 
          className="industrial-metadata text-red-500 px-1 animate-in fade-in slide-in-from-top-1 duration-200"
          role="alert"
        >
          {error}
        </p>
      )}
    </FormItem>
  )
}

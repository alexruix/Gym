"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3 bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-100 dark:border-zinc-800 shadow-xl", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10 px-8",
        caption_label: "hidden", // Ocultamos el label estático si hay dropdowns
        nav: "flex items-center",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl absolute left-2 z-10 transition-all active:scale-95"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-xl absolute right-2 z-10 transition-all active:scale-95"
        ),
        month_grid: "w-full border-collapse space-y-1",
        weekdays: "flex",
        weekday: "text-zinc-500 rounded-md w-9 font-black text-[10px] uppercase tracking-tighter text-center",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20", 
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-medium aria-selected:opacity-100 rounded-xl hover:bg-lime-400 hover:text-zinc-900 transition-all duration-300"
        ),
        range_start: "day-range-start",
        range_end: "day-range-end",
        selected:
          "bg-lime-400 text-zinc-900 hover:bg-lime-500 hover:text-zinc-900 focus:bg-lime-400 focus:text-zinc-900 font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)] !opacity-100",
        today: "bg-zinc-100 text-zinc-950 dark:bg-zinc-800 dark:text-zinc-50 font-bold border border-zinc-200 dark:border-zinc-700",
        outside:
          "day-outside text-zinc-400 opacity-50 aria-selected:bg-zinc-100/50 aria-selected:text-zinc-400 aria-selected:opacity-30 dark:text-zinc-400",
        disabled: "text-zinc-400 opacity-50 cursor-not-allowed",
        range_middle:
          "aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50",
        hidden: "invisible",
        // Dropdown styling (V9)
        dropdowns: "flex items-center gap-1.5",
        dropdown: "appearance-none bg-transparent border-none text-[11px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 focus:outline-none cursor-pointer hover:text-lime-500 transition-colors px-1",
        dropdown_month: "font-black",
        dropdown_year: "font-medium opacity-60",
        ...classNames,
      }}
      components={{
        Chevron: ({ ...props }) => {
          if (props.orientation === "left")
            return <ChevronLeft className="h-4 w-4" />
          return <ChevronRight className="h-4 w-4" />
        },
      }}
      captionLayout="dropdown" // Habilitamos selectores por defecto
      startMonth={new Date(1900, 0)}
      endMonth={new Date(2100, 11)}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }

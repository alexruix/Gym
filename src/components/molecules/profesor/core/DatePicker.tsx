import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

import { cn, formatDateLatam } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/useMediaQuery"

interface DatePickerProps {
  date?: Date | null
  setDate: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  error?: boolean
  required?: boolean
}

/**
 * DatePicker: Componente premium responsivo.
 * Mobile: Drawer (desde abajo) para ergonomía táctil.
 * Desktop: Popover para eficiencia industrial.
 */
export function DatePicker({
  date,
  setDate,
  placeholder = "Seleccioná fecha",
  label,
  className,
  disabled = false,
  error = false,
  required = false
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const displayValue = React.useMemo(() => {
    if (!date) return placeholder
    return formatDateLatam(date, 'full')
  }, [date, placeholder])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    setIsOpen(false)
  }

  const trigger = (
    <Button
      variant="outline"
      type="button"
      disabled={disabled}
      className={cn(
        "h-14 w-full justify-start text-left font-bold rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900 group/date-btn",
        !date && "text-zinc-400 font-medium",
        error && "border-red-500 focus-visible:ring-red-500",
        isOpen && "border-lime-500 ring-1 ring-lime-500",
        className
      )}
    >
      <CalendarIcon className={cn(
        "mr-3 h-4 w-4 transition-colors",
        isOpen ? "text-lime-500" : "text-zinc-400 group-hover/date-btn:text-lime-500"
      )} />
      <span className="truncate">{displayValue}</span>
      {required && !date && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lime-500 animate-pulse" />
      )}
    </Button>
  )

  const calendarContent = (
    <Calendar
      mode="single"
      selected={date || undefined}
      onSelect={handleSelect}
      disabled={(date) => date > new Date("2100-01-01") || date < new Date("1900-01-01")}
      initialFocus
      locale={es}
    />
  )

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          {trigger}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-none shadow-3xl rounded-3xl overflow-hidden" align="start">
          {calendarContent}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {trigger}
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-[3rem] p-0 border-none bg-white dark:bg-zinc-950 overflow-hidden pb-10">
        <SheetHeader className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-xs font-bold uppercase tracking-widest text-zinc-500">
            {label || "Seleccioná fecha"}
          </SheetTitle>
          <SheetClose className="rounded-xl p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </SheetClose>
        </SheetHeader>
        <div className="flex justify-center p-4">
          <div className="scale-110 sm:scale-100">
            {calendarContent}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

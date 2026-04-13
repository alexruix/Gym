import * as React from "react"
import { Calendar as CalendarIcon, X } from "lucide-react"
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

interface DatePickerAlumnoProps {
  date?: Date | null
  setDate: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  className?: string
  disabled?: boolean
  error?: boolean
}

/**
 * DatePickerAlumno: Versión Industrial Minimalist para el alumno.
 * Mobile: Sheet (Drawer) para ergonomía.
 * Desktop: Popover.
 */
export function DatePickerAlumno({
  date,
  setDate,
  placeholder = "Seleccioná fecha",
  label,
  className,
  disabled = false,
  error = false,
}: DatePickerAlumnoProps) {
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
        "h-14 w-full justify-start text-left font-black rounded-2xl bg-zinc-900 border-zinc-800 text-white transition-all hover:bg-zinc-800 outline-none focus:border-lime-500 focus:ring-1 focus:ring-lime-500 group/date-btn",
        !date && "text-zinc-400 font-bold",
        error && "border-red-500/50",
        isOpen && "border-lime-500 ring-1 ring-lime-500/20",
        className
      )}
      aria-label={label || "Seleccionar fecha"}
    >
      <CalendarIcon className={cn(
        "mr-3 h-4 w-4 transition-colors",
        isOpen ? "text-lime-400" : "text-zinc-400 group-hover/date-btn:text-lime-400"
      )} />
      <span className="truncate uppercase text-[11px] tracking-widest">{displayValue}</span>
    </Button>
  )

  const calendarContent = (
    <Calendar
      mode="single"
      selected={date || undefined}
      onSelect={handleSelect}
      disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
      initialFocus
      locale={es}
      className="border-none bg-transparent shadow-none"
      classNames={{
        weekday: "text-zinc-400 rounded-md w-9 font-bold text-[10px] uppercase tracking-tighter text-center",
        week: "flex w-full mt-2",
        day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
        dropdown_year: "font-medium opacity-80"
      }}
    />
  )

  if (isDesktop) {
    return (
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild aria-label="Abrir selector de fecha">
          {trigger}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-zinc-800 bg-zinc-950 shadow-3xl rounded-3xl overflow-hidden" align="start">
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
      <SheetContent side="bottom" className="rounded-t-[3rem] p-0 border-none bg-zinc-950 overflow-hidden pb-10">
        <SheetHeader className="p-8 border-b border-zinc-900 flex-row items-center justify-between space-y-0">
          <SheetTitle className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-300">
            {label || "Seleccioná fecha"}
          </SheetTitle>
          <SheetClose className="rounded-2xl p-3 bg-zinc-900/50 border border-white/5 hover:bg-zinc-800 transition-colors">
            <X className="w-5 h-5 text-zinc-400" />
          </SheetClose>
        </SheetHeader>
        <div className="flex justify-center p-8 bg-zinc-950">
          <div className="scale-125 sm:scale-100 origin-top">
            {calendarContent}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

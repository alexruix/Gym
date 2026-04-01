import {
  CircleCheck,
  Info,
  LoaderCircle,
  OctagonX,
  TriangleAlert,
} from "lucide-react"
import { Toaster as Sonner } from "sonner"
import React, { useEffect, useState } from "react"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")

  useEffect(() => {
    // Detect current theme based on the class applied to the root element
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark")
      setTheme(isDark ? "dark" : "light")
    }

    checkTheme()

    // Observe changes in the className of the root element
    const observer = new MutationObserver(checkTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    
    return () => observer.disconnect()
  }, [])

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheck className="h-4 w-4 text-lime-500" />,
        info: <Info className="h-4 w-4" />,
        warning: <TriangleAlert className="h-4 w-4" />,
        error: <OctagonX className="h-4 w-4" />,
        loading: <LoaderCircle className="h-4 w-4 animate-spin text-lime-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-zinc-50 dark:group-[.toaster]:bg-zinc-950 group-[.toaster]:text-zinc-950 dark:group-[.toaster]:text-zinc-50 group-[.toaster]:border-zinc-200 dark:group-[.toaster]:border-zinc-800 group-[.toaster]:shadow-2xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-zinc-500 dark:group-[.toast]:text-zinc-400 font-medium",
          actionButton:
            "group-[.toast]:bg-lime-500 group-[.toast]:text-zinc-950 font-bold rounded-xl",
          cancelButton:
            "group-[.toast]:bg-zinc-200 group-[.toast]:text-zinc-950 font-bold rounded-xl",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

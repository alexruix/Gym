import * as React from "react";
import {
  Search,
  Users,
  ClipboardList,
  Dumbbell,
  ArrowRight,
  Loader2,
  X,
  Command as CommandIcon
} from "lucide-react";
import { actions } from "astro:actions";
import { cn } from "@/lib/utils";
import { dashboardCopy } from "@/data/es/profesor/dashboard";

interface SearchResult {
  id: string;
  nombre: string;
  email?: string;
  type: 'alumno' | 'plan' | 'ejercicio';
  href: string;
}

export function UniversalSearch() {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<{
    alumnos: any[];
    planes: any[];
    ejercicios: any[];
  }>({ alumnos: [], planes: [], ejercicios: [] });
  const [loading, setLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [activeItem, setActiveItem] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Global Shortcut Cmd+K
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleActivate();
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleActivate = () => {
    setIsExpanded(true);
    setIsOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleDeactivate = () => {
    setIsExpanded(false);
    setIsOpen(false);
    setQuery("");
    inputRef.current?.blur();
  };

  // Close search when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (isExpanded && window.innerWidth < 1024) {
          // On mobile, only close if we are not typing
          if (query.length === 0) handleDeactivate();
        } else {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, query]);

  // Debounced search logic
  React.useEffect(() => {
    if (query.length < 2) {
      setResults({ alumnos: [], planes: [], ejercicios: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await actions.profesor.globalSearch({ query });
        if (data?.success) {
          setResults(data.results);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const allItems: SearchResult[] = [
    ...results.alumnos.map(a => ({ ...a, type: 'alumno' as const, href: `/profesor/alumnos/${a.id}` })),
    ...results.planes.map(p => ({ ...p, type: 'plan' as const, href: `/profesor/planes/${p.id}` })),
    ...results.ejercicios.map(e => ({ ...e, type: 'ejercicio' as const, href: `/profesor/ejercicios/${e.id}` })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveItem(prev => (prev + 1) % (allItems.length || 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveItem(prev => (prev - 1 + allItems.length) % (allItems.length || 1));
    } else if (e.key === "Enter" && activeItem >= 0 && allItems[activeItem]) {
      window.location.href = allItems[activeItem].href;
    } else if (e.key === "Escape") {
      handleDeactivate();
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative z-50 transition-all duration-300 ease-in-out",
        isExpanded ? "w-full lg:max-w-md" : "w-10 lg:w-full lg:max-w-md"
      )}
    >
      {/* Input de Búsqueda Industrial */}
      <div className="relative h-11 flex items-center">

        {!isExpanded && (
          <button
            onClick={handleActivate}
            className="lg:hidden flex items-center justify-center w-10 h-10 text-zinc-400 hover:text-zinc-950 transition-colors haptic-click"
          >
            <Search className="w-5 h-5" />
          </button>
        )}

        <div className={cn(
          "relative w-full h-full flex items-center transition-all duration-300",
          !isExpanded && "hidden lg:flex"
        )}>
          <Search className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200",
            isOpen ? "text-lime-500" : "text-zinc-400"
          )} />

          <input
            ref={inputRef}
            type="text"
            placeholder={dashboardCopy.layout.globalSearch}
            className={cn(
              "w-full h-full bg-zinc-100/50 hover:bg-zinc-100 border border-transparent focus:border-zinc-950 focus:bg-white rounded-2xl pl-11 pr-12 text-sm font-medium outline-none transition-all duration-200 shadow-sm sm:shadow-none",
              isOpen && "bg-white border-zinc-950 shadow-xl"
            )}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setActiveItem(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
          />

          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
            ) : query.length > 0 ? (
              <button onClick={handleDeactivate} className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-3 h-3 text-zinc-400" />
              </button>
            ) : (
              <>
                {/* <kbd className="hidden xl:inline-block bg-white dark:bg-zinc-900 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">âŒ˜</kbd>
                  <kbd className="hidden xl:inline-block bg-white dark:bg-zinc-900 text-zinc-400 text-[9px] font-bold px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800">K</kbd> */}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Resultados Flotantes (Integrated UX) */}
      {isOpen && (query.length >= 2 || allItems.length > 0) && (
        <div className="absolute top-full left-0 right-0 industrial-dialog mt-2 max-w-[calc(100vw-2rem)] sm:max-w-none">
          <div className="max-h-[70vh] overflow-y-auto scrollbar-hide py-2">
            {allItems.length > 0 ? (
              <div className="space-y-4 pb-2">
                {(['alumno', 'plan', 'ejercicio'] as const).map(type => {
                  const filtered = allItems.filter(item => item.type === type);
                  if (filtered.length === 0) return null;

                  return (
                    <div key={type} className="px-2">
                      <div className="px-4 py-2 industrial-label flex items-center justify-between">
                        {type === 'alumno' ? 'Alumnos' : type === 'plan' ? 'Planes' : 'Biblioteca'}
                        <span className="h-[1px] flex-1 bg-zinc-100 dark:bg-zinc-900 ml-4"></span>
                      </div>
                      <div className="space-y-1">
                        {filtered.map((item) => {
                          const index = allItems.indexOf(item);
                          const active = activeItem === index;
                          return (
                            <a
                              key={item.id}
                              href={item.href}
                              className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200 group haptic-click",
                                active ? "bg-zinc-950 text-white shadow-xl" : "hover:bg-ui-soft dark:hover:bg-zinc-900"
                              )}
                              onMouseEnter={() => setActiveItem(index)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                                  active ? "bg-zinc-800" : "bg-zinc-100 dark:bg-zinc-900"
                                )}>
                                  {type === 'alumno' && <Users className={cn("w-4 h-4", active ? "text-lime-400" : "text-zinc-500")} />}
                                  {type === 'plan' && <ClipboardList className={cn("w-4 h-4", active ? "text-lime-400" : "text-zinc-500")} />}
                                  {type === 'ejercicio' && <Dumbbell className={cn("w-4 h-4", active ? "text-lime-400" : "text-zinc-500")} />}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold truncate">{item.nombre}</p>
                                  {item.email && <p className={cn("industrial-metadata truncate lowercase", active ? "text-zinc-400" : "text-zinc-500")}>{item.email}</p>}
                                </div>
                              </div>
                              {active && <ArrowRight className="w-4 h-4 text-lime-400 animate-in slide-in-from-left-2 ml-2 shrink-0" />}
                            </a>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !loading && query.length >= 2 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                  Sin resultados para "<span className="text-zinc-900 dark:text-zinc-100">{query}</span>"
                </p>
              </div>
            ) : (
              <div className="px-6 py-8 text-center">
                <CommandIcon className="w-8 h-8 text-zinc-200 dark:text-zinc-800 mx-auto mb-3" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                  Escribí para buscar...
                </p>
              </div>
            )}
          </div>

          {/* Footer del Buscador - Industrial Tech */}
          {/* <div className="px-6 py-3 bg-zinc-50 dark:bg-zinc-900/50 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800">
             <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <kbd className="h-4 px-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500">â†µ</kbd>
                    Abrir
                </span>
                <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-zinc-400">
                    <kbd className="h-4 px-1 rounded bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500">â†‘â†“</kbd>
                    Mover
                </span>
             </div>
             <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-lime-500 hidden xs:block">
                Gym Intelligence
             </div>
          </div> */}
        </div>
      )}
    </div>
  );
}

import * as React from "react";
import { 
  Menu,
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Dumbbell, 
  CreditCard, 
  Settings,
  Clock,
} from "lucide-react";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { globalCopy } from "@/data/es/global";

interface NavItem {
  name: string;
  href: string;
  isActive: boolean;
}

interface MobileNavProps {
  currentPath: string;
}

export function MobileNav({ currentPath }: MobileNavProps) {
  const [open, setOpen] = React.useState(false);

  const navItems = [
    { name: globalCopy.layout.profesorNav.dashboard, href: '/profesor', icon: LayoutDashboard },
    { name: globalCopy.layout.profesorNav.agenda, href: '/profesor/agenda', icon: Clock },
    { name: globalCopy.layout.profesorNav.planes, href: '/profesor/planes', icon: ClipboardList },
    { name: globalCopy.layout.profesorNav.alumnos, href: '/profesor/alumnos', icon: Users },
    { name: globalCopy.layout.profesorNav.ejercicios, href: '/profesor/ejercicios', icon: Dumbbell },
    { name: globalCopy.layout.profesorNav.pagos, href: '/profesor/pagos', icon: CreditCard },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button 
          className="p-2 md:hidden text-zinc-500 hover:text-zinc-900 transition-colors"
          aria-label="Abrir menú"
        >
          <Menu className="w-6 h-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 border-r-0 w-[280px]">
        <SheetHeader className="p-6 border-b text-left">
          <SheetTitle className="font-black text-2xl tracking-tighter">
            {globalCopy.brand.nameLine1}<span className="text-lime-500">{globalCopy.brand.nameHighlight}</span>
          </SheetTitle>
        </SheetHeader>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.href || (item.href !== '/profesor' && currentPath.startsWith(item.href));
            
            return (
              <a 
                key={item.href}
                href={item.href} 
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-zinc-950 text-white shadow-lg shadow-zinc-200' 
                    : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-lime-400' : ''}`} aria-hidden="true" />
                <span className="text-sm font-bold uppercase tracking-wide">{item.name}</span>
              </a>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-zinc-100 bg-white">
          <a 
            href="/profesor/configuracion" 
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
          >
            <Settings className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-bold uppercase tracking-wide">{globalCopy.layout.profesorNav.configuracion}</span>
          </a>
        </div>
      </SheetContent>
    </Sheet>
  );
}

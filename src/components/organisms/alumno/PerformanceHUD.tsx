import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, Activity } from 'lucide-react';

interface DataPoint {
  date: string;
  value: number;
}

// Props del componente
interface PerformanceHUDProps {
  title: string;
  subtitle?: string;
  data: { date: string; value: number }[];
  color?: 'lime' | 'fuchsia';
  unit?: string;
  className?: string;
  key?: string | number;
}

/**
 * PerformanceHUD: Gráfica de líneas minimalista (HUD Style) con efecto Glow Neon.
 * Diseñada para visualizar PRs y Volumen sin dependencias pesadas.
 */
export function PerformanceHUD({ title, subtitle, data, color = 'lime', unit = 'kg', className }: PerformanceHUDProps) {
  if (data.length === 0) return null;

  // Cálculos básicos para el SVG
  const values = data.map(d => d.value);
  const min = Math.min(...values) * 0.9; // Margen inferior
  const max = Math.max(...values) * 1.1; // Margen superior
  const range = max - min;
  
  const width = 400;
  const height = 120;
  const padding = 20;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    const y = height - ((d.value - min) / range) * (height - padding * 2) - padding;
    return `${x},${y}`;
  }).join(' ');

  const strokeColor = color === 'lime' ? '#a3e635' : '#d946ef';

  return (
    <div className={cn("w-full bg-zinc-950/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-xl relative overflow-hidden group", className)}>
      {/* Glow Effect */}
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-[40px] opacity-10 group-hover:opacity-20 transition-opacity",
        color === 'lime' ? "bg-lime-500" : "bg-fuchsia-500"
      )} />

      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {color === 'lime' ? <TrendingUp className="w-3 h-3 text-lime-400" /> : <Activity className="w-3 h-3 text-fuchsia-400" />}
            <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
              {subtitle}
            </h4>
          </div>
          <p className="text-xl font-black text-white tracking-tighter uppercase leading-none">
            {title}
          </p>
        </div>
        <div className="text-right">
            <p className={cn("text-2xl font-black tabular-nums leading-none", color === 'lime' ? "text-lime-400" : "text-fuchsia-400")}>
                {data[data.length - 1].value}{unit}
            </p>
            <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">
                Marca actual
            </p>
        </div>
      </div>

      {/* SVG Sparkline with Glow */}
      <div className="relative h-[120px] w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`grad-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.15" />
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
            </linearGradient>
            <filter id={`glow-${title}`}>
              <feGaussianBlur stdDeviation="2" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area Fill */}
          <polyline
            fill={`url(#grad-${title})`}
            points={`${padding},${height} ${points} ${width - padding},${height}`}
            className="transition-all duration-1000"
          />

          {/* Line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            filter={`url(#glow-${title})`}
            className="transition-all duration-1000"
          />

          {/* Points */}
          {data.map((d, i) => {
             const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
             const y = height - ((d.value - min) / range) * (height - padding * 2) - padding;
             return (
               <circle 
                 key={i} 
                 cx={x} cy={y} r="3" 
                 fill={strokeColor} 
                 className="opacity-0 group-hover:opacity-100 transition-opacity" 
               />
             );
          })}
        </svg>
      </div>
    </div>
  );
}

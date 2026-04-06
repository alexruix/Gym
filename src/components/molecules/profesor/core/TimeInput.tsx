import React from 'react';
import { Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface TimeInputProps {
    id?: string;
    value: string;
    onChange: (value: string) => void;
    className?: string;
    disabled?: boolean;
    error?: boolean;
}

/**
 * TimeInput: Componente premium para entrada de tiempo en formato 24hs.
 * Forzado a 24hs, con máscara automática y optimizado para móvil.
 */
export const TimeInput: React.FC<TimeInputProps> = ({
    id = "time-input",
    value,
    onChange,
    className,
    disabled = false,
    error = false
}) => {
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputVal = e.target.value;

        // 1. Limpiamos todo lo que no sea número y limitamos a 4 dígitos
        let raw = inputVal.replace(/\D/g, '').slice(0, 4);

        if (raw.length === 0) {
            onChange('');
            return;
        }

        // 2. UX Hack: Si tipean del 3 al 9 al principio, asumimos que es "03" a "09"
        if (raw.length === 1 && parseInt(raw[0]) > 2) {
            raw = `0${raw[0]}`;
        }

        // 3. Validar Horas (Max 23)
        if (raw.length >= 2) {
            const hours = parseInt(raw.slice(0, 2));
            if (hours > 23) {
                raw = `23${raw.slice(2)}`;
            }
        }

        // 4. Validar Minutos (Max 59)
        if (raw.length >= 3) {
            const minTens = parseInt(raw[2]);
            if (minTens > 5) {
                raw = `${raw.slice(0, 2)}5${raw.slice(3)}`;
            }
        }

        // 5. Aplicar la máscara HH:MM
        let formatted = raw;
        if (raw.length >= 2) {
            if (inputVal.endsWith(':') && raw.length === 2 && inputVal.length < value.length) {
                formatted = raw; 
            } else if (raw.length > 2) {
                formatted = `${raw.slice(0, 2)}:${raw.slice(2)}`;
            } else if (inputVal.length > value.length && raw.length === 2) {
                formatted = `${raw}:`;
            }
        }

        onChange(formatted);
    };

    return (
        <div className="relative group/time">
            <Clock className={cn(
                "absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors z-10",
                error ? "text-red-500" : "text-zinc-400 group-focus-within/time:text-lime-500"
            )} />
            
            <Input
                id={id}
                type="text"
                inputMode="numeric"
                placeholder="00:00"
                value={value}
                onChange={handleInputChange}
                disabled={disabled}
                maxLength={5}
                className={cn(
                    "h-14 pl-11 pr-12 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-black text-sm transition-all focus-visible:ring-lime-400",
                    error && "border-red-500 focus-visible:ring-red-500",
                    className
                )}
            />

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <span className="text-[9px] font-black text-zinc-400 tracking-widest uppercase bg-zinc-100 dark:bg-zinc-900 px-1.5 py-0.5 rounded-md">24h</span>
            </div>
        </div>
    );
};
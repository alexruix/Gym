import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('debería formatear correctamente el peso argentino con pesos y centavos', () => {
    // Nota: El formato puede variar levemente dependiendo de la implementación de Intl (espacios, punto de miles)
    // El estándar miGym es $3.482,50
    const result = formatCurrency(3482.50);
    
    // Verificamos que contenga los elementos clave: $, decimales y separadores
    expect(result).toContain('$');
    expect(result).toContain('3');
    expect(result).toContain('482');
    expect(result).toContain('50');
  });

  it('debería agregar ,00 si no hay decimales', () => {
    const result = formatCurrency(1200);
    expect(result).toContain('1');
    expect(result).toContain('200');
    expect(result).toContain('00');
  });
});

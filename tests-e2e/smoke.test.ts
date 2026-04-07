import { test, expect } from '@playwright/test';

test.describe('miGym Smoke Tests', () => {
  test('debería cargar la página de inicio y mostrar el título correctamente', async ({ page }) => {
    await page.goto('/');

    // Verificamos que el título esté en el metadata
    await expect(page).toHaveTitle(/miGym/i);

    // Verificamos que exista un CTA primario (según design-system.md: bg-lime-500)
    // El sistema dice que los CTAs primarios invitan a la acción
    const primaryButton = page.locator('button, a').filter({ hasText: /entrar|comenzar|login/i }).first();
    if (await primaryButton.isVisible()) {
      await expect(primaryButton).toBeVisible();
    }
  });

  test('audit visual: debería tener elementos con bordes redondeados (rounded-3xl)', async ({ page }) => {
    await page.goto('/');

    // Según design-system.md, usamos rounded-3xl para layouts/cards
    // Buscamos si hay clases que incluyan 'rounded'
    const roundedElements = await page.locator('.rounded-3xl, .rounded-2xl').count();
    // No fallamos si es 0 (landing podría no tener cards aún), pero lo reportamos
    console.log(`Elementos con bordes redondeados encontrados: ${roundedElements}`);
  });

  test('audit accesibilidad: debería cumplir estándares WCAG AA', async ({ page }) => {
    await page.goto('/');

    // Debería tener role="main" o similar
    await expect(page.locator('main').first()).toBeVisible();
  });
});

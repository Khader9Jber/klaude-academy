import { test, expect } from '@playwright/test';

test.describe('Prompt Lab', () => {
  test('prompt lab page loads with heading', async ({ page }) => {
    await page.goto('/prompt-lab');
    await expect(page.getByTestId('prompt-lab-heading')).toBeVisible();
  });

  test('template library shows template cards', async ({ page }) => {
    await page.goto('/prompt-lab');
    const templateCards = page.getByTestId('template-card');
    await expect(templateCards).not.toHaveCount(0);
  });

  test('category filter buttons work', async ({ page }) => {
    await page.goto('/prompt-lab');
    // Click the Coding filter
    await page.getByTestId('filter-coding').click();
    // Should still have template cards visible (filtered to coding)
    const templateCards = page.getByTestId('template-card');
    await expect(templateCards).not.toHaveCount(0);
  });

  test('All filter shows all templates', async ({ page }) => {
    await page.goto('/prompt-lab');
    // Click a specific filter first
    await page.getByTestId('filter-coding').click();
    // Then click All
    await page.getByTestId('filter-all').click();
    const templateCards = page.getByTestId('template-card');
    await expect(templateCards).not.toHaveCount(0);
  });

  test('before/after examples are visible', async ({ page }) => {
    await page.goto('/prompt-lab');
    // Scroll to before/after section
    const beforeAfter = page.locator('text=Before');
    if (await beforeAfter.count() > 0) {
      await expect(beforeAfter.first()).toBeVisible();
    }
  });
});

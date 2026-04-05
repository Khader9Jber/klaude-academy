import { test, expect } from '@playwright/test';

test.describe('Templates', () => {
  test('templates page loads', async ({ page }) => {
    await page.goto('/templates');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('templates show template cards with copy buttons', async ({ page }) => {
    await page.goto('/templates');
    const templateCards = page.getByTestId('template-card');
    await expect(templateCards).not.toHaveCount(0);
    // Each template should have a Copy button
    await expect(page.locator('text=Copy')).not.toHaveCount(0);
  });

  test('template categories are filterable', async ({ page }) => {
    await page.goto('/templates');
    // Look for category filter buttons
    const hookFilter = page.locator('button:has-text("Hook"), button:has-text("Hooks")');
    if (await hookFilter.count() > 0) {
      await hookFilter.click();
      // Should still show template cards
      const templateCards = page.getByTestId('template-card');
      await expect(templateCards).not.toHaveCount(0);
    }
  });

  test('templates show code previews', async ({ page }) => {
    await page.goto('/templates');
    // Templates should have pre/code blocks
    const codeBlocks = page.locator('pre');
    await expect(codeBlocks).not.toHaveCount(0);
  });
});

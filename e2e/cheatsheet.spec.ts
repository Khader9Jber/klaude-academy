import { test, expect } from '@playwright/test';

test.describe('Cheatsheet', () => {
  test('cheatsheet page loads with search input', async ({ page }) => {
    await page.goto('/cheatsheet');
    await expect(page.getByTestId('cheatsheet-search')).toBeVisible();
  });

  test('search filters sections', async ({ page }) => {
    await page.goto('/cheatsheet');
    await page.getByTestId('cheatsheet-search').fill('compact');
    // Should filter to show compact-related content
    await expect(page.locator('text=/compact/i')).not.toHaveCount(0);
  });

  test('category tabs are visible and clickable', async ({ page }) => {
    await page.goto('/cheatsheet');
    await expect(page.getByTestId('cheatsheet-tab-all')).toBeVisible();
    await expect(page.getByTestId('cheatsheet-tab-cli')).toBeVisible();
    await expect(page.getByTestId('cheatsheet-tab-commands')).toBeVisible();
  });

  test('clicking a tab filters content', async ({ page }) => {
    await page.goto('/cheatsheet');
    await page.getByTestId('cheatsheet-tab-cli').click();
    // Should show CLI-related content
    await expect(page.locator('text=claude')).not.toHaveCount(0);
  });
});

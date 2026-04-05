import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('mobile: landing page renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('hero-heading')).toBeVisible();
    await expect(page.getByTestId('start-learning-btn').first()).toBeVisible();
  });

  test('mobile: hamburger menu appears', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.getByTestId('mobile-menu-btn')).toBeVisible();
  });

  test('tablet: curriculum page shows module cards', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/curriculum');
    await expect(page.getByTestId('module-card-claude-fundamentals')).toBeVisible();
  });

  test('desktop: lesson page shows title', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/curriculum/claude-fundamentals/what-is-claude');
    await expect(page.getByTestId('lesson-title')).toBeVisible();
  });

  test('mobile: lesson page is scrollable', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/curriculum/claude-fundamentals/what-is-claude');
    await expect(page.getByTestId('lesson-title')).toBeVisible();
    // Should be able to scroll
    await page.evaluate(() => window.scrollTo(0, 500));
  });
});

import { test, expect } from '@playwright/test';

test.describe('Progress Tracking', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('lesson shows Mark as Complete button', async ({ page }) => {
    await page.goto('/curriculum/claude-fundamentals/what-is-claude');
    await expect(page.getByTestId('mark-complete-btn')).toBeVisible();
  });

  test('clicking Mark as Complete changes button state', async ({ page }) => {
    await page.goto('/curriculum/claude-fundamentals/what-is-claude');
    await page.getByTestId('mark-complete-btn').click();
    // Should show completed state
    await expect(page.getByTestId('lesson-completed')).toBeVisible();
  });

  test('completed lesson persists after page reload', async ({ page }) => {
    await page.goto('/curriculum/claude-fundamentals/what-is-claude');
    await page.getByTestId('mark-complete-btn').click();
    await expect(page.getByTestId('lesson-completed')).toBeVisible();

    // Reload the page
    await page.reload();
    // Should still show completed
    await expect(page.getByTestId('lesson-completed')).toBeVisible();
  });

  test('progress page loads with heading', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByTestId('progress-heading')).toBeVisible();
  });

  test('progress dashboard shows stats', async ({ page }) => {
    await page.goto('/progress');
    await expect(page.getByTestId('stat-lessons')).toBeVisible();
    await expect(page.getByTestId('stat-quizzes')).toBeVisible();
    await expect(page.getByTestId('stat-streak')).toBeVisible();
    await expect(page.getByTestId('stat-achievements')).toBeVisible();
  });

  test('reset progress button exists with confirmation', async ({ page }) => {
    await page.goto('/progress');
    await page.getByTestId('reset-progress-btn').click();
    // Should show confirmation
    await expect(page.getByTestId('confirm-reset-btn')).toBeVisible();
  });
});

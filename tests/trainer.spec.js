const { test, expect } = require('@playwright/test');

test('Word Trainer initial UI state', async ({ page }) => {
    // Load the page
    await page.goto('http://localhost:3000');

    // Title
    await expect(page).toHaveTitle('Word Trainer');

    // Textarea exists
    await expect(page.locator('textarea')).toBeVisible();

    // Buttons exist
    const restart = page.locator('.restart-btn');
    const send = page.locator('.send-btn');
    const next = page.locator('.next-btn');

    await expect(restart).toBeVisible();
    await expect(send).toBeVisible();
    await expect(next).toBeVisible();

    // Next button is disabled initially
    await expect(next).toBeDisabled();
});

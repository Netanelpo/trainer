import {expect, test} from '@playwright/test';

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }, testInfo) => {
    page.on('console', (msg) => {
        console.log(`[${testInfo.title}] [browser:${msg.type()}] ${msg.text()}`);
    });
});

test.describe('Integration tests', () => {
    test('Case 1', async ({page}) => {
        await page.goto(`${BASE_URL}/`);
        await page.fill('#wordsInput', 'hi');

        await page.click('#sendWordsBtn');
        await page.waitForTimeout(5000);
        // words list
        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        // output message for SET_WORDS goes here (not in chat)
        await expect(page.locator('#setupFeedback')).toHaveText('this is the output:');

        // optional: mode select becomes visible after words exist
        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeVisible();
    });
});

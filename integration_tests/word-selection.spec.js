import {expect, test} from '@playwright/test';

const AGENT_ENDPOINT = '/api/agent';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const LOCAL_STORAGE_KEY = 'polyglot_state';

async function resetStorage(page) {
    await page.goto(`${BASE_URL}/`);
    await page.evaluate((k) => localStorage.removeItem(k), LOCAL_STORAGE_KEY);
    await page.reload(); // app boots with empty state
}

test.describe('Word selection (Set Words) — tests', () => {
    test('I paste no input and click send - no API calls', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        // Fail fast if the agent API is called
        await page.route('**/api/agent', async () => {
            throw new Error('Unexpected API call to /api/agent');
        });

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await page.click('#sendWordsBtn');
    });

    test('I paste hi and click send - API returns 500 -> shows error banner', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);

        await page.route('**/api/agent', async (route) => {
            await route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'boom' }),
            });
        });

        await page.fill('#wordsInput', 'hi');
        await page.click('#sendWordsBtn');

        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText('boom');
    });

    test('I paste words - calls API with correct JSON', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await page.route('**/api/agent', async (route) => {
            await route.fulfill({
                status: 200,
            });
        });

        await page.fill('#wordsInput', 'apple, run, beautiful');

        // Wait specifically for the SET_WORDS request (so other calls won't satisfy it).
        const reqPromise = page.waitForRequest((req) => {
            if (!req.url().includes(AGENT_ENDPOINT)) return false;
            if (req.method() !== 'POST') return false;
            const body = req.postDataJSON?.();
            return body?.action === 'SET_WORDS';
        });

        await page.click('#sendWordsBtn');

        const req = await reqPromise; // <- if you delete the click, this will timeout and FAIL
        const body = req.postDataJSON();

        expect(body).toMatchObject({
            input: 'apple, run, beautiful',
            action: 'SET_WORDS',
            context: {
                language: 'Hebrew',
                words: [],
            },
        });
    });

    test('API returns words - words are visible', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await page.route('**/api/agent', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    output: 'this is the output:',
                    words: ['apple', 'run', 'beautiful'],
                    context: {},
                }),
            });
        });

        await page.fill('#wordsInput', 'apple, run, beautiful');

        await page.click('#sendWordsBtn');

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

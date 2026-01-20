import {expect, test} from '@playwright/test';

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

test.beforeEach(async ({ page }, testInfo) => {
    page.on('console', (msg) => {
        console.log(`[${testInfo.title}] [browser:${msg.type()}] ${msg.text()}`);
    });
});

test.describe('Integration tests', () => {
    test('Case 1', async ({ page }) => {
        await page.goto(`${BASE_URL}/`);
        await page.fill('#wordsInput', 'apple, run, beautiful');

        const [res] = await Promise.all([
            page.waitForResponse(r =>
                    r.url().includes(AGENT_ENDPOINT) &&
                    r.request().method() === 'POST' &&
                    r.status() === 200
                , { timeout: 30000 }),
            page.click('#sendWordsBtn'),
        ]);

        const data = await res.json();
        console.log('API response:', data);

        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3, { timeout: 15000 });

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeVisible();

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: [ 'apple', 'run', 'beautiful' ],
            phase: 'setup',
            trainingMode: null
        });
    });

    test('Case 2', async ({ page }) => {
        await page.addInitScript((st) => {
            localStorage.setItem('polyglot_state', JSON.stringify(st));
        }, {
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            phase: 'setup',
            trainingMode: null
        });

        await page.goto(`${BASE_URL}/`);

        const [res] = await Promise.all([
            page.waitForResponse(r =>
                    r.url().includes(AGENT_ENDPOINT) &&
                    r.request().method() === 'POST' &&
                    r.status() === 200
                , { timeout: 30000 }),
            page.click('#modeEnToTarget'),
        ]);

        const data = await res.json();
        console.log('API response:', data);

        // UI switches to training
        await expect(page.locator('#modeSelectPhase')).toBeHidden();
        await expect(page.locator('#trainingPhase')).toBeVisible();

        // Agent output should appear in chat transcript (training output goes to chat)
        // Use contain to avoid issues with punctuation/whitespace (real API can vary slightly)
        await expect(page.locator('#chatTranscript .chat-bubble.agent').last())
            .toContainText((data.output || '').trim(), { timeout: 15000 });

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: [ 'apple', 'run', 'beautiful' ],
            phase: 'training',
            trainingMode: 'EN_TO_TARGET'
        });
    });
});

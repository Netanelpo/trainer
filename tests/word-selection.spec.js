import {expect, test} from '@playwright/test';

const AGENT_ENDPOINT = '/api/agent';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const LS_KEY = 'polyglot_state';

async function resetStorage(page) {
    await page.goto(`${BASE_URL}/`);
    await page.evaluate((k) => localStorage.removeItem(k), LS_KEY);
    await page.reload(); // app boots with empty state
}

function getWordChips(page) {
    return page.locator('#wordsList .word-chip');
}

async function getChipTexts(page) {
    return await page.locator('#wordsList .word-chip').allTextContents();
}

test.describe('Word selection (Set Words) — tests', () => {
    // Test Case 1
    test('First time I open the app (no words yet)', async ({page}) => {
        await resetStorage(page);

        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
    });

    // Test Case 2
    test('I paste words separated by commas - calls API with correct JSON', async ({ page }) => {
        await resetStorage(page);

        await page.route('**/api/agent', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    output: 'ok',
                    words: ['apple', 'run', 'beautiful'],
                    context: {},
                }),
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

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

    });

    // Test Case 3
    test('I paste words on separate lines', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple\nrun\nbeautiful');
        await page.click('#sendWordsBtn');

        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 4
    test('I paste using commas and new lines together', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple, run\nbeautiful');
        await page.click('#sendWordsBtn');

        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 5
    test("Spaces don't break my words (trimmed chips)", async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', '  apple ,  run  \n  beautiful  ');
        await page.click('#sendWordsBtn');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 6
    test('Empty lines and extra commas are ignored', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple,\n\n,run,   ,beautiful');
        await page.click('#sendWordsBtn');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 7
    test("I can't submit an empty list", async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', '     ');
        await page.click('#sendWordsBtn'); // click is allowed, handler will return early

        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
    });

    // Test Case 8
    test('Duplicates are removed', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple, apple, run');
        await page.click('#sendWordsBtn');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run']);
        await expect(page.locator('#wordCount')).toHaveText('2');
    });

    // Test Case 9
    test('Capital letters are treated as different words (case-sensitive)', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'Apple, apple');
        await page.click('#sendWordsBtn');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['Apple', 'apple']);
        await expect(page.locator('#wordCount')).toHaveText('2');
    });

    // Test Case 10
    test('Special characters are kept', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'naïve, co-operate, résumé');
        await page.click('#sendWordsBtn');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['naïve', 'co-operate', 'résumé']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 11
    test('After I set words, I move to “Start Training” screen', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple, run');
        await page.click('#sendWordsBtn');

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeVisible();
    });

    // Test Case 12
    test('I see a confirmation message after sending words', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple, run, beautiful');
        await page.click('#sendWordsBtn');

        await expect(page.locator('#setupFeedback')).toContainText("I've saved 3 words");
    });

    // Test Case 13
    test('My words are still there after refresh', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'engineer, brave, clear');
        await page.click('#sendWordsBtn');
        await expect(getWordChips(page)).toHaveCount(3);

        await page.reload();

        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await expect(page.locator('#wordsList')).toContainText('engineer');
        await expect(page.locator('#wordsList')).toContainText('brave');
        await expect(page.locator('#wordsList')).toContainText('clear');
    });

    // Test Case 14
    test("Changing language doesn't change my word list", async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'engineer, brave, clear');
        await page.click('#sendWordsBtn');
        const before = await getChipTexts(page);

        await page.selectOption('#languageSelect', 'Russian');
        const after = await getChipTexts(page);

        expect(after).toEqual(before);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 15
    test('If I clear the app data, I start from scratch', async ({page}) => {
        await resetStorage(page);

        await page.fill('#wordsInput', 'apple, run');
        await page.click('#sendWordsBtn');
        await expect(getWordChips(page)).toHaveCount(2);

        // Clear storage and reload
        await page.evaluate((k) => localStorage.removeItem(k), LS_KEY);
        await page.reload();

        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
    });
});

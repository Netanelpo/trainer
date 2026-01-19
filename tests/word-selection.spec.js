import { test, expect } from '@playwright/test';

const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';
const LS_KEY = 'polyglot_state';

async function resetStorage(page) {
    await page.goto(`${BASE_URL}/`);
    await page.evaluate((k) => localStorage.removeItem(k), LS_KEY);
    await page.reload(); // app boots with empty state
}

async function seedState(page, state) {
    await page.goto(`${BASE_URL}/`);
    await page.evaluate(({ k, v }) => localStorage.setItem(k, JSON.stringify(v)), { k: LS_KEY, v: state });
    await page.reload(); // app boots with seeded state
}

async function enableMock(page) {
    const mockToggle = page.locator('#mockToggle');
    if (!(await mockToggle.isChecked())) {
        await mockToggle.check();
    }
}

async function setWordsWithMock(page, text) {
    await enableMock(page);
    await page.fill('#wordsInput', text);
    await page.click('#sendWordsBtn');
    await expect(page.locator('#modeSelectPhase')).toBeVisible(); // words exist => mode select
}

function getWordChips(page) {
    return page.locator('#wordsList .word-chip');
}

async function getChipTexts(page) {
    return await page.locator('#wordsList .word-chip').allTextContents();
}

test.describe('Word selection (Set Words) — tests', () => {
    // Test Case 1
    test('First time I open the app (no words yet)', async ({ page }) => {
        await resetStorage(page);

        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
    });

    // Test Case 2
    test('I paste words separated by commas', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, run, beautiful');

        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 3
    test('I paste words on separate lines', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple\nrun\nbeautiful');

        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 4
    test('I paste using commas and new lines together', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, run\nbeautiful');

        await expect(getWordChips(page)).toHaveCount(3);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 5
    test("Spaces don't break my words (trimmed chips)", async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, '  apple ,  run  \n  beautiful  ');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 6
    test('Empty lines and extra commas are ignored', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple,\n\n,run,   ,beautiful');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 7
    test("I can't submit an empty list", async ({ page }) => {
        await resetStorage(page);

        await enableMock(page);
        await page.fill('#wordsInput', '     ');
        await page.click('#sendWordsBtn'); // click is allowed, handler will return early

        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
    });

    // Test Case 8
    test('Duplicates are removed', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, apple, run');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['apple', 'run']);
        await expect(page.locator('#wordCount')).toHaveText('2');
    });

    // Test Case 9
    test('Capital letters are treated as different words (case-sensitive)', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'Apple, apple');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['Apple', 'apple']);
        await expect(page.locator('#wordCount')).toHaveText('2');
    });

    // Test Case 10
    test('Special characters are kept', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'naïve, co-operate, résumé');

        const texts = await getChipTexts(page);
        expect(texts).toEqual(['naïve', 'co-operate', 'résumé']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 11
    test('After I set words, I move to “Start Training” screen', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, run');

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeVisible();
    });

    // Test Case 12
    test('I see a confirmation message after sending words', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, run, beautiful');

        await expect(page.locator('#setupFeedback')).toContainText("I've saved 3 words");
    });

    // Test Case 13
    test('My words are still there after refresh', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'engineer, brave, clear');
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
    test("Changing language doesn't change my word list", async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'engineer, brave, clear');
        const before = await getChipTexts(page);

        await page.selectOption('#languageSelect', 'Russian');
        const after = await getChipTexts(page);

        expect(after).toEqual(before);
        await expect(page.locator('#wordCount')).toHaveText('3');
    });

    // Test Case 15
    // test('Train Again keeps my same words', async ({ page }) => {
    //     await resetStorage(page);
    //
    //     await setWordsWithMock(page, 'apple'); // 1 word => quick finish
    //     await expect(getWordChips(page)).toHaveCount(1);
    //
    //     // Start training
    //     await page.click('#modeEnToTarget');
    //     await expect(page.locator('#trainingPhase')).toBeVisible();
    //
    //     // Wait for first agent question
    //     await expect(page.locator('#chatTranscript .chat-bubble.agent').first()).toBeVisible();
    //
    //     // Answer once => done
    //     await page.fill('#chatInput', 'תשובה'); // any text
    //     await page.click('#chatSendBtn');
    //
    //     await expect(page.locator('#donePhase')).toBeVisible();
    //
    //     // Train again
    //     await page.click('#btnTrainAgain');
    //
    //     await expect(page.locator('#modeSelectPhase')).toBeVisible();
    //     await expect(getWordChips(page)).toHaveCount(1);
    //     await expect(page.locator('#wordsList')).toContainText('apple');
    // });

    // Test Case 16
    // test("If saving fails (network/backend), my old words stay", async ({ page }) => {
    //     // Seed existing words; keep mock OFF to force fetch
    //     await seedState(page, {
    //         language: 'Russian',
    //         words: ['engineer', 'brave'],
    //         context: {},
    //         phase: 'setup',
    //         trainingMode: null,
    //         useMock: false,
    //     });
    //
    //     await expect(page.locator('#modeSelectPhase')).toBeVisible();
    //     await expect(page.locator('#wordCount')).toHaveText('2');
    //     await expect(page.locator('#wordsList')).toContainText('engineer');
    //     await expect(page.locator('#wordsList')).toContainText('brave');
    //
    //     // Force the agent call to fail
    //     await page.route('**/api/agent', (route) => route.abort());
    //
    //     // Even though UI hides setup when words exist, the elements still exist in DOM.
    //     // We can set value and force-click to simulate a failed SET_WORDS attempt.
    //     await page.evaluate(() => {
    //         document.getElementById('wordsInput').value = 'newword1, newword2';
    //     });
    //     await page.click('#sendWordsBtn', { force: true });
    //
    //     // Error banner appears, and old words remain unchanged
    //     await expect(page.locator('#errorBanner')).toBeVisible();
    //     await expect(page.locator('#errorBanner')).toHaveText('Ошибка сети. Попробуйте еще раз.');
    //
    //     await expect(page.locator('#wordCount')).toHaveText('2');
    //     await expect(page.locator('#wordsList')).toContainText('engineer');
    //     await expect(page.locator('#wordsList')).toContainText('brave');
    //     await expect(getWordChips(page)).toHaveCount(2);
    // });

    // Test Case 17
    test('If I clear the app data, I start from scratch', async ({ page }) => {
        await resetStorage(page);

        await setWordsWithMock(page, 'apple, run');
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

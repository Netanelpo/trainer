import {test, expect} from '@playwright/test';

const BASE_URL =
    process.env.PW_BASE_URL ||
    process.env.BASE_URL ||
    'http://localhost:3000';

function stateWith(overrides = {}) {
    return {
        language: 'Hebrew',
        words: [],
        context: {},
        phase: 'setup',
        trainingMode: null,
        useMock: false,
        ...overrides,
    };
}

test.afterEach(async ({page}) => {
    await page.evaluate(() => localStorage.removeItem('polyglot_state'));
});


test.describe('Language selection', () => {
    test('Default language on first visit is Hebrew (RTL + Hebrew strings)', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await expect(page.locator('#languageSelect')).toHaveValue('Hebrew');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');

        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');

        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('מאמן שפות');
        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();
    });

    test('Switching language to Russian updates i18n texts + LTR + badge', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await page.selectOption('#languageSelect', 'Russian');

        await expect(page.locator('#languageSelect')).toHaveValue('Russian');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Русский');

        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('Языковой Тренажер');
        await expect(page.locator('h2[data-i18n="pasteWordsTitle"]')).toHaveText('Вставьте изученные слова');
        await expect(page.locator('button[data-i18n="btnSendWords"]')).toHaveText('Отправить слова');
    });

    test('Switching back to Hebrew restores RTL + lang=he', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await page.selectOption('#languageSelect', 'Ukrainian');
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        await page.selectOption('#languageSelect', 'Hebrew');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');
    });

    test('Language selection persists after reload (localStorage)', async ({page}) => {
        await page.goto(`${BASE_URL}/`);

        await page.selectOption('#languageSelect', 'French');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Français');

        await page.reload();

        await expect(page.locator('#languageSelect')).toHaveValue('French');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Français');
        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('Entraîneur de Langue');
    });

    test('In Mode Select phase, target language labels update when language changes', async ({page}) => {
        const initial = stateWith({
            language: 'Hebrew',
            words: ['apple', 'run'],
            phase: 'setup', // setup + words => modeSelectPhase visible
        });

        await page.addInitScript((st) => {
            localStorage.setItem('polyglot_state', JSON.stringify(st));
        }, initial);

        await page.goto(`${BASE_URL}/`);

        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('#setupPhase')).toBeHidden();

        // Hebrew target labels
        await expect(page.locator('.target-lang-name').first()).toHaveText('עברית');

        // Switch to Spanish and ensure labels update
        await page.selectOption('#languageSelect', 'Spanish');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Español');
        await expect(page.locator('.target-lang-name').first()).toHaveText('Español');
        await expect(page.locator('.target-lang-name').nth(1)).toHaveText('Español');
    });

    test('Changing language does NOT reset words list / word count', async ({page}) => {
        const initial = stateWith({
            language: 'Russian',
            words: ['engineer', 'brave', 'clear'],
            phase: 'setup',
        });

        await page.addInitScript((st) => {
            localStorage.setItem('polyglot_state', JSON.stringify(st));
        }, initial);

        await page.goto(`${BASE_URL}/`);

        await expect(page.locator('#wordCount')).toHaveText('3');
        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3);
        await expect(page.locator('#wordsList')).toContainText('engineer');
        await expect(page.locator('#wordsList')).toContainText('brave');
        await expect(page.locator('#wordsList')).toContainText('clear');

        await page.selectOption('#languageSelect', 'Hebrew');

        await expect(page.locator('#wordCount')).toHaveText('3');
        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3);
        await expect(page.locator('#wordsList')).toContainText('engineer');
        await expect(page.locator('#wordsList')).toContainText('brave');
        await expect(page.locator('#wordsList')).toContainText('clear');
    });
});

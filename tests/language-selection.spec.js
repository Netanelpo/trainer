import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.describe('Language selection', () => {
    test('Default language on first visit is Hebrew (RTL + Hebrew strings)', async ({page}) => {
        await utils.openPage(page);

        await expect(page.locator('#languageSelect')).toHaveValue('Hebrew');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');

        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');

        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('מאמן שפות');
        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();
    });

    test('Switching language to Russian updates i18n texts + LTR + badge', async ({page}) => {
        await utils.openPage(page);

        await page.selectOption('#languageSelect', 'Russian');

        await expect(page.locator('#languageSelect')).toHaveValue('Russian');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Русский');

        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('Языковой Тренажер');
        await expect(page.locator('h2[data-i18n="pasteWordsTitle"]')).toHaveText('Вставьте изучаемые слова');
        await expect(page.locator('button[data-i18n="btnSendWords"]')).toHaveText('Отправить слова');
    });

    test('Switching back to Hebrew restores RTL + lang=he', async ({page}) => {
        await utils.openPage(page);

        await page.selectOption('#languageSelect', 'Ukrainian');
        await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
        await expect(page.locator('html')).toHaveAttribute('lang', 'en');

        await page.selectOption('#languageSelect', 'Hebrew');
        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');
    });

    test('Language selection persists after reload (localStorage)', async ({page}) => {
        await utils.openPage(page);

        await page.selectOption('#languageSelect', 'French');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Français');

        await page.reload();

        await expect(page.locator('#languageSelect')).toHaveValue('French');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: Français');
        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('Entraîneur de Langue');
    });

    test('In Mode Select phase, target language labels update when language changes', async ({page}) => {
        await utils.setWordList(page);

        await utils.openPage(page);

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
        await utils.setWordList(page);

        await utils.openPage(page);

        await expect(page.locator('#wordCount')).toHaveText('3');
        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3);
        await expect(page.locator('#wordsList')).toContainText('apple');
        await expect(page.locator('#wordsList')).toContainText('run');
        await expect(page.locator('#wordsList')).toContainText('beautiful');

        await page.selectOption('#languageSelect', 'Russian');

        await expect(page.locator('#wordCount')).toHaveText('3');
        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3);
        await expect(page.locator('#wordsList')).toContainText('apple');
        await expect(page.locator('#wordsList')).toContainText('run');
        await expect(page.locator('#wordsList')).toContainText('beautiful');
    });
});

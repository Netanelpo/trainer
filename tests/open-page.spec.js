import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.describe('Open Page in different phases', () => {
    test('Setup Phase', async ({page}) => {
        await utils.openPage(page);

        await utils.expectSetupPhase(page)

        await expect(page.locator('#languageSelect')).toHaveValue('Hebrew');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');

        await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
        await expect(page.locator('html')).toHaveAttribute('lang', 'he');

        await expect(page.locator('h1[data-i18n="appTitle"]')).toHaveText('מאמן שפות');
    });

    test('Training Mode Select Phase', async ({page}) => {
        await utils.setWordList(page);
        await utils.openPage(page);

        await utils.expectModeSelectPhase(page)


        await expect(page.locator('#languageSelect')).toHaveValue('Hebrew');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');
        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    })

    test('Training Phase', async ({page}) => {
        await utils.setTrainingMode(page);
        await utils.openPage(page);

        await utils.expectTrainingPhase(page)


        await expect(page.locator('#languageSelect')).toHaveValue('Hebrew');
        await expect(page.locator('#currentLangBadge')).toHaveText('Language: עברית');
        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
    })
});

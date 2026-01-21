import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.describe('Word selection (Set Words) — tests', () => {
    test('I paste no input and click send - no API calls', async ({page}) => {
        await utils.openPage(page);

        await utils.setExceptionAPI(page);

        await expect(page.locator('#wordCount')).toHaveText('0');
        await expect(page.locator('#wordsList .empty-state')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        await page.click('#sendWordsBtn');
    });

    test('I paste hi and click send - API returns 500 -> shows error banner', async ({page}) => {
        await utils.openPage(page);

        await utils.setErrorAPI(page);

        await page.fill('#wordsInput', 'hi');
        await page.click('#sendWordsBtn');

        await expect(page.locator('#errorBanner')).toBeVisible();
        await expect(page.locator('#errorBanner')).toContainText('boom');
    });

    test('I paste words - calls API with correct JSON', async ({page}) => {
        await utils.openPage(page);

        await utils.setAPI(page);

        await page.fill('#wordsInput', 'apple, run, beautiful');

        const response = await utils.clickAndReturn(page, '#sendWordsBtn');

        expect(response).toMatchObject({
            input: 'apple, run, beautiful',
            action: 'SET_WORDS',
            language: 'Hebrew',
        });
    });

    test('API returns words - words are visible', async ({page}) => {
        await utils.openPage(page);

        await utils.setAPI(page, {words: ['apple', 'run', 'beautiful']});

        await page.fill('#wordsInput', 'apple, run, beautiful');

        await page.click('#sendWordsBtn');

        // words list
        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await expect(page.locator('#modeSelectFeedback')).toBeVisible();
        await expect(page.locator('#modeSelectFeedback')).toHaveText('this is the output:');
        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeVisible();
    });

    test('API returns no words', async ({page}) => {
        await utils.openPage(page);

        await utils.setAPI(page);

        await page.fill('#wordsInput', 'hi');

        await page.click('#sendWordsBtn');

        await expect(page.locator('#wordCount')).toHaveText('0');

        await expect(page.locator('#modeSelectFeedback')).toBeHidden();
        await expect(page.locator('#setupFeedback')).toHaveText('this is the output:');
        await expect(page.locator('#setupPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();
        await expect(page.locator('h2[data-i18n="startTrainingTitle"]')).toBeHidden();
    })
});

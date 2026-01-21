import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.beforeEach(async ({page}, testInfo) => {
    await utils.setWordList(page);
    await utils.setAPI(page, {
        next_word: 'run',
    });
})

test.describe('Start Training Tests', () => {
    test('English to Target click', async ({page}) => {
        await utils.openPage(page);

        const response = await utils.clickAndReturn(page, '#modeEnToTarget');

        expect(response).toStrictEqual({
            action: 'EN_TO_TARGET_TRAINING',
            input: '',
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
        });

        // State updated
        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            phase: 'training',
            nextWord: 'run',
            trainingMode: 'EN_TO_TARGET_TRAINING'
        });
    });
});

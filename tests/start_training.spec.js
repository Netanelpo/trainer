import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.beforeEach(async ({page}, testInfo) => {
    await utils.setWordList(page);
    await utils.setAPI(page);
})

test.describe('Start Training Tests', () => {
    test('English to Target click', async ({page}) => {
        await utils.openPage(page);

        const response = await utils.clickAndReturn(page, '#modeEnToTarget');

        expect(response).toMatchObject({
            action: 'EN_TO_TARGET_TRAINING',
            input: '',
            language: 'Hebrew',
        });

        // State updated
        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            phase: 'training',
            trainingMode: 'EN_TO_TARGET_TRAINING'
        });
    });
});

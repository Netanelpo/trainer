import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.beforeEach(async ({page}, testInfo) => {
    await utils.setTrainingMode(page);
    await utils.setAPI(page);
})

test.describe('Training tests', () => {
    test('Send Answer', async ({page}) => {
        await utils.openPage(page);

        await page.fill('#chatInput', 'second input');

        const response = await utils.clickAndReturn(page, '#chatSendBtn');

        expect(response).toStrictEqual({
            action: 'EN_TO_TARGET_TRAINING',
            input: 'second input',
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
        });

        await expect(page.locator('#chatTranscript .chat-bubble.agent').last()).toHaveText(
            'this is the output:'
        );

        // State updated
        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: [ 'apple', 'run', 'beautiful' ],
            phase: 'training',
            trainingMode: 'EN_TO_TARGET_TRAINING'
        });
    });
});

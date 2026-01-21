import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';

test.beforeEach(async ({page}, testInfo) => {
    page.on('console', (msg) => {
        console.log(`[${testInfo.title}] [browser:${msg.type()}] ${msg.text()}`);
    });
});

test.describe('Integration tests', () => {
    test('Case 1', async ({page}) => {
        await utils.openPage(page);

        await page.fill('#wordsInput', 'apple, run, beautiful');

        const response = await utils.clickAndReturn(page, '#sendWordsBtn');
        console.log('API response:', response);

        await expect(page.locator('#wordsList .word-chip')).toHaveCount(3, {timeout: 30000});

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            phase: 'setup',
            trainingMode: null
        });
    });

    test('Case 2', async ({page}) => {
        await utils.setWordList(page);

        await utils.openPage(page);

        const response = await utils.clickAndReturn(page, '#modeEnToTarget');
        console.log('API response:', response);

        await expect(page.locator('#chatTranscript .chat-bubble.agent').last())
            .toContainText((response.output || '').trim(), { timeout: 30000 });

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            phase: 'training',
            trainingMode: 'EN_TO_TARGET_TRAINING'
        });
    });
});

import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.beforeEach(async ({page}, testInfo) => {
    page.on('console', (msg) => {
        console.log(`[${testInfo.title}] [browser:${msg.type()}] ${msg.text()}`);
    });
});

test.describe('Integration tests', () => {
    test('Set words', async ({page}) => {
        await utils.openPage(page);

        await page.fill('#wordsInput', 'apple, beautiful');

        const response = await utils.clickAndReturn(page, '#sendWordsBtn');
        console.log('API response:', response);

        await expect(page.locator('#wordsList .word-chip')).toHaveCount(2, {timeout: 30000});

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'beautiful'],
            remaining: ['apple', 'beautiful'],
            phase: 'setup',
            trainingMode: null
        });
    });

    test('First question', async ({page}) => {
        await utils.setWordList(page);

        await utils.openPage(page);

        const response = await utils.clickAndReturn(page, '#modeEnToTarget');
        console.log('API response:', response);

        await expect(page.locator('#chatTranscript .chat-bubble.agent').last())
            .toContainText((response.output || '').trim(), { timeout: 30000 });

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        const words = ['apple', 'run', 'beautiful'];

// st is the state AFTER pick_next_word ran (or after your reducer/action)
        expect(words).toContain(st.nextWord);

        expect(st.remaining).toHaveLength(words.length - 1);

// remaining should be words without nextWord
        const expectedRemaining = words.filter(w => w !== st.nextWord);
        expect(st.remaining.sort()).toStrictEqual(expectedRemaining.sort());

// If you want to assert the whole object except random nextWord:
        const { nextWord, remaining, ...rest } = st;

        expect(rest).toStrictEqual({
            language: 'Hebrew',
            words,
            phase: 'training',
            trainingMode: 'EN_TO_TARGET_TRAINING',
        });

        expect(remaining.sort()).toStrictEqual(expectedRemaining.sort());
    });

    test('First wrong answer', async ({page}) => {
        await utils.setTrainingMode(page);

        await utils.openPage(page);

        await page.fill('#chatInput', 'hi');

        const response = await utils.clickAndReturn(page, '#chatSendBtn');
        console.log('API response:', response);

        await expect(page.locator('#chatTranscript .chat-bubble.agent').last())
            .toContainText((response.output || '').trim(), { timeout: 30000 });

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        expect(st).toStrictEqual({
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
            remaining: ['apple', 'run', 'beautiful'],
            phase: 'training',
            nextWord: 'run',
            trainingMode: 'EN_TO_TARGET_TRAINING'
        });
    });

    test('First correct answer', async ({page}) => {
        await utils.setTrainingMode(page);

        await utils.openPage(page);

        await page.fill('#chatInput', 'לרוץ');

        const response = await utils.clickAndReturn(page, '#chatSendBtn');
        console.log('API response:', response);

        await expect(page.locator('#chatTranscript .chat-bubble.agent').last())
            .toContainText((response.output || '').trim(), { timeout: 30000 });

        const st = await page.evaluate(() => JSON.parse(localStorage.getItem('polyglot_state')));
        console.info('State:', st);
        const words = ['apple', 'run', 'beautiful'];

// st is the state AFTER pick_next_word ran (or after your reducer/action)
        expect(words).toContain(st.nextWord);

        expect(st.remaining).toHaveLength(words.length - 1);

// remaining should be words without nextWord
        const expectedRemaining = words.filter(w => w !== st.nextWord);
        expect(st.remaining.sort()).toStrictEqual(expectedRemaining.sort());

// If you want to assert the whole object except random nextWord:
        const { nextWord, remaining, ...rest } = st;

        expect(rest).toStrictEqual({
            language: 'Hebrew',
            words,
            phase: 'training',
            trainingMode: 'EN_TO_TARGET_TRAINING',
        });

        expect(remaining.sort()).toStrictEqual(expectedRemaining.sort());

    });

});

import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

test.describe('Training tests', () => {
    test('Start training mode (EN -> Target) calls API with correct JSON', async ({page}) => {
        await utils.setWordList(page);

        await utils.openPage(page);

        await utils.setAPI(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        const response = await utils.clickAndReturn(page, '#modeEnToTarget');

        expect(response).toMatchObject({
            action: 'EN_TO_TARGET_TRAINING',
            input: '',
            language: 'Hebrew',
        });
    });

    test('Start training mode (EN -> Target)', async ({page}) => {
        await utils.setWordList(page);

        await utils.openPage(page);

        await utils.setAPI(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');


        await page.click('#modeEnToTarget');

        // Training phase should be visible
        await expect(page.locator('#trainingPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        // First agent message appears in chat transcript
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

    test('Training mode (EN -> Target) calls API with correct JSON', async ({page}) => {
        await utils.setTrainingMode(page)

        await utils.openPage(page);

        await utils.setAPI(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');
        await page.fill('#chatInput', 'second input');

        const response = await utils.clickAndReturn(page, '#chatSendBtn');

        expect(response).toMatchObject({
            action: 'EN_TO_TARGET_TRAINING',
            input: 'second input',
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
        });
    });

    test('Training mode (EN -> Target)', async ({page}) => {
        await utils.setTrainingMode(page)

        await utils.openPage(page);

        await utils.setAPI(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');



        await page.fill('#chatInput', 'second input');
        await page.click('#chatSendBtn');

        // Training phase should be visible
        await expect(page.locator('#trainingPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        // First agent message appears in chat transcript
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

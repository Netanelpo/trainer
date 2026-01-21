import {expect, test} from '@playwright/test';
import * as utils from "../test_utils/utils";

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app'; // Configurable proxy endpoint

test.describe('Training tests', () => {
    test('Start training mode (EN -> Target) calls API with correct JSON', async ({page}) => {
        await utils.setLocalStorage(page);

        await utils.openPage(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({output: 'EN->Target: first prompt'}),
            });
        })

        const requestPromise = page.waitForRequest((req) => {
            try {
                return req.postDataJSON()?.action === 'EN_TO_TARGET_TRAINING';
            } catch {
                return false;
            }
        });

        await page.click('#modeEnToTarget');

        const trainingReq = await requestPromise;
        const payload = trainingReq.postDataJSON();

        expect(payload).toMatchObject({
            action: 'EN_TO_TARGET_TRAINING',
            input: '',
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
        });
    });

    test('Start training mode (EN -> Target)', async ({page}) => {
        await utils.setLocalStorage(page);

        await utils.openPage(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeVisible();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({output: 'EN->Target: first prompt'}),
            });
        })

        await page.click('#modeEnToTarget');

        // Training phase should be visible
        await expect(page.locator('#trainingPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        // First agent message appears in chat transcript
        await expect(page.locator('#chatTranscript .chat-bubble.agent').last()).toHaveText(
            'EN->Target: first prompt'
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
        await utils.setLocalStorage(page, {phase: 'training', trainingMode : 'EN_TO_TARGET_TRAINING'});

        await utils.openPage(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({output: 'EN->Target: second prompt'}),
            });
        })

        await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({output: 'EN->Target: first prompt'}),
            });
        })

        const requestPromise = page.waitForRequest((req) => {
            return true;
        });

        await page.fill('#chatInput', 'second input');
        await page.click('#chatSendBtn');

        const trainingReq = await requestPromise;
        const payload = trainingReq.postDataJSON();

        expect(payload).toMatchObject({
            action: 'EN_TO_TARGET_TRAINING',
            input: 'second input',
            language: 'Hebrew',
            words: ['apple', 'run', 'beautiful'],
        });
    });

    test('Training mode (EN -> Target)', async ({page}) => {
        await utils.setLocalStorage(page, {phase: 'training', trainingMode : 'EN_TO_TARGET_TRAINING'});

        await utils.openPage(page);

        await expect(page.locator('#setupPhase')).toBeHidden();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        const texts = await page.locator('#wordsList .word-chip').allTextContents();
        expect(texts).toEqual(['apple', 'run', 'beautiful']);
        await expect(page.locator('#wordCount')).toHaveText('3');

        await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
            return route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({output: 'EN->Target: second prompt'}),
            });
        })

        await page.fill('#chatInput', 'second input');
        await page.click('#chatSendBtn');

        // Training phase should be visible
        await expect(page.locator('#trainingPhase')).toBeVisible();
        await expect(page.locator('#modeSelectPhase')).toBeHidden();

        // First agent message appears in chat transcript
        await expect(page.locator('#chatTranscript .chat-bubble.agent').last()).toHaveText(
            'EN->Target: second prompt'
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

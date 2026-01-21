import {expect} from "@playwright/test";

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

export async function setWordList(page) {
    await page.addInitScript((st) => {
        localStorage.setItem('polyglot_state', JSON.stringify(st));
    }, {
        language: 'Hebrew',
        words: ['apple', 'run', 'beautiful'],
        phase: 'setup',
        trainingMode: null,
    });
}

export async function setTrainingMode(page) {
    await page.addInitScript((st) => {
        localStorage.setItem('polyglot_state', JSON.stringify(st));
    }, {
        language: 'Hebrew',
        words: ['apple', 'run', 'beautiful'],
        phase: 'training',
        trainingMode: 'EN_TO_TARGET_TRAINING',
    });
}

export async function openPage(page) {
    await page.goto(`${BASE_URL}/`);
}

export async function setAPI(page, extra = {}) {
    await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                output: 'this is the output:',
                ...extra, // optional extra fields
            }),
        });
    });
}

export async function setErrorAPI(page) {
    await page.route(`${AGENT_ENDPOINT}**`, async (route) => {
        await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({error: 'boom'}),
        });
    });
}

export async function setExceptionAPI(page) {
    await page.route(`${AGENT_ENDPOINT}**`, async () => {
        throw new Error('Unexpected API call to /api/agent');
    });
}

export async function clickAndReturn(page, selector) {
    const [req] = await Promise.all([
        page.waitForRequest((req) => {
            return req.url().includes(AGENT_ENDPOINT) && req.method() === 'POST';
        }, {timeout: 30000}),
        page.locator(selector).click(),
    ]);

    return req.postDataJSON();
}

export async function expectSetupPhase(page) {
    await expect(page.locator('#setupPhase')).toBeVisible();
    await expect(page.locator('#modeSelectPhase')).toBeHidden();
    await expect(page.locator('#trainingPhase')).toBeHidden();
}

export async function expectModeSelectPhase(page) {
    await expect(page.locator('#setupPhase')).toBeHidden();
    await expect(page.locator('#modeSelectPhase')).toBeVisible();
    await expect(page.locator('#trainingPhase')).toBeHidden();
}

export async function expectTrainingPhase(page) {
    await expect(page.locator('#setupPhase')).toBeHidden();
    await expect(page.locator('#modeSelectPhase')).toBeHidden();
    await expect(page.locator('#trainingPhase')).toBeVisible();
}

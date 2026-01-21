import {expect} from "@playwright/test";

const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

export async function setLocalStorage(page, {phase = 'setup', trainingMode = null} = {phase: 'setup'}) {
    await page.addInitScript((st) => {
        localStorage.setItem('polyglot_state', JSON.stringify(st));
    }, {
        language: 'Hebrew',
        words: ['apple', 'run', 'beautiful'],
        phase,
        trainingMode,
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

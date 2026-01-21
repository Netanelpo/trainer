export const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app'; // Configurable proxy endpoint
const BASE_URL = process.env.PW_BASE_URL || process.env.BASE_URL || 'http://localhost:3000';

export async function setLocalStorage(page, { phase = 'setup', trainingMode = null} = {phase: 'setup'}) {
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

const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
    testDir: 'tests',
    webServer: {
        command: 'npx serve . -l 3000',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
    },
});

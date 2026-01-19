# Polyglot Trainer (Client-Only)

A lightweight, static web application designed to help students memorize vocabulary by chatting with an AI agent. This project relies on vanilla HTML/CSS/JS with no build steps required.

## Features

* **Words Input:** Paste a list of words to learn.
* **Dual-Direction Training:** Train English &rarr; Target Language or vice versa.
* **AI Chat Agent:** Conversational interface for testing and feedback.
* **Localization:** Built-in support for Hebrew (RTL), Russian, Ukrainian, Spanish, and French.
* **State Persistence:** Remembers your words and language preference via `localStorage`.
* **Responsive:** Works on Desktop (split view) and Mobile (stacked view).

## How to Run Locally

Since this is a static app with no build step, you can run it directly:

1.  **Direct Open:** Double-click `index.html` in your browser. (Note: standard `file://` protocol limitations apply, but localStorage should work).
2.  **Static Server (Recommended):**
    If you have Node.js installed:
    ```bash
    npx serve .
    ```
    Then open `http://localhost:3000`.

## Configuration

### Backend Endpoint
Open `app.js` and modify the constant at the top:

```javascript
const AGENT_ENDPOINT = '/api/agent';
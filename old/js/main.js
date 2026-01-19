// main.js

import {
    ui,
    setSendEnabled,
    setLoading,
    clearInput,
    showOutput,
    showError,
    updateWordList
} from "./ui.js";

const API_URL = "https://start-858515335800.me-west1.run.app";

let inFlight = false;
let context = {};


/* -------------------------
   Input handling
------------------------- */

ui.textarea.addEventListener("input", () => {
    if (inFlight) return;
    if (!ui.nextBtn.disabled) return; // Next enabled → block send
    setSendEnabled(ui.textarea.value.trim().length > 0);
});

ui.textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!ui.sendBtn.disabled && !inFlight) {
            ui.sendBtn.click();
        }
    }
});


/* -------------------------
   Core send logic
------------------------- */

async function send({input = "", next = false} = {}) {
    inFlight = true;
    setSendEnabled(false);
    setLoading(true);
    ui.textarea.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                input,
                context,
                next
            }),
        });

        let data;
        try {
            data = await response.json();
        } catch {
            throw new Error("Invalid server response");
        }

        if (!response.ok) {
            throw new Error(data.output || "Server error");
        }

        if (
            typeof data.output !== "string" ||
            typeof data.context !== "object" ||
            data.context === null
        ) {
            throw new Error("Invalid response from server");
        }

        // ---- Apply server result ----
        showOutput(data.output);
        context = data.context;
        updateWordList(context);
        clearInput();

        // Server controls Next
        ui.nextBtn.disabled = data.next !== true;

    } catch (err) {
        console.error(err);
        showError(err.message || "Network error");
        ui.nextBtn.disabled = true;
        setSendEnabled(true);
    } finally {
        inFlight = false;
        setLoading(false);
        ui.textarea.disabled = false;
    }
}


/* -------------------------
   Button handlers
------------------------- */

ui.sendBtn.addEventListener("click", () => {
    if (inFlight) return;

    const input = ui.textarea.value.trim();
    if (!input) return;

    send({input});
});

ui.restartBtn.addEventListener("click", () => {
    if (inFlight) return;

    context = {};
    ui.nextBtn.disabled = true;
    clearInput();
    showOutput("");

    send(); // initial request
});

ui.nextBtn.addEventListener("click", () => {
    if (inFlight || ui.nextBtn.disabled) return;
    ui.nextBtn.disabled = true; // ⬅️ disable immediately
    send({next: true});
});

/* -------------------------
   Init
------------------------- */

setSendEnabled(false);
ui.nextBtn.disabled = true;
send(); // initial load

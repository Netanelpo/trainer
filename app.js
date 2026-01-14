const API_URL = "https://start-858515335800.me-west1.run.app";

const ui = {
    textarea: document.querySelector(".input-box textarea"),
    sendBtn: document.querySelector(".send-btn"),
    restartBtn: document.querySelector(".restart-btn"),
    nextBtn: document.querySelector(".next-btn"),
    output: document.querySelector(".output-text"),
    wordList: document.querySelector(".word-panel ul"),
    inputBox: document.querySelector(".input-box"),
    loading: document.querySelector(".loading-indicator")
};

let inFlight = false;
let context = {};


/* -------------------------
   UI helpers
------------------------- */

function setSendEnabled(enabled) {
    ui.sendBtn.disabled = !enabled;
    ui.sendBtn.style.opacity = enabled ? "1" : "0.5";
}

function setLoading(isLoading) {
    ui.inputBox.classList.toggle("loading", isLoading);
    ui.loading.hidden = !isLoading;
}

function clearInput() {
    ui.textarea.value = "";
    setSendEnabled(false);
}

function showOutput(text) {
    ui.output.textContent = text;
}

function showError(text) {
    ui.output.textContent = text;
}

function updateWordList(ctx) {
    const words = Array.isArray(ctx.words) ? ctx.words : [];
    ui.wordList.innerHTML = "";

    for (const word of words) {
        const li = document.createElement("li");
        li.textContent = word;
        ui.wordList.appendChild(li);
    }
}


/* -------------------------
   Input handling
------------------------- */

ui.textarea.addEventListener("input", () => {
    if (inFlight) return;
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

async function send({ input = "", next = false } = {}) {
    inFlight = true;
    setSendEnabled(false);
    setLoading(true);
    ui.textarea.disabled = true;

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
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

    send({ input });
});

ui.restartBtn.addEventListener("click", () => {
    if (inFlight) return;

    // reset local state
    context = {};
    ui.nextBtn.disabled = true;
    clearInput();
    showOutput("");

    send(); // initial request
});

ui.nextBtn.addEventListener("click", () => {
    if (inFlight || ui.nextBtn.disabled) return;
    send({ next: true });
});


/* -------------------------
   Init
------------------------- */

setSendEnabled(false);
ui.nextBtn.disabled = true;
send(); // initial load

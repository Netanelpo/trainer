const API_URL = "https://start-858515335800.me-west1.run.app";

const ui = {
    textarea: document.querySelector(".input-box textarea"),
    sendBtn: document.querySelector(".send-btn"),
    output: document.querySelector(".output-text"),
    wordList: document.querySelector(".word-panel ul"),
    inputBox: document.querySelector(".input-box")
};

let inFlight = false;

/* -------------------------
   UI helpers
------------------------- */

function setSendEnabled(enabled) {
    ui.sendBtn.disabled = !enabled;
    ui.sendBtn.style.opacity = enabled ? "1" : "0.5";
}

function setLoading(isLoading) {
    if (isLoading) {
        ui.inputBox.classList.add("loading");
        ui.textarea.disabled = true;
        showOutput("Thinking...");
    } else {
        ui.inputBox.classList.remove("loading");
        ui.textarea.disabled = false;
    }
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

function updateWordList(words) {
    ui.wordList.innerHTML = "";
    for (const word of words) {
        const li = document.createElement("li");
        li.textContent = word;
        ui.wordList.appendChild(li);
    }
}

/* -------------------------
   Input state handling
------------------------- */

ui.textarea.addEventListener("input", () => {
    if (inFlight) return;
    const hasText = ui.textarea.value.trim().length > 0;
    setSendEnabled(hasText);
});

/* -------------------------
   Send action
------------------------- */

ui.sendBtn.addEventListener("click", async () => {
    if (inFlight) return;

    const text = ui.textarea.value.trim();
    if (!text) return;

    const currentWords = [];
    ui.wordList.querySelectorAll("li").forEach(li => {
        currentWords.push(li.textContent);
    });

    inFlight = true;
    setSendEnabled(false);
    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                words: currentWords
            }),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "Server error");
        }

        if (!Array.isArray(data.words) || typeof data.output !== "string") {
            throw new Error("Invalid response from server");
        }

        showOutput(data.output);
        updateWordList(data.words);
        clearInput();

    } catch (err) {
        console.error(err);
        showError(err.message || "Network error");
        setSendEnabled(true);
    } finally {
        inFlight = false;
        setLoading(false);
    }
});

/* -------------------------
   Initial state
------------------------- */

setSendEnabled(false);

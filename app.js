const API_URL = "https://start-858515335800.me-west1.run.app";

const ui = {
    textarea: document.querySelector(".input-box textarea"),
    sendBtn: document.querySelector(".send-btn"),
    output: document.querySelector(".output-text"),
    wordList: document.querySelector(".word-panel ul"),
};

/* -------------------------
   UI helpers
------------------------- */

function setSendEnabled(enabled) {
    ui.sendBtn.disabled = !enabled;
    ui.sendBtn.style.opacity = enabled ? "1" : "0.5";
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
    const hasText = ui.textarea.value.trim().length > 0;
    setSendEnabled(hasText);
});

/* -------------------------
   Send action
------------------------- */

ui.sendBtn.addEventListener("click", async () => {
    const text = ui.textarea.value.trim();
    if (!text) return;

    setSendEnabled(false);
    showOutput("…");

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Server error");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        // Expect: { output: "...", words: [...] }
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
    }
});

/* -------------------------
   Initial state
------------------------- */

setSendEnabled(false);

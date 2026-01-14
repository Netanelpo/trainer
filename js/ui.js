// ui.js

export const ui = {
    textarea: document.querySelector(".input-box textarea"),
    sendBtn: document.querySelector(".send-btn"),
    restartBtn: document.querySelector(".restart-btn"),
    nextBtn: document.querySelector(".next-btn"),
    output: document.querySelector(".output-text"),
    wordList: document.querySelector(".word-panel ul"),
    inputBox: document.querySelector(".input-box"),
    loading: document.querySelector(".loading-indicator")
};

/* -------------------------
   UI helpers
------------------------- */

export function setSendEnabled(enabled) {
    ui.sendBtn.disabled = !enabled;
    ui.sendBtn.style.opacity = enabled ? "1" : "0.5";
}

export function setLoading(isLoading) {
    ui.inputBox.classList.toggle("loading", isLoading);
    ui.loading.hidden = !isLoading;
}

export function clearInput() {
    ui.textarea.value = "";
    setSendEnabled(false);
}

export function showOutput(text) {
    ui.output.textContent = text;
}

export function showError(text) {
    ui.output.textContent = text;
}

export function updateWordList(ctx) {
    const words = Array.isArray(ctx.words) ? ctx.words : [];
    ui.wordList.innerHTML = "";

    for (const word of words) {
        const li = document.createElement("li");
        li.textContent = word;
        ui.wordList.appendChild(li);
    }
}

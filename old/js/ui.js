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

function isRTL(text) {
    return /[\u0590-\u05FF\u0600-\u06FF]/.test(text); // Hebrew/Arabic ranges
}

export function showOutput(text) {
    // Clear previous output
    ui.output.replaceChildren();

    if (!text) return;

    const rtl = isRTL(text);

    // Set direction on the container
    ui.output.dir = rtl ? "rtl" : "ltr";
    ui.output.style.textAlign = rtl ? "right" : "left";

    // If not RTL, render plain text
    if (!rtl) {
        ui.output.textContent = text;
        return;
    }

    // RTL: isolate LTR tokens (English words), including quoted ones like 'engineer'
    const frag = document.createDocumentFragment();
    const re = /(['"])([A-Za-z][A-Za-z0-9_-]*)\1|\b[A-Za-z][A-Za-z0-9_-]*\b/g;

    let last = 0;
    let m;

    while ((m = re.exec(text)) !== null) {
        if (m.index > last) {
            frag.appendChild(document.createTextNode(text.slice(last, m.index)));
        }

        const bdi = document.createElement("bdi");
        bdi.dir = "ltr";
        bdi.textContent = m[0]; // safe text
        frag.appendChild(bdi);

        last = re.lastIndex;
    }

    if (last < text.length) {
        frag.appendChild(document.createTextNode(text.slice(last)));
    }

    ui.output.appendChild(frag);
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

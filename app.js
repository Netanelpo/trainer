const API_URL = "https://start-858515335800.me-west1.run.app";

const ui = {
    textarea: document.querySelector(".input-box textarea"),
    sendBtn: document.querySelector(".send-btn"),
    output: document.querySelector(".output-text"),
    wordList: document.querySelector(".word-panel ul"),
    inputBox: document.querySelector(".input-box"),
    loading: document.querySelector(".loading-indicator")
};

let inFlight = false;
let context = {};


function setSendEnabled(enabled) {
    ui.sendBtn.disabled = !enabled;
    ui.sendBtn.style.opacity = enabled ? "1" : "0.5";
}

function setLoading(isLoading) {
    if (isLoading) {
        ui.inputBox.classList.add("loading");
        ui.textarea.disabled = true;
        ui.loading.hidden = false;
        ui.output.textContent = "";
    } else {
        ui.inputBox.classList.remove("loading");
        ui.textarea.disabled = false;
        ui.loading.hidden = true;
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

function updateWordList(ctx) {
    const words = ctx.words || [];
    ui.wordList.innerHTML = "";
    for (const word of words) {
        const li = document.createElement("li");
        li.textContent = word;
        ui.wordList.appendChild(li);
    }
}


ui.textarea.addEventListener("input", () => {
    if (inFlight) return;
    setSendEnabled(ui.textarea.value.trim().length > 0);
});


async function send(input) {
    inFlight = true;
    setSendEnabled(false);
    setLoading(true);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({
                input,
                context
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

        showOutput(data.output);
        context = data.context;
        updateWordList(context);
        clearInput();

    } catch (err) {
        console.error(err);
        showError(err.message || "Network error");
        setSendEnabled(true);
    } finally {
        inFlight = false;
        setLoading(false);
    }
}


ui.sendBtn.addEventListener("click", () => {
    if (inFlight) return;

    const input = ui.textarea.value.trim();
    if (!input) return;

    send(input);
});


setSendEnabled(false);
send("");

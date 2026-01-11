const API_START = "https://start-858515335800.me-west1.run.app";
const API_TRAIN = "https://start_training-858515335800.me-west1.run.app";

// Local state (last server response)
let lastOldWords = [];
let lastNewWords = [];

async function start() {
    const input = document.getElementById("userInput").value.trim();
    const oldList = document.getElementById("oldWords");
    const newList = document.getElementById("newWords");
    const errorBox = document.getElementById("error");

    // Reset UI
    oldList.innerHTML = "";
    newList.innerHTML = "";
    errorBox.hidden = true;
    errorBox.textContent = "";

    if (!input) {
        errorBox.textContent = "נא להזין טקסט.";
        errorBox.hidden = false;
        return;
    }

    try {
        const response = await fetch(API_START, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: input }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error("שגיאת שרת.");
        }

        if (data.error) {
            throw new Error(data.error);
        }

        if (
            !Array.isArray(data.new_words) ||
            !Array.isArray(data.old_words)
        ) {
            throw new Error("תגובה לא תקינה מהשרת.");
        }

        // Save state
        lastOldWords = data.old_words;
        lastNewWords = data.new_words;

        // Render old words
        for (const word of lastOldWords) {
            const li = document.createElement("li");
            li.textContent = word;
            oldList.appendChild(li);
        }

        // Render new words
        for (const word of lastNewWords) {
            const li = document.createElement("li");
            li.textContent = word;
            newList.appendChild(li);
        }

    } catch (err) {
        console.error(err);
        errorBox.textContent = err.message || "שגיאת רשת.";
        errorBox.hidden = false;
    }
}

// ------------------
// Training actions
// ------------------

function trainOld() {
    startTraining(); // no words → train old
}

function trainNew() {
    if (!lastNewWords.length) {
        alert("אין מילים חדשות לתרגול.");
        return;
    }
    startTraining(lastNewWords);
}

async function startTraining(words = null) {
    try {
        const payload = words ? { words } : {};

        const response = await fetch(API_TRAIN, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || data.error) {
            throw new Error(data.error || "שגיאה בהתחלת תרגול.");
        }

        // For now just log – later this will open the trainer UI
        console.log("Training started:", data);

    } catch (err) {
        alert(err.message || "שגיאת רשת בזמן תרגול.");
    }
}

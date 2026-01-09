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
        const response = await fetch(
            "https://start-858515335800.me-west1.run.app",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: input }),
            }
        );

        const data = await response.json();

        // HTTP error
        if (!response.ok) {
            errorBox.textContent = "שגיאת שרת.";
            errorBox.hidden = false;
            return;
        }

        // Logical error from backend
        if (data.error) {
            errorBox.textContent = data.error;
            errorBox.hidden = false;
            return;
        }

        // Validate payload
        if (
            !Array.isArray(data.new_words) ||
            !Array.isArray(data.old_words)
        ) {
            errorBox.textContent = "תגובה לא תקינה מהשרת.";
            errorBox.hidden = false;
            return;
        }

        // Render old words
        for (const word of data.old_words) {
            const li = document.createElement("li");
            li.textContent = word;
            oldList.appendChild(li);
        }

        // Render new words
        for (const word of data.new_words) {
            const li = document.createElement("li");
            li.textContent = word;
            newList.appendChild(li);
        }

    } catch (err) {
        console.error(err);
        errorBox.textContent = "שגיאת רשת. נסה שוב.";
        errorBox.hidden = false;
    }
}

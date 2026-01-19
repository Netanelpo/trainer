/**
 * APP CONFIGURATION
 */
const AGENT_ENDPOINT = '/api/agent'; // Configurable proxy endpoint
const LOCAL_STORAGE_KEY = 'polyglot_state';

// Localization Dictionary
const I18N = {
    'Hebrew': {
        dir: 'rtl',
        appTitle: 'מאמן שפות',
        mockMode: 'מצב דמה',
        learnedWords: 'מילים שנלמדו',
        noWordsYet: 'עדיין לא נוספו מילים',
        pasteWordsTitle: 'הדבק את המילים שלמדת',
        pasteWordsHelper: 'הפרד מילים עם פסיקים או שורות חדשות',
        btnSendWords: 'שלח מילים',
        startTrainingTitle: 'התחל אימון',
        chooseDirection: 'בחר את כיוון האימון:',
        btnSend: 'שלח',
        sessionComplete: 'האימון הושלם!',
        whatNext: 'מה ברצונך לעשות?',
        btnGetFeedback: 'קבל משוב',
        btnTrainAgain: 'התאמן שוב',
        labelLoading: 'טוען...',
        errorNetwork: 'שגיאת תקשורת. אנא נסה שנית.',
        wordCount: 'מילים',
        langName: 'עברית'
    },
    'Russian': {
        dir: 'ltr',
        appTitle: 'Языковой Тренажер',
        mockMode: 'Тест-режим',
        learnedWords: 'Изученные слова',
        noWordsYet: 'Слова еще не добавлены',
        pasteWordsTitle: 'Вставьте изученные слова',
        pasteWordsHelper: 'Разделяйте слова запятыми или новыми строками',
        btnSendWords: 'Отправить слова',
        startTrainingTitle: 'Начать тренировку',
        chooseDirection: 'Выберите направление:',
        btnSend: 'Отправить',
        sessionComplete: 'Сессия завершена!',
        whatNext: 'Что делать дальше?',
        btnGetFeedback: 'Получить отзыв',
        btnTrainAgain: 'Тренироваться снова',
        labelLoading: 'Загрузка...',
        errorNetwork: 'Ошибка сети. Попробуйте еще раз.',
        wordCount: 'слов',
        langName: 'Русский'
    },
    'Ukrainian': {
        dir: 'ltr',
        appTitle: 'Мовний Тренажер',
        mockMode: 'Тест-режим',
        learnedWords: 'Вивчені слова',
        noWordsYet: 'Слова ще не додані',
        pasteWordsTitle: 'Вставте вивчені слова',
        pasteWordsHelper: 'Розділяйте слова комами або новими рядками',
        btnSendWords: 'Надіслати слова',
        startTrainingTitle: 'Почати тренування',
        chooseDirection: 'Оберіть напрямок:',
        btnSend: 'Надіслати',
        sessionComplete: 'Сесія завершена!',
        whatNext: 'Що робити далі?',
        btnGetFeedback: 'Отримати відгук',
        btnTrainAgain: 'Тренуватися знову',
        labelLoading: 'Завантаження...',
        errorNetwork: 'Помилка мережі. Спробуйте ще раз.',
        wordCount: 'слів',
        langName: 'Українська'
    },
    'Spanish': {
        dir: 'ltr',
        appTitle: 'Entrenador de Idiomas',
        mockMode: 'Modo Prueba',
        learnedWords: 'Palabras aprendidas',
        noWordsYet: 'No hay palabras añadidas',
        pasteWordsTitle: 'Pega tus palabras aprendidas',
        pasteWordsHelper: 'Separa las palabras con comas o nuevas líneas',
        btnSendWords: 'Enviar palabras',
        startTrainingTitle: 'Empezar entrenamiento',
        chooseDirection: 'Elige la dirección:',
        btnSend: 'Enviar',
        sessionComplete: '¡Sesión completada!',
        whatNext: '¿Qué te gustaría hacer?',
        btnGetFeedback: 'Obtener feedback',
        btnTrainAgain: 'Entrenar de nuevo',
        labelLoading: 'Cargando...',
        errorNetwork: 'Error de red. Inténtalo de nuevo.',
        wordCount: 'palabras',
        langName: 'Español'
    },
    'French': {
        dir: 'ltr',
        appTitle: 'Entraîneur de Langue',
        mockMode: 'Mode Test',
        learnedWords: 'Mots appris',
        noWordsYet: 'Aucun mot ajouté',
        pasteWordsTitle: 'Collez vos mots appris',
        pasteWordsHelper: 'Séparez les mots par des virgules ou des nouvelles lignes',
        btnSendWords: 'Envoyer les mots',
        startTrainingTitle: 'Commencer l\'entraînement',
        chooseDirection: 'Choisissez la direction :',
        btnSend: 'Envoyer',
        sessionComplete: 'Session terminée !',
        whatNext: 'Que souhaitez-vous faire ?',
        btnGetFeedback: 'Obtenir un retour',
        btnTrainAgain: 'S\'entraîner à nouveau',
        labelLoading: 'Chargement...',
        errorNetwork: 'Erreur réseau. Veuillez réessayer.',
        wordCount: 'mots',
        langName: 'Français'
    }
};

/**
 * STATE MANAGEMENT
 */
const defaultState = {
    language: 'Hebrew',
    words: [],
    context: {},
    phase: 'setup', // 'setup', 'training', 'done'
    trainingMode: null, // 'EN_TO_TARGET', 'TARGET_TO_EN'
    useMock: false
};

let state = { ...defaultState };

function loadState() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        state = JSON.parse(stored);
    }
    // Ensure mock toggle reflects state immediately
    document.getElementById('mockToggle').checked = state.useMock;
    document.getElementById('languageSelect').value = state.language;
}

function saveState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function resetTranscript() {
    // Only resets UI, doesn't affect persistable state logic directly unless needed
    document.getElementById('chatTranscript').innerHTML = '';
}

/**
 * UI UPDATES & I18N
 */
function updateUI() {
    const langData = I18N[state.language];

    // 1. Direction and Globals
    document.documentElement.setAttribute('dir', langData.dir);
    document.documentElement.lang = state.language === 'Hebrew' ? 'he' : 'en'; // Simple fallback

    // 2. Text Content Localization
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (langData[key]) {
            el.textContent = langData[key];
        }
    });

    // 3. Dynamic Text
    document.getElementById('currentLangBadge').textContent = `Language: ${langData.langName}`;
    document.querySelectorAll('.target-lang-name').forEach(el => el.textContent = langData.langName);
    document.getElementById('wordCount').textContent = `${state.words.length}`;

    // 4. Words List rendering
    const wordsList = document.getElementById('wordsList');
    if (state.words.length > 0) {
        wordsList.innerHTML = state.words.map(w => `<span class="word-chip">${w}</span>`).join('');
    } else {
        wordsList.innerHTML = `<p class="empty-state">${langData.noWordsYet}</p>`;
    }

    // 5. Phase Visibility
    // Hide all first
    ['setupPhase', 'modeSelectPhase', 'trainingPhase', 'donePhase'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });

    if (state.phase === 'setup') {
        if (state.words.length > 0) {
            document.getElementById('modeSelectPhase').classList.remove('hidden');
        } else {
            document.getElementById('setupPhase').classList.remove('hidden');
        }
    } else if (state.phase === 'training') {
        document.getElementById('trainingPhase').classList.remove('hidden');
    } else if (state.phase === 'done') {
        document.getElementById('donePhase').classList.remove('hidden');
        document.getElementById('trainingPhase').classList.remove('hidden'); // Keep chat visible in background/above
    }
}

function addChatBubble(text, sender) {
    const transcript = document.getElementById('chatTranscript');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`; // sender: 'agent' or 'student'
    bubble.textContent = text;
    transcript.appendChild(bubble);
    transcript.scrollTop = transcript.scrollHeight;
}

function showLoading(isLoading) {
    const btn = document.querySelector('button:not(:disabled)'); // rough check
    if(isLoading) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}

function showError(msg) {
    const banner = document.getElementById('errorBanner');
    if (msg) {
        banner.textContent = msg;
        banner.classList.remove('hidden');
        setTimeout(() => banner.classList.add('hidden'), 5000);
    } else {
        banner.classList.add('hidden');
    }
}

/**
 * MOCK AGENT LOGIC
 */
async function mockAgentCall(payload) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 600));

    const { action, input, context } = payload;
    const lang = context.language;
    const words = context.words || [];

    // 1. SET_WORDS
    if (action === 'SET_WORDS') {
        // Parse words
        const rawList = input.split(/[\n,]+/).map(s => s.trim()).filter(s => s.length > 0);
        // Dedupe preserving case
        const uniqueWords = [...new Set(rawList)];

        return {
            output: `Great! I've saved ${uniqueWords.length} words. Please choose a training direction.`,
            words: uniqueWords,
            context: { ...context, words: uniqueWords },
            isDone: false
        };
    }

    // 2. TRAINING
    if (action === 'EN_TO_TARGET_TRAINING' || action === 'TARGET_TO_EN_TRAINING') {
        let currentIndex = context.mockIndex || 0;

        // Check if student just answered
        let replyPrefix = "";
        if (input) {
            replyPrefix = (Math.random() > 0.3) ? "Correct! " : "Close enough. ";
            currentIndex++;
        }

        // Check if done
        if (currentIndex >= Math.min(words.length, 5)) { // Limit to 5 for mock
            return {
                output: `${replyPrefix} That was the last word. Good job!`,
                words: words,
                context: { ...context, mockIndex: currentIndex },
                isDone: true
            };
        }

        // Ask next question
        const nextWord = words[currentIndex];
        const isEnSource = action === 'EN_TO_TARGET_TRAINING';
        const question = isEnSource
            ? `How do you say "${nextWord}" in ${lang}?`
            : `What does "${nextWord}" mean in English?`;

        return {
            output: `${replyPrefix}${question}`,
            words: words,
            context: { ...context, mockIndex: currentIndex },
            isDone: false
        };
    }

    // 3. FEEDBACK
    if (action === 'FEEDBACK') {
        return {
            output: `Mock Feedback: You practiced ${words.length} words. You are doing great in ${lang}!`,
            words: words,
            context: context,
            isDone: true
        };
    }

    return { output: "Error: Unknown mock action", words: words, context: context, isDone: false };
}

/**
 * API INTERACTION
 */
async function callAgent(action, inputVal = "") {
    showLoading(true);
    showError(null);

    const payload = {
        input: inputVal,
        action: action,
        context: {
            ...state.context,
            language: state.language,
            words: state.words
        }
    };

    try {
        let response;
        if (state.useMock) {
            console.log('Calling Mock Agent:', payload);
            response = await mockAgentCall(payload);
        } else {
            const res = await fetch(AGENT_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            response = await res.json();
        }

        // Handle Response
        if (response.words) {
            state.words = response.words;
        }
        if (response.context) {
            state.context = response.context;
        }

        // UI Logic based on Action & Response
        if (action === 'SET_WORDS') {
            state.phase = 'setup'; // stays in setup until mode clicked, but now words exist
            // Use the output as a preview in the mode select screen if desired,
            // or just show it in the chat area if we were already chatting.
            // For this UX, we show the words list on left and enable mode buttons.
            document.getElementById('setupFeedback').textContent = response.output;
        } else if (response.output) {
            addChatBubble(response.output, 'agent');
        }

        if (response.isDone) {
            state.phase = 'done';
        }

        saveState();
        updateUI();

    } catch (err) {
        console.error(err);
        showError(I18N[state.language].errorNetwork);
    } finally {
        showLoading(false);
    }
}

/**
 * EVENT LISTENERS
 */
function bindEvents() {
    // Language Switch
    document.getElementById('languageSelect').addEventListener('change', (e) => {
        state.language = e.target.value;
        saveState();
        updateUI();
    });

    // Mock Toggle
    document.getElementById('mockToggle').addEventListener('change', (e) => {
        state.useMock = e.target.checked;
        saveState();
    });

    // 1. Send Words
    document.getElementById('sendWordsBtn').addEventListener('click', () => {
        const txt = document.getElementById('wordsInput').value;
        if (!txt.trim()) return;
        callAgent('SET_WORDS', txt);
    });

    // 2. Start Training (EN -> Target)
    document.getElementById('modeEnToTarget').addEventListener('click', () => {
        state.phase = 'training';
        state.trainingMode = 'EN_TO_TARGET';
        resetTranscript();
        saveState();
        updateUI();
        // Reset mock index if using mock
        state.context.mockIndex = 0;
        callAgent('EN_TO_TARGET_TRAINING', '');
    });

    // 2. Start Training (Target -> EN)
    document.getElementById('modeTargetToEn').addEventListener('click', () => {
        state.phase = 'training';
        state.trainingMode = 'TARGET_TO_EN';
        resetTranscript();
        saveState();
        updateUI();
        state.context.mockIndex = 0;
        callAgent('TARGET_TO_EN_TRAINING', '');
    });

    // 3. Chat Send
    const handleChatSend = () => {
        const input = document.getElementById('chatInput');
        const txt = input.value.trim();
        if (!txt) return;

        addChatBubble(txt, 'student');
        input.value = '';

        if (state.phase === 'training') {
            callAgent(state.trainingMode, txt);
        }
    };

    document.getElementById('chatSendBtn').addEventListener('click', handleChatSend);
    document.getElementById('chatInput').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleChatSend();
    });

    // 4. Feedback
    document.getElementById('btnFeedback').addEventListener('click', () => {
        callAgent('FEEDBACK', '');
        // Hide feedback button to prevent double click? Or just append to chat.
    });

    // 5. Train Again
    document.getElementById('btnTrainAgain').addEventListener('click', () => {
        // Return to mode select
        state.phase = 'setup'; // Actually 'setup' with words renders mode select
        // Technically we are skipping the "paste" part because words exist.
        // But logic in updateUI handles: if phase=setup && words.length > 0 -> show Mode Select.
        state.context = {}; // clear context for new run
        resetTranscript();
        saveState();
        updateUI();
    });
}

/**
 * INITIALIZATION
 */
(function init() {
    loadState();
    bindEvents();
    updateUI();
})();
/**
 * APP CONFIGURATION
 */
const AGENT_ENDPOINT = 'https://start-858515335800.me-west1.run.app';
const LOCAL_STORAGE_KEY = 'polyglot_state';

// Localization Dictionary
const I18N = {
    'Hebrew': {
        dir: 'rtl',
        appTitle: 'מאמן שפות',
        learnedWords: 'מילים ללמידה',
        noWordsYet: 'עדיין לא נוספו מילים',
        pasteWordsTitle: 'הדבק את המילים ללמידה',
        pasteWordsHelper: 'הפרד מילים עם פסיקים או שורות חדשות',
        btnSendWords: 'שלח מילים',
        startTrainingTitle: 'התחל אימון',
        chooseDirection: 'בחר את כיוון האימון:',
        btnSend: 'שלח',
        sessionComplete: 'האימון הושלם!',
        whatNext: 'מה ברצונך לעשות?',
        btnGetFeedback: 'קבל משוב',
        btnTrainAgain: 'התאמן שוב',
        btnChangeWords: 'אפס רשימת מילים',

        labelLoading: 'טוען...',
        errorNetwork: 'שגיאת תקשורת. אנא נסה שנית.',
        wordCount: 'מילים',
        langName: 'עברית'
    },
    'Russian': {
        dir: 'ltr',
        appTitle: 'Языковой Тренажер',
        learnedWords: 'Изучаемые слова',
        noWordsYet: 'Слова еще не добавлены',
        pasteWordsTitle: 'Вставьте изучаемые слова',
        pasteWordsHelper: 'Разделяйте слова запятыми или новыми строками',
        btnSendWords: 'Отправить слова',
        startTrainingTitle: 'Начать тренировку',
        chooseDirection: 'Выберите направление:',
        btnSend: 'Отправить',
        sessionComplete: 'Сессия завершена!',
        whatNext: 'Что делать дальше?',
        btnGetFeedback: 'Получить отзыв',
        btnTrainAgain: 'Тренироваться снова',
        btnChangeWords: 'Сбросить слова',

        labelLoading: 'Загрузка...',
        errorNetwork: 'Ошибка сети. Попробуйте еще раз.',
        wordCount: 'слов',
        langName: 'Русский'
    },
    'Ukrainian': {
        dir: 'ltr',
        appTitle: 'Мовний Тренажер',
        learnedWords: 'Слова для вивчення',
        noWordsYet: 'Слова ще не додані',
        pasteWordsTitle: 'Вставте слова для вивчення',
        pasteWordsHelper: 'Розділяйте слова комами або новими рядками',
        btnSendWords: 'Надіслати слова',
        startTrainingTitle: 'Почати тренування',
        chooseDirection: 'Оберіть напрямок:',
        btnSend: 'Надіслати',
        sessionComplete: 'Сесія завершена!',
        whatNext: 'Що робити далі?',
        btnGetFeedback: 'Отримати відгук',
        btnTrainAgain: 'Тренуватися знову',
        btnChangeWords: 'Скинути слова',

        labelLoading: 'Завантаження...',
        errorNetwork: 'Помилка мережі. Спробуйте ще раз.',
        wordCount: 'слів',
        langName: 'Українська'
    },
    'Spanish': {
        dir: 'ltr',
        appTitle: 'Entrenador de Idiomas',
        learnedWords: 'Palabras para aprender',
        noWordsYet: 'Aún no se han añadido palabras',
        pasteWordsTitle: 'Pega las palabras para aprender',
        pasteWordsHelper: 'Separa las palabras con comas o nuevas líneas',
        btnSendWords: 'Enviar palabras',
        startTrainingTitle: 'Empezar entrenamiento',
        chooseDirection: 'Elige la dirección:',
        btnSend: 'Enviar',
        sessionComplete: '¡Sesión completada!',
        whatNext: '¿Qué te gustaría hacer?',
        btnGetFeedback: 'Obtener feedback',
        btnTrainAgain: 'Entrenar de nuevo',
        btnChangeWords: 'Reiniciar palabras',

        labelLoading: 'Cargando...',
        errorNetwork: 'Error de red. Inténtalo de nuevo.',
        wordCount: 'palabras',
        langName: 'Español'
    },
    'French': {
        dir: 'ltr',
        appTitle: 'Entraîneur de Langue',
        learnedWords: 'Mots à apprendre',
        noWordsYet: 'Aucun mot ajouté',
        pasteWordsTitle: 'Collez les mots à apprendre',
        pasteWordsHelper: 'Séparez les mots par des virgules ou des nouvelles lignes',
        btnSendWords: 'Envoyer les mots',
        startTrainingTitle: 'Commencer l\'entraînement',
        chooseDirection: 'Choisissez la direction :',
        btnSend: 'Envoyer',
        sessionComplete: 'Session terminée !',
        whatNext: 'Que souhaitez-vous faire ?',
        btnGetFeedback: 'Obtenir un retour',
        btnTrainAgain: 'S\'entraîner à nouveau',
        btnChangeWords: 'Réinitialiser les mots',

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
    phase: 'setup', // 'setup', 'training', 'done'
    trainingMode: null, // 'EN_TO_TARGET_TRAINING', 'TARGET_TO_EN_TRAINING'
};

let state = {...defaultState};

function loadState() {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
        state = JSON.parse(stored);
    }
    document.getElementById('languageSelect').value = state.language;
}

function saveState() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

function resetTranscript() {
    document.getElementById('chatTranscript').innerHTML = '';
}

/**
 * UI UPDATES & I18N
 */
function updateUI() {
    const langData = I18N[state.language];

    // 1. Direction and Globals
    document.documentElement.setAttribute('dir', langData.dir);
    document.documentElement.lang = state.language === 'Hebrew' ? 'he' : 'en';

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
    const btnChangeWords = document.getElementById('btnChangeWords');

    if (state.words.length > 0) {
        wordsList.innerHTML = state.words.map(w => `<span class="word-chip">${w}</span>`).join('');
        btnChangeWords.classList.remove('hidden'); // Show button right after words
    } else {
        wordsList.innerHTML = `<p class="empty-state">${langData.noWordsYet}</p>`;
        btnChangeWords.classList.add('hidden');
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
        document.getElementById('trainingPhase').classList.remove('hidden');
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
    const buttons = document.querySelectorAll('button');

    if (isLoading) {
        document.body.style.cursor = 'wait';
        buttons.forEach(btn => {
            btn.disabled = true;
            btn.dataset.originalText = btn.textContent;
            btn.style.opacity = '0.7';
        });

        // specific feedback for the send button if it's the active context
        const sendWordsBtn = document.getElementById('sendWordsBtn');
        if (state.phase === 'setup') {
            sendWordsBtn.textContent = I18N[state.language].labelLoading || '...';
        }

    } else {
        document.body.style.cursor = 'default';
        buttons.forEach(btn => {
            btn.disabled = false;
            btn.style.opacity = '1';
            // Restore text via I18N updates in updateUI to ensure correct lang
            if (btn.id === 'sendWordsBtn') {
                updateUI();
            }
        });
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
 * API INTERACTION
 */
async function callAgent(action, inputVal = "") {
    showLoading(true);
    showError(null);

    // Clear previous feedbacks
    ['setupFeedback', 'modeSelectFeedback'].forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.classList.add('hidden');
            el.textContent = '';
        }
    });

    const payload = {
        input: inputVal,
        action: action,
        language: state.language,
        words: state.words,
    };

    try {
        const res = await fetch(AGENT_ENDPOINT, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload),
        });

        const response = await res.json();
        if (!res.ok) {
            const msg = response?.error || `HTTP ${res.status}`;
            throw new Error(msg);
        }

        if (!response) {
            throw new Error('Invalid JSON');
        }

        // Handle Response
        if (response.words) {
            state.words = response.words;
        }

        if (response.isDone) {
            state.phase = 'done';
        }

        // Save and Update UI *before* showing output messages so the correct screen is visible
        saveState();
        updateUI();

        // Handle output message visibility depending on resulting phase
        if (action === 'SET_WORDS' && response.output) {
            if (state.words.length > 0) {
                const feedbackEl = document.getElementById('modeSelectFeedback');
                if (feedbackEl) {
                    feedbackEl.textContent = response.output;
                    feedbackEl.classList.remove('hidden');
                }
            } else {
                const feedbackEl = document.getElementById('setupFeedback');
                if (feedbackEl) {
                    feedbackEl.textContent = response.output;
                    feedbackEl.classList.remove('hidden');
                }
            }
        } else if (response.output) {
            // Normal chat response
            addChatBubble(response.output, 'agent');
            // FIX: Focus input after agent replies for better UX
            if(state.phase === 'training') {
                setTimeout(() => document.getElementById('chatInput').focus(), 50);
            }
        }

    } catch (err) {
        console.error(err);
        showError(err?.message || I18N[state.language].errorNetwork);
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

    // 1. Send Words
    document.getElementById('sendWordsBtn').addEventListener('click', () => {
        const txt = document.getElementById('wordsInput').value;
        if (!txt.trim()) return;
        callAgent('SET_WORDS', txt);
    });

    // 2. Reset Words
    const btnChangeWords = document.getElementById('btnChangeWords');
    if (btnChangeWords) {
        btnChangeWords.addEventListener('click', () => {
            state.words = [];
            state.phase = 'setup';

            // Clear inputs and feedbacks
            document.getElementById('wordsInput').value = '';
            ['setupFeedback', 'modeSelectFeedback'].forEach(id => {
                const el = document.getElementById(id);
                if(el) {
                    el.textContent = '';
                    el.classList.add('hidden');
                }
            });

            saveState();
            updateUI();
        });
    }


    // 3. Start Training (EN -> Target)
    document.getElementById('modeEnToTarget').addEventListener('click', () => {
        state.phase = 'training';
        state.trainingMode = 'EN_TO_TARGET_TRAINING';
        resetTranscript();
        saveState();
        updateUI();

        // NEW: Focus input immediately when training starts
        setTimeout(() => document.getElementById('chatInput')?.focus(), 50);

        callAgent('EN_TO_TARGET_TRAINING', '');
    });

    // 4. Start Training (Target -> EN)
    document.getElementById('modeTargetToEn').addEventListener('click', () => {
        state.phase = 'training';
        state.trainingMode = 'TARGET_TO_EN_TRAINING';
        resetTranscript();
        saveState();
        updateUI();

        // NEW: Focus input immediately when training starts
        setTimeout(() => document.getElementById('chatInput')?.focus(), 50);

        callAgent('TARGET_TO_EN_TRAINING', '');
    });

    // 5. Chat Send
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

    // 6. Feedback / Train Again
    document.getElementById('btnFeedback').addEventListener('click', () => {
        callAgent('FEEDBACK', '');
    });

    document.getElementById('btnTrainAgain').addEventListener('click', () => {
        state.phase = 'setup'; // Logic in updateUI will show Mode Select because words exist
        resetTranscript();

        // Hide feedback when restarting
        const el = document.getElementById('modeSelectFeedback');
        if(el) el.classList.add('hidden');

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
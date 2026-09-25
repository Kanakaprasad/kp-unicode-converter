/**
 * KPWorks Converter UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let currentMode = 'a2u'; // 'a2u' or 'u2a'
    let currentLang = localStorage.getItem('kpworks_lang') || 'en';
    let currentTheme = localStorage.getItem('kpworks_theme') || 'light';

    const dom = {
        themeSelect: document.getElementById('themeSelect'),
        langSelect: document.getElementById('langSelect'),
        btnA2U: document.getElementById('btnA2U'),
        btnU2A: document.getElementById('btnU2A'),
        inputPanelTitle: document.getElementById('inputPanelTitle'),
        outputPanelTitle: document.getElementById('outputPanelTitle'),
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        btnClear: document.getElementById('btnClear'),
        btnCopy: document.getElementById('btnCopy'),
        inputStats: document.getElementById('inputStats'),
        outputStats: document.getElementById('outputStats')
    };

    // --- Translations ---
    const i18n = {
        en: {
            modeA2U: "ASCII → Unicode",
            modeU2A: "Unicode → ASCII",
            inputA2UTitle: "Input (ASCII / Nudi / Baraha)",
            outputA2UTitle: "Output (Unicode Kannada)",
            inputU2ATitle: "Input (Unicode Kannada)",
            outputU2ATitle: "Output (ASCII / Nudi / Baraha)",
            inputPlaceholder: "Type or paste your text here...",
            outputPlaceholder: "Converted text will appear here",
            clear: "Clear",
            copy: "Copy",
            copied: "Copied ✓",
            chars: "characters",
            words: "words"
        },
        kn: {
            modeA2U: "ಆಸ್ಕಿ → ಯುನಿಕೋಡ್",
            modeU2A: "ಯುನಿಕೋಡ್ → ಆಸ್ಕಿ",
            inputA2UTitle: "ಇನ್ಪುಟ್ (ಆಸ್ಕಿ / ನುಡಿ / ಬರಹ)",
            outputA2UTitle: "ಔಟ್ಪುಟ್ (ಯುನಿಕೋಡ್ ಕನ್ನಡ)",
            inputU2ATitle: "ಇನ್ಪುಟ್ (ಯುನಿಕೋಡ್ ಕನ್ನಡ)",
            outputU2ATitle: "ಔಟ್ಪುಟ್ (ಆಸ್ಕಿ / ನುಡಿ / ಬರಹ)",
            inputPlaceholder: "ಇಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಅಂಟಿಸಿ...",
            outputPlaceholder: "ಬದಲಾವಣೆಗೊಂಡ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
            clear: "ತೆರವುಗೊಳಿಸಿ",
            copy: "ನಕಲಿಸಿ",
            copied: "ನಕಲಿಸಲಾಗಿದೆ ✓",
            chars: "ಅಕ್ಷರಗಳು",
            words: "ಪದಗಳು"
        }
    };

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    function initTheme() {
        dom.themeSelect.value = currentTheme;
        applyTheme(currentTheme);

        dom.themeSelect.addEventListener('change', (e) => {
            currentTheme = e.target.value;
            localStorage.setItem('kpworks_theme', currentTheme);
            applyTheme(currentTheme);
        });

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentTheme === 'system') applyTheme('system');
        });
    }

    // --- Language Management ---
    function applyLanguage() {
        const t = i18n[currentLang];
        
        // Update Buttons
        dom.btnA2U.textContent = t.modeA2U;
        dom.btnU2A.textContent = t.modeU2A;
        dom.btnClear.innerHTML = `<svg class="icon"><path d="M18 6L6 18M6 6l12 12"></path></svg> ${t.clear}`;
        
        // Ensure copy button text resets cleanly if it was mid-animation
        dom.btnCopy.classList.remove('btn-success');
        dom.btnCopy.innerHTML = `<svg class="icon"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> ${t.copy}`;
        
        // Update Titles & Placeholders based on Mode
        if (currentMode === 'a2u') {
            dom.inputPanelTitle.textContent = t.inputA2UTitle;
            dom.outputPanelTitle.textContent = t.outputA2UTitle;
        } else {
            dom.inputPanelTitle.textContent = t.inputU2ATitle;
            dom.outputPanelTitle.textContent = t.outputU2ATitle;
        }
        
        dom.inputText.placeholder = t.inputPlaceholder;
        dom.outputText.placeholder = t.outputPlaceholder;
        
        updateStats();
    }

    function initLanguage() {
        dom.langSelect.value = currentLang;
        dom.langSelect.addEventListener('change', (e) => {
            currentLang = e.target.value;
            localStorage.setItem('kpworks_lang', currentLang);
            applyLanguage();
        });
    }

    // --- Mode Switching ---
    function setMode(mode) {
        currentMode = mode;
        if (mode === 'a2u') {
            dom.btnA2U.classList.add('active');
            dom.btnU2A.classList.remove('active');
        } else {
            dom.btnU2A.classList.add('active');
            dom.btnA2U.classList.remove('active');
        }
        
        // Clear input to prevent confusion when switching domains
        dom.inputText.value = '';
        dom.outputText.value = '';
        
        applyLanguage();
        updateStats();
    }

    dom.btnA2U.addEventListener('click', () => setMode('a2u'));
    dom.btnU2A.addEventListener('click', () => setMode('u2a'));

    // --- Stats (Char/Word Count) ---
    function countWords(str) {
        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    function updateStats() {
        const t = i18n[currentLang];
        
        const inLen = dom.inputText.value.length;
        const inWords = countWords(dom.inputText.value);
        dom.inputStats.textContent = `${inLen} ${t.chars} · ${inWords} ${t.words}`;
        
        const outLen = dom.outputText.value.length;
        const outWords = countWords(dom.outputText.value);
        dom.outputStats.textContent = `${outLen} ${t.chars} · ${outWords} ${t.words}`;
    }

    // --- Conversion Logic ---
    let convertTimeout;
    function triggerConversion() {
        // Simple debounce
        clearTimeout(convertTimeout);
        convertTimeout = setTimeout(() => {
            const text = dom.inputText.value;
            const converted = KPConverter.convert(text, currentMode);
            dom.outputText.value = converted;
            updateStats();
        }, 50);
    }

    dom.inputText.addEventListener('input', triggerConversion);

    // --- Actions ---
    dom.btnClear.addEventListener('click', () => {
        dom.inputText.value = '';
        dom.outputText.value = '';
        updateStats();
        dom.inputText.focus();
    });

    dom.btnCopy.addEventListener('click', async () => {
        const text = dom.outputText.value;
        if (!text) return;
        
        try {
            await navigator.clipboard.writeText(text);
            const t = i18n[currentLang];
            
            // Visual feedback
            const originalHTML = dom.btnCopy.innerHTML;
            dom.btnCopy.classList.add('btn-success');
            dom.btnCopy.innerHTML = `<svg class="icon"><polyline points="20 6 9 17 4 12"></polyline></svg> ${t.copied}`;
            
            setTimeout(() => {
                dom.btnCopy.classList.remove('btn-success');
                dom.btnCopy.innerHTML = originalHTML;
            }, 2000);
            
        } catch (err) {
            console.error('Failed to copy text: ', err);
            // Fallback for older browsers
            dom.outputText.select();
            document.execCommand('copy');
        }
    });

    // --- Init ---
    initTheme();
    initLanguage();
    setMode('a2u'); // Initializes language labels and stats as well
});

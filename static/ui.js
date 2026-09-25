/**
 * KPWorks Converter UI Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & DOM Elements ---
    let currentMode = 'a2u'; // 'a2u' or 'u2a'
    let currentLang = localStorage.getItem('kpworks_lang') || 'en';
    let currentTheme = localStorage.getItem('kpworks_theme') || 'light';

    const dom = {
        btnA2U: document.getElementById('btnA2U'),
        btnU2A: document.getElementById('btnU2A'),
        inputPanelTitle: document.getElementById('inputPanelTitle'),
        outputPanelTitle: document.getElementById('outputPanelTitle'),
        inputText: document.getElementById('inputText'),
        outputText: document.getElementById('outputText'),
        btnPaste: document.getElementById('btnPaste'),
        btnClear: document.getElementById('btnClear'),
        btnCopy: document.getElementById('btnCopy'),
        inputStats: document.getElementById('inputStats'),
        outputStats: document.getElementById('outputStats'),
        brandSubtitle: document.querySelector('.brand-subtitle'),
        langSelectVal: document.getElementById('langSelectVal'),
        themeSelectVal: document.getElementById('themeSelectVal')
    };

    // --- Translations ---
    const i18n = {
        en: {
            brandSubtitle: "Kannada ASCII ↔ Unicode Converter",
            modeA2U: "ASCII → Unicode",
            modeU2A: "Unicode → ASCII",
            inputA2UTitle: "Input (ASCII / Nudi / Baraha)",
            outputA2UTitle: "Output (Unicode Kannada)",
            inputU2ATitle: "Input (Unicode Kannada)",
            outputU2ATitle: "Output (ASCII / Nudi / Baraha)",
            inputPlaceholder: "Type or paste your text here...",
            outputPlaceholder: "Converted text will appear here",
            paste: "Paste",
            pasted: "Pasted ✓",
            clear: "Clear",
            copy: "Copy",
            copied: "Copied ✓",
            chars: "characters",
            words: "words",
            themeLight: "☀ Light",
            themeDark: "◐ Dark",
            themeSystem: "🖥 System",
            langEn: "English",
            langKn: "ಕನ್ನಡ"
        },
        kn: {
            brandSubtitle: "ಕನ್ನಡ ಆಸ್ಕಿ ↔ ಯುನಿಕೋಡ್ ಪರಿವರ್ತಕ",
            modeA2U: "ಆಸ್ಕಿ → ಯುನಿಕೋಡ್",
            modeU2A: "ಯುನಿಕೋಡ್ → ಆಸ್ಕಿ",
            inputA2UTitle: "ಇನ್ಪುಟ್ (ಆಸ್ಕಿ / ನುಡಿ / ಬರಹ)",
            outputA2UTitle: "ಔಟ್ಪುಟ್ (ಯುನಿಕೋಡ್ ಕನ್ನಡ)",
            inputU2ATitle: "ಇನ್ಪುಟ್ (ಯುನಿಕೋಡ್ ಕನ್ನಡ)",
            outputU2ATitle: "ಔಟ್ಪುಟ್ (ಆಸ್ಕಿ / ನುಡಿ / ಬರಹ)",
            inputPlaceholder: "ಇಲ್ಲಿ ಬರೆಯಿರಿ ಅಥವಾ ಅಂಟಿಸಿ...",
            outputPlaceholder: "ಬದಲಾವಣೆಗೊಂಡ ಪಠ್ಯ ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತದೆ",
            paste: "ಅಂಟಿಸಿ",
            pasted: "ಅಂಟಿಸಲಾಗಿದೆ ✓",
            clear: "ತೆರವುಗೊಳಿಸಿ",
            copy: "ನಕಲಿಸಿ",
            copied: "ನಕಲಿಸಲಾಗಿದೆ ✓",
            chars: "ಅಕ್ಷರಗಳು",
            words: "ಪದಗಳು",
            themeLight: "☀ ಲೈಟ್",
            themeDark: "◐ ಡಾರ್ಕ್",
            themeSystem: "🖥 ಸಿಸ್ಟಮ್",
            langEn: "English",
            langKn: "ಕನ್ನಡ"
        }
    };

    // --- Custom Dropdown Logic ---
    function setupDropdown(wrapperId, btnId, listId, onSelect, currentVal) {
        const wrapper = document.getElementById(wrapperId);
        const btn = document.getElementById(btnId);
        const list = document.getElementById(listId);
        const options = list.querySelectorAll('.custom-select-option');
        
        let focusedIndex = -1;

        function closeDropdown() {
            wrapper.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            options.forEach(opt => opt.classList.remove('focused'));
            focusedIndex = -1;
        }

        function openDropdown() {
            wrapper.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            // Find currently selected
            const selectedOpt = Array.from(options).findIndex(opt => opt.getAttribute('data-value') === currentVal());
            if (selectedOpt >= 0) {
                focusedIndex = selectedOpt;
                options[focusedIndex].classList.add('focused');
            }
        }

        function toggleDropdown() {
            if (wrapper.classList.contains('open')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        btn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!wrapper.classList.contains('open')) {
                    openDropdown();
                } else {
                    if (focusedIndex < options.length - 1) {
                        if (focusedIndex >= 0) options[focusedIndex].classList.remove('focused');
                        focusedIndex++;
                        options[focusedIndex].classList.add('focused');
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (wrapper.classList.contains('open') && focusedIndex > 0) {
                    options[focusedIndex].classList.remove('focused');
                    focusedIndex--;
                    options[focusedIndex].classList.add('focused');
                }
            }
        });

        options.forEach((opt, index) => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                onSelect(opt.getAttribute('data-value'));
                closeDropdown();
            });
            opt.addEventListener('mouseenter', () => {
                if (focusedIndex >= 0) options[focusedIndex].classList.remove('focused');
                focusedIndex = index;
                opt.classList.add('focused');
            });
        });

        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    function updateDropdownSelection(listId, val, labelElId, getLabelFn) {
        const options = document.querySelectorAll(`#${listId} .custom-select-option`);
        options.forEach(opt => {
            if (opt.getAttribute('data-value') === val) {
                opt.classList.add('selected');
                opt.setAttribute('aria-selected', 'true');
                if (labelElId) {
                    document.getElementById(labelElId).textContent = getLabelFn ? getLabelFn(val) : opt.textContent;
                }
            } else {
                opt.classList.remove('selected');
                opt.setAttribute('aria-selected', 'false');
            }
        });
    }

    // --- Theme Management ---
    function applyTheme(theme) {
        if (theme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
        } else {
            document.documentElement.setAttribute('data-theme', theme);
        }
    }

    function getThemeLabel(val) {
        const t = i18n[currentLang];
        if (val === 'light') return t.themeLight;
        if (val === 'dark') return t.themeDark;
        return t.themeSystem;
    }

    function refreshThemeLabels() {
        const t = i18n[currentLang];
        document.querySelector('#themeSelectList [data-value="light"]').textContent = t.themeLight;
        document.querySelector('#themeSelectList [data-value="dark"]').textContent = t.themeDark;
        document.querySelector('#themeSelectList [data-value="system"]').textContent = t.themeSystem;
        dom.themeSelectVal.textContent = getThemeLabel(currentTheme);
    }

    function initTheme() {
        applyTheme(currentTheme);
        updateDropdownSelection('themeSelectList', currentTheme, 'themeSelectVal', getThemeLabel);

        setupDropdown('themeSelectWrapper', 'themeSelectBtn', 'themeSelectList', (val) => {
            currentTheme = val;
            localStorage.setItem('kpworks_theme', currentTheme);
            applyTheme(currentTheme);
            updateDropdownSelection('themeSelectList', currentTheme, 'themeSelectVal', getThemeLabel);
        }, () => currentTheme);

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (currentTheme === 'system') applyTheme('system');
        });
    }

    // --- Language Management ---
    function applyLanguage() {
        const t = i18n[currentLang];
        
        // Update branding subtitle
        dom.brandSubtitle.textContent = t.brandSubtitle;
        
        // Update Buttons
        dom.btnA2U.textContent = t.modeA2U;
        dom.btnU2A.textContent = t.modeU2A;
        
        document.getElementById('pasteBtnText').textContent = t.paste;
        document.getElementById('clearBtnText').textContent = t.clear;
        
        // Ensure buttons text resets cleanly if it was mid-animation
        dom.btnCopy.classList.remove('btn-success');
        document.getElementById('copyBtnText').textContent = t.copy;
        dom.btnPaste.classList.remove('btn-success');
        
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
        
        // Update Theme Dropdown Labels
        refreshThemeLabels();
        
        // Update Language Dropdown Labels
        document.querySelector('#langSelectList [data-value="en"]').textContent = t.langEn;
        document.querySelector('#langSelectList [data-value="kn"]').textContent = t.langKn;
        dom.langSelectVal.textContent = currentLang === 'en' ? t.langEn : t.langKn;
        
        updateStats();
    }

    function initLanguage() {
        updateDropdownSelection('langSelectList', currentLang, 'langSelectVal', (val) => i18n[currentLang][val === 'en' ? 'langEn' : 'langKn']);
        
        setupDropdown('langSelectWrapper', 'langSelectBtn', 'langSelectList', (val) => {
            currentLang = val;
            localStorage.setItem('kpworks_lang', currentLang);
            applyLanguage();
            updateDropdownSelection('langSelectList', currentLang, 'langSelectVal', (val) => i18n[currentLang][val === 'en' ? 'langEn' : 'langKn']);
        }, () => currentLang);
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
    dom.btnPaste.addEventListener('click', async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Insert text at cursor position or append
                const start = dom.inputText.selectionStart;
                const end = dom.inputText.selectionEnd;
                const val = dom.inputText.value;
                dom.inputText.value = val.substring(0, start) + text + val.substring(end);
                dom.inputText.selectionStart = dom.inputText.selectionEnd = start + text.length;
                
                triggerConversion();
                
                // Visual feedback
                const t = i18n[currentLang];
                dom.btnPaste.classList.add('btn-success');
                document.getElementById('pasteBtnText').textContent = t.pasted;
                
                setTimeout(() => {
                    dom.btnPaste.classList.remove('btn-success');
                    document.getElementById('pasteBtnText').textContent = t.paste;
                }, 2000);
            }
        } catch (err) {
            console.error('Failed to read clipboard text: ', err);
            // Graceful fallback: just focus the input so user can ctrl+v
            dom.inputText.focus();
        }
    });

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
            dom.btnCopy.classList.add('btn-success');
            document.getElementById('copyBtnText').textContent = t.copied;
            
            setTimeout(() => {
                dom.btnCopy.classList.remove('btn-success');
                document.getElementById('copyBtnText').textContent = t.copy;
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

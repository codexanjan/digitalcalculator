document.addEventListener('DOMContentLoaded', () => {
    // Selectors
    const display = document.getElementById('display');
    const historyPreview = document.getElementById('historyPreview');
    const themeToggle = document.getElementById('themeToggle');
    const historyToggle = document.getElementById('historyToggle');
    const historyPanel = document.getElementById('historyPanel');
    const closeHistory = document.getElementById('closeHistory');
    const clearHistoryBtn = document.getElementById('clearHistory');
    const historyList = document.getElementById('historyList');
    const sciPanel = document.getElementById('scientificPanel');
    const voiceInputToggle = document.getElementById('voiceInputToggle');
    const memoryIndicator = document.getElementById('memoryIndicator');
    const buttons = document.querySelectorAll('.btn');

    // State
    let currentInput = '0';
    let memory = 0;
    let history = JSON.parse(localStorage.getItem('calcHistory')) || [];
    let isDarkTheme = true;
    let shouldResetInput = false;

    // Initialize
    renderHistory();
    updateMemoryIndicator();

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        isDarkTheme = !document.body.classList.contains('light-mode');
        themeToggle.innerHTML = isDarkTheme ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    });

    // History Panel Toggles
    historyToggle.addEventListener('click', () => {
        historyPanel.classList.remove('hidden');
    });
    closeHistory.addEventListener('click', () => {
        historyPanel.classList.add('hidden');
    });

    clearHistoryBtn.addEventListener('click', () => {
        history = [];
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    });

    // Handle Button Clicks
    buttons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            createRipple(e, btn);
            playClickSound();
            const action = btn.getAttribute('data-action');
            const value = btn.getAttribute('data-value');
            handleInput(action, value);
        });
    });

    // Keyboard Support
    document.addEventListener('keydown', (e) => {
        const keyMap = {
            'Enter': { action: 'calculate' },
            '=': { action: 'calculate' },
            'Backspace': { action: 'delete' },
            'Escape': { action: 'clear' },
            '+': { action: 'operator', value: '+' },
            '-': { action: 'operator', value: '-' },
            '*': { action: 'operator', value: '×' },
            '/': { action: 'operator', value: '÷' },
            '.': { action: 'number', value: '.' },
            '(': { action: 'sci', value: '(' },
            ')': { action: 'sci', value: ')' },
            '^': { action: 'sci', value: '^' },
            '!': { action: 'sci', value: '!' },
        };

        if (e.key >= '0' && e.key <= '9') {
            initAudio();
            handleInput('number', e.key);
            playClickSound();
        } else if (keyMap[e.key]) {
            e.preventDefault();
            initAudio();
            handleInput(keyMap[e.key].action, keyMap[e.key].value);
            playClickSound();
        } else if (e.key.toLowerCase() === 'c' && e.ctrlKey) {
            navigator.clipboard.writeText(display.innerText);
        }
    });

    // Core Logic
    function handleInput(action, value) {
        if (display.innerText === 'Error') {
            currentInput = '0';
            shouldResetInput = false;
        }

        switch(action) {
            case 'number':
                if (shouldResetInput) {
                    currentInput = value === '.' ? '0.' : value;
                    shouldResetInput = false;
                } else {
                    if (currentInput === '0' && value !== '.') {
                        currentInput = value;
                    } else {
                        currentInput += value;
                    }
                }
                updateDisplay();
                break;
            case 'operator':
            case 'sci':
                shouldResetInput = false;
                if (currentInput === '0' && value !== '.' && value !== '(' && !value.endsWith('(')) {
                    currentInput = value;
                } else if (currentInput === '0' && (value === '(' || value.endsWith('('))) {
                    currentInput = value;
                } else {
                    currentInput += value;
                }
                updateDisplay();
                break;
            case 'clear':
                currentInput = '0';
                historyPreview.innerText = '';
                shouldResetInput = false;
                updateDisplay();
                break;
            case 'delete':
                if (shouldResetInput) {
                    historyPreview.innerText = '';
                    shouldResetInput = false;
                } else if (currentInput.length > 1) {
                    currentInput = currentInput.slice(0, -1);
                } else {
                    currentInput = '0';
                }
                updateDisplay();
                break;
            case 'calculate':
                if (!currentInput || currentInput === '0') return;
                try {
                    const result = sanitizeAndEvaluate(currentInput);
                    historyPreview.innerText = currentInput + ' =';
                    
                    if (result !== 'Error') {
                        saveHistory(currentInput, result);
                    }
                    
                    currentInput = result.toString();
                    shouldResetInput = true;
                    updateDisplay();
                } catch (e) {
                    currentInput = 'Error';
                    updateDisplay();
                }
                break;
            case 'toggle-sci':
                sciPanel.classList.toggle('hidden');
                break;
            case 'toggle-sign':
                if (currentInput !== '0' && currentInput !== 'Error') {
                    if (currentInput.startsWith('-')) {
                        currentInput = currentInput.slice(1);
                    } else {
                        currentInput = '-' + currentInput;
                    }
                    updateDisplay();
                }
                break;
            case 'memory-add':
                memory += parseFloat(currentInput) || 0;
                updateMemoryIndicator();
                shouldResetInput = true;
                break;
            case 'memory-subtract':
                memory -= parseFloat(currentInput) || 0;
                updateMemoryIndicator();
                shouldResetInput = true;
                break;
            case 'memory-read':
                currentInput = memory.toString();
                shouldResetInput = true;
                updateDisplay();
                break;
            case 'memory-clear':
                memory = 0;
                updateMemoryIndicator();
                break;
        }
    }

    function updateDisplay() {
        display.innerText = currentInput || '0';
        
        // Dynamic font size for long numbers
        if (currentInput.length > 12) {
            display.style.fontSize = '2rem';
        } else if (currentInput.length > 8) {
            display.style.fontSize = '2.5rem';
        } else {
            display.style.fontSize = '3.5rem';
        }
        
        display.scrollLeft = display.scrollWidth;
    }

    function updateMemoryIndicator() {
        if (memory !== 0) {
            memoryIndicator.classList.remove('hidden');
        } else {
            memoryIndicator.classList.add('hidden');
        }
    }

    function sanitizeAndEvaluate(expression) {
        try {
            // Check for invalid strings early to prevent injection
            let validationStr = expression
                .replace(/sin\(/g, '')
                .replace(/cos\(/g, '')
                .replace(/tan\(/g, '')
                .replace(/log\(/g, '')
                .replace(/ln\(/g, '')
                .replace(/sqrt\(/g, '')
                .replace(/[0-9.+\-×÷%()^!πe]/g, '')
                .trim();
                
            if (validationStr.length > 0) {
                throw new Error('Invalid Input');
            }

            // Safe replacements
            let expr = expression
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/\be\b/g, 'Math.E')
                .replace(/sin\(/g, 'Math.sin(')
                .replace(/cos\(/g, 'Math.cos(')
                .replace(/tan\(/g, 'Math.tan(')
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/sqrt\(/g, 'Math.sqrt(')
                .replace(/\^/g, '**');

            // Replace simple factorials like 5!
            expr = expr.replace(/(\d+(\.\d+)?)!/g, 'factorial($1)');

            const factorial = (n) => {
                const num = parseFloat(n);
                if (num < 0 || !Number.isInteger(num)) return NaN;
                if (num === 0 || num === 1) return 1;
                let res = 1;
                for(let i = 2; i <= num; i++) res *= i;
                return res;
            };

            const func = new Function('factorial', `return ${expr}`);
            let result = func(factorial);

            if (!isFinite(result) || isNaN(result)) {
                return 'Error';
            }

            // Fix floating point precision
            return Math.round(result * 1e10) / 1e10;
        } catch (error) {
            return 'Error';
        }
    }

    function saveHistory(expr, res) {
        history.unshift({ expr, res });
        if (history.length > 20) history.pop(); // Keep only last 20
        localStorage.setItem('calcHistory', JSON.stringify(history));
        renderHistory();
    }

    function renderHistory() {
        historyList.innerHTML = '';
        history.forEach(item => {
            const div = document.createElement('div');
            div.className = 'history-item';
            div.innerHTML = `<div class="expr">${item.expr} =</div><div class="res">${item.res}</div>`;
            div.addEventListener('click', () => {
                currentInput = item.res.toString();
                historyPreview.innerText = item.expr + ' =';
                shouldResetInput = true;
                updateDisplay();
                historyPanel.classList.add('hidden');
            });
            historyList.appendChild(div);
        });
    }

    function createRipple(event, button) {
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        
        const x = event.clientX - rect.left - radius;
        const y = event.clientY - rect.top - radius;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${x}px`;
        circle.style.top = `${y}px`;
        circle.classList.add('ripple');

        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        button.appendChild(circle);
    }

    // Voice Input Integration
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        voiceInputToggle.addEventListener('click', () => {
            try {
                recognition.start();
                voiceInputToggle.classList.add('pulse');
            } catch(e) {
                // Ignore if already started
            }
        });

        recognition.onresult = (event) => {
            let transcript = event.results[0][0].transcript.toLowerCase();
            transcript = transcript
                .replace(/plus/g, '+')
                .replace(/minus/g, '-')
                .replace(/times/g, '×')
                .replace(/multiply by/g, '×')
                .replace(/multiplied by/g, '×')
                .replace(/divided by/g, '÷')
                .replace(/divide/g, '÷')
                .replace(/over/g, '÷')
                .replace(/equals/g, '')
                .replace(/square root of/g, 'sqrt(')
                .replace(/ /g, '');
            
            if (currentInput === '0' || shouldResetInput) {
                currentInput = '';
                shouldResetInput = false;
            }
            
            currentInput += transcript;
            updateDisplay();
            
            try {
                // Auto calculate if it seems like a complete expression
                const res = sanitizeAndEvaluate(currentInput);
                if (res !== 'Error') {
                    historyPreview.innerText = currentInput + ' =';
                    saveHistory(currentInput, res);
                    currentInput = res.toString();
                    shouldResetInput = true;
                    updateDisplay();
                }
            } catch(e) {}
        };

        recognition.onend = () => {
            voiceInputToggle.classList.remove('pulse');
        };
        recognition.onerror = () => {
            voiceInputToggle.classList.remove('pulse');
        };
    } else {
        voiceInputToggle.style.display = 'none';
    }
});

// Sound System (Global)
let audioCtx;
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playClickSound() {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(600, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.05);
    
    gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.05);
}

// Initialize audio context on first user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('keydown', initAudio, { once: true });

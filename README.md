# Advanced Glassmorphism Calculator

> **Made by Anjan Shetty**

A modern, responsive, and feature-rich calculator web application built with HTML5, CSS3, and Vanilla JavaScript (ES6).

## Features
- **Basic & Scientific Operations:** Supports a wide range of mathematical operations including trigonometry, logarithms, exponentials, factorials, and more.
- **Glassmorphism UI:** A sleek, modern design with an animated background gradient, smooth transitions, and ripple hover effects.
- **Dark/Light Mode:** Toggle seamlessly between beautifully curated dark and light themes.
- **Calculation History:** Automatically saves your past calculations using LocalStorage. View and recall previous results anytime.
- **Memory Functions:** Standard memory operations (MC, MR, M-, M+) with visual indicators.
- **Keyboard Support:** Full keyboard accessibility for rapid calculations.
- **Voice Input:** Uses the experimental Web Speech API to input calculations via voice commands (on supported browsers).
- **Sound Effects:** Subtle synthesized audio feedback on interaction.
- **Responsive Design:** Mobile-first design ensures the calculator looks and feels great on any screen size.
- **Secure Evaluation:** Safely parses and evaluates mathematical expressions without directly exposing raw input to the global `eval` context.

## Technologies Used
- **HTML5:** Semantic structure and accessibility markers.
- **CSS3:** Vanilla CSS with Custom Properties (Variables) for theming, Flexbox/Grid for layout, and Keyframe animations.
- **JavaScript (ES6+):** Pure vanilla JavaScript for state management, history storage, mathematical parsing, and DOM manipulation. No external libraries are required.

## How to Run
Simply open `index.html` in any modern web browser. No build steps, dependencies, or local servers are required!

## Keyboard Shortcuts
- `0-9` & `.`: Numbers and decimal
- `+ - * /`: Basic Operators
- `Enter` or `=`: Calculate result
- `Backspace`: Delete last character
- `Escape`: Clear all (C)
- `Ctrl + C`: Copy current result to clipboard

## Developer Notes
All code is structured directly in the `calculator-app` folder:
- `index.html`: Contains the UI structure and FontAwesome imports for icons.
- `style.css`: Contains the theming variables, layout styles, and animations.
- `script.js`: Contains event listeners, history management, math evaluation logic, and audio synthesis.

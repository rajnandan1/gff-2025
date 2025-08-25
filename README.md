# GFF 2025 – Cashfree Display & Input Test

Vanilla HTML/CSS/JS demo page used at Global Fintech Festival 2025 to quickly verify a target device / kiosk display:

-   JavaScript execution
-   Page navigation / redirection
-   Color gamut & gradient banding
-   Contrast & fine checker sharpness
-   Motion smoothness / frame pacing (approx FPS)
-   Dynamic background / brightness adaptation
-   Multi‑touch (count, coordinates, pressure/force if available)
-   High DPI 1px alternating line clarity

## Files

-   `index.html` – Main test hub inside iPhone mock (`iphonemock.png`).
-   `touch-test.html` – Dedicated multi‑touch capture page.
-   `styles.css` – Layout + visual test styles / animations.
-   `scripts.js` – All interactive logic.
-   `iphonemock.png` – Device frame graphic (provided in repository root).

## Quick Use

Open `index.html` locally (no build needed). If using a local server (for best cross‑origin image caching), any simple static server works.

### Main Page Tests

1. Logo loads (network reachability / image decoding).
2. Press “JS Action Test” – counter increments + ripple created (verifies JS & DOM updates).
3. Press “Go To Multi‑Touch Page” – navigates to `touch-test.html` after a short delay.
4. Inspect color swatches & gradients for banding or tint.
5. Checker bars (fine / medium / coarse) show aliasing & subpixel behavior.
6. Animated ball + scanning bars: Toggle motion; watch for stutter / dropped frames. FPS label approximates browser frame rate.
7. Cycle BG button rotates themed background gradients to test brightness/contrast.
8. Top 1px alternating line canvas tests high DPI rendering crispness.

### Multi‑Touch Page

-   Touch inside the large capture area: each finger shows a numbered glowing dot and leaves a short trail.
-   Stats panel: Active, total since load, maximum concurrent, last event, pressure values (0–1) if the hardware supplies `force` or `pressure`.
-   Recent gestures log keeps last ~25 lines.
-   Back button returns using browser history; Home link returns explicitly.

## Implementation Notes

-   All logic is framework‑free; a single `scripts.js` auto‑detects which page is loaded.
-   FPS is derived by counting animation frames; it’s approximate and may differ from system tools.
-   Background cycles apply body classes `bg-alt-*` to vary gradients.
-   Ripple & touch trails rely on CSS animations & dynamically constructed gradients.
-   Touch events call `preventDefault` to avoid scrolling inside the capture area and to ensure multi‑finger tracking.

## Extending

Add more test utilities (e.g., orientation lock prompts, sensor tests, haptic patterns) by editing existing files. Keep dependencies zero to simplify deployment.

## License

Demo code © 2025 Cashfree (sample) – adapt as needed for internal testing.

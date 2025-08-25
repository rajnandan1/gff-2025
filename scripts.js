/* GFF 2025 Cashfree Display + Input Test Script */
(function () {
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    const isTouchPage = location.pathname.endsWith("touch-test.html");

    // JS Action Test
    let jsCount = 0;
    function initIndexPage() {
        const jsBtn = $("#jsTestBtn");
        const redirectBtn = $("#redirectBtn");
        const result = $("#jsTestResult");
        if (jsBtn) {
            jsBtn.addEventListener("click", (e) => {
                jsCount++;
                const t = performance.now().toFixed(1);
                result.textContent = `JS OK – clicks: ${jsCount} (t=${t}ms)`;
                // create ephemeral ripple to visualize frame pacing
                const ripple = document.createElement("span");
                ripple.className = "ripple";
                const rect = jsBtn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                ripple.style.left = x + "px";
                ripple.style.top = y + "px";
                jsBtn.appendChild(ripple);
                setTimeout(() => ripple.remove(), 900);
            });
        }
        if (redirectBtn) {
            redirectBtn.addEventListener("click", () => {
                result.textContent = "Navigating to multi-touch page…";
                setTimeout(() => {
                    window.location.href = redirectBtn.dataset.target;
                }, 200);
            });
        }
        initMotion();
        initBackgroundCycle();
        drawHiDPILines();
    }

    // Motion & FPS
    let motionEnabled = true;
    let lastFrame = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;
    function initMotion() {
        const ball = $("#animBall");
        const bars = $("#scanBars");
        const toggle = $("#toggleMotion");
        const fpsLabel = $("#fps");
        if (!ball || !toggle) return;

        let angle = 0;
        function animate() {
            if (motionEnabled) {
                angle += 0.035; // speed
                const r = 48; // radius
                ball.style.transform = `translate(calc(-50% + ${
                    Math.sin(angle) * r
                }px), calc(-50% + ${Math.cos(angle * 1.2) * r}px))`;
                frameCount++;
                const now = performance.now();
                if (now - fpsTimer > 1000) {
                    const fps = Math.round(
                        (frameCount * 1000) / (now - fpsTimer)
                    );
                    fpsLabel && (fpsLabel.textContent = "FPS: " + fps);
                    fpsTimer = now;
                    frameCount = 0;
                }
            }
            requestAnimationFrame(animate);
        }
        fpsTimer = performance.now();
        animate();

        toggle.addEventListener("click", () => {
            motionEnabled = !motionEnabled;
            toggle.textContent = motionEnabled
                ? "Pause Motion"
                : "Resume Motion";
        });
    }

    function initBackgroundCycle() {
        const btn = $("#changeBg");
        if (!btn) return;
        const classes = [
            "bg-alt-0",
            "bg-alt-1",
            "bg-alt-2",
            "bg-alt-3",
            "bg-alt-4",
        ];
        let idx = 0;
        btn.addEventListener("click", () => {
            document.body.classList.remove(...classes);
            idx = (idx + 1) % classes.length;
            if (idx > 0) document.body.classList.add(classes[idx]);
        });
    }

    function drawHiDPILines() {
        const screen = $(".app-screen");
        const canvas = $("#lineTest");
        if (!canvas) return; // optional
        canvas.width = screen.clientWidth * window.devicePixelRatio;
        canvas.height = 40 * window.devicePixelRatio;
        canvas.style.width = "100%";
        canvas.style.height = "40px";
        const ctx = canvas.getContext("2d");
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        for (let i = 0; i < screen.clientWidth; i++) {
            ctx.fillStyle = i % 2 === 0 ? "#fff" : "#000";
            ctx.fillRect(i, 0, 1, 20);
        }
        for (let i = 0; i < screen.clientWidth; i += 10) {
            ctx.fillStyle = "#44d6ff";
            ctx.fillRect(i, 22, 5, 16);
        }
        // Debounced resize redraw for line test
        let resizeTO;
        window.addEventListener("resize", () => {
            clearTimeout(resizeTO);
            resizeTO = setTimeout(drawHiDPILines, 150);
        });
    }

    // Touch Page Logic
    function initTouchPage() {
        const area = $("#touchArea");
        if (!area) return;
        const activeCountEl = $("#activeCount");
        const totalTouchesEl = $("#totalTouches");
        const maxConcurrentEl = $("#maxConcurrent");
        const lastEventEl = $("#lastEvent");
        const pressureList = $("#pressureList");
        const gestureLog = $("#gestureLog");

        let totalTouches = 0;
        let maxConcurrent = 0;
        const touchPoints = new Map();

        function log(msg) {
            const li = document.createElement("li");
            li.textContent = msg;
            gestureLog.prepend(li);
            while (gestureLog.children.length > 25)
                gestureLog.lastChild.remove();
        }

        function spawnDot(id, x, y, force) {
            let dot = document.createElement("div");
            dot.className = "touch-dot";
            dot.style.cssText = `position:absolute;left:${x - 18}px;top:${
                y - 18
            }px;width:36px;height:36px;border-radius:50%;background:radial-gradient(circle at 30% 30%,rgba(255,255,255,.9),rgba(68,214,255,.7),rgba(157,116,255,.5));mix-blend-mode:screen;pointer-events:none;`;
            dot.dataset.id = id;
            const label = document.createElement("span");
            label.textContent = id;
            label.style.cssText =
                "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:10px;color:#000;font-weight:600;";
            dot.appendChild(label);
            area.appendChild(dot);
            touchPoints.set(id, { dot, lastX: x, lastY: y, path: [] });
        }

        function updateDot(id, x, y, force) {
            const tp = touchPoints.get(id);
            if (!tp) return;
            tp.dot.style.left = x - 18 + "px";
            tp.dot.style.top = y - 18 + "px";
            tp.path.push([x, y]);
            if (tp.path.length > 60) tp.path.shift();
            // path drawing using shadow trail
            const trail = tp.path
                .map(
                    (p, i) =>
                        `radial-gradient(circle at ${
                            p[0] - tp.path[0][0] + 18
                        }px ${p[1] - tp.path[0][1] + 18}px, rgba(157,116,255,${
                            (i / tp.path.length) * 0.4
                        }), transparent ${18 + i / 1.2}px)`
                )
                .join(",");
            tp.dot.style.background = trail || tp.dot.style.background;
        }

        function removeDot(id) {
            const tp = touchPoints.get(id);
            if (!tp) return;
            tp.dot.style.transition = "opacity .4s, transform .4s";
            tp.dot.style.opacity = "0";
            tp.dot.style.transform = "scale(.4)";
            setTimeout(() => tp.dot.remove(), 420);
            touchPoints.delete(id);
        }

        function refreshStats(evtType) {
            activeCountEl.textContent = touchPoints.size;
            maxConcurrent = Math.max(maxConcurrent, touchPoints.size);
            maxConcurrentEl.textContent = maxConcurrent;
            totalTouchesEl.textContent = totalTouches;
            lastEventEl.textContent = evtType;
            // pressures
            pressureList.innerHTML = "";
            [...touchPoints.keys()].forEach((id) => {
                const tpTouch = [...(window.lastTouches || [])].find(
                    (t) => t.identifier === id
                );
                const force = tpTouch
                    ? tpTouch.force || tpTouch.pressure || 0
                    : 0;
                const div = document.createElement("div");
                div.className = "pressure-item";
                div.textContent = `ID ${id}: ${force.toFixed(2)}`;
                pressureList.appendChild(div);
            });
        }

        ["touchstart", "touchmove", "touchend", "touchcancel"].forEach(
            (type) => {
                area.addEventListener(
                    type,
                    (ev) => {
                        window.lastTouches = ev.touches;
                        if (type === "touchstart") {
                            totalTouches += ev.changedTouches.length;
                            for (const t of ev.changedTouches) {
                                spawnDot(
                                    t.identifier,
                                    t.clientX -
                                        area.getBoundingClientRect().left,
                                    t.clientY -
                                        area.getBoundingClientRect().top,
                                    t.force || t.pressure || 0
                                );
                            }
                            log(`start (${ev.touches.length} active)`);
                        } else if (type === "touchmove") {
                            for (const t of ev.changedTouches) {
                                updateDot(
                                    t.identifier,
                                    t.clientX -
                                        area.getBoundingClientRect().left,
                                    t.clientY -
                                        area.getBoundingClientRect().top,
                                    t.force || t.pressure || 0
                                );
                            }
                        } else if (
                            type === "touchend" ||
                            type === "touchcancel"
                        ) {
                            for (const t of ev.changedTouches) {
                                removeDot(t.identifier);
                            }
                            log(
                                `${type.replace("touch", "")} (${
                                    ev.touches.length
                                } remain)`
                            );
                        }
                        refreshStats(type);
                        ev.preventDefault();
                    },
                    { passive: false }
                );
            }
        );
    }

    // Ripple style appended programmatically to avoid clutter
    const rippleStyle = document.createElement("style");
    rippleStyle.textContent = `.ripple{position:absolute;width:10px;height:10px;background:rgba(255,255,255,.6);border-radius:50%;translate:-50% -50%;animation:ripple .9s ease-out forwards;mix-blend-mode:overlay;}@keyframes ripple{0%{opacity:1;transform:scale(.6);}80%{opacity:.2;}100%{opacity:0;transform:scale(12);}}`;
    document.head.appendChild(rippleStyle);

    if (isTouchPage) initTouchPage();
    else initIndexPage();
})();

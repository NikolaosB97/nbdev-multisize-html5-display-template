import { createAd } from "../../core/core.js";
import { createLooper } from "../../core/loop.js";
import { rafThrottle } from "../../core/utils.js";
import config from "./config.js";

const DEBUG = true;

createAd({
  config,
  debug: DEBUG,
  init: () => {
    const root = document.getElementById("adRoot");
    const closeBtn = document.getElementById("closeBtn");

    const looper = createLooper({ maxLoops: config.maxLoops, debug: DEBUG });

    let collapsed = false;
    let killed = false;
    let lockedCollapsed = false; // Only the X button permanently locks the collapsed state
    let autoCollapseTimer = null;

    function setCollapsed(v) {
      collapsed = v;
      root.classList.toggle("is-collapsed", v);
      root.classList.toggle("is-expanded", !v);
    }

    function collapse(reason = "manual") {
      if (killed) return;
      if (collapsed) return;
      if (DEBUG) console.log("[DH] collapse:", reason);

      // Only the close button should lock the unit in a collapsed/closed state
      if (reason === "close") {
        lockedCollapsed = true;
      }

      setCollapsed(true);

      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = null;
      }

      gsap.to(".hero", { autoAlpha: 0, y: -8, duration: 0.35, overwrite: true });
      gsap.to(".barRight", { autoAlpha: 1, duration: 0.25, overwrite: true });
    }

    function expand() {
      if (lockedCollapsed) return;
      setCollapsed(false);
      gsap.set(".hero", { autoAlpha: 1, y: 0 });
    }

    // Initial visual state
    expand();
    gsap.set(".barRight", { autoAlpha: 1 });

    // Animation timeline (runs only while expanded)
    const tl = gsap.timeline({ paused: true });

    tl.from(".headline", { y: 10, autoAlpha: 0, duration: 0.6 })
      .from(".sub", { y: 8, autoAlpha: 0, duration: 0.45 }, "-=0.2")
      .from(".ctaBig", { y: 8, autoAlpha: 0, duration: 0.45 }, "-=0.15")
      .from(".heroRight img", { scale: 0.92, autoAlpha: 0, duration: 0.6 }, "-=0.35")
      .from(".price", { y: 6, autoAlpha: 0, duration: 0.45 }, "-=0.25")
      .to({}, { duration: 1.8 });

    function playCycle() {
      if (killed) return;

      // Always start a loop from the expanded state
      expand();

      tl.restart();
      looper.markLoop();

      tl.eventCallback("onComplete", () => {
        if (killed || lockedCollapsed) return;

        if (looper.canLoop()) {
          setTimeout(() => playCycle(), 900);
        } else {
          autoCollapseTimer = setTimeout(() => collapse("auto"), config.autoCollapseMs);
        }
      });
    }

    // Close (X): TV-off style shutdown animation
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (DEBUG) console.log("[DH] close clicked");

      lockedCollapsed = true;
      killed = true;

      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = null;
      }

      try { tl.kill(); } catch (_) {}

      // Disable interactions right away
      const clickLayer = document.getElementById("clickLayer");
      if (clickLayer) clickLayer.style.pointerEvents = "none";
      closeBtn.style.pointerEvents = "none";

      // Start from the current rendered height (important if the unit is mid-resize)
      const currentHeight = root.getBoundingClientRect().height;
      gsap.set(root, {
        height: Math.max(currentHeight, 0) + "px",
        overflow: "hidden",
        willChange: "height, opacity, transform",
        transformOrigin: "50% 50%"
      });

      // Fade internal content first so the TV-off effect looks clean
      gsap.to([".hero", ".bar", ".closeBtn"], { autoAlpha: 0, duration: 0.12, overwrite: true });

      // TV-off: collapse to a thin horizontal line, then pinch + fade out
      const tvTl = gsap.timeline({ defaults: { overwrite: true } });
      tvTl
        .to(root, { height: "6px", duration: 0.55, ease: "power2.in" })
        .to(root, { scaleX: 0.02, duration: 0.18, ease: "power1.in" }, "-=0.06")
        .to(root, { autoAlpha: 0, duration: 0.12, ease: "none" }, "-=0.08")
        .set(root, { height: "0px", scaleX: 1 });

      setCollapsed(true);
    });

    // Kick things off
    playCycle();

    // Scroll-driven resize (Codevelop-style, fully reversible)
    const maxScroll = Math.max(config.collapseOnScrollY || 0, 500);

    const cssRoot = () => getComputedStyle(document.documentElement);
    const readHeights = () => {
      const css = cssRoot();
      const expandedH = parseInt(css.getPropertyValue("--h-expanded"), 10) || 300;
      const collapsedH = parseInt(css.getPropertyValue("--h-collapsed"), 10) || 90;
      return { expandedH, collapsedH, delta: expandedH - collapsedH };
    };

    let { expandedH, collapsedH, delta } = readHeights();

    const onScroll = rafThrottle(() => {
      if (killed || root.style.height === "0px") return;

      const y = window.scrollY || 0;
      const progress = Math.min(Math.max(y / maxScroll, 0), 1);

      const currentH = expandedH - (delta * progress);
      root.style.height = currentH + "px";

      // Optional: fade the hero as we collapse
      gsap.set(".hero", { autoAlpha: 1 - progress });

      if (progress > 0.98) setCollapsed(true);
      else setCollapsed(false);
    });

    window.addEventListener("scroll", onScroll);

    window.addEventListener("resize", rafThrottle(() => {
      ({ expandedH, collapsedH, delta } = readHeights());
      onScroll();
    }));
  }
});
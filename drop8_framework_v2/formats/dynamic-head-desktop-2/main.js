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
    const clickLayer = document.getElementById("clickLayer");
    const heroVideo = document.getElementById("heroVideo");

    const looper = createLooper({ maxLoops: config.maxLoops, debug: DEBUG });

    let killed = false;
    let lockedClosed = false;
    let autoCollapseTimer = null;

    // Keep the unit fixed for a while (dynamic header effect), then auto-close if not dismissed.
    const HOLD_MS = (config.behavior && typeof config.behavior.holdMs === "number")
      ? config.behavior.holdMs
      : 20000;
    let autoCloseTimer = null;

    let collapsed = false;
    let isAnimatingState = false;

    // Always start in expanded mode. Enable collapse/expand only after the first real scroll,
    // so it doesn't start already split if the browser restores scroll position on refresh.
    let userHasScrolled = false;

    // Minimal intro animation: simple and stable (better for publisher previews).
    const tl = gsap.timeline({ paused: true });
    tl.from(".bar .logo", { y: -6, autoAlpha: 0, duration: 0.35 })
      .from(".barRight", { y: -6, autoAlpha: 0, duration: 0.30 }, "-=0.20")
      .to({}, { duration: 1.0 });

    function playCycle() {
      if (killed || lockedClosed || collapsed) return;

      tl.restart();
      looper.markLoop();

      tl.eventCallback("onComplete", () => {
        if (killed || lockedClosed) return;

        if (looper.canLoop()) {
          setTimeout(() => playCycle(), 800);
        } else {
          autoCollapseTimer = setTimeout(() => {
            if (DEBUG) console.log("[DH-D] loops done");
          }, config.autoCollapseMs);
        }
      });
    }

    const closeAd = (reason = "x") => {
      if (killed || lockedClosed) return;

      lockedClosed = true;
      killed = true;

      // Stop all pending timers (loops / auto-close / etc.).
      if (autoCollapseTimer) {
        clearTimeout(autoCollapseTimer);
        autoCollapseTimer = null;
      }
      if (autoCloseTimer) {
        clearTimeout(autoCloseTimer);
        autoCloseTimer = null;
      }

      // Safely kill the intro timeline.
      try { tl.kill(); } catch (_) {}

      // Disable any clickthrough after closing.
      if (clickLayer) clickLayer.style.pointerEvents = "none";

      // Pause the video to avoid CPU/audio usage after close.
      if (heroVideo) {
        try { heroVideo.pause(); } catch (_) {}
      }

      // Clean and predictable exit animation (publisher-friendly behavior).
      gsap.killTweensOf(root);
      gsap.to(root, {
        height: 0,
        autoAlpha: 0,
        duration: 0.35,
        ease: "power2.in",
        onComplete: () => {
          root.style.position = "sticky";
          root.style.left = "";
          root.style.transform = "";
          if (DEBUG) console.log(`[DH-D2] closed (${reason})`);
        }
      });
    };

    // X button click: full close (and stop clickthrough).
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeAd("x");
    });

    // Start intro cycle.
    playCycle();

    // For the first HOLD_MS the unit stays FIXED at the top: the page scrolls underneath,
    // but the format remains pinned like real publisher dynamic headers.
    root.style.position = "fixed";
    root.style.top = "0";
    root.style.left = "50%";
    root.style.transform = "translateX(-50%)";
    root.style.zIndex = "9999";

    // If the user does not click X, auto-close after HOLD_MS.
    autoCloseTimer = setTimeout(() => {
      closeAd("timeout");
    }, HOLD_MS);

    // Heights read from CSS variables (layout controlled via CSS).
    const readHeights = () => {
      const css = getComputedStyle(document.documentElement);
      const expandedH = parseInt(css.getPropertyValue("--h-expanded"), 10) || 420;
      const collapsedH = parseInt(css.getPropertyValue("--h-collapsed"), 10) || 180;
      return { expandedH, collapsedH };
    };

    let { expandedH, collapsedH } = readHeights();

    const setState = (isCollapsed) => {
      collapsed = isCollapsed;
      root.classList.toggle("is-collapsed", isCollapsed);
      root.classList.toggle("is-expanded", !isCollapsed);

      if (collapsed) {
        try { tl.pause(0); } catch (_) {}
      }
    };

    const animateToCollapsed = () => {
      if (killed || lockedClosed || collapsed || isAnimatingState) return;
      isAnimatingState = true;

      gsap.killTweensOf(root);
      gsap.killTweensOf([".mediaWide", ".panelRight"]);

      setState(true);

      // Reduce container height (collapsed state).
      gsap.to(root, {
        height: collapsedH,
        duration: 0.35,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => { isAnimatingState = false; }
      });

      // 50/50 split: video on the left, image on the right.
      gsap.to(".mediaWide", { flexBasis: "50%", duration: 0.35, ease: "power2.out", overwrite: true });
      gsap.to(".panelRight", { flexBasis: "50%", autoAlpha: 1, duration: 0.35, ease: "power2.out", overwrite: true });

      // Keep the video playing (muted) for a realistic preview behavior.
      if (heroVideo) {
        heroVideo.muted = true;
        try { heroVideo.play(); } catch (_) {}
      }
    };

    const animateToExpanded = () => {
      if (killed || lockedClosed || !collapsed || isAnimatingState) return;
      isAnimatingState = true;

      gsap.killTweensOf(root);
      gsap.killTweensOf([".mediaWide", ".panelRight"]);

      setState(false);

      // Return to expanded height.
      gsap.to(root, {
        height: expandedH,
        duration: 0.45,
        ease: "power2.out",
        overwrite: true,
        onComplete: () => {
          isAnimatingState = false;
          playCycle();
        }
      });

      // Restore full-width video layout.
      gsap.to(".mediaWide", { flexBasis: "100%", duration: 0.45, ease: "power2.out", overwrite: true });
      gsap.to(".panelRight", { flexBasis: "0%", autoAlpha: 0, duration: 0.25, ease: "power2.out", overwrite: true });

      if (heroVideo) {
        heroVideo.muted = true;
        try { heroVideo.play(); } catch (_) {}
      }
    };

    // Initial state: full video.
    setState(false);
    userHasScrolled = false;
    gsap.set(root, { height: expandedH });
    gsap.set(".mediaWide", { flexBasis: "100%" });
    gsap.set(".panelRight", { flexBasis: "0%", autoAlpha: 0 });

    // Scroll thresholds (tuning).
    const COLLAPSE_Y = config.scroll?.collapseY ?? 80;
    const EXPAND_Y = config.scroll?.expandY ?? 20;

    const getScrollY = () => {
      // In some preview setups scroll may live on documentElement/body instead of window.
      const de = document.documentElement;
      const b = document.body;
      return Math.max(
        window.scrollY || 0,
        (de && de.scrollTop) || 0,
        (b && b.scrollTop) || 0
      );
    };

    const handleScroll = () => {
      if (killed || lockedClosed || isAnimatingState) return;
      if (!userHasScrolled) return;

      const y = getScrollY();

      if (DEBUG) console.log("[DH-D2] scrollY", y);

      if (!collapsed && y > COLLAPSE_Y) animateToCollapsed();
      if (collapsed && y < EXPAND_Y) animateToExpanded();
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        handleScroll();
      });
    };

    // React to scroll only after the first real user interaction.
    // Some browsers restore scroll position on refresh: without this guard it would start already split.
    window.addEventListener("scroll", () => {
      userHasScrolled = true;
      onScroll();
    }, { passive: true });

    // Debug: press "c" to toggle collapsed/expanded.
    window.addEventListener("keydown", (e) => {
      if (!DEBUG) return;
      if (e.key.toLowerCase() === "c") {
        if (collapsed) animateToExpanded();
        else animateToCollapsed();
      }
    });

    window.addEventListener("resize", rafThrottle(() => {
      ({ expandedH, collapsedH } = readHeights());
      gsap.set(root, { height: collapsed ? collapsedH : expandedH });

      // On resize, do not force any state unless the user has already scrolled.
      if (userHasScrolled) onScroll();
    }));

    // Autoplay fallback: if the browser blocks autoplay, try to start it muted anyway.
    if (heroVideo) {
      heroVideo.muted = true;
      heroVideo.playsInline = true;
      try { heroVideo.play(); } catch (_) {}
    }
  }
});
import { createAd } from "../../core/core.js";
import config from "./config.js";

const DEBUG = true;

createAd({
  config,
  debug: DEBUG,
  init: () => {
    const root = document.getElementById("adRoot");
    const closeBtn = document.getElementById("closeBtn");
    const clickLayer = document.getElementById("clickLayer");
    const miniCta = document.getElementById("miniCta");

    let killed = false;
    let hovering = false;

    // Create the animated red separator line (like a video progress bar)
    const videoLine = document.createElement("div");
    videoLine.className = "videoLine";
    root.appendChild(videoLine);

    // Initial entrance animation
    const tl = gsap.timeline();
    tl.from(".kicker", { y: 6, autoAlpha: 0, duration: 0.30 })
      .from(".headline", { y: 8, autoAlpha: 0, duration: 0.40 }, "-=0.15")
      .from(".sub", { y: 6, autoAlpha: 0, duration: 0.30 }, "-=0.20")
      .from(".imgWrap", { scale: 0.985, autoAlpha: 0, duration: 0.55 }, "-=0.05")
      .from(".cta", { y: 6, autoAlpha: 0, duration: 0.35 }, "-=0.18");

    // Handle full close (X button)
    closeBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (killed) return;

      killed = true;
      if (clickLayer) clickLayer.style.pointerEvents = "none";
      closeBtn.style.pointerEvents = "none";

      gsap.to(root, {
        autoAlpha: 0,
        duration: 0.20,
        ease: "power2.out",
        onComplete: () => root.classList.add("is-closed"),
      });
    });

    // When in ultra state, the mini CTA should behave like the main click area
    if (miniCta && clickLayer) {
      miniCta.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        clickLayer.click();
      });
    }

    // On hover we expand again (typical publisher sidebar behaviour)
    root.addEventListener("mouseenter", () => { hovering = true; scheduleUpdate(true); });
    root.addEventListener("mouseleave", () => { hovering = false; scheduleUpdate(true); });

    // Small helpers
    const getVar = (name, fallback) => {
      const v = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name));
      return Number.isFinite(v) ? v : fallback;
    };

    const SB_H   = getVar("--sb-h", 600);
    const SB_MIN = getVar("--sb-mini-h", 160);

    const imgWrap  = document.querySelector(".imgWrap");
    const img      = document.querySelector(".imgWrap img");
    const headline = document.querySelector(".headline");
    const sub      = document.querySelector(".sub");
    const cta      = document.querySelector(".cta");

    // Layout targets and limits
    const IMG_H_MAX = 360;
    const IMG_H_MIN = 0;   // ultra-collapsed: no awkward image crop
    const R_MAX = 16;
    const R_MIN = 12;

    // Scroll range where the sidebar collapses
    const START_Y = 80;
    const END_Y   = 420;

    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    // We animate a single progress value (p: 0 → 1) to drive everything smoothly
    const state = { p: 0 };
    let targetP = 0;

    // GSAP quick setters for performance
    const setRootH = gsap.quickSetter(root, "height", "px");
    const setRootRadius = gsap.quickSetter(root, "borderRadius", "px");
    const setImgH = gsap.quickSetter(imgWrap, "height", "px");
    const setImgRadius = gsap.quickSetter(imgWrap, "borderRadius", "px");
    const setImgOpacity = gsap.quickSetter(imgWrap, "opacity");

    function apply(p){
      // Update root height based on scroll progress
      const h = SB_H + (SB_MIN - SB_H) * p;
      setRootH(h);

      // Adjust border radius and shadow as it collapses
      const r = R_MAX + (R_MIN - R_MAX) * p;
      setRootRadius(r);

      const shadowA = 0.25 - 0.10 * p; // lighter in mini
      root.style.boxShadow = `0 16px 40px rgba(0,0,0,${shadowA.toFixed(3)})`;

      // Resize image area as we move toward collapsed state
      const ih = IMG_H_MAX + (IMG_H_MIN - IMG_H_MAX) * p;
      setImgH(ih);

      const ir = 14 + (10 - 14) * p;
      setImgRadius(ir);

      // Fade the media out near the end to avoid awkward cropping
      const mediaFade = 1 - Math.max(0, (p - 0.82) / 0.18); // 1..0 between 0.82 and 1
      setImgOpacity(mediaFade);

      // Slight text scaling and vertical shift
      const headScale = 1 - 0.14 * p;
      const subScale  = 1 - 0.10 * p;
      const textY = -10 * p;

      headline.style.transform = `translate3d(0, ${textY.toFixed(2)}px, 0) scale(${headScale.toFixed(3)})`;
      sub.style.transform      = `translate3d(0, ${textY.toFixed(2)}px, 0) scale(${subScale.toFixed(3)})`;

      // Shrink and move CTA as we collapse
      const ctaScale = 1 - 0.14 * p;
      const ctaY = 10 * p;
      const ctaO = 1 - 0.20 * p;
      cta.style.transform = `translate3d(0, ${ctaY.toFixed(2)}px, 0) scale(${ctaScale.toFixed(3)})`;
      // NOTE: opacity is finalized in the ultra-collapsed section below
      if (p <= 0.90) cta.style.opacity = ctaO.toFixed(3);

      // Subtle parallax effect on the image
      const imgY = -12 * p;
      const imgS = 1.02 - 0.02 * p;
      img.style.transform = `translate3d(0, ${imgY.toFixed(2)}px, 0) scale(${imgS.toFixed(3)})`;

      // Handle collapsed and ultra-collapsed states
      const collapsed = p > 0.78;
      const ultra = p > 0.90; // final mini: keep only NEW + CRUNCH BOX

      root.classList.toggle("is-collapsed", collapsed);
      root.classList.toggle("is-ultra", ultra);
      videoLine.style.opacity = collapsed ? "1" : "0";

      // In ultra mode we keep only the essential label (hide sub + CTA)
      sub.style.opacity = ultra ? "0" : (1 - 0.10 * p).toFixed(3);
      cta.style.opacity = ultra ? "0" : (1 - 0.20 * p).toFixed(3);
      cta.style.pointerEvents = ultra ? "none" : "auto";
      if (miniCta) miniCta.style.pointerEvents = ultra ? "auto" : "none";
      if (cta) cta.setAttribute("aria-hidden", ultra ? "true" : "false");

      // In ultra mode the media area disappears completely
      if (ultra) {
        setImgH(0);
        setImgOpacity(0);
      }

      // Slightly tighten the headline for a compact label feel
      if (ultra) {
        headline.style.transform = `translate3d(0, -10px, 0) scale(0.90)`;
      }
    }

    // Accessibility: ensure CTA is not focusable when hidden
    if (cta) {
      cta.setAttribute("aria-hidden", "false");
    }

    function computeTargetP(){
      const y = window.scrollY || 0;
      const p = clamp01((y - START_Y) / (END_Y - START_Y));
      return p;
    }

    // Animate progress value toward the target
    let tween = null;
    function scheduleUpdate(force){
      if (killed) return;

      const desired = hovering ? 0 : computeTargetP();
      if (!force && Math.abs(desired - targetP) < 0.001) return;
      targetP = desired;

      if (tween) tween.kill();
      tween = gsap.to(state, {
        p: targetP,
        duration: 0.22,
        ease: "power2.out",
        onUpdate: () => apply(state.p)
      });
    }

    // Throttled scroll handling via requestAnimationFrame
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        scheduleUpdate(false);
      });
    });

    window.addEventListener("resize", () => scheduleUpdate(true));

    // Initial setup
    gsap.set(root, { height: SB_H });
    apply(0);
    scheduleUpdate(true);
  }
});
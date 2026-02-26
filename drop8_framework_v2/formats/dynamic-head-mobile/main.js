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

    let collapsed = false;
    let isAnimatingState = false;

    const readHeights = () => {
      const css = getComputedStyle(document.documentElement);
      return {
        expandedH: parseInt(css.getPropertyValue("--h-expanded"), 10) || 480,
        collapsedH: parseInt(css.getPropertyValue("--h-collapsed"), 10) || 220
      };
    };

    let { expandedH, collapsedH } = readHeights();

    const setState = (isCollapsed) => {
      collapsed = isCollapsed;
      root.classList.toggle("is-collapsed", isCollapsed);
      root.classList.toggle("is-expanded", !isCollapsed);
    };

    const animateToCollapsed = () => {
      if (collapsed || isAnimatingState) return;
      isAnimatingState = true;

      setState(true);

      gsap.to(root, {
        height: collapsedH,
        duration: 0.35,
        ease: "power2.out",
        onComplete: () => { isAnimatingState = false; }
      });

      gsap.to(".media", { autoAlpha: 0, duration: 0.2 });
      gsap.to(".imgA", { autoAlpha: 0, duration: 0.25 });
      gsap.to(".imgB", { autoAlpha: 1, duration: 0.25 });
    };

    const animateToExpanded = () => {
      if (!collapsed || isAnimatingState) return;
      isAnimatingState = true;

      setState(false);

      gsap.to(root, {
        height: expandedH,
        duration: 0.45,
        ease: "power2.out",
        onComplete: () => { isAnimatingState = false; }
      });

      gsap.to(".media", { autoAlpha: 1, duration: 0.25 });
      gsap.to(".imgA", { autoAlpha: 1, duration: 0.25 });
      gsap.to(".imgB", { autoAlpha: 0, duration: 0.25 });
    };

    gsap.set(root, { height: expandedH });

    const COLLAPSE_Y = 90;
    const EXPAND_Y = 20;

    const onScroll = rafThrottle(() => {
      const y = window.scrollY || 0;
      if (!collapsed && y > COLLAPSE_Y) animateToCollapsed();
      if (collapsed && y < EXPAND_Y) animateToExpanded();
    });

    window.addEventListener("scroll", onScroll);

    window.addEventListener("resize", rafThrottle(() => {
      ({ expandedH, collapsedH } = readHeights());
      gsap.set(root, { height: collapsed ? collapsedH : expandedH });
    }));

    closeBtn.addEventListener("click", () => {
      gsap.to(root, { height: 0, autoAlpha: 0, duration: 0.35 });
    });
  }
});
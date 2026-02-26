import { createAd } from "../../core/core.js";
import { createLooper } from "../../core/loop.js";
import config from "./config.js";

const DEBUG = true;

createAd({
  config,
  debug: DEBUG,
  init: () => {
    const root = document.getElementById("adRoot");
    const clickLayer = document.getElementById("clickLayer");

    const looper = createLooper({ maxLoops: config.maxLoops, debug: DEBUG });

    // Clickthrough
    clickLayer.addEventListener("click", () => {
      // your core should handle Enabler + clickTag fallback
      // if not, you can do: window.open(config.exits.click, "_blank");
      if (DEBUG) console.log("[WB-XL] click");
      clickLayer.blur();
      clickLayer.dispatchEvent(new CustomEvent("ad:exit", { detail: { key: "click" } }));
    });

    // GSAP timeline (simple, readable, production-friendly)
    const tl = gsap.timeline({ paused: true });

    // Headline split animation (Bigger / Crunchier enter from sides)
    const headlineTL = gsap.timeline({ paused: true });

    const leftWord = root.querySelector(".word--left, .word--l");
    const rightWord = root.querySelector(".word--right, .word--r");

    if (leftWord && rightWord) {
      headlineTL
        .set([leftWord, rightWord], { autoAlpha: 0 })
        .set(leftWord, { xPercent: -60 })
        .set(rightWord, { xPercent: 60 })

        // enter from sides
        .to([leftWord, rightWord], {
          autoAlpha: 1,
          xPercent: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.04
        })

        // small readable hold
        .to({}, { duration: 0.8 })

        // exit splitting outward
        .to(leftWord, {
          autoAlpha: 0,
          xPercent: -70,
          duration: 0.45,
          ease: "power2.in"
        }, 0)
        .to(rightWord, {
          autoAlpha: 0,
          xPercent: 70,
          duration: 0.45,
          ease: "power2.in"
        }, 0);
    }

    if (DEBUG) {
      console.log("[WB-XL] headline element:", root.querySelector(".h1, .headline"));
      console.log("[WB-XL] left/right words:", leftWord, rightWord);
    }

    tl.from(".bgImg", { scale: 1.08, duration: 0.9, ease: "power2.out" }, 0)
      .from(".brandRow", { y: 8, autoAlpha: 0, duration: 0.35, ease: "power2.out" }, 0.05)
      .from(".h1, .headline", { y: 10, autoAlpha: 0, duration: 0.45, ease: "power2.out" }, 0.12)
      .from(".sub", { y: 8, autoAlpha: 0, duration: 0.35, ease: "power2.out" }, 0.20)
      .from(".product", { x: 14, autoAlpha: 0, duration: 0.55, ease: "power2.out" }, 0.15)
      .from(".badge", { scale: 0.9, autoAlpha: 0, duration: 0.25, ease: "power2.out" }, 0.35)
      .from(".price", { y: 8, autoAlpha: 0, duration: 0.30, ease: "power2.out" }, 0.28)
      .from(".cta", { y: 8, autoAlpha: 0, duration: 0.30, ease: "power2.out" }, 0.32)
      .to({}, { duration: 1.4 }); // hold

    function playCycle() {
      // restart main timeline
      tl.restart();

      // trigger headline animation at each loop
      if (headlineTL && headlineTL.duration()) {
        headlineTL.restart();
      }

      looper.markLoop();

      tl.eventCallback("onComplete", () => {
        if (looper.canLoop()) {
          setTimeout(playCycle, 900);
        } else {
          if (DEBUG) console.log("[WB-XL] loops done");
        }
      });
    }

    // Start
    playCycle();

    // Safety
    window.addEventListener("visibilitychange", () => {
      if (document.hidden) tl.pause();
      else tl.resume();
    });
  }
});
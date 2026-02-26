import { detectEnv } from "./env.js";

export function politeLoad({ onReady, timeoutMs = 4000, debug = false } = {}) {
  const w = window;
  const { hasEnabler } = detectEnv();

  const done = (() => {
    let called = false;
    return () => {
      if (called) return;
      called = true;
      if (debug) console.log("[POLITE] READY");
      onReady?.();
    };
  })();

  if (hasEnabler) {
    try {
      if (w.Enabler.isInitialized()) {
        if (w.Enabler.isPageLoaded()) return done();
        w.Enabler.addEventListener(w.studio.events.StudioEvent.PAGE_LOADED, done);
      } else {
        w.Enabler.addEventListener(w.studio.events.StudioEvent.INIT, () => {
          if (w.Enabler.isPageLoaded()) return done();
          w.Enabler.addEventListener(w.studio.events.StudioEvent.PAGE_LOADED, done);
        });
      }
      setTimeout(done, timeoutMs);
      return;
    } catch (e) {
      if (debug) console.log("[POLITE] Enabler error -> fallback", e);
    }
  }

  if (document.readyState === "complete") return done();
  w.addEventListener("load", done, { once: true });
  setTimeout(done, timeoutMs);
}
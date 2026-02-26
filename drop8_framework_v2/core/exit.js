import { detectEnv } from "./env.js";

export function createExit({ defaultUrl, exitName = "Exit", debug = false } = {}) {
  const { hasEnabler, hasAdform } = detectEnv();
  const w = window;

  function resolveUrl() {
    const qs = new URLSearchParams(location.search);
    const clickTagFromQS = qs.get("clickTag");
    const clickTag = w.clickTag || clickTagFromQS;

    if (hasAdform) {
      try {
        const u = w.adform.getClickURL("default");
        if (u) return u;
      } catch (_) {}
    }
    return clickTag || defaultUrl || "https://example.com";
  }

  function handleClick(e) {
    e?.preventDefault?.();
    const url = resolveUrl();

    if (hasEnabler) {
      if (debug) console.log("[EXIT] Enabler.exit", exitName, url);
      try { w.Enabler.exit(exitName); } catch (_) { w.open(url, "_blank"); }
      return;
    }

    if (debug) console.log("[EXIT] window.open", url);
    w.open(url, "_blank");
  }

  return { handleClick, resolveUrl };
}
export function detectEnv() {
  const w = window;
  const hasEnabler = typeof w.Enabler !== "undefined";
  const hasAdform = typeof w.adform !== "undefined" && w.adform && typeof w.adform.getClickURL === "function";
  return { hasEnabler, hasAdform };
}
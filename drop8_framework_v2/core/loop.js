export function createLooper({ maxLoops = 2, debug = false } = {}) {
  let loops = 0;
  const log = (...a) => debug && console.log("[LOOP]", ...a);

  function canLoop() { return loops < maxLoops; }
  function markLoop() { loops += 1; log(`${loops}/${maxLoops}`); }

  return { canLoop, markLoop, get loops() { return loops; } };
}
export function qs(sel, root = document) {
  const el = root.querySelector(sel);
  if (!el) throw new Error(`Missing element: ${sel}`);
  return el;
}

export function rafThrottle(fn) {
  let ticking = false;
  return (...args) => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      fn(...args);
    });
  };
}
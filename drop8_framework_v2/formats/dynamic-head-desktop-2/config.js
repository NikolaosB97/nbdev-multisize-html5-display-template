/**
 * Dynamic Head Desktop – Video Split Version
 * Expanded: full-width video
 * Collapsed: video left + image right
 */

export default {
  // Basic format info
  format: "dynamic-head-desktop-2",

  // Size reference (970x300 style desktop header)
  width: 970,
  height: 300,

  // Loop behaviour (for intro animation)
  maxLoops: 2,

  // Delay before allowing scroll-based collapse logic
  autoCollapseMs: 1200,

  // Click / exit handling
  clickUrl: "https://example.com",

  // Video behaviour
  video: {
    autoplay: true,
    muted: true,
    loop: true
  },

  // Scroll thresholds (can be tuned from here if needed)
  scroll: {
    collapseY: 80,
    expandY: 20
  },

  // Debug mode
  debug: true
};
import { politeLoad } from "./polite.js";
import { createExit } from "./exit.js";

export function createAd({ config, init, debug = false } = {}) {
  if (!config) throw new Error("config required");
  if (!init) throw new Error("init required");

  const exit = createExit({
    defaultUrl: config.defaultClickUrl,
    exitName: config.exitName,
    debug
  });

  politeLoad({
    debug,
    onReady: () => {
      const clickLayer = document.getElementById(config.clickLayerId || "clickLayer");
      if (clickLayer) clickLayer.addEventListener("click", exit.handleClick);

      if (debug) console.log("[AD] init:", config.formatName);
      init({ config, exit });
    }
  });
}
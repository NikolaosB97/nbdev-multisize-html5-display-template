// Polite load: start solo dopo window load (publisher-friendly)
if (document.readyState === "complete") {
  startAd();
} else {
  window.addEventListener("load", startAd);
}






var CFG = window.AD_CONFIG || {
  clickUrl: window.clickTag || "https://nbdeveloper.ch",
  copy: {
    headline: "Engineering Digital Systems",
    subline: "Built for performance at scale",
    cta: "Learn More"
  },
  motion: { loops: 2, loopDelay: 1.2 }
};

var loops = 0;
var maxLoops = (CFG.motion && CFG.motion.loops) || 2;

function injectCopy() {
  document.querySelector(".headline").innerHTML = CFG.copy.headline;
  document.querySelector(".subline").innerHTML = CFG.copy.subline;
  document.querySelector(".cta").innerHTML = CFG.copy.cta;
}

function exit(name, url) {
  // Studio/Enabler support (se presente)
  if (window.Enabler && typeof window.Enabler.exit === "function") {
    window.Enabler.exit(name);
    return;
  }
  // DV360 clickTag fallback
  window.open(url || window.clickTag);
}

function addExit() {
  // Click su background/container
  document.getElementById("container").addEventListener("click", function () {
    exit("Background Exit", window.clickTag || CFG.clickUrl);
  });

  // Click su CTA (separato)
  var cta = document.getElementById("cta");
  if (cta) {
    cta.addEventListener("click", function (e) {
      e.stopPropagation(); // evita che scatti anche il background exit
      exit("CTA Exit", window.clickTag || CFG.clickUrl);
    });
  }
}

function play() {
  gsap.set([".line", ".headline", ".subline", ".cta"], { opacity: 0, y: 10 });
  gsap.set(".line", { x: -10, y: 0 });

  var tl = gsap.timeline({
    onComplete: function () {
      loops++;
      if (loops < maxLoops) {
        gsap.delayedCall(CFG.motion.loopDelay || 1.2, play);
      }
    }
  });

  tl.to(".line", { duration: 0.5, opacity: 1, x: 0, ease: "power2.out" })
    .to(".headline", { duration: 0.7, opacity: 1, y: 0, ease: "power2.out" }, "-=0.2")
    .to(".subline", { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.35")
    .to(".cta", { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.35");
}

injectCopy();
addExit();
play();
(function () {
  function getCfg() {
    return window.AD_CONFIG || {
      clickUrl: window.clickTag || "https://nbdeveloper.ch",
      copy: {
        headline: "Engineering Digital Systems",
        subline: "Built for performance at scale",
        cta: "Learn More"
      },
      motion: { loops: 2, loopDelay: 1.2 }
    };
  }

  function qs(sel) { return document.querySelector(sel); }

  function injectCopy(CFG) {
    var h = qs(".headline");
    var s = qs(".subline");
    var c = qs(".cta");
    if (h) h.innerHTML = CFG.copy.headline;
    if (s) s.innerHTML = CFG.copy.subline;
    if (c) c.innerHTML = CFG.copy.cta;
  }

  function exit(name, url) {
    
    if (window.Enabler && typeof window.Enabler.exit === "function") {
      window.Enabler.exit(name);
      return;
    }

    window.open(url || window.clickTag);
  }

  function bindExits(CFG) {
    var container = document.getElementById("container");
    if (container) {
      container.addEventListener("click", function () {
        exit("Background Exit", window.clickTag || CFG.clickUrl);
      });
    }

    var cta = document.getElementById("cta");
    if (cta) {
      cta.addEventListener("click", function (e) {
        e.stopPropagation();
        exit("CTA Exit", window.clickTag || CFG.clickUrl);
      });
    }
  }

  function politeStart(fn) {
    if (document.readyState === "complete") fn();
    else window.addEventListener("load", fn);
  }


  window.AdCore = {
    init: function (buildTimeline) {
      var CFG = getCfg();
      var loops = 0;
      var maxLoops = (CFG.motion && CFG.motion.loops) || 2;
      var loopDelay = (CFG.motion && CFG.motion.loopDelay) || 1.2;

      function runOnce() {
       
        gsap.set([".line", ".headline", ".subline", ".cta"], { opacity: 0, y: 10 });
        gsap.set(".line", { x: -10, y: 0 });

        var tl = buildTimeline(CFG);

        tl.eventCallback("onComplete", function () {
          loops++;
          if (loops < maxLoops) gsap.delayedCall(loopDelay, runOnce);
        });
      }

      politeStart(function () {
        injectCopy(CFG);
        bindExits(CFG);

    
        var container = document.getElementById("container");
        if (container && CFG.size) {
          container.style.width = CFG.size.w + "px";
          container.style.height = CFG.size.h + "px";
          container.setAttribute("data-size", CFG.size.w + "x" + CFG.size.h);

          
          try {
            var de = document.documentElement;
            de.style.width = CFG.size.w + "px";
            de.style.height = CFG.size.h + "px";
            de.style.margin = "0";
            de.style.padding = "0";
            de.style.overflow = "hidden";
            
            de.style.background = "transparent";

            document.body.style.width = CFG.size.w + "px";
            document.body.style.height = CFG.size.h + "px";
            document.body.style.margin = "0";
            document.body.style.padding = "0";
            document.body.style.overflow = "hidden";
            document.body.style.display = "inline-block";
            document.body.style.background = "transparent";
          } catch (e) {}
        }

        runOnce();
      });
    }
  };
})();
(function () {
  window.Creative = {
    buildTimeline: function () {
      var tl = gsap.timeline();

      tl.to(".line", { duration: 0.5, opacity: 1, x: 0, ease: "power2.out" })
        .to(".headline", { duration: 0.7, opacity: 1, y: 0, ease: "power2.out" }, "-=0.2")
        .to(".subline", { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.35")
        .to(".cta", { duration: 0.6, opacity: 1, y: 0, ease: "power2.out" }, "-=0.35");

      return tl;
    }
  };
})();
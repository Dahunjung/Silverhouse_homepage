(function () {
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // 헤더 드롭다운
  var groups = Array.prototype.slice.call(document.querySelectorAll(".nav-group"));

  function closeAll(except) {
    groups.forEach(function (g) {
      if (g === except) return;
      g.classList.remove("is-open");
      var t = g.querySelector(".nav-trigger");
      if (t) t.setAttribute("aria-expanded", "false");
    });
  }

  groups.forEach(function (group) {
    var trigger = group.querySelector(".nav-trigger");
    if (!trigger) return;
    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = !group.classList.contains("is-open");
      closeAll(group);
      group.classList.toggle("is-open", open);
      trigger.setAttribute("aria-expanded", String(open));
    });
  });

  document.addEventListener("click", function () { closeAll(null); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeAll(null);
  });

  // 계획 대비 실적 차트 (예시 데이터, 단위: 억원)
  var pva = document.getElementById("ma-pva");
  if (pva) {
    var plan = [118, 116, 120, 124, 122, 126, 121, 124, 123, 128];
    var actual = [126, 122, 114, 135, 133, 131, 129, 118, 131, 145];
    var min = 80;
    var max = 155;
    var pct = function (v) { return ((v - min) / (max - min)) * 100; };
    var html = "";
    for (var i = 0; i < plan.length; i++) {
      var rate = Math.round((actual[i] / plan[i]) * 100);
      var top = pct(Math.max(plan[i], actual[i]));
      html +=
        '<div class="ma-pva-col">' +
        '<span class="ma-pva-rate' + (rate < 100 ? " down" : "") + '" style="--top:' + top.toFixed(1) + '%">' + rate + "%</span>" +
        '<i class="p" style="--h:' + pct(plan[i]).toFixed(1) + '%;transition-delay:' + i * 0.05 + 's"></i>' +
        '<i class="a" style="--h:' + pct(actual[i]).toFixed(1) + '%;transition-delay:' + (i * 0.05 + 0.08) + 's"></i>' +
        '<span class="ma-pva-month">' + (i + 1) + "월</span>" +
        "</div>";
    }
    pva.innerHTML = html;
    pva.closest(".ma-panel").classList.add("reveal");
  }

  // 숫자 카운트업
  function countUp(el) {
    var target = Number(el.getAttribute("data-count"));
    var comma = el.getAttribute("data-format") === "comma";
    if (!target || reduceMotion) return;
    var start = null;
    var duration = 1200;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var v = Math.round(target * eased);
      el.textContent = comma ? v.toLocaleString("ko-KR") : String(v);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // AI 대화 순차 표시
  function playChat(chat) {
    var msgs = chat.querySelectorAll(".msg");
    msgs.forEach(function (m, idx) {
      setTimeout(function () { m.classList.add("is-shown"); }, reduceMotion ? 0 : idx * 900);
    });
  }

  var targets = Array.prototype.slice.call(document.querySelectorAll(".reveal, [data-count], #ma-chat"));

  if (!("IntersectionObserver" in window)) {
    targets.forEach(function (el) {
      el.classList.add("is-in");
      if (el.id === "ma-chat") playChat(el);
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        io.unobserve(el);
        if (el.id === "ma-chat") {
          playChat(el);
          return;
        }
        if (el.hasAttribute("data-count")) countUp(el);
        el.classList.add("is-in");
      });
    },
    { threshold: 0.25 }
  );

  targets.forEach(function (el) { io.observe(el); });
})();

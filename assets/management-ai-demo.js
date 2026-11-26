(function () {
  "use strict";

  var view = document.getElementById("view");
  var charts = [];

  // ---------- 공통 유틸 ----------

  function fmt(n, d) {
    d = d || 0;
    return Number(n).toLocaleString("ko-KR", { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function signed(n, d) {
    var v = Number(n.toFixed(d || 0));
    return (v > 0 ? "+" : v < 0 ? "−" : "") + fmt(Math.abs(v), d);
  }
  function tone(diff, invert) {
    if (!diff) return "";
    var bad = invert ? diff > 0 : diff < 0;
    return bad ? "text-error" : "text-success";
  }
  function colored(text, diff, invert) {
    var c = tone(diff, invert);
    return c ? '<span class="' + c + '">' + text + "</span>" : text;
  }
  function sum(arr) {
    return arr.reduce(function (a, b) { return a + (b || 0); }, 0);
  }
  function pad12(arr) {
    var out = arr.slice();
    while (out.length < 12) out.push(null);
    return out;
  }
  function round(v, d) {
    var m = Math.pow(10, d || 0);
    return Math.round(v * m) / m;
  }

  var MONTH_LABELS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  var LAST12 = ["25.11", "25.12", "26.01", "26.02", "26.03", "26.04", "26.05", "26.06", "26.07", "26.08", "26.09", "26.10"];

  // ---------- 가상 데이터 ----------

  var YEARS = {
    2026: {
      months: 10,
      rev: [126, 122, 114, 135, 133, 131, 129, 118, 131, 145],
      revPlan: [118, 116, 120, 124, 122, 126, 121, 124, 123, 128, 130, 128],
      profit: [4.8, 4.1, 2.2, 5.6, 5.2, 4.9, 4.3, 1.6, 4.6, 5.3],
      profitPlan: [4.2, 4.1, 4.3, 4.4, 4.3, 4.5, 4.3, 4.4, 4.5, 4.7, 4.6, 4.7]
    },
    2025: {
      months: 12,
      rev: [112, 110, 118, 121, 119, 124, 117, 113, 120, 126, 122, 119],
      revPlan: [115, 113, 116, 118, 118, 120, 118, 117, 119, 121, 120, 118],
      profit: [3.1, 2.8, 3.6, 4.0, 3.7, 4.2, 3.3, 2.5, 3.9, 4.4, 3.8, 3.2],
      profitPlan: [3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5, 3.5]
    }
  };
  YEARS[2026].qty = YEARS[2026].rev.map(function (r, i) { return r * 100 + (i === 9 ? 50 : 0); });
  YEARS[2026].qtyPlan = YEARS[2026].revPlan.map(function (r, i) { return i < 10 ? r * 100 + 227 : 12765; });
  YEARS[2025].qty = YEARS[2025].rev.map(function (r) { return r * 100 + 80; });
  YEARS[2025].qtyPlan = YEARS[2025].revPlan.map(function (r) { return r * 100; });

  // [자재그룹, 매출량(MT), 매출액(억), 영업이익(억)]
  var TEAMS = [
    { name: "영업1팀", code: "S100", rows: [["A그룹", 41350, 412, 16.2], ["B그룹", 13620, 138, -1.4], ["C그룹", 4480, 46, 3.6]] },
    { name: "영업2팀", code: "S200", rows: [["A그룹", 14050, 142, 9.1], ["D그룹", 4720, 48, 2.2]] },
    { name: "영업3팀", code: "S300", rows: [["A그룹", 8310, 84, 0.6], ["B그룹", 3190, 32, -1.9]] },
    { name: "수출팀", code: "E100", rows: [["A그룹", 32410, 318, 15.8], ["B그룹", 6320, 64, -1.6]] }
  ];
  var TEAMS_PREV = [
    [[39820, 391, 14.1], [14210, 142, 0.6], [4050, 41, 2.9]],
    [[13400, 134, 7.6], [4950, 50, 2.6]],
    [[8920, 89, 2.3], [3480, 35, -0.4]],
    [[24010, 240, 6.1], [5830, 58, -0.3]]
  ];

  // ---------- Chart.js 플러그인 ----------

  Chart.defaults.font.family = "Pretendard, system-ui, sans-serif";
  Chart.defaults.color = "#6b7280";

  Chart.register({
    id: "valueLabels",
    afterDatasetsDraw: function (chart, args, opts) {
      if (!opts || !opts.enabled) return;
      var ctx = chart.ctx;
      ctx.save();
      ctx.font = opts.font || "600 11px Pretendard";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      chart.data.datasets.forEach(function (ds, di) {
        var meta = chart.getDatasetMeta(di);
        if (meta.hidden || (opts.datasets && opts.datasets.indexOf(di) < 0)) return;
        meta.data.forEach(function (el, i) {
          var v = ds.data[i];
          if (v === null || v === undefined) return;
          ctx.fillStyle = (opts.color && opts.color(v, di)) || ds.labelColor || ds.borderColor || "#374151";
          ctx.fillText(opts.format(v, di), el.x, el.y - (opts.offset || 4));
        });
      });
      ctx.restore();
    }
  });

  Chart.register({
    id: "pvaRates",
    afterDatasetsDraw: function (chart, args, opts) {
      if (!opts || !opts.enabled) return;
      var ctx = chart.ctx;
      var plan = chart.data.datasets[0].data;
      var actual = chart.data.datasets[1].data;
      var m0 = chart.getDatasetMeta(0).data;
      var m1 = chart.getDatasetMeta(1).data;
      ctx.save();
      ctx.font = "500 11px Pretendard";
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      plan.forEach(function (p, i) {
        var a = actual[i];
        if (p === null || a === null || a === undefined || !p) return;
        var rate = Math.round((a / p) * 100);
        ctx.fillStyle = rate < 100 ? "#ef4444" : "#374151";
        var y = Math.min(m0[i].y, m1[i].y) - 18;
        ctx.fillText((opts.prefix || "") + "(" + rate + "%)", (m0[i].x + m1[i].x) / 2, y);
      });
      ctx.restore();
    }
  });

  Chart.register({
    id: "pieLabels",
    afterDatasetsDraw: function (chart, args, opts) {
      if (!opts || !opts.enabled) return;
      var ctx = chart.ctx;
      var ds = chart.data.datasets[0];
      var total = sum(ds.data);
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fff";
      chart.getDatasetMeta(0).data.forEach(function (el, i) {
        var ratio = (ds.data[i] / total) * 100;
        if (ratio < 5) return;
        var pos = el.tooltipPosition();
        ctx.font = "bold 13px Pretendard";
        ctx.fillText(fmt(ds.data[i]) + " 억원", pos.x, pos.y - 8);
        ctx.font = "12px Pretendard";
        ctx.fillText("(" + Math.round(ratio) + "%)", pos.x, pos.y + 9);
      });
      ctx.restore();
    }
  });

  function makeChart(id, config) {
    var el = document.getElementById(id);
    if (!el) return null;
    config.options = config.options || {};
    config.options.responsive = true;
    config.options.maintainAspectRatio = false;
    var c = new Chart(el, config);
    charts.push(c);
    return c;
  }
  function destroyCharts() {
    charts.forEach(function (c) { c.destroy(); });
    charts = [];
  }

  var GRID = { color: "rgba(0,0,0,0.06)" };

  function isNarrow() {
    return window.innerWidth < 640;
  }

  // ---------- 화면 공통 조각 ----------

  function pageHeader(icon, title, desc, right) {
    return (
      '<div class="mb-6 flex flex-wrap justify-between items-start gap-4">' +
      "<div>" +
      '<h1 class="text-3xl font-bold"><i class="ph ' + icon + '" style="font-size:28px"></i><span class="ml-2">' + title + "</span></h1>" +
      '<p class="text-base-content/60 mt-2">' + desc + "</p>" +
      "</div>" +
      (right || "") +
      "</div>"
    );
  }
  function selectBox(id, label, options, value, extraClass) {
    return (
      '<div class="form-control ' + (extraClass || "w-48") + '">' +
      '<label class="label"><span class="label-text font-bold">' + label + "</span></label>" +
      '<select class="select select-bordered w-full" id="' + id + '">' +
      options.map(function (o) {
        var v = Array.isArray(o) ? o[0] : o;
        var t = Array.isArray(o) ? o[1] : o;
        return '<option value="' + v + '"' + (String(v) === String(value) ? " selected" : "") + ">" + t + "</option>";
      }).join("") +
      "</select></div>"
    );
  }
  function cardTitle(icon, title) {
    return '<h2 class="card-title"><i class="ph ' + icon + '" style="font-size:20px"></i><span>' + title + "</span></h2>";
  }
  function statCard(label, value, sub) {
    return (
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      '<p class="text-sm text-base-content/60">' + label + "</p>" +
      '<h2 class="text-2xl font-bold">' + value + "</h2>" +
      (sub || "") +
      "</div></div>"
    );
  }
  function legendChip(color, text) {
    return '<span class="inline-flex items-center gap-1.5"><span class="inline-block w-3 h-3 rounded-sm" style="background:' + color + '"></span><span>' + text + "</span></span>";
  }

  // ---------- 메인 ----------

  function planLine(label, plan, actual, unit, d) {
    var diff = actual - plan;
    var text = "(계획대비 " + fmt(Math.abs(diff), d) + " " + unit + (diff >= 0 ? " 초과)" : " 미달)");
    return "<p>" + label + " : " + fmt(plan, d) + " " + unit + " " + colored(text, diff >= 0 ? 1 : -1) + "</p>";
  }

  function kpiCard(label, value, icon, color, plans) {
    return (
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      '<div class="flex items-center justify-between"><div>' +
      '<p class="text-sm text-base-content/60">' + label + "</p>" +
      '<h2 class="text-3xl font-bold">' + value + "</h2>" +
      "</div>" +
      '<div class="avatar placeholder"><div class="' + color + ' rounded-full w-12 h-12"><i class="ph ' + icon + '" style="font-size:24px"></i></div></div>' +
      "</div>" +
      '<div class="mt-3 space-y-1 text-base text-base-content/70">' + plans + "</div>" +
      "</div></div>"
    );
  }

  function teamTableRows(scale) {
    var html = "";
    var total = [0, 0, 0];
    TEAMS.forEach(function (t) {
      var sub = [0, 0, 0];
      t.rows.forEach(function (r, i) {
        var q = r[1] * scale.q;
        var rev = r[2] * scale.r;
        var p = r[3] * scale.p;
        sub[0] += q; sub[1] += rev; sub[2] += p;
        html +=
          "<tr>" +
          (i === 0 ? '<td class="team" rowspan="' + (t.rows.length + 1) + '">' + t.name + "</td>" : "") +
          '<td class="text-center">' + r[0] + "</td>" +
          '<td class="num">' + fmt(q) + " MT</td>" +
          '<td class="num">' + fmt(rev) + " 억원</td>" +
          '<td class="num ' + (p < 0 ? "text-error" : "") + '">' + fmt(p, 1) + " 억원</td>" +
          '<td class="num ' + (p < 0 ? "text-error" : "") + '">' + signed((p / rev) * 100, 1) + "%</td>" +
          "</tr>";
      });
      total[0] += sub[0]; total[1] += sub[1]; total[2] += sub[2];
      html +=
        '<tr class="subtotal">' +
        '<td class="text-center">' + t.name + " 소계</td>" +
        '<td class="num">' + fmt(sub[0]) + " MT</td>" +
        '<td class="num">' + fmt(sub[1]) + " 억원</td>" +
        '<td class="num ' + (sub[2] < 0 ? "text-error" : "") + '">' + fmt(sub[2], 1) + " 억원</td>" +
        '<td class="num ' + (sub[2] < 0 ? "text-error" : "") + '">' + signed((sub[2] / sub[1]) * 100, 1) + "%</td>" +
        "</tr>";
    });
    html +=
      '<tr class="subtotal bg-base-200">' +
      '<td class="text-center" colspan="2">합계</td>' +
      '<td class="num">' + fmt(total[0]) + " MT</td>" +
      '<td class="num">' + fmt(total[1]) + " 억원</td>" +
      '<td class="num">' + fmt(total[2], 1) + " 억원</td>" +
      '<td class="num">' + signed((total[2] / total[1]) * 100, 1) + "%</td>" +
      "</tr>";
    return html;
  }

  var mainYear = 2026;

  function renderMain() {
    var y = YEARS[mainYear];
    var n = y.months;
    var qty = sum(y.qty.slice(0, n));
    var rev = sum(y.rev.slice(0, n));
    var profit = round(sum(y.profit.slice(0, n)), 1);
    var qtyPlan = sum(y.qtyPlan.slice(0, n));
    var revPlan = sum(y.revPlan.slice(0, n));
    var profitPlan = round(sum(y.profitPlan.slice(0, n)), 1);
    var base = { q: 128450, r: 1284, p: 42.6 };
    var scale = { q: qty / base.q, r: rev / base.r, p: profit / base.p };

    view.innerHTML =
      '<div class="p-6">' +
      '<div class="mb-6 flex justify-end">' + selectBox("year-select", "년도 선택", [[2026, "2026년"], [2025, "2025년"]], mainYear) + "</div>" +
      '<div class="mb-6">' +
      '<div class="mb-4 flex items-center justify-between gap-4">' +
      '<h2 class="text-2xl font-bold"><i class="ph ph-calendar-check" style="font-size:24px"></i><span class="ml-2">' + n + "월 누계</span></h2>" +
      '<span class="text-sm text-base-content/60 shrink-0">*부산물 제외 기준</span>' +
      "</div>" +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-6">' +
      kpiCard("누계 매출량", fmt(qty) + " MT", "ph-scales", "bg-primary text-primary-content",
        planLine("누계 경영계획", qtyPlan, qty, "MT", 0) + planLine("연간 경영계획", sum(y.qtyPlan), qty, "MT", 0)) +
      kpiCard("누계 매출액", fmt(rev) + " 억원", "ph-currency-circle-dollar", "bg-secondary text-secondary-content",
        planLine("누계 경영계획", revPlan, rev, "억원", 0) + planLine("연간 경영계획", sum(y.revPlan), rev, "억원", 0)) +
      kpiCard("누계 영업이익", fmt(profit, 1) + " 억원", "ph-trend-up", "bg-accent text-accent-content",
        planLine("누계 경영계획", profitPlan, profit, "억원", 1) + planLine("연간 경영계획", round(sum(y.profitPlan), 1), profit, "억원", 1)) +
      "</div></div>" +
      '<div class="mb-6">' +
      '<h2 class="text-2xl font-bold mb-4"><i class="ph ph-chart-line" style="font-size:24px"></i><span class="ml-2">월별 현황</span></h2>' +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-bar", "월별 판매량") + '<div class="h-64"><canvas id="c-qty"></canvas></div></div></div>' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-line", "월별 매출액") + '<div class="h-64"><canvas id="c-rev"></canvas></div></div></div>' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-line", "월별 영업이익") + '<div class="h-64"><canvas id="c-profit"></canvas></div></div></div>' +
      "</div></div>" +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      cardTitle("ph-table", "팀별 손익 현황(누계)") +
      '<div class="overflow-x-auto"><table class="table demo-table border-t-2 border-b-2 border-base-300">' +
      '<thead><tr><th class="text-center">팀명</th><th class="text-center">자재그룹</th><th class="num">매출량</th><th class="num">매출액</th><th class="num">영업이익</th><th class="num">영업이익률</th></tr></thead>' +
      "<tbody>" + teamTableRows(scale) + "</tbody></table></div>" +
      "</div></div>" +
      "</div>";

    document.getElementById("year-select").addEventListener("change", function (e) {
      mainYear = Number(e.target.value);
      renderMain();
    });

    var labelOpts = { left: 4, right: 4, top: 22 };
    makeChart("c-qty", {
      type: "bar",
      data: {
        labels: MONTH_LABELS,
        datasets: [{
          data: pad12(y.qty.map(function (v) { return round(v / 1000, 1); })),
          backgroundColor: "rgba(59, 130, 246, 0.8)",
          borderColor: "rgb(59, 130, 246)",
          borderWidth: 1
        }]
      },
      options: {
        layout: { padding: labelOpts },
        plugins: { legend: { display: false }, valueLabels: { enabled: !isNarrow(), format: function (v) { return fmt(v); } } },
        scales: { x: { grid: GRID }, y: { grid: GRID, beginAtZero: true, ticks: { callback: function (v) { return v + " 천 MT"; } } } }
      }
    });
    makeChart("c-rev", {
      type: "line",
      data: {
        labels: MONTH_LABELS,
        datasets: [{
          data: pad12(y.rev),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 3
        }]
      },
      options: {
        layout: { padding: labelOpts },
        plugins: { legend: { display: false }, valueLabels: { enabled: true, offset: 7, format: function (v) { return fmt(v); } } },
        scales: { x: { grid: GRID }, y: { grid: GRID, ticks: { callback: function (v) { return v + " 억원"; } } } }
      }
    });
    makeChart("c-profit", {
      type: "line",
      data: {
        labels: MONTH_LABELS,
        datasets: [{
          data: pad12(y.profit),
          borderColor: "rgb(251, 191, 36)",
          backgroundColor: "rgba(251, 191, 36, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 3
        }]
      },
      options: {
        layout: { padding: labelOpts },
        plugins: { legend: { display: false }, valueLabels: { enabled: true, offset: 7, format: function (v) { return fmt(v, 1); } } },
        scales: { x: { grid: GRID }, y: { grid: GRID, beginAtZero: true, ticks: { callback: function (v) { return fmt(v, 1) + " 억원"; } } } }
      }
    });
  }

  // ---------- 계획 대비 실적 ----------

  var pvaYear = 2026;

  function renderPlan() {
    var y = YEARS[pvaYear];
    var n = y.months;
    var sections = [
      { key: "qty", icon: "ph-scales", title: "판매량", unit: "천 MT", d: 1, label: 0, tick: 0,
        plan: y.qtyPlan.map(function (v) { return round(v / 1000, 1); }), actual: y.qty.map(function (v) { return round(v / 1000, 1); }) },
      { key: "rev", icon: "ph-currency-circle-dollar", title: "매출액", unit: "억원", d: 0, plan: y.revPlan, actual: y.rev },
      { key: "profit", icon: "ph-trend-up", title: "영업이익", unit: "억원", d: 1, plan: y.profitPlan, actual: y.profit }
    ];

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-chart-bar", "계획 대비 실적", "월별 경영계획과 실적을 비교합니다. *부산물 제외 기준",
        selectBox("pva-year", "년도 선택", [[2026, "2026년"], [2025, "2025년"]], pvaYear)) +
      sections.map(function (s) {
        return (
          '<div class="card bg-base-100 shadow-xl mb-6"><div class="card-body">' +
          '<div class="flex items-start justify-between gap-4"><div>' + cardTitle(s.icon, s.title) +
          '<p class="text-sm text-base-content/60 -mt-1">단위: ' + s.unit + "</p></div>" +
          '<div class="flex items-center gap-4 text-sm shrink-0 pt-1">' + legendChip("#94a3b8", "계획") + legendChip("#3b82f6", "실적") + "</div></div>" +
          '<div class="mt-4 flex flex-col md:flex-row gap-6 items-stretch">' +
          '<div class="relative min-w-0 flex-1 h-64 md:h-80"><canvas id="pva-' + s.key + '"></canvas></div>' +
          '<div class="relative md:w-44 shrink-0 h-48 md:h-80"><canvas id="pva-' + s.key + '-annual"></canvas></div>' +
          "</div></div></div>"
        );
      }).join("") +
      "</div>";

    document.getElementById("pva-year").addEventListener("change", function (e) {
      pvaYear = Number(e.target.value);
      renderPlan();
    });

    sections.forEach(function (s) {
      var dec = s.label === undefined ? s.d : s.label;
      var tickDec = s.tick === undefined ? s.d : s.tick;
      var fmtV = function (v) { return fmt(v, dec); };
      var actual = pad12(s.actual.slice(0, n));
      makeChart("pva-" + s.key, {
        type: "bar",
        data: {
          labels: MONTH_LABELS.map(function (m) { return m + "월"; }),
          datasets: [
            { label: "계획", data: s.plan, backgroundColor: "#94a3b8", labelColor: "#4b5563", borderRadius: 2, categoryPercentage: 0.7 },
            { label: "실적", data: actual, backgroundColor: "#3b82f6", labelColor: "#2563eb", borderRadius: 2, categoryPercentage: 0.7 }
          ]
        },
        options: {
          layout: { padding: { top: isNarrow() ? 8 : 34 } },
          plugins: {
            legend: { display: false },
            valueLabels: { enabled: !isNarrow(), format: fmtV },
            pvaRates: { enabled: !isNarrow() }
          },
          scales: {
            x: { grid: { display: false } },
            y: { grid: GRID, beginAtZero: true, ticks: { callback: function (v) { return fmt(v, tickDec) + " " + s.unit; } } }
          }
        }
      });
      var planSum = round(sum(s.plan.slice(0, n)), s.d);
      var actSum = round(sum(s.actual.slice(0, n)), s.d);
      makeChart("pva-" + s.key + "-annual", {
        type: "bar",
        data: {
          labels: ["누계"],
          datasets: [
            { label: "계획", data: [planSum], backgroundColor: "#94a3b8", labelColor: "#4b5563" },
            { label: "실적", data: [actSum], backgroundColor: "#3b82f6", labelColor: "#2563eb" }
          ]
        },
        options: {
          layout: { padding: { top: 34 } },
          plugins: {
            legend: { display: false },
            valueLabels: { enabled: true, format: fmtV },
            pvaRates: { enabled: true, prefix: "달성률 " }
          },
          scales: { x: { grid: { display: false } }, y: { display: false, beginAtZero: true } }
        }
      });
    });
  }

  // ---------- 팀별 손익 ----------

  function renderTeamProfit() {
    var rows = "";
    var totA = [0, 0, 0];
    var totB = [0, 0, 0];
    function cells(a, b) {
      var d = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
      return (
        '<td class="num">' + fmt(a[0]) + '</td><td class="num">' + fmt(a[1]) + '</td><td class="num ' + (a[2] < 0 ? "text-error" : "") + '">' + fmt(a[2], 1) + "</td>" +
        '<td class="num">' + fmt(b[0]) + '</td><td class="num">' + fmt(b[1]) + '</td><td class="num ' + (b[2] < 0 ? "text-error" : "") + '">' + fmt(b[2], 1) + "</td>" +
        '<td class="num">' + colored(signed(d[0]), d[0]) + '</td><td class="num">' + colored(signed(d[1]), d[1]) + '</td><td class="num">' + colored(signed(d[2], 1), round(d[2], 1)) + "</td>"
      );
    }
    TEAMS.forEach(function (t, ti) {
      var subA = [0, 0, 0];
      var subB = [0, 0, 0];
      t.rows.forEach(function (r, i) {
        var a = [r[1], r[2], r[3]];
        var b = TEAMS_PREV[ti][i];
        for (var k = 0; k < 3; k++) { subA[k] += a[k]; subB[k] += b[k]; }
        rows += "<tr>" + (i === 0 ? '<td class="team" rowspan="' + (t.rows.length + 1) + '">' + t.name + "<br><span class=\"text-xs text-base-content/50\">(" + t.code + ")</span></td>" : "") +
          '<td class="text-center">' + r[0] + "</td>" + cells(a, b) + "</tr>";
      });
      for (var k = 0; k < 3; k++) { totA[k] += subA[k]; totB[k] += subB[k]; }
      rows += '<tr class="subtotal"><td class="text-center">소계</td>' + cells(subA, subB) + "</tr>";
    });
    rows += '<tr class="subtotal bg-base-200"><td class="text-center" colspan="2">합계</td>' + cells(totA, totB) + "</tr>";

    function monthInput(label, v) {
      return '<div class="form-control"><label class="label py-0"><span class="label-text text-xs">' + label + '</span></label><input type="month" class="input input-bordered input-sm" value="' + v + '" readonly /></div>';
    }

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-table", "팀별 손익 현황", "팀별 손익 현황을 분석합니다.") +
      '<div class="card bg-base-100 shadow-xl mb-6"><div class="card-body">' +
      '<div class="flex flex-wrap items-center justify-between gap-4">' + cardTitle("ph-calendar", "기간 선택") +
      '<div class="flex flex-wrap items-center gap-4">' +
      '<div class="flex items-center gap-4"><h3 class="text-lg font-semibold whitespace-nowrap">기준년월 (A)</h3><div class="flex gap-2">' + monthInput("From", "2026-01") + monthInput("To", "2026-10") + "</div></div>" +
      '<div class="flex items-center gap-4"><h3 class="text-lg font-semibold whitespace-nowrap">비교년월 (B)</h3><div class="flex gap-2">' + monthInput("From", "2025-01") + monthInput("To", "2025-10") + "</div></div>" +
      "</div></div></div></div>" +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      '<div class="flex flex-wrap items-center justify-between gap-2">' + cardTitle("ph-table", "팀별 손익 현황") + '<span class="text-sm text-base-content/60">단위: MT, 억원</span></div>' +
      '<div class="overflow-x-auto"><table class="table table-sm demo-table border-t-2 border-b-2 border-base-300">' +
      "<thead>" +
      '<tr><th rowspan="2" class="text-center">팀명(부서코드)</th><th rowspan="2" class="text-center">자재그룹</th>' +
      '<th colspan="3" class="text-center">기준년월 (A) 2026.01~10</th><th colspan="3" class="text-center">비교년월 (B) 2025.01~10</th><th colspan="3" class="text-center">증감 (A-B)</th></tr>' +
      '<tr><th class="num">매출량</th><th class="num">매출액</th><th class="num">영업이익</th><th class="num">매출량</th><th class="num">매출액</th><th class="num">영업이익</th><th class="num">매출량</th><th class="num">매출액</th><th class="num">영업이익</th></tr>' +
      "</thead><tbody>" + rows + "</tbody></table></div>" +
      "</div></div></div>";
  }

  // ---------- 재무현황 ----------

  function renderFinance() {
    function diffLine(prefix, diff, rate, invert) {
      return '<p class="text-base mt-1">' + prefix + ": " + colored(signed(diff) + " 억원 (" + signed(rate, 1) + "%)", diff, invert) + "</p>";
    }
    function metricLine(prefix, diff, unit, d, invert) {
      return '<p class="text-base mt-1">' + prefix + ": " + colored(signed(diff, d) + unit, diff, invert) + "</p>";
    }
    function bsCard(label, value, mom, momRate, yoy, yoyRate, invert) {
      return statCard(label, fmt(value) + " 억원", diffLine("전월 대비", mom, momRate, invert) + diffLine("전년동월 대비", yoy, yoyRate, invert));
    }
    function metricCard(label, value, mom, yoy, unit, d, formula, invert) {
      return statCard(label, value, metricLine("전월 대비", mom, unit, d, invert) + metricLine("전년동월 대비", yoy, unit, d, invert) +
        '<p class="text-xs text-base-content/60 mt-2">' + formula + "</p>");
    }

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-currency-circle-dollar", "재무현황", "합계잔액시산표 기준 자산·부채·자본 현황을 조회합니다.",
        selectBox("fin-period", "기간 선택", [["202610", "2026년 10월"]], "202610", "w-48")) +
      '<h2 class="text-xl font-bold mb-4">재무현황</h2>' +
      '<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">' +
      bsCard("자산", 2480, 32, 1.3, 156, 6.7, false) +
      bsCard("부채", 1120, -18, -1.6, -64, -5.4, true) +
      bsCard("자본", 1360, 50, 3.8, 220, 19.3, false) +
      "</div>" +
      '<h2 class="text-xl font-bold mb-4">주요 재무지표</h2>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">' +
      metricCard("부채비율", "82.4%", -4.5, -21.5, "%p", 1, "부채 / 자본", true) +
      metricCard("유동비율", "168.5%", 2.1, 12.4, "%p", 1, "유동자산 / 유동부채", false) +
      metricCard("총자산 회전율", "0.70 회", 0.06, 0.05, " 회", 2, "(매출 당월 × 12) / 자산", false) +
      metricCard("매출채권회전율", "7.02 회", -0.15, 0.41, " 회", 2, "(매출 당월 × 12) / 매출채권", false) +
      "</div>" +
      '<h2 class="text-xl font-bold mb-4">자산, 부채 구성</h2>' +
      '<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-pie", "자산구성") + '<div class="h-80"><canvas id="fin-asset"></canvas></div></div></div>' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-pie", "부채구성") + '<div class="h-80"><canvas id="fin-liab"></canvas></div></div></div>' +
      "</div></div>";

    var colors = ["rgba(59,130,246,0.8)", "rgba(34,197,94,0.8)", "rgba(251,191,36,0.8)", "rgba(168,85,247,0.8)", "rgba(156,163,175,0.8)"];
    function pie(id, labels, data) {
      makeChart(id, {
        type: "pie",
        data: { labels: labels, datasets: [{ data: data, backgroundColor: colors }] },
        options: {
          plugins: {
            legend: { position: "bottom" },
            pieLabels: { enabled: true },
            tooltip: { callbacks: { label: function (c) { return c.label + ": " + fmt(c.raw) + " 억원"; } } }
          }
        }
      });
    }
    pie("fin-asset", ["유형자산", "재고자산", "현금성자산", "매출채권", "기타"], [1042, 546, 347, 248, 297]);
    pie("fin-liab", ["매입채무", "단기차입금", "장기차입금", "미지급금", "기타"], [392, 314, 224, 101, 89]);
  }

  // ---------- 판매 요약 ----------

  function renderMaterial() {
    var groups = ["A그룹", "B그룹", "C그룹", "D그룹"];
    var share = [956, 234, 46, 48];
    var qtyShare = [96120, 23130, 4480, 4720];
    var monthly = YEARS[2026].qty.map(function (q) {
      return [round(q * 0.748), round(q * 0.18), round(q * 0.035), round(q * 0.037)];
    });

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-chart-pie", "판매 요약", "자재그룹별 판매량과 매출 비중을 요약합니다. (2026년 10월 누계)") +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">' +
      groups.map(function (g, i) {
        return statCard(g + " 매출액", fmt(share[i]) + " 억원",
          '<p class="text-base text-base-content/60 mt-1">매출량 ' + fmt(qtyShare[i]) + " MT · 비중 " + Math.round((share[i] / 1284) * 100) + "%</p>");
      }).join("") +
      "</div>" +
      '<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">' +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-pie", "자재그룹별 매출 비중") + '<div class="h-80"><canvas id="mat-pie"></canvas></div></div></div>' +
      '<div class="card bg-base-100 shadow-xl lg:col-span-2"><div class="card-body">' + cardTitle("ph-chart-bar", "월별 자재그룹별 판매량") + '<div class="h-80"><canvas id="mat-bar"></canvas></div></div></div>' +
      "</div></div>";

    var colors = ["rgba(59,130,246,0.8)", "rgba(34,197,94,0.8)", "rgba(251,191,36,0.8)", "rgba(168,85,247,0.8)"];
    makeChart("mat-pie", {
      type: "doughnut",
      data: { labels: groups, datasets: [{ data: share, backgroundColor: colors }] },
      options: { plugins: { legend: { position: "bottom" }, pieLabels: { enabled: true } } }
    });
    makeChart("mat-bar", {
      type: "bar",
      data: {
        labels: MONTH_LABELS.slice(0, 10).map(function (m) { return m + "월"; }),
        datasets: groups.map(function (g, gi) {
          return { label: g, data: monthly.map(function (m) { return m[gi]; }), backgroundColor: colors[gi] };
        })
      },
      options: {
        plugins: { legend: { position: "bottom" } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: GRID, ticks: { callback: function (v) { return fmt(v) + " MT"; } } } }
      }
    });
  }

  // ---------- 판매 분석 ----------

  function renderSales() {
    var filters = [
      ["품목계정", ["제품", "상품"]],
      ["자재그룹", ["A그룹", "B그룹", "C그룹", "D그룹"]],
      ["유통경로", ["내수", "수출"]],
      ["주문유형", ["일반", "임가공"]],
      ["부서코드", ["영업1팀", "영업2팀", "영업3팀", "수출팀"]],
      ["재질(강종)", ["일반재", "고내식", "컬러"]]
    ];
    var labels = [];
    var qty = [];
    var price = [];
    YEARS[2025].qty.concat(YEARS[2026].qty).forEach(function (q, i) {
      var yy = i < 12 ? "25" : "26";
      labels.push(yy + "." + String((i % 12) + 1).padStart(2, "0"));
      qty.push(q);
      price.push(Math.round(965 + 28 * Math.sin(i * 0.55) + i * 1.8));
    });

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-chart-line", "판매 분석", "매출 추이를 분석합니다.") +
      '<div class="card bg-base-100 shadow-xl mb-6 overflow-visible"><div class="card-body overflow-visible">' +
      '<h2 class="card-title mb-4"><i class="ph ph-funnel" style="font-size:20px"></i><span>필터 옵션</span></h2>' +
      '<div class="grid grid-cols-2 md:grid-cols-6 gap-6">' +
      filters.map(function (f) {
        return (
          '<div class="sales-filter-group relative" tabindex="0">' +
          '<div class="flex items-center gap-2 mb-2"><h3 class="font-semibold">' + f[0] + '</h3><i class="ph ph-caret-down sales-filter-icon transition-transform"></i></div>' +
          '<p class="text-sm text-base-content/60">전체</p>' +
          '<div class="sales-filter-panel space-y-2 absolute left-0 top-full z-20 w-full min-w-[10rem] bg-base-100 border border-base-300 rounded-lg shadow-lg p-3">' +
          '<label class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-sm" checked /><span class="text-sm">전체</span></label>' +
          f[1].map(function (o) { return '<label class="flex items-center gap-2"><input type="checkbox" class="checkbox checkbox-sm" checked /><span class="text-sm">' + o + "</span></label>"; }).join("") +
          "</div></div>"
        );
      }).join("") +
      "</div></div></div>" +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      '<div class="flex flex-wrap justify-between items-center gap-4 mb-4">' + cardTitle("ph-chart-line", "매출 추이") +
      '<div class="flex gap-4">' +
      '<div class="form-control"><label class="label"><span class="label-text text-xs">기간 From</span></label><input type="month" class="input input-bordered input-sm" value="2025-01" readonly /></div>' +
      '<div class="form-control"><label class="label"><span class="label-text text-xs">기간 To</span></label><input type="month" class="input input-bordered input-sm" value="2026-10" readonly /></div>' +
      "</div></div>" +
      '<div class="flex justify-between items-center mb-2 px-2"><span class="text-sm font-semibold text-green-600">매출량 (MT)</span><span class="text-sm font-semibold text-blue-600">판매단가 (천원)</span></div>' +
      '<div class="h-96"><canvas id="sales-chart"></canvas></div>' +
      "</div></div></div>";

    makeChart("sales-chart", {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          { type: "line", label: "판매단가", data: price, borderColor: "rgb(59,130,246)", backgroundColor: "rgb(59,130,246)", yAxisID: "y1", tension: 0.35, pointRadius: 3 },
          { label: "매출량", data: qty, backgroundColor: "rgba(34,197,94,0.6)", borderColor: "rgb(34,197,94)", borderWidth: 1, yAxisID: "y" }
        ]
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: { grid: { display: false } },
          y: { position: "left", grid: GRID, beginAtZero: true, ticks: { callback: function (v) { return fmt(v); } } },
          y1: { position: "right", grid: { display: false }, min: 850, max: 1100, ticks: { callback: function (v) { return fmt(v); } } }
        }
      }
    });
  }

  // ---------- 생산 ----------

  var LINES = ["1라인", "2라인", "3라인", "4라인"];
  var LINE_PROD = [6820, 3910, 2640, 1180];
  var LINE_PROD_DIFF = [340, -120, 210, 45];
  var LINE_COST = [48200, 61500, 72300, 95800];
  var LINE_COST_DIFF = [-1300, 800, -2100, -3400];
  var productionLine = "1라인";

  function lineSeries(k) {
    var prod = [];
    var cost = [];
    for (var i = 0; i < 12; i++) {
      prod.push(Math.round((LINE_PROD[k] * (0.9 + 0.07 * Math.sin(i * 0.9 + k))) / 10) * 10);
      cost.push(Math.round((LINE_COST[k] * (1.04 - 0.05 * Math.sin(i * 0.9 + k))) / 100) * 100);
    }
    prod[11] = LINE_PROD[k];
    prod[10] = LINE_PROD[k] - LINE_PROD_DIFF[k];
    cost[11] = LINE_COST[k];
    cost[10] = LINE_COST[k] - LINE_COST_DIFF[k];
    return { prod: prod, cost: cost };
  }

  function renderProduction() {
    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-factory", "라인별 생산량, 원단위", "수불부 데이터를 기반으로 라인별 생산량과 가공비 원단위를 분석합니다.",
        selectBox("prod-period", "기간 선택", [["202610", "2026년 10월"]], "202610")) +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">' +
      LINES.map(function (l, i) {
        return statCard(l + " 생산량", fmt(LINE_PROD[i]) + " MT", '<p class="text-base mt-1">전월 대비: ' + colored(signed(LINE_PROD_DIFF[i]) + " MT", LINE_PROD_DIFF[i]) + "</p>");
      }).join("") +
      "</div>" +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">' +
      LINES.map(function (l, i) {
        return statCard(l + " 가공비 원단위", fmt(LINE_COST[i]) + " 원/MT", '<p class="text-base mt-1">전월 대비: ' + colored(signed(LINE_COST_DIFF[i]) + " 원/MT", LINE_COST_DIFF[i], true) + "</p>");
      }).join("") +
      "</div>" +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
      '<div class="flex flex-wrap justify-between items-center gap-4 mb-4">' + cardTitle("ph-chart-line", "라인별 생산량 추이") +
      '<div class="form-control"><label class="label"><span class="label-text text-xs">작업장</span></label>' +
      '<select class="select select-bordered select-sm" id="line-select">' +
      LINES.concat(["전체"]).map(function (l) { return '<option value="' + l + '"' + (l === productionLine ? " selected" : "") + ">" + l + "</option>"; }).join("") +
      "</select></div></div>" +
      '<div class="h-96"><canvas id="prod-chart"></canvas></div>' +
      "</div></div></div>";

    document.getElementById("line-select").addEventListener("change", function (e) {
      productionLine = e.target.value;
      renderProduction();
    });

    var prod;
    var cost;
    if (productionLine === "전체") {
      var all = LINES.map(function (l, k) { return lineSeries(k); });
      prod = LAST12.map(function (m, i) { return sum(all.map(function (s) { return s.prod[i]; })); });
      cost = LAST12.map(function (m, i) {
        var w = sum(all.map(function (s) { return s.prod[i] * s.cost[i]; }));
        return Math.round(w / prod[i] / 100) * 100;
      });
    } else {
      var s = lineSeries(LINES.indexOf(productionLine));
      prod = s.prod;
      cost = s.cost;
    }
    makeChart("prod-chart", {
      type: "bar",
      data: {
        labels: LAST12,
        datasets: [
          { type: "line", label: "가공비 원단위 (원/MT)", data: cost, borderColor: "rgb(239,68,68)", backgroundColor: "rgb(239,68,68)", yAxisID: "y1", tension: 0.35, pointRadius: 3 },
          { label: "생산량 (MT)", data: prod, backgroundColor: "rgba(59,130,246,0.75)", yAxisID: "y" }
        ]
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "bottom" } },
        scales: {
          x: { grid: { display: false } },
          y: { grid: GRID, beginAtZero: true, ticks: { callback: function (v) { return fmt(v) + " MT"; } } },
          y1: { position: "right", grid: { display: false }, ticks: { callback: function (v) { return fmt(v); } } }
        }
      }
    });
  }

  // ---------- 재고 ----------

  var INV = {
    FERT: [16800, 17200, 17650, 17900, 18100, 17600, 17300, 17800, 18050, 18300, 18160, 18420],
    HALB: [9100, 9300, 9500, 9800, 9650, 9400, 9550, 9700, 9900, 10050, 9930, 9860],
    ROH: [22400, 23100, 23800, 22900, 23400, 24100, 23600, 23200, 22800, 23500, 23070, 24310]
  };
  var invType = "ALL";

  function renderInventory() {
    var last = function (a) { return a[11]; };
    var diff = function (a) { return a[11] - a[10]; };
    var total = LAST12.map(function (m, i) { return INV.FERT[i] + INV.HALB[i] + INV.ROH[i]; });
    function card(label, arr) {
      return statCard(label, fmt(last(arr)) + " MT", '<p class="text-base mt-1">전월대비 ' + colored(signed(diff(arr)) + " MT", diff(arr), true) + "</p>");
    }

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-warehouse", "재고 분석", "수불부 데이터를 기반으로 재고 현황을 분석합니다.",
        selectBox("inv-period", "기간 선택", [["202610", "2026년 10월"]], "202610")) +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">' +
      card("제품 재고량", INV.FERT) + card("반제품 재고량", INV.HALB) + card("원재료 재고량", INV.ROH) + card("제품+반제품+원재료", total) +
      "</div>" +
      '<div class="card bg-base-100 shadow-xl mb-8"><div class="card-body">' +
      '<div class="flex flex-wrap justify-between items-center gap-4 mb-4">' + cardTitle("ph-chart-line", "기간별 재고 추이") +
      '<div class="form-control"><label class="label"><span class="label-text text-xs">품목계정</span></label>' +
      '<select class="select select-bordered select-sm" id="inv-type">' +
      [["ALL", "제품+반제품+원재료"], ["FERT", "제품"], ["HALB", "반제품"], ["ROH", "원재료"]].map(function (o) {
        return '<option value="' + o[0] + '"' + (o[0] === invType ? " selected" : "") + ">" + o[1] + "</option>";
      }).join("") +
      "</select></div></div>" +
      '<div class="h-96"><canvas id="inv-chart"></canvas></div>' +
      "</div></div></div>";

    document.getElementById("inv-type").addEventListener("change", function (e) {
      invType = e.target.value;
      renderInventory();
    });

    var colors = { FERT: "rgb(59,130,246)", HALB: "rgb(34,197,94)", ROH: "rgb(251,191,36)" };
    var names = { FERT: "제품", HALB: "반제품", ROH: "원재료" };
    var datasets = invType === "ALL"
      ? ["FERT", "HALB", "ROH"].map(function (k) { return { label: names[k], data: INV[k], backgroundColor: colors[k].replace("rgb", "rgba").replace(")", ",0.75)") }; })
      : [{ type: "line", label: names[invType], data: INV[invType], borderColor: colors[invType], backgroundColor: colors[invType].replace("rgb", "rgba").replace(")", ",0.12)"), fill: true, tension: 0.35, pointRadius: 3 }];
    makeChart("inv-chart", {
      type: "bar",
      data: { labels: LAST12, datasets: datasets },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { position: "bottom" },
          valueLabels: invType === "ALL" ? { enabled: false } : { enabled: true, offset: 7, format: function (v) { return fmt(v); } }
        },
        layout: { padding: { top: 16 } },
        scales: {
          x: { stacked: invType === "ALL", grid: { display: false } },
          y: { stacked: invType === "ALL", grid: GRID, beginAtZero: invType === "ALL", ticks: { callback: function (v) { return fmt(v) + " MT"; } } }
        }
      }
    });
  }

  // ---------- 인원현황 ----------

  function renderHeadcount() {
    var totals = [178, 179, 180, 180, 182, 183, 183, 184, 185, 185, 186, 186];
    var office = [55, 55, 56, 56, 56, 57, 57, 57, 58, 58, 58, 58];
    var exec = totals.map(function () { return 6; });
    var other = totals.map(function () { return 10; });
    var prof = totals.map(function (t, i) { return t - office[i] - exec[i] - other[i]; });

    function iconCard(label, value, icon, color, extra) {
      return (
        '<div class="card bg-base-100 shadow-xl"><div class="card-body">' +
        '<div class="flex items-center justify-between"><div><p class="text-sm text-base-content/60">' + label + '</p><h2 class="text-3xl font-bold">' + value + "</h2></div>" +
        '<div class="avatar placeholder"><div class="' + color + ' rounded-full w-12 h-12"><i class="ph ' + icon + '" style="font-size:24px"></i></div></div></div>' +
        extra + "</div></div>"
      );
    }
    function split(a, b) {
      return '<div class="mt-3 pt-3 border-t border-base-300 grid grid-cols-2 gap-3">' +
        '<div><p class="text-xs text-base-content/60">전문직</p><p class="text-lg font-bold">' + a + "</p></div>" +
        '<div><p class="text-xs text-base-content/60">사무직</p><p class="text-lg font-bold">' + b + "</p></div></div>";
    }

    view.innerHTML =
      '<div class="p-6">' +
      pageHeader("ph-users", "인원현황", "월별 인원 현황을 조회합니다.",
        '<div class="form-control"><label class="label"><span class="label-text">연월</span></label><input type="month" class="input input-bordered w-full max-w-xs" value="2026-10" readonly /></div>') +
      '<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">' +
      iconCard("전체 직원수", "186명", "ph-users", "bg-primary text-primary-content", '<p class="text-xs text-base-content/60 mt-2">2026년 10월 말 기준</p>') +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body !gap-0"><p class="text-sm text-base-content/60 mb-3">직종별 직원수</p>' +
      '<div class="grid grid-cols-2 gap-x-3 gap-y-3">' +
      [["임원", 6], ["사무직", 58], ["전문직", 112], ["기타", 10]].map(function (r) {
        return '<div><p class="text-xs text-base-content/60 leading-none">' + r[0] + '</p><p class="text-xl font-bold leading-tight mt-1">' + r[1] + "명</p></div>";
      }).join("") +
      "</div></div></div>" +
      iconCard("평균 근속년수", "12.4년", "ph-briefcase", "bg-secondary text-secondary-content", '<p class="text-xs text-base-content/60 mt-2">입사일자 기준</p>' + split("13.8년", "10.1년")) +
      iconCard("평균 연령", "43.2세", "ph-cake", "bg-accent text-accent-content", '<p class="text-xs text-base-content/60 mt-2">생년월일 기준</p>' + split("45.1세", "39.6세")) +
      "</div>" +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body">' + cardTitle("ph-chart-bar", "월별 직종별 인원 추이") +
      '<div class="h-96"><canvas id="hc-chart"></canvas></div></div></div>' +
      "</div>";

    makeChart("hc-chart", {
      type: "bar",
      data: {
        labels: LAST12,
        datasets: [
          { label: "전문직", data: prof, backgroundColor: "rgba(59,130,246,0.8)" },
          { label: "사무직", data: office, backgroundColor: "rgba(34,197,94,0.8)" },
          { label: "임원", data: exec, backgroundColor: "rgba(168,85,247,0.8)" },
          { label: "기타", data: other, backgroundColor: "rgba(156,163,175,0.8)" }
        ]
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: { legend: { position: "bottom" } },
        scales: { x: { stacked: true, grid: { display: false } }, y: { stacked: true, grid: GRID, ticks: { callback: function (v) { return v + "명"; } } } }
      }
    });
  }

  // ---------- 데모 미제공 화면 ----------

  var PLACEHOLDERS = {
    "processing-cost": ["ph-calculator", "라인별 가공비", "라인별 가공비를 인건비·동력비·수선비 등 비목별로 나누어 분석합니다."],
    "processing-cost-summary": ["ph-calculator", "라인별 가공비(요약)", "라인별 가공비를 월별로 요약하고 전월·전년 대비 증감을 보여 줍니다."],
    "processing-cost-total": ["ph-calculator", "총제조비용", "재료비·노무비·경비를 합한 총제조비용 추이를 분석합니다."],
    utility: ["ph-lightning", "유틸리티", "전력·가스·용수 사용량과 원단위를 라인별로 분석합니다."],
    waste: ["ph-trash", "폐기 비용", "폐기물 발생량과 처리 비용을 월별로 관리합니다."],
    purchase: ["ph-shopping-cart", "원재료 매입 분석", "원재료 매입량과 매입단가 추이, 공급사별 비중을 분석합니다."],
    "margin-profit": ["ph-chart-line-down", "한계이익 분석", "거래처·품목별 한계이익을 계산해 적자 거래처를 찾아냅니다."],
    "inventory-price": ["ph-chart-line", "재고 단가 분석", "품목계정별 재고 단가 추이를 분석합니다."],
    "team-inventory": ["ph-table", "팀별 제품 재고 현황", "영업팀별 제품 재고와 장기 재고를 확인합니다."],
    peer: ["ph-buildings", "동종사 경영실적", "동종업계 회사들의 분기·누계 경영실적을 전년과 비교합니다."]
  };

  function renderPlaceholder(route) {
    var p = PLACEHOLDERS[route];
    view.innerHTML =
      '<div class="p-6">' +
      pageHeader(p[0], p[1], p[2]) +
      '<div class="card bg-base-100 shadow-xl"><div class="card-body items-center text-center py-16">' +
      '<div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-base-200 mb-2"><i class="ph ' + p[0] + '" style="font-size:32px"></i></div>' +
      '<h2 class="text-xl font-bold">이 화면은 데모에서 미리보기를 제공하지 않습니다</h2>' +
      '<p class="text-base-content/60 max-w-md">실제 서비스에서는 회사의 ERP 데이터를 연결해 ' + p[1] + " 화면을 제공합니다. 업무에 맞춘 화면 구성은 상담을 통해 함께 설계합니다.</p>" +
      '<div class="flex flex-wrap justify-center gap-2 mt-4">' +
      '<a href="#main" class="btn">메인 대시보드 보기</a>' +
      '<a href="mailto:thehunss@gmail.com?subject=%EA%B2%BD%EC%98%81%EA%B4%80%EB%A6%AC%20AI%20%EB%8F%84%EC%9E%85%20%EB%AC%B8%EC%9D%98" class="btn demo-gpt-btn">도입 문의하기</a>' +
      "</div></div></div></div>";
  }

  // ---------- 라우터 ----------

  var ROUTES = {
    main: renderMain,
    material: renderMaterial,
    sales: renderSales,
    production: renderProduction,
    "team-profit": renderTeamProfit,
    "plan-vs-actual": renderPlan,
    finance: renderFinance,
    inventory: renderInventory,
    headcount: renderHeadcount
  };

  var sidebar = document.getElementById("sidebar");
  var sidebarBackdrop = document.getElementById("sidebar-backdrop");

  function openSidebar() {
    sidebar.classList.add("is-open");
    sidebarBackdrop.hidden = false;
  }
  function closeSidebar() {
    sidebar.classList.remove("is-open");
    sidebarBackdrop.hidden = true;
  }

  function route() {
    var name = location.hash.replace("#", "") || "main";
    if (!ROUTES[name] && !PLACEHOLDERS[name]) name = "main";
    destroyCharts();
    (ROUTES[name] || function () { renderPlaceholder(name); })();
    view.scrollTop = 0;

    document.querySelectorAll("#demo-menu details").forEach(function (d) { d.open = false; });
    document.querySelectorAll("#demo-menu a[data-route]").forEach(function (a) {
      var active = a.getAttribute("data-route") === name;
      a.classList.toggle("active", active);
      if (active) {
        var details = a.closest("details");
        if (details) details.open = true;
      }
    });
    closeSidebar();
  }

  window.addEventListener("hashchange", route);
  document.getElementById("sidebar-open").addEventListener("click", openSidebar);
  document.getElementById("sidebar-close").addEventListener("click", closeSidebar);
  sidebarBackdrop.addEventListener("click", closeSidebar);

  // ---------- 토스트 ----------

  var toast = document.getElementById("demo-toast");
  var toastText = document.getElementById("demo-toast-text");
  var toastTimer;
  function showToast(text) {
    toastText.textContent = text;
    toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.hidden = true; }, 2200);
  }
  document.querySelectorAll("[data-demo-only]").forEach(function (el) {
    el.addEventListener("click", function () { showToast("데모에서는 사용할 수 없는 기능입니다."); });
  });

  // ---------- AI 어시스턴트 ----------

  var panel = document.getElementById("gpt-panel");
  var gptBackdrop = document.getElementById("gpt-backdrop");
  var messages = document.getElementById("gpt-messages");
  var form = document.getElementById("gpt-form");
  var input = document.getElementById("gpt-input");
  var sendBtn = document.getElementById("gpt-send");
  var titleEl = document.getElementById("gpt-title");
  var sending = false;
  var lastTopic = null;

  var EXAMPLES = ["올해 팀별 영업이익 순위 알려줘", "10월 매출액은 계획 대비 어때?", "재고가 가장 많이 늘어난 건 뭐야?"];

  function teamRankAnswer() {
    var teams = TEAMS.map(function (t) {
      return { name: t.name, rev: sum(t.rows.map(function (r) { return r[2]; })), profit: round(sum(t.rows.map(function (r) { return r[3]; })), 1) };
    }).sort(function (a, b) { return b.profit - a.profit; });
    return {
      html:
        "<p>2026년 10월 누계 기준 팀별 영업이익 순위입니다.</p>" +
        "<table><thead><tr><th>순위</th><th>팀</th><th>매출액</th><th>영업이익</th><th>이익률</th></tr></thead><tbody>" +
        teams.map(function (t, i) {
          var neg = t.profit < 0 ? ' style="color:#dc2626"' : "";
          return "<tr><td>" + (i + 1) + "</td><td>" + t.name + '</td><td class="num">' + fmt(t.rev) + '억</td><td class="num"' + neg + ">" + fmt(t.profit, 1) + '억</td><td class="num"' + neg + ">" + signed((t.profit / t.rev) * 100, 1) + "%</td></tr>";
        }).join("") +
        "</tbody></table>" +
        "<p>영업3팀만 적자(−1.3억원)이며, B그룹에서 −1.9억원 손실이 났습니다.</p>",
      topic: "team",
      next: ["영업3팀은 왜 적자야?", "10월 매출액은 계획 대비 어때?"]
    };
  }

  function lossReasonAnswer() {
    return {
      html:
        "<p>영업3팀 적자의 주요 원인은 다음과 같습니다.</p>" +
        "<ul>" +
        "<li><b>B그룹 판매단가 하락</b>: 상반기 대비 톤당 단가가 6.2% 내려 한계이익이 줄었습니다.</li>" +
        "<li><b>한계적자 거래처</b>: 3곳에서 −1.6억원이 발생해 팀 손실의 대부분을 차지합니다.</li>" +
        "<li><b>A그룹</b>은 0.6억원 흑자를 유지하고 있습니다.</li>" +
        "</ul>" +
        "<p>B그룹 단가 조정이나 한계적자 거래처 물량 조정을 검토해 보세요.</p>",
      topic: "team3",
      next: ["재고가 가장 많이 늘어난 건 뭐야?", "부채비율은 어때?"]
    };
  }

  function revenueAnswer() {
    return {
      html:
        "<p>10월 매출액은 <b>145억원</b>으로 계획(128억원)보다 17억원 많아 <b>달성률 113.3%</b>입니다.</p>" +
        "<table><thead><tr><th>구분</th><th>계획</th><th>실적</th><th>달성률</th></tr></thead><tbody>" +
        '<tr><td>8월</td><td class="num">124억</td><td class="num">118억</td><td class="num" style="color:#dc2626">95.2%</td></tr>' +
        '<tr><td>9월</td><td class="num">123억</td><td class="num">131억</td><td class="num">106.5%</td></tr>' +
        '<tr><td>10월</td><td class="num">128억</td><td class="num">145억</td><td class="num">113.3%</td></tr>' +
        '<tr><td><b>누계</b></td><td class="num">1,222억</td><td class="num">1,284억</td><td class="num"><b>105.1%</b></td></tr>' +
        "</tbody></table>" +
        "<p>8월 미달분을 9~10월에 만회해 누계로는 계획을 62억원 초과했습니다.</p>",
      topic: "revenue",
      next: ["올해 팀별 영업이익 순위 알려줘", "재고가 가장 많이 늘어난 건 뭐야?"]
    };
  }

  function inventoryAnswer() {
    return {
      html:
        "<p>2026년 10월 말 기준, 전월 대비 가장 많이 늘어난 재고는 <b>원재료</b>입니다.</p>" +
        "<table><thead><tr><th>품목계정</th><th>9월</th><th>10월</th><th>증감</th></tr></thead><tbody>" +
        '<tr><td>원재료</td><td class="num">23,070</td><td class="num">24,310</td><td class="num" style="color:#dc2626">+1,240</td></tr>' +
        '<tr><td>제품</td><td class="num">18,160</td><td class="num">18,420</td><td class="num" style="color:#dc2626">+260</td></tr>' +
        '<tr><td>반제품</td><td class="num">9,930</td><td class="num">9,860</td><td class="num">−70</td></tr>' +
        "</tbody></table>" +
        "<p>단위는 MT입니다. 원재료는 5.4% 늘었으며, 11월 생산 계획을 고려하면 적정 수준인지 확인이 필요합니다.</p>",
      topic: "inventory",
      next: ["부채비율은 어때?", "올해 팀별 영업이익 순위 알려줘"]
    };
  }

  function financeAnswer() {
    return {
      html:
        "<p>2026년 10월 부채비율은 <b>82.4%</b>로 전월보다 4.5%p 낮아졌습니다.</p>" +
        "<ul>" +
        "<li>부채 1,120억원 (전월 대비 −18억원)</li>" +
        "<li>자본 1,360억원 (전월 대비 +50억원)</li>" +
        "<li>유동비율 168.5%로 단기 지급 능력도 양호합니다.</li>" +
        "</ul>",
      topic: "finance",
      next: ["10월 매출액은 계획 대비 어때?", "올해 팀별 영업이익 순위 알려줘"]
    };
  }

  function fallbackAnswer() {
    return {
      html:
        "<p>데모에서는 준비된 예시 질문에만 답변할 수 있어요.</p>" +
        "<p>실제 서비스에서는 회사 데이터베이스를 직접 조회해 생산·판매·손익·재무에 대한 질문에 답변합니다. 아래 질문을 눌러 체험해 보세요.</p>",
      topic: null,
      next: EXAMPLES
    };
  }

  function answerFor(q) {
    var t = q.replace(/\s+/g, "");
    if (/(적자|왜|원인|이유)/.test(t) && (/3팀/.test(t) || lastTopic === "team")) return lossReasonAnswer();
    if (/(순위|팀별|영업이익|손익)/.test(t)) return teamRankAnswer();
    if (/(매출|계획|달성)/.test(t)) return revenueAnswer();
    if (/재고/.test(t)) return inventoryAnswer();
    if (/(부채|자산|자본|재무|유동)/.test(t)) return financeAnswer();
    return fallbackAnswer();
  }

  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function suggestionButtons(list) {
    return '<div class="flex flex-wrap gap-2 mt-3">' + list.map(function (q) {
      return '<button type="button" class="btn btn-outline btn-xs gpt-suggest" data-q="' + escapeHtml(q) + '">' + escapeHtml(q) + "</button>";
    }).join("") + "</div>";
  }

  function showWelcome() {
    lastTopic = null;
    titleEl.textContent = "AI 어시스턴트";
    messages.innerHTML =
      '<div id="gpt-welcome" class="text-center py-10 px-2">' +
      '<div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3"><i class="ph ph-chat-circle-dots text-primary" style="font-size:28px"></i></div>' +
      '<p class="font-medium mb-1">안녕하세요</p>' +
      '<p class="text-sm text-base-content/60 mb-4">생산·판매·손익 데이터를 자연어로 질문해 보세요.</p>' +
      '<div class="flex flex-col gap-2">' +
      EXAMPLES.map(function (q) { return '<button type="button" class="btn btn-outline btn-sm gpt-suggest" data-q="' + q + '">' + q + "</button>"; }).join("") +
      "</div></div>";
  }

  function appendBubble(html, role) {
    var welcome = document.getElementById("gpt-welcome");
    if (welcome) welcome.remove();
    var wrap = document.createElement("div");
    wrap.className = role === "user" ? "flex justify-end" : "flex justify-start";
    var bubble = document.createElement("div");
    bubble.className = role === "user"
      ? "max-w-[90%] rounded-2xl px-3 py-2 text-sm bg-[#3b4951] text-white"
      : "max-w-[95%] rounded-2xl px-3 py-2 text-sm bg-base-200 gpt-md";
    bubble.innerHTML = html;
    wrap.appendChild(bubble);
    messages.appendChild(wrap);
    messages.scrollTop = messages.scrollHeight;
    return wrap;
  }

  function ask(question) {
    question = question.trim();
    if (!question || sending) return;
    sending = true;
    input.value = "";
    input.style.height = "auto";
    sendBtn.disabled = true;
    messages.querySelectorAll(".gpt-suggest-wrap").forEach(function (el) { el.remove(); });
    if (titleEl.textContent === "AI 어시스턴트") titleEl.textContent = question.length > 24 ? question.slice(0, 24) + "…" : question;
    appendBubble(escapeHtml(question), "user");
    var loading = appendBubble('<span class="loading loading-spinner loading-xs"></span> 답변 생성 중...', "assistant");
    loading.querySelector("div").classList.remove("gpt-md");
    loading.querySelector("div").classList.add("flex", "items-center", "gap-2");
    setTimeout(function () {
      loading.remove();
      var a = answerFor(question);
      lastTopic = a.topic;
      appendBubble(a.html, "assistant");
      var s = document.createElement("div");
      s.className = "gpt-suggest-wrap";
      s.innerHTML = suggestionButtons(a.next);
      messages.appendChild(s);
      messages.scrollTop = messages.scrollHeight;
      sending = false;
    }, 1100);
  }

  function openPanel() {
    panel.classList.add("open");
    panel.setAttribute("aria-hidden", "false");
    gptBackdrop.hidden = false;
    setTimeout(function () { input.focus(); }, 300);
  }
  function closePanel() {
    panel.classList.remove("open");
    panel.setAttribute("aria-hidden", "true");
    gptBackdrop.hidden = true;
  }

  messages.addEventListener("click", function (e) {
    var btn = e.target.closest(".gpt-suggest");
    if (btn) ask(btn.getAttribute("data-q"));
  });
  document.getElementById("gpt-open").addEventListener("click", function () {
    closeSidebar();
    openPanel();
  });
  document.getElementById("gpt-close").addEventListener("click", closePanel);
  document.getElementById("gpt-new").addEventListener("click", showWelcome);
  gptBackdrop.addEventListener("click", closePanel);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    ask(input.value);
  });
  input.addEventListener("input", function () {
    input.style.height = "auto";
    input.style.height = Math.min(input.scrollHeight, 128) + "px";
    sendBtn.disabled = !input.value.trim() || sending;
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      ask(input.value);
    }
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closePanel();
      closeSidebar();
    }
  });

  showWelcome();
  route();
})();

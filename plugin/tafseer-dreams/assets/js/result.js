// Renders the /api/dreams response. All text goes in via textContent, never innerHTML.
// Exposed as window.TafseerResult; everything else stays inside this function.
(function () {
  "use strict";

  const SOURCE_NAMES = {
    all: "جميع الكتب",
    nabulsi: "النابلسي",
    ibn_sirin: "ابن سيرين",
    ibn_shaheen: "ابن شاهين",
    tabir: "تعبير الرؤيا",
    sadiq: "الإمام جعفر الصادق",
    freud: "سيغموند فرويد",
  };

  // What the Sunnah teaches after a bad dream (Sahih al-Bukhari, Sahih Muslim).
  // Fixed text, never generated.
  const SUNNA_RESPONSE = {
    title: "رؤيا مزعجة — ما أرشدت إليه السنة",
    steps: [
      "الاستعاذة بالله من الشيطان الرجيم ومن شر ما رأيت، ثلاث مرات.",
      "النفث عن يسارك ثلاثاً.",
      "التحوّل عن الجنب الذي كنت عليه إن أردت النوم مرة أخرى.",
      "صلاة ركعتين إن استطعت، وعدم تحديث أحد بها.",
    ],
    promise: "فإنها لا تضرك بإذن الله.",
    source: "من صحيح البخاري وصحيح مسلم",
  };

    // el("p", {class: "x", dir: "auto"}, "text", childNode, ...)
  function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined || v === false) continue;
      if (k === "class") node.className = v;
      else node.setAttribute(k, v === true ? "" : v);
    }
    for (const child of children.flat()) {
      if (child === null || child === undefined || child === false) continue;
      node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
  }

  function link(url, text) {
    return url
      ? el("a", { href: url, target: "_blank", rel: "noopener noreferrer" }, text)
      : el("span", {}, text);
  }

  const authorityName = (data) => SOURCE_NAMES[data.authority] || data.authority_name;

function pageRef(ref) {
    const label = `${SOURCE_NAMES[ref.source] || ref.source}${ref.printed_page ? `، ص ${ref.printed_page}` : ""}`;
    return link(ref.url, label);
  }

  function sourcesLine(refs, prefix = "المصدر") {
    if (!refs.length) return null;
    const parts = [];
    refs.forEach((r, i) => {
      if (i) parts.push(" · ");
      parts.push(pageRef(r));
    });
    return el("p", { class: "r-sources" }, `${prefix}: `, ...parts);
  }

  // Section ids carry the result container's id, so two results on one page don't share anchors.
  let idPrefix = "";

  function section(id, title, lead, ...children) {
    return el("section", { class: "r-section", id: `${idPrefix}-${id}` },
      el("h2", { class: "r-heading" }, title),
      lead ? el("p", { class: "r-lead" }, lead) : null,
      ...children,
    );
  }

  // ---------- pieces ----------

  function renderDream(data, dream, onEdit) {
    let editBtn = null;
    if (onEdit) {
      editBtn = el("button", { type: "button", class: "t-btn t-btn--ghost t-btn--sm" }, "تعديل الرؤيا");
      editBtn.addEventListener("click", onEdit);
    }
    return el("div", { class: "r-dream" },
      el("div", { class: "r-dream-head" },
        el("p", { class: "r-label" }, `رؤياك · ${authorityName(data)}`),
        editBtn,
      ),
      el("p", { class: "r-dream-text", dir: "auto" }, dream),
    );
  }

  function renderHero(data) {
    const texts = data.original_texts.length;
    return el("div", { class: `r-hero r-hero--${data.dream_type}` },
      el("span", { class: "r-badge", dir: "auto" }, data.dream_type_label),
      el("h1", { class: "r-title", dir: "auto" }, data.title),
      el("p", { class: "r-short", dir: "auto" }, data.short_summary),
      el("p", { class: "r-based" },
        "استناداً إلى ", link(data.authority_url, authorityName(data)),
        texts ? ` · عدد النصوص المستشهد بها: ${texts}` : " · تفسير عام، لم يُعثر على نصوص مطابقة"),
    );
  }

  function renderNav(data, hasOriginals) {
    const items = [
      ["r-reading", "التفسير"],
      ["r-symbols", "الرموز"],
      ["r-analysis", "التحليل"],
      ["r-summary", "الخلاصة"],
      hasOriginals ? ["r-originals", "النصوص الأصلية"] : null,
    ].filter(Boolean);
    return el("nav", { class: "r-nav", "aria-label": "الأقسام" },
      ...items.map(([id, label]) => el("a", { href: `#${idPrefix}-${id}` }, label)),
    );
  }

  function renderDua(text, dir) {
    if (!text) return null;
    return el("blockquote", { class: "r-dua", dir }, text);
  }

  function renderSunna(data) {
    if (data.dream_type !== "disturbing_dream" || data.authority === "freud") return null;
    const t = SUNNA_RESPONSE;
    return el("aside", { class: "r-sunna" },
      el("h2", { class: "r-sunna-title" }, t.title),
      el("ol", { class: "r-sunna-steps" }, ...t.steps.map((s) => el("li", {}, s))),
      el("p", { class: "r-sunna-promise" }, t.promise),
      renderDua(data.dua, "auto"),
      el("p", { class: "r-sunna-source" }, t.source),
    );
  }

  function renderReading(data) {
    return section("r-reading", "تفسير الرؤيا", null,
      el("ol", { class: "r-scenes" },
        ...data.reading.map((c, i) =>
          el("li", { class: "r-card r-scene" },
            el("p", { class: "r-scene-no" }, `المشهد ${i + 1}`),
            el("h3", { class: "r-scene-title", dir: "auto" }, c.title),
            ...c.paragraphs.map((p) => el("p", { class: "r-text", dir: "auto" }, p)),
            sourcesLine(c.sources),
          )),
      ),
    );
  }

  function renderSymbols(data) {
    return section("r-symbols", "الرموز ودلالاتها", null,
      ...data.symbols.map((s, i) =>
        el("article", { class: "r-card r-symbol" },
          el("div", { class: "r-symbol-head" },
            el("span", { class: "r-num" }, i + 1),
            el("h3", { class: "r-symbol-name", dir: "auto" }, s.symbol),
            s.cited
              ? el("span", { class: "r-tag r-tag--cited" }, "موثّق")
              : el("span", { class: "r-tag r-tag--general" }, "تفسير عام"),
          ),
          el("p", { class: "r-text r-meaning", dir: "auto" }, s.meaning),
          el("div", { class: "r-box" },
            el("p", { class: "r-box-label" }, "بحسب حالك"),
            el("p", { class: "r-text", dir: "auto" }, s.for_your_situation),
          ),
          s.cited
            ? sourcesLine(s.sources, "من")
            : el("p", { class: "r-sources" },
                "ليس من نص بعينه — تفسير عام على منهج ",
                link(s.authority_url, authorityName(data)), "."),
        )),
    );
  }

  function meter(label, value, kind) {
    return el("div", { class: `r-meter r-meter--${kind}` },
      el("div", { class: "r-meter-head" },
        el("span", {}, label),
        el("span", { class: "r-meter-value" }, `${value}%`),
      ),
      el("div", {
        class: "r-meter-track", role: "meter", "aria-label": label,
        "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(value),
      }, el("div", { class: "r-meter-fill", style: `width:${value}%` })),
    );
  }

  function renderAnalysis(data) {
    const a = data.analysis;
    return section("r-analysis", "التحليل", "الطابع العاطفي لرؤياك — تقدير مستنتج من التفسير، وليس قياساً دقيقاً.",
      el("article", { class: "r-card" },
        el("div", { class: "r-meters" },
          meter("التفاؤل", a.optimism, "optimism"),
          meter("الأمل", a.hope, "hope"),
          meter("القلق", a.anxiety, "anxiety"),
        ),
        el("p", { class: "r-text r-analysis-note", dir: "auto" }, a.explanation),
      ),
    );
  }

  function renderSummary(data, showDua) {
    return section("r-summary", "الخلاصة", null,
      el("article", { class: "r-card" },
        el("p", { class: "r-text", dir: "auto" }, data.summary.text),
        el("div", { class: "r-box" },
          el("p", { class: "r-box-label", dir: "auto" }, data.dream_type_label),
          el("p", { class: "r-text", dir: "auto" }, data.summary.dream_type_explained),
        ),
        showDua ? renderDua(data.dua, "auto") : null,
      ),
    );
  }

  function renderOriginals(data) {
    if (!data.original_texts.length) return null;
    return section("r-originals", "النصوص الأصلية من الكتب", "كلام الكتب نفسه دون تغيير. اضغط على الرمز لقراءته.",
      ...data.original_texts.map((o, i) =>
        el("details", { class: "r-original", open: i === 0 },
          el("summary", {},
            el("span", { class: "r-original-symbol", dir: "rtl" }, o.symbol),
            el("span", { class: "r-tag" }, `${SOURCE_NAMES[o.source] || o.source}${o.printed_page ? ` · ص ${o.printed_page}` : ""}`),
          ),
          el("blockquote", { class: "r-quote", dir: "rtl", lang: "ar" }, o.text_ar),
          el("p", { class: "r-original-link" }, link(o.url, "فتح المصدر ↗")),
        )),
    );
  }

  function renderActions(container, onNew, myDreamsUrl) {
    let again = null;
    if (onNew) {
      again = el("button", { type: "button", class: "t-btn t-btn--primary" }, "رؤيا جديدة");
      again.addEventListener("click", onNew);
    }
    const myDreams = myDreamsUrl ? el("a", { class: "t-btn t-btn--ghost", href: myDreamsUrl }, "أحلامي") : null;
    const copy = el("button", { type: "button", class: "t-btn t-btn--ghost" }, "نسخ");
    copy.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(container.innerText);
        copy.textContent = "تم النسخ";
      } catch {
        copy.textContent = "تعذّر النسخ";
      }
      setTimeout(() => (copy.textContent = "نسخ"), 1500);
    });
    const print = el("button", { type: "button", class: "t-btn t-btn--ghost" }, "طباعة");
    print.addEventListener("click", () => window.print());
    return el("div", { class: "r-actions" }, again, myDreams, copy, print);
  }

  // onEdit: back to the form as it was. onNew: back to the form for another dream.
  // myDreamsUrl: the [tafseer_my_dreams] page. Each is optional; its button is left out without it.
  function renderResult(container, data, dream, { onEdit, onNew, myDreamsUrl } = {}) {
    idPrefix = container.id;
    const sunna = renderSunna(data);
    const originals = renderOriginals(data);
    const sections = [
      renderDream(data, dream, onEdit),
      renderHero(data),
      sunna,
      renderNav(data, Boolean(originals)),
      renderReading(data),
      renderSymbols(data),
      renderAnalysis(data),
      renderSummary(data, !sunna),   // the dua sits in the sunna box when there is one
      originals,
      renderActions(container, onNew, myDreamsUrl),
    ];
    // replaceChildren would print a null as the text "null".
    container.replaceChildren(...sections.filter(Boolean));
  }

  window.TafseerResult = { render: renderResult, SOURCE_NAMES };
})();

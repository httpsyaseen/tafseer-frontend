// Renders the /api/dreams response. All text goes in via textContent, never innerHTML.

const SOURCE_NAMES = {
  nabulsi: "Al-Nabulsi",
  ibn_sirin: "Ibn Sirin",
  ibn_shaheen: "Ibn Shahin",
  tabir: "Ta'bir al-Ru'ya",
  sadiq: "Imam Ja'far al-Sadiq",
  freud: "Sigmund Freud",
};

// What the Sunnah teaches after a bad dream (Sahih al-Bukhari, Sahih Muslim).
// Fixed text, never generated.
const SUNNA_RESPONSE = {
  ar: {
    title: "رؤيا مزعجة — ما أرشدت إليه السنة",
    steps: [
      "الاستعاذة بالله من الشيطان الرجيم ومن شر ما رأيت، ثلاث مرات.",
      "النفث عن يسارك ثلاثاً.",
      "التحوّل عن الجنب الذي كنت عليه إن أردت النوم مرة أخرى.",
      "صلاة ركعتين إن استطعت، وعدم تحديث أحد بها.",
    ],
    promise: "فإنها لا تضرك بإذن الله.",
    source: "من صحيح البخاري وصحيح مسلم",
  },
  en: {
    title: "A distressing dream — the Sunnah response",
    steps: [
      "Seek refuge in Allah from Shaytan and from the evil of what you saw, three times.",
      "Spit lightly (dry) to your left three times.",
      "Turn over onto your other side if you go back to sleep.",
      "Pray two rak'ahs if you can, and do not tell anyone about the dream.",
    ],
    promise: "It will not harm you, by Allah's permission.",
    source: "From Sahih al-Bukhari and Sahih Muslim",
  },
};

const isArabic = (text) => /[؀-ۿ]/.test(text);

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

function pageRef(ref) {
  const label = `${SOURCE_NAMES[ref.source] || ref.source}${ref.printed_page ? `, p. ${ref.printed_page}` : ""}`;
  return link(ref.url, label);
}

function sourcesLine(refs, prefix = "Source") {
  if (!refs.length) return null;
  const parts = [];
  refs.forEach((r, i) => {
    if (i) parts.push(" · ");
    parts.push(pageRef(r));
  });
  return el("p", { class: "r-sources" }, `${prefix}: `, ...parts);
}

function section(id, title, lead, ...children) {
  return el("section", { class: "r-section", id },
    el("h2", { class: "r-heading" }, title),
    lead ? el("p", { class: "r-lead" }, lead) : null,
    ...children,
  );
}

// ---------- pieces ----------

function renderDream(data, dream, onEdit) {
  const editBtn = el("button", { type: "button", class: "btn btn--ghost btn--sm" }, "Edit dream");
  editBtn.addEventListener("click", onEdit);
  return el("div", { class: "r-dream" },
    el("div", { class: "r-dream-head" },
      el("p", { class: "r-label" }, `Your dream · ${data.authority_name}`),
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
      "Based on ", link(data.authority_url, data.authority_name),
      texts ? ` · ${texts} text${texts > 1 ? "s" : ""} cited` : " · general interpretation, no passages matched"),
  );
}

function renderNav(data, hasOriginals) {
  const items = [
    ["r-reading", "Reading"],
    ["r-symbols", "Symbols"],
    ["r-analysis", "Analysis"],
    ["r-summary", "Summary"],
    hasOriginals ? ["r-originals", "Original texts"] : null,
  ].filter(Boolean);
  return el("nav", { class: "r-nav", "aria-label": "Sections" },
    ...items.map(([id, label]) => el("a", { href: `#${id}` }, label)),
  );
}

function renderDua(text, dir) {
  if (!text) return null;
  return el("blockquote", { class: "r-dua", dir }, text);
}

function renderSunna(data, lang) {
  if (data.dream_type !== "disturbing_dream" || data.authority === "freud") return null;
  const t = SUNNA_RESPONSE[lang];
  const dir = lang === "ar" ? "rtl" : "ltr";
  return el("aside", { class: "r-sunna", dir, lang },
    el("h2", { class: "r-sunna-title" }, t.title),
    el("ol", { class: "r-sunna-steps" }, ...t.steps.map((s) => el("li", {}, s))),
    el("p", { class: "r-sunna-promise" }, t.promise),
    renderDua(data.dua, dir),
    el("p", { class: "r-sunna-source" }, t.source),
  );
}

function renderReading(data) {
  return section("r-reading", "Reading the dream", null,
    el("ol", { class: "r-scenes" },
      ...data.reading.map((c, i) =>
        el("li", { class: "r-card r-scene" },
          el("p", { class: "r-scene-no" }, `Scene ${i + 1}`),
          el("h3", { class: "r-scene-title", dir: "auto" }, c.title),
          ...c.paragraphs.map((p) => el("p", { class: "r-text", dir: "auto" }, p)),
          sourcesLine(c.sources),
        )),
    ),
  );
}

function renderSymbols(data) {
  return section("r-symbols", "Symbols and their meanings", null,
    ...data.symbols.map((s, i) =>
      el("article", { class: "r-card r-symbol" },
        el("div", { class: "r-symbol-head" },
          el("span", { class: "r-num" }, i + 1),
          el("h3", { class: "r-symbol-name", dir: "auto" }, s.symbol),
          s.cited
            ? el("span", { class: "r-tag r-tag--cited" }, "cited")
            : el("span", { class: "r-tag r-tag--general" }, "general interpretation"),
        ),
        el("p", { class: "r-text r-meaning", dir: "auto" }, s.meaning),
        el("div", { class: "r-box" },
          el("p", { class: "r-box-label" }, "Given your situation"),
          el("p", { class: "r-text", dir: "auto" }, s.for_your_situation),
        ),
        s.cited
          ? sourcesLine(s.sources, "From")
          : el("p", { class: "r-sources" },
              "Not from a specific passage — general reading in the tradition of ",
              link(s.authority_url, data.authority_name), "."),
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
  return section("r-analysis", "Analysis", "The emotional tone of your dream — an estimate from the reading, not a measurement.",
    el("article", { class: "r-card" },
      el("div", { class: "r-meters" },
        meter("Optimism", a.optimism, "optimism"),
        meter("Hope", a.hope, "hope"),
        meter("Anxiety", a.anxiety, "anxiety"),
      ),
      el("p", { class: "r-text r-analysis-note", dir: "auto" }, a.explanation),
    ),
  );
}

function renderSummary(data, showDua) {
  return section("r-summary", "Summary", null,
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
  return section("r-originals", "Original texts from the books", "The books' own words, unaltered. Tap a symbol to read them.",
    ...data.original_texts.map((o, i) =>
      el("details", { class: "r-original", open: i === 0 },
        el("summary", {},
          el("span", { class: "r-original-symbol", dir: "rtl" }, o.symbol),
          el("span", { class: "r-tag" }, `${SOURCE_NAMES[o.source] || o.source}${o.printed_page ? ` · p. ${o.printed_page}` : ""}`),
        ),
        el("blockquote", { class: "r-quote", dir: "rtl", lang: "ar" }, o.text_ar),
        el("p", { class: "r-original-link" }, link(o.url, "Open source ↗")),
      )),
  );
}

function renderActions(onEdit) {
  const again = el("button", { type: "button", class: "btn btn--primary" }, "New dream");
  again.addEventListener("click", onEdit);
  const copy = el("button", { type: "button", class: "btn btn--ghost" }, "Copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("result").innerText);
      copy.textContent = "Copied";
    } catch {
      copy.textContent = "Copy failed";
    }
    setTimeout(() => (copy.textContent = "Copy"), 1500);
  });
  const print = el("button", { type: "button", class: "btn btn--ghost" }, "Print");
  print.addEventListener("click", () => window.print());
  return el("div", { class: "r-actions" }, again, copy, print);
}

function renderResult(container, data, dream, onEdit) {
  const lang = isArabic(dream) ? "ar" : "en";
  const sunna = renderSunna(data, lang);
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
    renderActions(onEdit),
  ];
  // replaceChildren would print a null as the text "null".
  container.replaceChildren(...sections.filter(Boolean));
}

// Renders the /api/dreams response. All text goes in via textContent, never innerHTML.

const SOURCE_NAMES = {
  nabulsi: "Al-Nabulsi",
  ibn_sirin: "Ibn Sirin",
  ibn_shaheen: "Ibn Shahin",
  tabir: "Ta'bir al-Ru'ya",
  sadiq: "Imam Ja'far al-Sadiq",
  freud: "Sigmund Freud",
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

function section(title, ...children) {
  return el("section", { class: "r-section" }, el("h2", { class: "r-heading" }, title), ...children);
}

function renderDream(data, dream, onEdit) {
  const editBtn = el("button", { type: "button", class: "btn btn--ghost btn--sm" }, "Edit dream");
  editBtn.addEventListener("click", onEdit);
  return el("div", { class: "r-dream" },
    el("p", { class: "r-label" }, `Your dream · ${data.authority_name}`),
    el("p", { class: "r-dream-text", dir: "auto" }, dream),
    editBtn,
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

function renderReading(data) {
  return section("Reading the dream",
    ...data.reading.map((c, i) =>
      el("article", { class: "r-card" },
        el("h3", { class: "r-scene", dir: "auto" },
          el("span", { class: "r-scene-no" }, `Scene ${i + 1}`), " — ", c.title),
        ...c.paragraphs.map((p) => el("p", { dir: "auto" }, p)),
        sourcesLine(c.sources),
      )),
  );
}

function renderSymbols(data) {
  return section("Symbols and their meanings",
    ...data.symbols.map((s, i) =>
      el("article", { class: "r-card r-symbol" },
        el("div", { class: "r-symbol-head" },
          el("span", { class: "r-num" }, i + 1),
          el("h3", { class: "r-symbol-name", dir: "auto" }, s.symbol),
          s.cited
            ? el("span", { class: "r-tag r-tag--cited" }, "cited")
            : el("span", { class: "r-tag r-tag--general" }, "general interpretation"),
        ),
        el("div", { class: "r-box r-box--meaning" }, el("p", { dir: "auto" }, s.meaning)),
        el("div", { class: "r-box r-box--situation" },
          el("strong", {}, "Given your situation"), el("p", { dir: "auto" }, s.for_your_situation)),
        s.cited
          ? sourcesLine(s.sources, "From")
          : el("p", { class: "r-sources" },
              `Not from a specific passage — general reading in the tradition of `,
              link(s.authority_url, data.authority_name), "."),
      )),
  );
}

function renderSummary(data) {
  return section("Summary",
    el("article", { class: "r-card" },
      el("p", { dir: "auto" }, data.summary.text),
      el("div", { class: "r-box r-box--situation" },
        el("strong", { dir: "auto" }, data.dream_type_label), el("p", { dir: "auto" }, data.summary.dream_type_explained)),
    ),
  );
}

function renderOriginals(data) {
  if (!data.original_texts.length) return null;
  return section("Original texts from the books",
    el("p", { class: "r-lead" }, "The books' own words, unaltered. Tap a symbol to read them."),
    ...data.original_texts.map((o, i) =>
      el("details", { class: "r-original", open: i === 0 },
        el("summary", {},
          el("span", { class: "r-original-symbol", dir: "rtl" }, o.symbol),
          el("span", { class: "r-tag" }, `${SOURCE_NAMES[o.source] || o.source}${o.printed_page ? ` · p. ${o.printed_page}` : ""}`),
        ),
        el("blockquote", { class: "r-quote", dir: "rtl", lang: "ar" }, o.text_ar),
        el("p", { class: "r-sources" }, link(o.url, "Open source ↗")),
      )),
  );
}

function renderActions(onEdit) {
  const copy = el("button", { type: "button", class: "btn btn--ghost" }, "Copy");
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(document.getElementById("result").innerText);
      copy.textContent = "Copied";
      setTimeout(() => (copy.textContent = "Copy"), 1500);
    } catch {
      copy.textContent = "Copy failed";
    }
  });
  const print = el("button", { type: "button", class: "btn btn--ghost" }, "Print");
  print.addEventListener("click", () => window.print());
  const again = el("button", { type: "button", class: "btn btn--primary" }, "New dream");
  again.addEventListener("click", onEdit);
  return el("div", { class: "actions r-actions" }, again, copy, print);
}

function renderResult(container, data, dream, onEdit) {
  const sections = [
    renderDream(data, dream, onEdit),
    renderHero(data),
    renderReading(data),
    renderSymbols(data),
    renderSummary(data),
    renderOriginals(data),   // null when nothing was cited
    renderActions(onEdit),
    el("p", { class: "r-disclaimer" },
      "This presents what the classical books say. It is not a fatwa, a ruling, or knowledge of the unseen. " +
      "Interpretation is probabilistic and varies with the dreamer's situation."),
  ];
  // replaceChildren would print a null as the text "null".
  container.replaceChildren(...sections.filter(Boolean));
}

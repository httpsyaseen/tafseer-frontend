// [tafseer_my_dreams]: the dreams this browser has interpreted, from window.TafseerStore.
// A list, and a detail view that redraws the saved result without calling the API again.
(function () {
  "use strict";

  const { render: renderResult, SOURCE_NAMES } = window.TafseerResult;
  const store = window.TafseerStore;

  const dateFormat = new Intl.DateTimeFormat("ar", { dateStyle: "long", timeStyle: "short" });
  const EXCERPT = 140;

  // Same helper as result.js: text only ever goes in as text.
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

  function button(cls, text, onClick) {
    const b = el("button", { type: "button", class: cls }, text);
    b.addEventListener("click", onClick);
    return b;
  }

  function excerpt(text) {
    return text.length > EXCERPT ? `${text.slice(0, EXCERPT).trim()}…` : text;
  }

  function init(root) {
    if (root.dataset.ready) return;
    root.dataset.ready = "1";

    const $ = (name) => root.querySelector(`[data-t="${name}"]`);
    const listView = $("list-view");
    const list = $("list");
    const empty = $("empty");
    const clearBtn = $("clear");
    const detailView = $("detail-view");
    const result = $("result");

    function scrollIntoViewIfNeeded() {
      if (root.getBoundingClientRect().top < 0) {
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function showList() {
      const items = store.list();
      list.replaceChildren(...items.map((item) => {
        const { request, data } = item;
        const authority = SOURCE_NAMES[data.authority] || SOURCE_NAMES[request.source] || data.authority_name;
        return el("li", { class: "r-card h-item" },
          el("button", { type: "button", class: "h-open", "data-id": item.id },
            el("span", { class: "h-meta" },
              el("span", { class: "r-tag" }, authority),
              el("time", { datetime: item.savedAt }, dateFormat.format(new Date(item.savedAt))),
            ),
            el("span", { class: "h-title", dir: "auto" }, data.title),
            el("span", { class: "h-dream", dir: "auto" }, excerpt(request.dream)),
          ),
          button("t-btn t-btn--ghost t-btn--sm h-delete", "حذف", () => {
            store.remove(item.id);
            showList();
          }),
        );
      }));
      empty.hidden = items.length > 0;
      list.hidden = items.length === 0;
      clearBtn.hidden = items.length === 0;
      detailView.hidden = true;
      listView.hidden = false;
      // Leave the page as a plain list, without a #fragment from an opened dream.
      if (location.hash) history.replaceState(null, "", location.pathname + location.search);
    }

    function showDetail(id) {
      const item = store.get(id);
      if (!item) return showList();
      renderResult(result, item.data, item.request.dream);
      listView.hidden = true;
      detailView.hidden = false;
      scrollIntoViewIfNeeded();
    }

    list.addEventListener("click", (e) => {
      const open = e.target.closest(".h-open");
      if (open) showDetail(open.dataset.id);
    });

    $("back").addEventListener("click", () => {
      showList();
      scrollIntoViewIfNeeded();
    });

    clearBtn.addEventListener("click", () => {
      if (window.confirm("هل تريد حذف جميع أحلامك المحفوظة في هذا المتصفح؟")) {
        store.clear();
        showList();
      }
    });

    // A dream interpreted in another tab shows up here too.
    window.addEventListener("storage", (e) => {
      if (e.key === null || e.key === store.KEY) {
        if (!listView.hidden) showList();
      }
    });

    showList();
  }

  document.querySelectorAll(".tafseer-my-dreams").forEach(init);
})();

// The form for [tafseer_dream]. Posts to the plugin's REST route, which forwards to the backend.
(function () {
  "use strict";

  const root = document.getElementById("tafseer-app");
  if (!root) return;

  const { render: renderResult, SOURCE_NAMES } = window.TafseerResult;
  const API_URL = window.TafseerConfig.apiUrl;

  const $ = (id) => document.getElementById(`tafseer-${id}`);
  const formView = $("form-view");
  const form = $("dream-form");
  const dreamInput = $("dream");
  const counter = $("counter");
  const statusEl = $("status");
  const loading = $("loading");
  const loadingSteps = root.querySelectorAll("#tafseer-loading-steps li");
  const loadingBook = $("loading-book");
  const result = $("result");
  const submitBtn = form.querySelector('button[type="submit"]');

  // select id -> request body field
  const FIELDS = {
    "f-jins": "gender",
    "f-hala": "marital_status",
    "f-umr": "age_range",
    "f-shuur": "waking_state",
    "f-alam": "pain",
    "f-takrar": "recurring",
    "f-waqt": "dream_time",
    "f-istikhara": "istikhara",
    "f-wuduh": "clarity",
    "f-qabl": "state_before_sleep",
    "f-makan": "place_familiar",
  };

  function setStatus(text) {
    statusEl.textContent = text;
  }

  function show(view) {
    formView.hidden = view !== "form";
    loading.hidden = view !== "loading";
    result.hidden = view !== "result";
    // The app sits inside the client's page, so bring the app into view, not the top of the page.
    if (root.getBoundingClientRect().top < 0) {
      root.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // The request is one call, so the steps are paced by time, not by real progress.
  let stepTimer = null;
  function startLoading(sourceName) {
    loadingBook.textContent = `Reading ${sourceName}`;
    let i = 0;
    const mark = () => loadingSteps.forEach((li, n) => {
      li.classList.toggle("is-done", n < i);
      li.classList.toggle("is-active", n === i);
    });
    mark();
    stepTimer = setInterval(() => {
      if (i < loadingSteps.length - 1) { i++; mark(); }
    }, 4000);
    show("loading");
  }

  function stopLoading() {
    clearInterval(stepTimer);
  }

  dreamInput.addEventListener("input", () => {
    counter.textContent = dreamInput.value.trim().length;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const dream = dreamInput.value.trim();
    if (!dream) {
      setStatus("Please write your dream first.");
      dreamInput.focus();
      return;
    }

    const checked = form.querySelector('input[name="source"]:checked');
    const body = { dream, source: checked?.value || "ibn_sirin" };
    for (const [id, key] of Object.entries(FIELDS)) {
      const value = $(id).value;
      if (value) body[key] = value;
    }

    setStatus("");
    submitBtn.disabled = true;
    startLoading(SOURCE_NAMES[body.source] || "the books");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        // `detail` from the backend and the plugin; `message` from WordPress's own REST errors.
        const reason = typeof data.detail === "string" ? data.detail : data.message;
        throw new Error(reason || `HTTP ${res.status}`);
      }
      renderResult(result, data, dream, () => show("form"));
      show("result");
    } catch (err) {
      show("form");
      setStatus(`Something went wrong: ${err.message}. Please try again.`);
    } finally {
      stopLoading();
      submitBtn.disabled = false;
    }
  });

  form.addEventListener("reset", () => {
    setStatus("");
    counter.textContent = "0";
  });
})();

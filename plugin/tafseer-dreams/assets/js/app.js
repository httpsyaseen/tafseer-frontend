// The form for the Tafseer shortcodes. Posts to the plugin's REST route, which forwards to the backend.
// Every .tafseer-app on the page is its own instance; several shortcodes may share one page.
(function () {
  "use strict";

  const { render: renderResult, SOURCE_NAMES } = window.TafseerResult;

  function init(root) {
    // Guards against this file loading twice (e.g. an optimisation plugin duplicating it).
    if (root.dataset.ready) return;
    root.dataset.ready = "1";

    const $ = (name) => root.querySelector(`[data-t="${name}"]`);
    const apiUrl = root.dataset.apiUrl;
    const formView = $("form-view");
    const form = $("form");
    const dreamInput = $("dream");
    const counter = $("counter");
    const statusEl = $("status");
    const loading = $("loading");
    const loadingSteps = $("loading-steps").querySelectorAll("li");
    const loadingBook = $("loading-book");
    const result = $("result");
    const submitBtn = form.querySelector('button[type="submit"]');

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

      // Field names in the form are the request body keys; empty selects are left out.
      const body = {};
      for (const [key, value] of new FormData(form)) {
        if (value) body[key] = value;
      }
      body.dream = dream;

      setStatus("");
      submitBtn.disabled = true;
      startLoading(SOURCE_NAMES[body.source] || "the books");
      try {
        const res = await fetch(apiUrl, {
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
  }

  document.querySelectorAll(".tafseer-app").forEach(init);
})();

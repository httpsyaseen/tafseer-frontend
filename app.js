// Served by nginx: the API is on the same host under /api (e.g. http://72.60.34.215/api/dreams).
// Opened as a local file: talk to `make dev` directly.
const API_URL = location.protocol === "file:"
  ? "http://127.0.0.1:8000/api/dreams"
  : "/api/dreams";

const formView = document.getElementById("form-view");
const form = document.getElementById("dream-form");
const dreamInput = document.getElementById("dream");
const counter = document.getElementById("counter");
const status = document.getElementById("status");
const loading = document.getElementById("loading");
const loadingSteps = document.querySelectorAll("#loading-steps li");
const loadingBook = document.getElementById("loading-book");
const result = document.getElementById("result");
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

// Only Arabic error messages are shown as they are; anything else gets the general one.
const GENERIC_ERROR = "تعذّر تفسير الرؤيا الآن. حاول مرة أخرى بعد قليل.";
const isArabic = (text) => /[\u0600-\u06FF]/.test(text || "");

function setStatus(text) {
  status.textContent = text;
}

function show(view) {
  formView.hidden = view !== "form";
  loading.hidden = view !== "loading";
  result.hidden = view !== "result";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// The request is one call, so the steps are paced by time, not by real progress.
let stepTimer = null;
function startLoading(sourceName) {
  loadingBook.textContent = `الرجوع إلى ${sourceName}`;
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

// Back to the form exactly as the visitor left it: dream, authority and "about you".
function editDream() {
  show("form");
  dreamInput.focus({ preventScroll: true });
}

// A new dream from the same person: only the dream text is cleared.
function newDream() {
  dreamInput.value = "";
  counter.textContent = "0";
  setStatus("");
  editDream();
}

dreamInput.addEventListener("input", () => {
  counter.textContent = dreamInput.value.trim().length;
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const dream = dreamInput.value.trim();
  if (!dream) {
    setStatus("اكتب رؤياك أولاً من فضلك.");
    dreamInput.focus();
    return;
  }

  const checked = form.querySelector('input[name="source"]:checked');
  const body = { dream, source: checked?.value || "ibn_sirin" };
  for (const [id, key] of Object.entries(FIELDS)) {
    const value = document.getElementById(id).value;
    if (value) body[key] = value;
  }

  setStatus("");
  submitBtn.disabled = true;
  startLoading(SOURCE_NAMES[body.source] || "الكتب");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "");
    renderResult(result, data, dream, { onEdit: editDream, onNew: newDream });
    show("result");
  } catch (err) {
    show("form");
    setStatus(isArabic(err.message) ? err.message : GENERIC_ERROR);
  } finally {
    stopLoading();
    submitBtn.disabled = false;
  }
});

form.addEventListener("reset", () => {
  setStatus("");
  counter.textContent = "0";
});

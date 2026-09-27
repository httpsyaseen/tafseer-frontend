// Served by nginx: the API is on the same host under /api (e.g. http://72.60.34.215/api/dreams).
// Opened as a local file: talk to `make dev` directly.
const API_URL = location.protocol === "file:"
  ? "http://127.0.0.1:8000/api/dreams"
  : "/api/dreams";

const form = document.getElementById("dream-form");
const status = document.getElementById("status");
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

function setStatus(text, kind = "") {
  status.textContent = text;
  status.className = "status" + (kind ? ` status--${kind}` : "");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const body = {
    dream: document.getElementById("dream").value.trim(),
    source: form.querySelector('input[name="source"]:checked')?.value || "ibn_sirin",
  };
  for (const [id, key] of Object.entries(FIELDS)) {
    const value = document.getElementById(id).value;
    if (value) body[key] = value;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "Interpreting…";
  setStatus("Reading the books and interpreting your dream — this takes 10–20 seconds.");
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.detail ? JSON.stringify(data.detail) : `HTTP ${res.status}`);
    setStatus("");
    showResult(data, body.dream);
  } catch (err) {
    setStatus(`Could not send: ${err.message}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Interpret";
  }
});

form.addEventListener("reset", () => setStatus(""));

function showResult(data, dream) {
  renderResult(result, data, dream, showForm);
  form.hidden = true;
  result.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Back to the form with the dream and options still filled in.
function showForm() {
  result.hidden = true;
  form.hidden = false;
  window.scrollTo({ top: 0, behavior: "smooth" });
  document.getElementById("dream").focus();
}

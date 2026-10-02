// The visitor's past dreams, kept in this browser only (localStorage).
// Exposed as window.TafseerStore; used by the form (save) and by [tafseer_my_dreams] (read, delete).
(function () {
  "use strict";

  const KEY = "tafseer:dreams";
  // Newest first; older dreams drop off past this. Each one is roughly 10–20 KB.
  const MAX_ITEMS = 100;

  // Storage can be missing or throw (private windows, blocked site data); treat that as empty.
  function read() {
    try {
      const items = JSON.parse(localStorage.getItem(KEY) || "[]");
      return Array.isArray(items) ? items : [];
    } catch {
      return [];
    }
  }

  // When the browser's quota is full, drop the oldest dreams until it fits.
  function write(items) {
    while (items.length) {
      try {
        localStorage.setItem(KEY, JSON.stringify(items));
        return true;
      } catch {
        items = items.slice(0, -1);
      }
    }
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
    return false;
  }

  function newId() {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // request: the body sent to the API (dream, source, "about you" fields). data: the API response.
  function save(request, data) {
    const item = { id: newId(), savedAt: new Date().toISOString(), request, data };
    write([item, ...read()].slice(0, MAX_ITEMS));
    return item;
  }

  function list() {
    return read();
  }

  function get(id) {
    return read().find((item) => item.id === id) || null;
  }

  function remove(id) {
    write(read().filter((item) => item.id !== id));
  }

  function clear() {
    try { localStorage.removeItem(KEY); } catch { /* storage unavailable */ }
  }

  window.TafseerStore = { KEY, save, list, get, remove, clear };
})();

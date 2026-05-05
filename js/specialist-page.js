(function () {
  "use strict";

  const WHATSAPP_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/></svg>';

  const TELEGRAM_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0Zm4.962 7.224c.1-.002.321.023.464.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212-.07-.062-.174-.041-.249-.024-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635Z"/></svg>';

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getSlugFromPath() {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1] || "";
    return last.replace(/\.html$/i, "").toLowerCase();
  }

  async function loadSpecialists() {
    try {
      const res = await fetch("/data/specialists.json", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json && Array.isArray(json.specialists) && json.specialists.length) {
          return json.specialists;
        }
      }
    } catch (_) {
      /* fall back below */
    }
    return typeof specialists !== "undefined" ? specialists : [];
  }

  function notFoundTemplate() {
    return `
      <div class="detail-not-found">
        <h1>Mütəxəssis tapılmadı</h1>
        <p>Axtardığınız mütəxəssis mövcud deyil və ya silinmişdir.</p>
        <a class="detail-back" href="/index.html">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          <span>Ana səhifə</span>
        </a>
      </div>
    `;
  }

  function detailTemplate(s) {
    return `
      <div class="detail-grid">
        <figure class="detail-photo">
          <img src="${escapeHtml(s.image)}" alt="${escapeHtml(s.name)}" />
        </figure>
        <div class="detail-info">
          <span class="detail-title">${escapeHtml(s.title)}</span>
          <h1 class="detail-name">${escapeHtml(s.name)}</h1>
          <p class="detail-bio">${escapeHtml(s.about)}</p>
          <div class="detail-actions">
            <a class="detail-action detail-action-whatsapp"
               href="${escapeHtml(s.whatsapp)}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${escapeHtml(s.name)} — WhatsApp">
              ${WHATSAPP_SVG}
              <span>WhatsApp</span>
            </a>
            <a class="detail-action detail-action-telegram"
               href="${escapeHtml(s.telegram)}"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${escapeHtml(s.name)} — Telegram">
              ${TELEGRAM_SVG}
              <span>Telegram</span>
            </a>
          </div>
        </div>
      </div>
    `;
  }

  async function render() {
    const root = document.getElementById("detailRoot");
    if (!root) return;

    const slug = getSlugFromPath();
    const list = await loadSpecialists();
    const specialist = list.find((s) => s.id === slug);

    if (!specialist) {
      root.innerHTML = notFoundTemplate();
      document.title = "Tapılmadı — Car Details";
      return;
    }

    document.title = `${specialist.name} — ${specialist.title} | Car Details`;
    root.innerHTML = detailTemplate(specialist);
  }

  document.addEventListener("DOMContentLoaded", render);
})();

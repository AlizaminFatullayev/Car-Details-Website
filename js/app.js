(function () {
  "use strict";

  /* ---------- Navbar (shared) ---------- */
  function initNavbar() {
    const toggle = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      const icon = toggle.querySelector(".material-symbols-outlined");
      if (icon) icon.textContent = isOpen ? "close" : "menu";
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        if (menu.classList.contains("open")) {
          menu.classList.remove("open");
          toggle.setAttribute("aria-expanded", "false");
          const icon = toggle.querySelector(".material-symbols-outlined");
          if (icon) icon.textContent = "menu";
        }
      });
    });
  }

  /* ---------- Home: render brand cards + scroll spy ---------- */
  function renderCards() {
    const grid = document.getElementById("cardsGrid");
    if (!grid || typeof specialists === "undefined") return;

    grid.innerHTML = specialists
      .map(
        (s) => `
        <a class="card" href="pages/specialist.html?id=${s.id}" data-id="${s.id}" aria-label="${s.brand} mütəxəssisi">
          <div class="card-icon">
            <span class="material-symbols-outlined">${s.icon}</span>
          </div>
          <h3 class="card-brand">${s.brand}</h3>
          <p class="card-name">${s.name}</p>
          <span class="card-tagline">${s.tagline}</span>
        </a>`
      )
      .join("");
  }

  function initScrollSpy() {
    const links = document.querySelectorAll("[data-nav]");
    if (!links.length) return;
    const sections = Array.from(links)
      .map((l) => document.querySelector(l.getAttribute("href")))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) =>
              l.classList.toggle("active", l.getAttribute("href") === "#" + id)
            );
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /* ---------- Home: contact form ---------- */
  function initContactForm() {
    const form = document.getElementById("contactForm");
    if (!form) return;
    const status = document.getElementById("contactStatus");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get("name") || "").toString().trim();
      const email = (data.get("email") || "").toString().trim();
      const message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        status.textContent = "Bütün sahələri doldurun";
        status.style.color = "#ffb4ab";
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = "E-poçt ünvanı düzgün deyil";
        status.style.color = "#ffb4ab";
        return;
      }

      status.style.color = "";
      status.textContent = "Mesajınız göndərildi. Tezliklə əlaqə saxlayacağıq.";
      form.reset();
    });
  }

  /* ---------- Specialist details page ---------- */
  function renderSpecialist() {
    const root = document.getElementById("specialistRoot");
    if (!root || typeof specialists === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const specialist =
      specialists.find((s) => s.id === id) || specialists[0];

    document.title = `${specialist.name} — ${specialist.title} | Car Details`;

    const mapQuery = encodeURIComponent(specialist.address);
    const mapSrc = `https://www.google.com/maps?q=${mapQuery}&output=embed`;
    const mapLink = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;

    root.innerHTML = `
      <aside class="specialist-profile">
        <div class="specialist-image">
          <img src="${specialist.image}" alt="${specialist.name}" loading="lazy" />
        </div>
        <div>
          <h1 class="specialist-name">${specialist.name}</h1>
          <div class="specialist-title-row">
            <span class="specialist-title-text">${specialist.title}</span>
          </div>
        </div>
        <div class="specialist-actions">
          <a class="specialist-action" href="tel:${specialist.phone.replace(
            /\s/g,
            ""
          )}" aria-label="Zəng et">
            <span class="material-symbols-outlined">call</span>
          </a>
          <a class="specialist-action" href="mailto:${specialist.email}" aria-label="E-poçt göndər">
            <span class="material-symbols-outlined">mail</span>
          </a>
          <button class="specialist-action" id="shareBtn" aria-label="Paylaş">
            <span class="material-symbols-outlined">share</span>
          </button>
        </div>
      </aside>

      <div class="specialist-content">
        <article class="bio-card glass">
          <span class="bio-eyebrow">Tərcümeyi-hal</span>
          <p class="bio-text">${specialist.about}</p>
          <div class="bio-meta">
            <div>
              <div class="bio-meta-label">Əlaqə nömrəsi</div>
              <div class="bio-meta-value">${specialist.phone}</div>
            </div>
            <div>
              <div class="bio-meta-label">E-poçt</div>
              <div class="bio-meta-value">${specialist.email}</div>
            </div>
            <div>
              <div class="bio-meta-label">Ünvan</div>
              <div class="bio-meta-value">${specialist.address}</div>
            </div>
            <div>
              <div class="bio-meta-label">Sertifikat</div>
              <div class="bio-meta-value">${specialist.certification} Authorized</div>
            </div>
          </div>
        </article>

        <div class="stats-grid">
          <div class="stat glass">
            <span class="material-symbols-outlined">verified</span>
            <div class="stat-value">${specialist.repairs}</div>
            <div class="stat-label">Təmir Edilən Mühərrik</div>
          </div>
          <div class="stat glass">
            <span class="material-symbols-outlined">speed</span>
            <div class="stat-value">${specialist.experience}</div>
            <div class="stat-label">İllik Təcrübə</div>
          </div>
          <div class="stat glass">
            <span class="material-symbols-outlined">workspace_premium</span>
            <div class="stat-value">${specialist.certification}</div>
            <div class="stat-label">Sertifikatlı Usta</div>
          </div>
        </div>

        <a class="map-card glass" href="${mapLink}" target="_blank" rel="noopener" aria-label="Məkanı xəritədə görün">
          <iframe
            src="${mapSrc}"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            title="Map">
          </iframe>
          <span class="map-pin">
            <span class="material-symbols-outlined">location_on</span>
            Məkanı Xəritədə Görün
          </span>
        </a>
      </div>
    `;

    const shareBtn = document.getElementById("shareBtn");
    if (shareBtn) {
      shareBtn.addEventListener("click", async () => {
        const shareData = {
          title: document.title,
          text: `${specialist.name} — ${specialist.title}`,
          url: window.location.href
        };
        try {
          if (navigator.share) {
            await navigator.share(shareData);
          } else {
            await navigator.clipboard.writeText(window.location.href);
            shareBtn.classList.add("copied");
            const icon = shareBtn.querySelector(".material-symbols-outlined");
            const original = icon.textContent;
            icon.textContent = "check";
            setTimeout(() => {
              icon.textContent = original;
              shareBtn.classList.remove("copied");
            }, 1500);
          }
        } catch (_) {
          /* user cancelled */
        }
      });
    }
  }

  /* ---------- Boot ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    initNavbar();
    renderCards();
    initScrollSpy();
    initContactForm();
    renderSpecialist();
  });
})();

/* =========================================================
   STUDIO THALVONY SILVA — configuração e interações
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO CENTRAL — edite apenas este bloco
   ---------------------------------------------------------
   WHATSAPP_NUMBER: apenas números, com DDI 55 + DDD + número.
   Exemplo de formato: "5584900000000"
   Enquanto estiver vazio, os botões abrem o WhatsApp com a
   mensagem pronta para a pessoa escolher o contato.
--------------------------------------------------------- */
const CONFIG = {
  WHATSAPP_NUMBER: "5584996213780", // (84) 99621-3780
  INSTAGRAM_URL: "https://www.instagram.com/studiothalvonysilva02/",
  TIMEZONE: "America/Fortaleza",    // fuso de Parnamirim/RN (usado no "Aberto agora")

  MESSAGES: {
    hero: "Olá! Conheci o site do Studio Thalvony Silva e gostaria de agendar um horário.",
    sobre: "Olá! Conheci o Studio Thalvony Silva pelo site e gostaria de saber mais sobre o atendimento.",
    procedimentos: "Olá! Gostaria de conhecer os serviços para cabelo do Studio Thalvony Silva.",
    procedimento: "Olá! Vi no site e gostaria de saber valores e horários para {procedimento}.",
    diferenciais: "Olá! Gostaria de agendar um horário no Studio Thalvony Silva.",
    contato: "Olá! Acessei o site do Studio Thalvony Silva e gostaria de tirar algumas dúvidas.",
  },
};

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* ---------- WhatsApp ---------- */
  const number = String(CONFIG.WHATSAPP_NUMBER).replace(/\D/g, "");
  if (!number) console.warn("[Studio Thalvony Silva] Configure CONFIG.WHATSAPP_NUMBER em script.js.");

  const waLink = (text) =>
    `https://wa.me/${number}?text=${encodeURIComponent(text)}`;

  $$("[data-wa]").forEach((el) => {
    const key = el.dataset.wa;
    let text = CONFIG.MESSAGES[key] || CONFIG.MESSAGES.hero;
    if (key === "procedimento") {
      const proc = el.dataset.procedure;
      text = proc
        ? CONFIG.MESSAGES.procedimento.replace("{procedimento}", proc.toLowerCase())
        : CONFIG.MESSAGES.procedimentos;
    }
    el.href = waLink(text);
    el.target = "_blank";
    el.rel = "noopener";
  });

  /* ---------- Instagram ---------- */
  $$("[data-instagram]").forEach((el) => {
    if (CONFIG.INSTAGRAM_URL) {
      el.href = CONFIG.INSTAGRAM_URL;
    } else {
      // Sem URL configurada: leva ao contato pelo WhatsApp em vez de um link quebrado
      el.href = waLink(CONFIG.MESSAGES.contato);
      el.title = "Instagram em breve";
    }
  });

  /* ---------- Ano no rodapé ---------- */
  const year = $("#year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header + barra mobile ---------- */
  const header = $("#header");
  const hero = $("#inicio");
  const cta = $("#agendar");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 10);

    // Barra inferior: aparece após o hero e some a partir do CTA final (que já tem botão grande)
    const heroEnd = hero.offsetTop + hero.offsetHeight - 120;
    const reachedCta = cta.getBoundingClientRect().top < window.innerHeight * 0.8;
    document.body.classList.toggle("show-bar", y > heroEnd && !reachedCta);
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = $("#menuToggle");
  const nav = $("#nav");
  const setMenu = (open) => {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-open", open);
  };
  toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  $$("a", nav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
  });
  window.matchMedia("(min-width: 1100px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  /* ---------- Link ativo no menu ---------- */
  const links = $$(".nav__link");
  const sections = links
    .map((l) => $(l.getAttribute("href")))
    .filter(Boolean);
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((l) => l.classList.toggle("is-active", l.getAttribute("href") === `#${entry.target.id}`));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => spy.observe(s));

  /* ---------- Reveal ao rolar ---------- */
  const revealEls = $$(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        // pequeno atraso escalonado entre irmãos
        const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
        el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 70}ms`;
        el.classList.add("is-visible");
        io.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- FAQ (acordeão) ---------- */
  $$(".accordion__trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".accordion__item");
      const open = !item.classList.contains("is-open");
      $$(".accordion__item.is-open").forEach((other) => {
        if (other !== item) {
          other.classList.remove("is-open");
          $(".accordion__trigger", other).setAttribute("aria-expanded", "false");
        }
      });
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", String(open));
    });
  });

  /* ---------- Estrelas das avaliações ---------- */
  $$(".stars[data-rating]").forEach((el) => {
    const rating = Math.max(0, Math.min(5, Number(el.dataset.rating) || 0));
    el.innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<svg class="${i < rating ? "" : "is-empty"}" aria-hidden="true"><use href="#i-star"/></svg>`
    ).join("");
  });

  /* ---------- Horários: destaca o dia e mostra "Aberto agora" ---------- */
  const hoursList = $("#hoursList");
  const hoursStatus = $("#hoursStatus");
  if (hoursList && hoursStatus) {
    try {
      const parts = Object.fromEntries(
        new Intl.DateTimeFormat("en-US", {
          timeZone: CONFIG.TIMEZONE, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
        }).formatToParts(new Date()).map((p) => [p.type, p.value])
      );
      const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
      const now = Number(parts.hour) * 60 + Number(parts.minute);
      const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
      const today = $(`li[data-day="${day}"]`, hoursList);
      if (today) {
        today.classList.add("is-today");
        const { open, close } = today.dataset;
        const isOpen = open && close && now >= toMin(open) && now < toMin(close);
        hoursStatus.textContent = isOpen ? `Aberto agora · até ${close}` : "Fechado agora";
        hoursStatus.classList.toggle("is-open", Boolean(isOpen));
        hoursStatus.hidden = false;
      }
    } catch (e) { /* sem suporte a fuso: a tabela continua visível normalmente */ }
  }

  /* ---------- Indicadores dos carrosséis (mobile) ---------- */
  $$("[data-carousel]").forEach((track) => {
    const dots = track.nextElementSibling;
    if (!dots || !dots.classList.contains("carousel-dots")) return;
    const items = [...track.children];
    dots.innerHTML = items.map(() => "<span></span>").join("");
    const dotEls = [...dots.children];
    const update = () => {
      const w = items[0].getBoundingClientRect().width;
      const idx = Math.round(track.scrollLeft / (w + 16));
      dotEls.forEach((d, i) => d.classList.toggle("is-active", i === Math.min(idx, items.length - 1)));
    };
    track.addEventListener("scroll", () => requestAnimationFrame(update), { passive: true });
    update();
  });
})();

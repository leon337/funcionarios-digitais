(function () {
  const config = window.PORTFOLIO_CONFIG || {};
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const expanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!expanded));
      mobileMenu.hidden = expanded;
      menuToggle.setAttribute("aria-label", expanded ? "Abrir menu" : "Fechar menu");
    });
    mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menuToggle.setAttribute("aria-expanded", "false"); mobileMenu.hidden = true;
      menuToggle.setAttribute("aria-label", "Abrir menu");
    }));
  }
  const year = document.querySelector("#year");
  if (year) year.textContent = new Date().getFullYear();
  const primaryContact = document.querySelector("#primary-contact");
  const note = document.querySelector("#contact-config-note");
  const linksContainer = document.querySelector("#contact-links");
  const digits = String(config.whatsappNumber || "").replace(/\D/g, "");
  if (digits.length >= 12) {
    primaryContact.href = "https://wa.me/" + digits + "?text=" + encodeURIComponent(config.whatsappMessage || "Olá! Quero entender como um funcionário digital pode ajudar minha empresa.");
    primaryContact.target = "_blank"; primaryContact.rel = "noopener noreferrer";
    note.textContent = "Prefere outro canal? Encontre os perfis oficiais abaixo.";
  } else {
    primaryContact.href = "#contact-details";
    primaryContact.addEventListener("click", (event) => {
      event.preventDefault();
      note.textContent = "O WhatsApp comercial ainda precisa ser configurado pelo proprietário antes de receber contatos.";
      note.classList.add("config-warning");
      document.querySelector("#contact-details").scrollIntoView({ behavior: "smooth", block: "center" });
    });
    note.textContent = "Os canais de contato serão ativados assim que os dados comerciais forem configurados.";
  }
  const addExternalLink = (label, url) => {
    if (!url || !linksContainer) return;
    try {
      const parsed = new URL(url);
      if (!["https:", "http:"].includes(parsed.protocol)) return;
      const link = document.createElement("a");
      link.href = parsed.href; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.textContent = label; linksContainer.appendChild(link); linksContainer.hidden = false;
    } catch (_) { /* Ignora URL inválida. */ }
  };
  addExternalLink("Instagram", config.instagramUrl);
  addExternalLink("Facebook", config.facebookUrl);
  if (config.contactEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.contactEmail)) addExternalLink("E-mail", "mailto:" + config.contactEmail);
})();

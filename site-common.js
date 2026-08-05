(() => {
  const key = "imageToolkitLanguage";
  function apply(locale) {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    document.querySelectorAll("[data-ko][data-en]").forEach((el) => {
      el.textContent = locale === "ko" ? el.dataset.ko : el.dataset.en;
    });
    document.querySelectorAll(".language-button").forEach((button) => {
      const active = button.dataset.language === locale;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
    });
  }
  let locale = document.documentElement.dataset.locale || "ko";
  apply(locale);
  document.querySelectorAll(".language-button").forEach((button) => {
    button.addEventListener("click", () => {
      locale = button.dataset.language;
      try { localStorage.setItem(key, locale); } catch (error) {}
      apply(locale);
    });
  });
})();

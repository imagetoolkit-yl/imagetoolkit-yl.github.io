(() => {
  const key = "imageToolkitLanguage";
  const sharedLabels = new Map([
    ["Tools", ["도구", "Tools"]],
    ["Presets", ["플랫폼 규격", "Presets"]],
    ["Guides", ["가이드", "Guides"]],
    ["About", ["소개", "About"]],
    ["Privacy", ["개인정보처리방침", "Privacy"]],
    ["Terms", ["이용약관", "Terms"]],
    ["Contact", ["문의", "Contact"]],
    ["Image Resizer", ["이미지 크기 조절", "Image Resizer"]],
    ["Image Compressor", ["이미지 압축", "Image Compressor"]],
    ["Image Converter", ["이미지 변환", "Image Converter"]],
    ["Crop & Canvas Fit", ["이미지 맞춤 및 자르기", "Crop & Canvas Fit"]],
    ["Canvas Fit & Crop", ["이미지 맞춤 및 자르기", "Canvas Fit & Crop"]],
    ["Image Outline", ["이미지 외곽선", "Image Outline"]],
    ["Batch Image Tool", ["일괄 이미지 처리", "Batch Image Tool"]],
    ["Batch & ZIP", ["일괄 이미지 처리", "Batch & ZIP"]],
    ["Open →", ["도구 열기 →", "Open →"]],
    ["Open tool →", ["도구 열기 →", "Open tool →"]],
    ["IMAGE TOOLS", ["이미지 도구", "IMAGE TOOLS"]],
    ["IMAGE RESIZER", ["이미지 크기 조절", "IMAGE RESIZER"]],
    ["IMAGE COMPRESSOR", ["이미지 압축", "IMAGE COMPRESSOR"]],
    ["IMAGE CONVERTER", ["이미지 변환", "IMAGE CONVERTER"]],
    ["CROP & CANVAS FIT", ["이미지 맞춤 및 자르기", "CROP & CANVAS FIT"]],
    ["IMAGE OUTLINE", ["이미지 외곽선", "IMAGE OUTLINE"]],
    ["BATCH IMAGE TOOL", ["일괄 이미지 처리", "BATCH IMAGE TOOL"]],
    ["PLATFORM PRESETS", ["플랫폼 규격", "PLATFORM PRESETS"]],
  ]);

  document.querySelectorAll("a, span, strong, p, h1, h2, h3").forEach((el) => {
    if (el.children.length || (el.dataset.ko && el.dataset.en)) return;
    const labels = sharedLabels.get(el.textContent.trim());
    if (!labels) return;
    el.dataset.ko = labels[0];
    el.dataset.en = labels[1];
  });

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

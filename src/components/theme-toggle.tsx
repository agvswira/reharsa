"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

// Tema disimpan di atribut data-theme pada <html> (diisi skrip di layout
// sebelum halaman tampil). Komponen ini membaca dan memantau atribut itu.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => observer.disconnect();
}

function readTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("reharsa-theme", next);
    } catch {
      // Penyimpanan diblokir; tema tetap berganti untuk sesi ini.
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      className="min-h-11 rounded-full border border-line-2 px-4 text-sm text-ink hover:bg-accent-soft active:translate-y-px"
    >
      {theme === "dark" ? "Terang" : "Gelap"}
    </button>
  );
}

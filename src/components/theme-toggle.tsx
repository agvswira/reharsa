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

// Saklar tema. Posisi kenop diatur CSS dari data-theme (lihat .theme-knob di
// globals.css), jadi sudah benar sejak render pertama tanpa berkedip.
export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, readTheme, () => null);

  function toggle() {
    const next: Theme = readTheme() === "dark" ? "light" : "dark";
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
      role="switch"
      aria-checked={theme === "dark"}
      aria-label="Tema gelap"
      title={theme === "dark" ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      onClick={toggle}
      className="group ml-1 grid min-h-11 min-w-11 place-items-center rounded-full"
    >
      <span className="theme-track relative block h-7 w-12 rounded-full border border-edge bg-track transition-colors group-hover:border-ink">
        <span className="theme-knob absolute left-[3px] top-[3px] block size-5 rounded-full bg-ink shadow-sm" />
      </span>
    </button>
  );
}

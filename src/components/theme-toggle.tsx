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

function Sun({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="4.5" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
      </g>
    </svg>
  );
}

function Moon({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1Z"
      />
    </svg>
  );
}

// Saklar tema: matahari di kiri (terang), bulan di kanan (gelap). Kenop
// menutupi mode yang aktif dan memuat simbolnya. Posisi dan simbol diatur CSS
// dari data-theme (lihat .theme-* di globals.css), jadi benar sejak render
// pertama tanpa berkedip.
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
      className="group ml-1 grid min-h-11 place-items-center rounded-full"
    >
      <span className="theme-track relative flex h-8 w-[3.75rem] items-center justify-between rounded-full border border-edge bg-surface px-2 text-muted transition-colors group-hover:border-ink">
        <Sun className="size-4" />
        <Moon className="size-4" />
        <span className="theme-knob absolute left-[3px] top-[3px] grid size-6 place-items-center rounded-full bg-ink text-paper shadow-sm">
          <Sun className="theme-sun size-4" />
          <Moon className="theme-moon size-4" />
        </span>
      </span>
    </button>
  );
}

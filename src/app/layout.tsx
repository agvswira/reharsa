import type { Metadata } from "next";
import { Bricolage_Grotesque, Mona_Sans } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { AccountNav } from "@/components/account-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

// Tipografi mengikuti DESIGN.md (diturunkan dari referensi OpenLC):
// Mona Sans untuk teks, Bricolage Grotesque untuk judul.
const mona = Mona_Sans({
  variable: "--font-mona",
  subsets: ["latin"],
});

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz"],
});

export const metadata: Metadata = {
  title: "Reharsa: latihan melayani tamu asing",
  description:
    "Latihan berbicara dengan tamu hotel virtual dan dapatkan rapor pelayanan berbasis rubrik.",
};

// Menetapkan tema sebelum halaman tampil supaya tidak berkedip. Gelap adalah
// bawaan; terang hanya bila pengguna memilihnya lewat tombol tema.
const themeScript = `(function(){try{var t=localStorage.getItem("reharsa-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}})()`;

const navLink =
  "inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-muted hover:bg-accent-soft hover:text-ink";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="dark"
      className={`${mona.variable} ${bricolage.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#konten"
          className="sr-only rounded-full bg-accent px-5 py-2.5 font-semibold text-accent-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
        >
          Langsung ke konten
        </a>
        <header className="sticky top-0 z-30 border-b border-line bg-paper">
          {/* Tiga kolom: logo kiri, tautan halaman di tengah, akun dan tema di
              kanan. Di layar kecil tautan tengah disembunyikan. */}
          <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              className="justify-self-start rounded font-display text-xl font-semibold tracking-[-0.02em] text-ink"
            >
              Reharsa
            </Link>
            <nav aria-label="Halaman" className="hidden items-center gap-1 md:flex">
              <Link href="/#cara-kerja" className={navLink}>
                Cara kerja
              </Link>
              <Link href="/#situasi" className={navLink}>
                Situasi
              </Link>
              <Link href="/#prinsip" className={navLink}>
                Prinsip
              </Link>
            </nav>
            <nav
              aria-label="Akun"
              className="flex items-center gap-1 justify-self-end"
            >
              {/* AccountNav membaca path saat ini; dengan cacheComponents
                  bagian ini harus di dalam Suspense. */}
              <Suspense fallback={<span className="w-24" aria-hidden="true" />}>
                <AccountNav />
              </Suspense>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main
          id="konten"
          tabIndex={-1}
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 outline-none sm:px-8"
        >
          {children}
        </main>
        <footer className="border-t border-line">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 sm:flex-row sm:items-baseline sm:justify-between sm:px-8">
            <p className="font-display text-lg font-semibold text-ink">
              Reharsa
            </p>
            <p className="text-sm text-muted">
              Rekaman suara tidak disimpan. Hotel Puri Sekar dan semua tamu di
              sini adalah tokoh fiktif untuk latihan.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

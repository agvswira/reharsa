import type { Metadata } from "next";
import { Bricolage_Grotesque, Mona_Sans } from "next/font/google";
import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { SiteNav } from "@/components/site-nav";
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

// Menetapkan tema sebelum halaman tampil supaya tidak berkedip. Terang (batu
// paras) adalah bawaan; gelap hanya bila pengguna memilihnya lewat saklar.
const themeScript = `(function(){try{var t=localStorage.getItem("reharsa-theme");document.documentElement.dataset.theme=t==="dark"?"dark":"light"}catch(e){document.documentElement.dataset.theme="light"}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      data-theme="light"
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
          {/* Tiga kolom: logo kiri (ke halaman depan), navigasi di tengah,
              akun dan tema di kanan. Isi navigasi mengikuti halaman dan status
              masuk (lihat SiteNav). */}
          <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between gap-4 px-4 sm:px-8 md:grid md:grid-cols-[1fr_auto_1fr]">
            <Link
              href="/"
              aria-label="Reharsa, ke halaman depan"
              className="justify-self-start rounded text-ink"
            >
              <Logo />
            </Link>
            {/* SiteNav membaca path saat ini; dengan cacheComponents bagian
                ini harus di dalam Suspense. */}
            <Suspense
              fallback={
                <>
                  <span aria-hidden="true" />
                  <span aria-hidden="true" className="h-11 justify-self-end" />
                </>
              }
            >
              <SiteNav />
            </Suspense>
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
          <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
            <p className="text-ink">
              <Logo />
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next, Fraunces } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

// Atkinson Hyperlegible dirancang agar huruf mudah dibedakan. Siswa membaca
// transkrip dan umpan balik sambil berpikir, jadi keterbacaan didahulukan.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
  subsets: ["latin"],
});

// Serif untuk judul: nuansa kartu registrasi hotel, membedakan Reharsa dari
// aplikasi chat biasa.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reharsa: latihan melayani tamu asing",
  description:
    "Latihan berbicara dengan tamu hotel virtual dan dapatkan rapor pelayanan berbasis rubrik.",
};

// Menetapkan tema sebelum halaman tampil supaya tidak berkedip.
const themeScript = `(function(){try{var t=localStorage.getItem("reharsa-theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="id"
      className={`${atkinson.variable} ${fraunces.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <a
          href="#konten"
          className="sr-only rounded-md bg-accent px-4 py-2 font-bold text-accent-ink focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50"
        >
          Langsung ke konten
        </a>
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="rounded font-display text-xl font-semibold text-ink"
            >
              Reharsa
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main
          id="konten"
          tabIndex={-1}
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 outline-none sm:px-6"
        >
          {children}
        </main>
        <footer className="border-t border-line">
          <p className="mx-auto max-w-5xl px-4 py-4 text-sm text-muted sm:px-6">
            Rekaman suara tidak disimpan. Hotel Puri Sekar dan semua tamu di
            sini adalah tokoh fiktif untuk latihan.
          </p>
        </footer>
      </body>
    </html>
  );
}

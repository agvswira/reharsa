import type { Metadata } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import "./globals.css";

// Atkinson Hyperlegible dirancang agar huruf mudah dibedakan. Siswa membaca
// transkrip dan umpan balik sambil berpikir, jadi keterbacaan didahulukan.
const atkinson = Atkinson_Hyperlegible_Next({
  variable: "--font-atkinson",
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
      className={`${atkinson.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col font-sans">
        <header className="border-b border-line">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <Link
              href="/"
              className="rounded text-lg font-bold tracking-tight text-ink"
            >
              Reharsa
            </Link>
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          {children}
        </main>
        <footer className="border-t border-line">
          <p className="mx-auto max-w-3xl px-4 py-4 text-sm text-muted sm:px-6">
            Rekaman suara tidak disimpan. Hotel Puri Sekar dan semua tamu di
            sini adalah tokoh fiktif untuk latihan.
          </p>
        </footer>
      </body>
    </html>
  );
}

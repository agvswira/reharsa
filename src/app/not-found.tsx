import Link from "next/link";
import { pageTitle } from "@/lib/ui";

export default function NotFound() {
  return (
    <div className="space-y-4 py-6 sm:py-12">
      <h1 className={pageTitle}>Halaman tidak ditemukan</h1>
      <p className="max-w-prose text-lg text-muted">
        Alamat ini tidak cocok dengan halaman atau situasi mana pun di Reharsa.
      </p>
      <Link
        href="/latihan"
        className="inline-flex min-h-11 items-center rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90"
      >
        Lihat daftar situasi
      </Link>
    </div>
  );
}

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Situasi latihan tidak ditemukan</h1>
      <p className="text-muted">
        Alamat ini tidak cocok dengan situasi mana pun di Reharsa.
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

"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/client/auth-client";

const link =
  "inline-flex min-h-11 items-center rounded-full px-3 text-sm font-medium text-muted hover:bg-accent-soft hover:text-ink aria-[current=page]:font-semibold aria-[current=page]:text-ink sm:px-3.5";
const pill =
  "ml-1 inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm font-semibold text-ink hover:bg-accent-soft";

/**
 * Navigasi header, mengikuti halaman dan status masuk:
 * - Halaman depan, atau belum masuk: tautan bagian halaman depan.
 * - Sudah masuk di halaman aplikasi: Latihan dan Riwayat. Kembali ke halaman
 *   depan lewat logo Reharsa.
 * Mengembalikan dua <nav> (tengah dan kanan) untuk grid tiga kolom header.
 */
export function SiteNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();
  const onLanding = pathname === "/";
  const signedIn = Boolean(data);
  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;

  const showApp = signedIn && !onLanding;

  return (
    <>
      <nav
        aria-label="Halaman"
        className={`items-center gap-1 ${showApp ? "flex" : "hidden md:flex"}`}
      >
        {isPending ? null : showApp ? (
          <>
            <Link href="/latihan" aria-current={current("/latihan")} className={link}>
              Latihan
            </Link>
            <Link href="/riwayat" aria-current={current("/riwayat")} className={link}>
              Riwayat
            </Link>
          </>
        ) : (
          <>
            <Link href="/#cara-kerja" className={link}>
              Cara kerja
            </Link>
            <Link href="/#situasi" className={link}>
              Situasi
            </Link>
            <Link href="/#prinsip" className={link}>
              Prinsip
            </Link>
          </>
        )}
      </nav>

      <nav aria-label="Akun" className="flex items-center gap-1 justify-self-end">
        {isPending ? (
          <span className="w-24" aria-hidden="true" />
        ) : signedIn ? (
          <>
            {onLanding ? (
              <Link href="/latihan" className={pill}>
                Buka latihan
              </Link>
            ) : null}
            <button
              type="button"
              onClick={async () => {
                await authClient.signOut();
                router.push("/");
                router.refresh();
              }}
              className={link}
            >
              Keluar
            </button>
          </>
        ) : (
          <>
            <Link href="/masuk" className={link}>
              Masuk
            </Link>
            <Link href="/daftar" className={pill}>
              Daftar
            </Link>
          </>
        )}
        <ThemeToggle />
      </nav>
    </>
  );
}

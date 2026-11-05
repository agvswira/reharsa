"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/client/auth-client";

const link =
  "inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-muted hover:bg-accent-soft hover:text-ink aria-[current=page]:text-ink";
const pill =
  "ml-1 inline-flex min-h-11 items-center rounded-full border border-line-2 px-4 text-sm font-semibold text-ink hover:bg-accent-soft";

// Menu akun di header. Belum masuk: Masuk dan Daftar. Sudah masuk: Latihan,
// Riwayat, dan Keluar.
export function AccountNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, isPending } = authClient.useSession();

  if (isPending) return <span className="w-24" aria-hidden="true" />;

  if (!data) {
    return (
      <>
        <Link href="/masuk" className={link}>
          Masuk
        </Link>
        <Link href="/daftar" className={pill}>
          Daftar
        </Link>
      </>
    );
  }

  const current = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`) ? "page" : undefined;

  return (
    <>
      <Link href="/latihan" aria-current={current("/latihan")} className={link}>
        Latihan
      </Link>
      <Link href="/riwayat" aria-current={current("/riwayat")} className={link}>
        Riwayat
      </Link>
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
  );
}

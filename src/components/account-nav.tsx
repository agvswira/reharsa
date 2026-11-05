"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/client/auth-client";

const link =
  "inline-flex min-h-11 items-center rounded-full px-3.5 text-sm font-medium text-muted hover:bg-accent-soft hover:text-ink";

// Menu akun di header: Masuk bila belum login; Riwayat dan Keluar bila sudah.
export function AccountNav() {
  const router = useRouter();
  const { data, isPending } = authClient.useSession();

  if (isPending) return <span className="w-16" aria-hidden="true" />;

  if (!data) {
    return (
      <Link href="/masuk" className={link}>
        Masuk
      </Link>
    );
  }

  return (
    <>
      <Link href="/riwayat" className={link}>
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

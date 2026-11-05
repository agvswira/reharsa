"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/client/auth-client";

const ERRORS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "Email atau password salah.",
  USER_ALREADY_EXISTS: "Email ini sudah terdaftar. Silakan masuk.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "Email ini sudah terdaftar. Silakan masuk.",
  PASSWORD_TOO_SHORT: "Password minimal 8 karakter.",
  INVALID_EMAIL: "Format email tidak valid.",
};

const field =
  "w-full rounded-2xl border border-edge bg-surface px-4 py-3 text-ink placeholder:text-muted";

export function AuthForm({
  mode,
  next,
}: {
  mode: "masuk" | "daftar";
  next: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const name = String(form.get("name") ?? "").trim();
    setBusy(true);
    setError(null);

    const { error: err } =
      mode === "daftar"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password });

    if (err) {
      setError(
        (err.code && ERRORS[err.code]) ||
          "Tidak bisa diproses sekarang. Coba lagi sebentar.",
      );
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
      {mode === "daftar" ? (
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium">
            Nama panggilan
          </label>
          <input
            id="name"
            name="name"
            required
            autoComplete="nickname"
            maxLength={60}
            className={field}
          />
          <p className="text-sm text-muted">
            Hanya tampil di halaman riwayatmu. Tidak dikirim ke layanan AI.
          </p>
        </div>
      ) : null}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="email@contoh.com"
          className={field}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "daftar" ? "new-password" : "current-password"}
          className={field}
        />
        {mode === "daftar" ? (
          <p className="text-sm text-muted">Minimal 8 karakter.</p>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="rounded-2xl bg-alert-soft p-3 text-sm text-alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex h-[50px] w-full items-center justify-center rounded-full bg-accent px-6 font-semibold text-accent-ink hover:opacity-90 active:translate-y-px disabled:opacity-50"
      >
        {busy
          ? "Memproses..."
          : mode === "daftar"
            ? "Buat akun"
            : "Masuk"}
      </button>

      <p className="text-center text-sm text-muted">
        {mode === "daftar" ? "Sudah punya akun? " : "Belum punya akun? "}
        <Link
          href={`/${mode === "daftar" ? "masuk" : "daftar"}?next=${encodeURIComponent(next)}`}
          className="rounded font-semibold text-ink underline"
        >
          {mode === "daftar" ? "Masuk" : "Daftar"}
        </Link>
      </p>
    </form>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Daftar · Reharsa" };

export default function DaftarPage(props: PageProps<"/daftar">) {
  return (
    <div className="mx-auto max-w-md space-y-6 py-6 sm:py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3rem)]">Buat akun</h1>
        <p className="text-muted">
          Gratis. Akun dipakai untuk berlatih, menyimpan setiap rapor, dan
          melihat perkembanganmu.
        </p>
      </div>
      <Suspense fallback={null}>
        <Form searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}

async function Form({
  searchParams,
}: Pick<PageProps<"/daftar">, "searchParams">) {
  const { next } = await searchParams;
  return <AuthForm mode="daftar" next={safeNext(next)} />;
}

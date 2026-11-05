import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Masuk · Reharsa" };

export default function MasukPage(props: PageProps<"/masuk">) {
  return (
    <div className="mx-auto max-w-md space-y-6 py-6 sm:py-12">
      <div className="space-y-2 text-center">
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3rem)]">Masuk</h1>
        <p className="text-muted">
          Rapor latihanmu tersimpan dan bisa dibaca lagi di halaman riwayat.
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
}: Pick<PageProps<"/masuk">, "searchParams">) {
  const { next } = await searchParams;
  return <AuthForm mode="masuk" next={safeNext(next)} />;
}

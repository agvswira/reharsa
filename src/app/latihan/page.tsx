import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ScenarioPicker } from "@/components/scenario-picker";
import { ServiceNotice } from "@/components/service-notice";
import { currentUser } from "@/lib/server/auth";
import { serviceStatus } from "@/lib/server/env";
import { SCENARIOS } from "@/lib/scenarios";

export const metadata: Metadata = { title: "Pilih situasi · Reharsa" };

export default function LatihanPage() {
  return (
    <Suspense fallback={<p className="text-muted">Memuat situasi...</p>}>
      <Picker />
    </Suspense>
  );
}

async function Picker() {
  const user = await currentUser();
  if (!user) redirect("/masuk?next=/latihan");

  return (
    <div className="space-y-10">
      <div className="space-y-3">
        <p className="text-muted">Halo, {user.name}.</p>
        <h1 className="text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]">
          Pilih situasi.
        </h1>
        <p className="max-w-prose text-muted">
          {SCENARIOS.length} situasi, dari yang terjadi setiap hari sampai yang
          jarang tapi sulit. Pilih suasana awal tamu, lalu mulai. Setiap rapor
          tersimpan di{" "}
          <Link href="/riwayat" className="rounded font-semibold text-ink underline">
            riwayat latihanmu
          </Link>
          .
        </p>
      </div>
      <ServiceNotice status={serviceStatus()} />
      <ScenarioPicker />
    </div>
  );
}

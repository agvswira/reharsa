import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { Report } from "@/components/report";
import { currentUser } from "@/lib/server/auth";
import { getSession } from "@/lib/server/history";
import { getScenario } from "@/lib/scenarios";

export const metadata: Metadata = { title: "Rapor tersimpan · Reharsa" };

const dateFmt = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Makassar",
});

export default function SavedReportPage(props: PageProps<"/riwayat/[id]">) {
  return (
    <Suspense fallback={<p className="text-muted">Memuat rapor...</p>}>
      <Saved params={props.params} />
    </Suspense>
  );
}

async function Saved({ params }: Pick<PageProps<"/riwayat/[id]">, "params">) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect(`/masuk?next=/riwayat/${id}`);

  const saved = await getSession(user.id, id);
  if (!saved) notFound();
  const scenario = getScenario(saved.scenarioId);
  if (!scenario) notFound();

  return (
    <div className="space-y-6">
      <Link href="/riwayat" className="rounded text-sm text-muted underline">
        Kembali ke riwayat
      </Link>
      <Report
        scenario={scenario}
        turns={saved.turns}
        dateLabel={dateFmt.format(new Date(saved.createdAt))}
        restartHref={`/latihan/${scenario.id}?mood=${saved.mood}`}
        data={{
          evaluation: saved.evaluation,
          coaching: saved.coaching,
          pronunciation: saved.pronunciation,
          pronFailures: 0,
        }}
      />
    </div>
  );
}

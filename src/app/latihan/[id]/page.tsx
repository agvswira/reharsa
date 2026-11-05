import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { PracticeSession } from "@/components/practice-session";
import { getScenario, MOOD_START, SCENARIOS, type Mood } from "@/lib/scenarios";
import { currentUser } from "@/lib/server/auth";
import { serviceStatus } from "@/lib/server/env";

export function generateStaticParams() {
  return SCENARIOS.map((s) => ({ id: s.id }));
}

export async function generateMetadata(
  props: PageProps<"/latihan/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const scenario = getScenario(id);
  return { title: scenario ? `${scenario.title} · Reharsa` : "Reharsa" };
}

export default function PracticePage(props: PageProps<"/latihan/[id]">) {
  return (
    <Suspense
      fallback={<p className="text-muted">Menyiapkan situasi latihan...</p>}
    >
      <Session params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Session({
  params,
  searchParams,
}: Pick<PageProps<"/latihan/[id]">, "params" | "searchParams">) {
  const { id } = await params;
  const search = await searchParams;
  const scenario = getScenario(id);
  if (!scenario) notFound();

  // Status layanan dibaca saat request, bukan saat build.
  await connection();

  const raw = typeof search.mood === "string" ? search.mood : "kesal";
  const mood: Mood = raw in MOOD_START ? (raw as Mood) : "kesal";

  // Latihan wajib masuk; setelah masuk, kembali ke situasi yang sama.
  const user = await currentUser();
  if (!user) {
    redirect(
      `/masuk?next=${encodeURIComponent(`/latihan/${scenario.id}?mood=${mood}`)}`,
    );
  }

  return (
    <PracticeSession
      key={`${scenario.id}-${mood}`}
      scenario={scenario}
      mood={mood}
      status={serviceStatus()}
    />
  );
}

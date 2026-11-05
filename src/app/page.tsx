import type { CSSProperties } from "react";
import { connection } from "next/server";
import { Suspense } from "react";
import { PracticeTimeline } from "@/components/practice-timeline";
import { ServiceNotice } from "@/components/service-notice";
import { SCENARIOS, type Mood } from "@/lib/scenarios";
import { serviceStatus } from "@/lib/server/env";

// Halaman depan: komponen server tanpa JavaScript tambahan di browser.
// Struktur mengikuti referensi (hero, perbandingan, bukti, langkah, prinsip,
// penutup), isi dan gaya mengikuti DESIGN.md. Semua cuplikan percakapan dan
// rapor di halaman ini adalah contoh dan ditandai begitu di layar.

async function CurrentServiceNotice() {
  await connection();
  return <ServiceNotice status={serviceStatus()} />;
}

const MOODS: { value: Mood; label: string; hint: string }[] = [
  { value: "sabar", label: "Sabar", hint: "mulai tenang" },
  { value: "kesal", label: "Kesal", hint: "mulai jengkel" },
  { value: "marah", label: "Marah", hint: "mulai emosi tinggi" },
];

const nyepi = SCENARIOS[0];

// Skala tipografi dan tombol dari DESIGN.md (diturunkan dari referensi).
const display =
  "font-display font-semibold leading-[1.04] tracking-[-0.03em] text-[clamp(2.4rem,7vw,5.5rem)] [text-wrap:balance]";
const h2 = "text-[clamp(2rem,1.3rem+2.5vw,3.5rem)]";
const lede =
  "max-w-[60ch] text-[clamp(1rem,0.95rem+0.25vw,1.125rem)] text-muted [text-wrap:pretty]";
const primaryButton =
  "inline-flex h-[50px] items-center justify-center rounded-full bg-accent px-6 text-[15.5px] font-semibold text-accent-ink hover:opacity-90 active:translate-y-px";
const ghostButton =
  "inline-flex h-[50px] items-center justify-center rounded-full border border-line-2 bg-accent-soft px-6 text-[15.5px] font-semibold text-ink hover:border-edge active:translate-y-px";

/** Meter emosi contoh: 9 ruas merah (emosi 8) yang turun menjadi 4 ruas (emosi 3). */
function DemoMeter() {
  return (
    <div className="demo-meter grid grid-cols-11 gap-1" aria-hidden="true">
      {Array.from({ length: 11 }, (_, i) => {
        if (i > 8) return <span key={i} className="h-2.5 rounded-sm bg-track" />;
        const drop = i > 3;
        return (
          <span
            key={i}
            {...(drop ? { "data-drop": "" } : { "data-keep": "" })}
            style={{ "--i": 8 - i } as CSSProperties}
            className="h-2.5 rounded-sm bg-alert"
          />
        );
      })}
    </div>
  );
}

function Hero() {
  const facts = [
    `${SCENARIOS.length} situasi latihan`,
    "Aksen Australia, India, Inggris",
    "Dinilai dengan rubrik layanan front office",
    "Umpan balik dalam bahasa Indonesia",
    "Rekaman suara tidak disimpan",
  ];
  return (
    <section
      aria-labelledby="hero-judul"
      className="flex flex-col items-center pt-6 text-center sm:pt-12"
    >
      <h1 id="hero-judul" className={display}>
        <span className="rise block">Tamu marah di kelas,</span>
        <span className="rise block [animation-delay:120ms]">
          bukan di lobi hotel.
        </span>
      </h1>
      <p className={`rise mt-6 ${lede} [animation-delay:300ms]`}>
        Reharsa memerankan tamu hotel dan pewawancara kapal pesiar dari
        Australia, India, dan Inggris lewat suara. Kamu menanganinya dalam
        bahasa Inggris, lalu membaca rapor yang menunjuk kalimatmu sendiri.
      </p>
      <div className="rise mt-8 flex flex-wrap justify-center gap-3 [animation-delay:420ms]">
        <a href="#pilih-situasi" className={primaryButton}>
          Mulai latihan
        </a>
        <a href="#cara-kerja" className={ghostButton}>
          Lihat cara kerjanya
        </a>
      </div>

      {/* Pusat visual: kartu tamu dengan sorot cahaya di belakangnya
          (pengganti kanvas animasi referensi, hanya gradasi CSS). */}
      <div className="relative mt-16 w-full max-w-xl">
        <div
          aria-hidden="true"
          className="beam pointer-events-none absolute -inset-x-24 -bottom-16 -top-24"
        />
        <figure
          aria-label="Contoh: emosi tamu turun dari 8 ke 3"
          className="rise card relative space-y-4 p-5 text-left [animation-delay:560ms] sm:p-6"
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-lg font-semibold">{nyepi.guest.name}</p>
            <p className="text-sm text-muted">Tamu dari {nyepi.guest.origin}</p>
          </div>
          <p lang="en" className="text-lg leading-relaxed text-soft">
            “{nyepi.openingLines.marah}”
          </p>
          <DemoMeter />
          <figcaption className="text-sm text-muted">
            Contoh: emosi tamu turun dari 8 ke 3 setelah kamu minta maaf dan
            menawarkan teknisi dalam 15 menit.
          </figcaption>
        </figure>
      </div>

      <ul
        aria-label="Yang sudah ada di Reharsa"
        className="rise mt-16 flex max-w-4xl flex-wrap justify-center gap-x-8 gap-y-3 text-sm font-medium text-soft [animation-delay:700ms]"
      >
        {facts.map((f) => (
          <li key={f} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="size-1 rounded-full bg-ink" />
            {f}
          </li>
        ))}
      </ul>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="cara-kerja"
      aria-labelledby="cara-kerja-judul"
      className="scroll-mt-20"
    >
      <div className="reveal mx-auto max-w-3xl space-y-4 text-center">
        <h2 id="cara-kerja-judul" className={h2}>
          Latihan yang sama, dua cara.
        </h2>
        <p className={`${lede} mx-auto`}>
          Situasinya tamu Australia yang AC kamarnya mati saat Nyepi. Di kiri,
          yang biasa terjadi saat role-play di kelas. Di kanan, contoh alur di
          Reharsa.
        </p>
      </div>
      <PracticeTimeline />
    </section>
  );
}

function ReportProof() {
  return (
    <section
      id="rapor"
      aria-labelledby="rapor-judul"
      className="reveal grid scroll-mt-20 items-center gap-10 lg:grid-cols-2"
    >
      <div className="space-y-5">
        <h2 id="rapor-judul" className={h2}>
          Rapor yang menunjuk kalimatmu sendiri.
        </h2>
        <p className={lede}>
          Setelah percakapan selesai, agen penilai membaca transkrip dan memberi
          skor 1 sampai 4 untuk setiap kriteria. Setiap skor disertai kutipan
          ucapanmu, alasan dalam bahasa Indonesia, dan contoh kalimat yang lebih
          baik.
        </p>
        <p className="border-t border-line pt-4 text-muted">
          Penilai terpisah dari tamu dan tidak menghukum aksen. Yang dinilai
          kejelasan, kesopanan, dan ketepatan solusi.
        </p>
      </div>
      <figure
        aria-label="Contoh rapor"
        className="space-y-4 card p-5 sm:p-6"
      >
        <figcaption className="text-sm text-muted">Contoh rapor</figcaption>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-bold">Solusi &amp; aturan Nyepi</p>
          <p className="font-display text-2xl font-semibold tabular-nums">3/4</p>
        </div>
        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-2.5 rounded-sm ${n <= 3 ? "bg-ink" : "bg-track"}`}
            />
          ))}
        </div>
        <blockquote lang="en" className="border-l-2 border-line pl-3 text-muted">
          “I can send our technician to your room in 15 minutes.”
        </blockquote>
        <div className="space-y-1">
          <p className="text-sm text-muted">Coba katakan</p>
          <p lang="en" className="rounded-md bg-accent-soft px-3 py-2 font-bold">
            Let me send our technician up right away. He should be with you
            within 15 minutes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3 text-sm">
          <span className="text-muted">Latih lagi:</span>
          <span lang="en" className="rounded-md border border-line px-2 py-0.5">
            conditioning <span className="tabular-nums text-muted">76</span>
          </span>
        </div>
      </figure>
    </section>
  );
}

function Steps() {
  const steps = [
    {
      title: "Pilih situasi dan suasana tamu",
      body: "Sabar, kesal, atau marah. Suasana menentukan cara tamu membuka percakapan.",
      visual: (
        <div className="flex gap-1.5">
          {["Sabar", "Kesal", "Marah"].map((m) => (
            <span
              key={m}
              className={`rounded-md border px-2.5 py-1 text-sm ${
                m === "Kesal" ? "border-ink font-bold" : "border-line"
              }`}
            >
              {m}
            </span>
          ))}
        </div>
      ),
    },
    {
      title: "Izinkan mikrofon",
      body: "Rekaman hanya dipakai untuk mengubah suaramu jadi teks dan menilai pengucapan.",
      visual: (
        <div className="space-y-2 text-sm">
          <p>Reharsa ingin memakai mikrofon</p>
          <div className="flex justify-end gap-2">
            <span className="rounded-md border border-line px-2 py-0.5 text-muted">
              Blokir
            </span>
            <span className="rounded-md bg-ink px-2 py-0.5 text-paper">
              Izinkan
            </span>
          </div>
        </div>
      ),
    },
    {
      title: "Bicara sampai tamu puas",
      body: "Tekan tombol, bicara, tekan lagi. Ucapanmu muncul sebagai teks saat kamu bicara.",
      visual: (
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-alert text-white">
            <span className="size-3 rounded-sm bg-current" />
          </span>
          <span className="flex h-6 items-end gap-1">
            {[40, 70, 100, 60, 30].map((h, i) => (
              <span
                key={i}
                className="w-1.5 rounded-sm bg-alert"
                style={{ height: `${h}%` }}
              />
            ))}
          </span>
        </div>
      ),
    },
    {
      title: "Baca rapor",
      body: "Total poin, satu fokus latihan berikutnya, dan rincian per kriteria.",
      visual: (
        <div className="space-y-1">
          <p className="font-display text-2xl font-semibold tabular-nums">
            16 dari 20
          </p>
          <p className="text-sm text-muted">Fokus: Penutup &amp; terima kasih</p>
        </div>
      ),
    },
  ];
  return (
    <section aria-labelledby="langkah-judul" className="reveal space-y-10">
      <div className="max-w-3xl space-y-4">
        <h2 id="langkah-judul" className={h2}>
          Mulai dalam empat langkah.
        </h2>
        <p className={lede}>
          Butuh Chrome atau Edge dan mikrofon. Akun tidak wajib; masuk hanya untuk menyimpan rapor.
        </p>
      </div>
      <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={s.title} className="space-y-3">
            <div
              aria-hidden="true"
              className="flex min-h-28 flex-col justify-between gap-4 card p-4"
            >
              <span className="font-display text-lg font-semibold tabular-nums text-muted">
                0{i + 1}
              </span>
              {s.visual}
            </div>
            <h3 className="font-bold">{s.title}</h3>
            <p className="text-muted">{s.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScenarioList() {
  return (
    <section
      id="pilih-situasi"
      aria-labelledby="pilih-situasi-judul"
      className="scroll-mt-20 space-y-6"
    >
      <h2 id="pilih-situasi-judul" className={h2}>
        Pilih situasi.
      </h2>
      <Suspense fallback={null}>
        <CurrentServiceNotice />
      </Suspense>
      <ol className="divide-y divide-line border-y border-line">
        {SCENARIOS.map((s, i) => (
          <li key={s.id} className="py-7">
            <form
              action={`/latihan/${s.id}`}
              className="grid gap-5 md:grid-cols-[13rem_1fr]"
            >
              <div className="space-y-1">
                <p className="font-display text-3xl font-semibold tabular-nums text-muted">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="font-bold">{s.guest.name}</p>
                <p className="text-sm text-muted">
                  {s.kind === "interview" ? "Pewawancara" : "Tamu"} dari{" "}
                  {s.guest.origin}
                </p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">{s.title}</h3>
                  <p className="max-w-prose">{s.situation}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Yang dinilai</p>
                  <ul className="mt-1 flex flex-wrap gap-2">
                    {s.criteria.map((c) => (
                      <li
                        key={c.id}
                        className="rounded-md border border-line px-2.5 py-1 text-sm"
                      >
                        {c.label}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <fieldset>
                    <legend className="mb-2 text-sm text-muted">
                      Suasana awal{" "}
                      {s.kind === "interview" ? "pewawancara" : "tamu"}
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((m) => (
                        <label
                          key={m.value}
                          className="flex min-h-11 items-center gap-2 rounded-full border border-edge bg-surface px-3 hover:bg-paper has-[:checked]:border-ink has-[:checked]:font-bold"
                        >
                          <input
                            type="radio"
                            name="mood"
                            value={m.value}
                            defaultChecked={m.value === "kesal"}
                            className="accent-[var(--accent)]"
                          />
                          {m.label}
                          <span className="sr-only">, {m.hint}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button
                    type="submit"
                    className="min-h-11 rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
                  >
                    Mulai situasi ini
                    <span className="sr-only">: {s.title}</span>
                  </button>
                </div>
              </div>
            </form>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Principles() {
  const items = [
    {
      title: "Penilai terpisah dari tamu.",
      body: "Agen tamu hanya bermain peran. Skor dibuat agen lain setelah percakapan selesai, jadi jalannya role-play tidak memengaruhi nilai.",
    },
    {
      title: "Tamu hanya tahu fakta hotel.",
      body: "Harga, jam layanan, dan aturan Nyepi diambil dari lembar fakta skenario. Tamu tidak mengarang layanan yang tidak ada.",
    },
    {
      title: "Aksen tidak dihukum.",
      body: "Bahasa Inggris yang jelas dan sopan tidak dikurangi nilainya hanya karena terdengar Indonesia.",
    },
    {
      title: "Reharsa tidak menyimpan rekaman suaramu.",
      body: "Audio hanya dikirim ke layanan suara untuk diubah jadi teks dan dinilai, lalu tidak disimpan. Transkrip dan rapor disimpan hanya bila kamu masuk ke akunmu, dan hanya kamu yang bisa membukanya.",
    },
    {
      title: "Alat latihan, bukan sertifikasi.",
      body: "Skor membantu kamu tahu apa yang perlu dilatih. Kalau penilai kurang yakin, rapor memberi tahu bahwa skor itu hanya perkiraan.",
    },
  ];
  return (
    <section id="prinsip" aria-labelledby="prinsip-judul" className="reveal scroll-mt-20 space-y-10">
      <div className="max-w-3xl space-y-4">
        <h2 id="prinsip-judul" className={h2}>
          Yang kami jaga.
        </h2>
        <p className={lede}>
          Batasan ini tertulis di kode Reharsa, bukan hanya janji di halaman
          ini.
        </p>
      </div>
      <dl className="grid gap-x-10 gap-y-8 md:grid-cols-2">
        {items.map((it, i) => (
          <div
            key={it.title}
            className={`space-y-2 border-t border-line pt-4 ${
              i === 0 ? "md:col-span-2 md:max-w-3xl" : ""
            }`}
          >
            <dt
              className={`font-semibold tracking-[-0.014em] ${i === 0 ? "text-2xl" : "text-xl"}`}
            >
              {it.title}
            </dt>
            <dd className="text-muted">{it.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Close() {
  return (
    <section
      aria-labelledby="penutup-judul"
      className="reveal border-t border-line pt-20 text-center"
    >
      <h2 id="penutup-judul" className={display}>
        <span className="block">Latihan dulu.</span>
        <span className="block">Layani dengan tenang.</span>
      </h2>
      <div className="mt-8 flex justify-center">
        <a href="#pilih-situasi" className={primaryButton}>
          Pilih situasi latihan
        </a>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="space-y-[clamp(5.5rem,10vw,9.5rem)] pb-16">
      <Hero />
      <HowItWorks />
      <ReportProof />
      <Steps />
      <ScenarioList />
      <Principles />
      <Close />
    </div>
  );
}

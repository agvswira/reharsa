import Link from "next/link";
import { PracticeTimeline } from "@/components/practice-timeline";
import { channelLabel, GROUPS, SCENARIOS } from "@/lib/scenarios";

// Halaman depan: komponen server tanpa JavaScript tambahan di browser.
// Struktur mengikuti referensi (hero, perbandingan, bukti, langkah, prinsip,
// penutup), isi dan gaya mengikuti DESIGN.md. Semua cuplikan percakapan dan
// rapor di halaman ini adalah contoh dan ditandai begitu di layar.

const nyepi = SCENARIOS[0];
const countries = new Set(SCENARIOS.map((s) => s.guest.origin)).size;

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

function Hero() {
  const stats = [
    { value: String(SCENARIOS.length), label: "situasi hotel" },
    { value: String(countries), label: "negara asal tamu" },
    { value: "0-4", label: "skor per kriteria" },
  ];
  return (
    <section
      aria-labelledby="hero-judul"
      className="flex flex-col items-center pt-6 text-center sm:pt-12"
    >
      <h1 id="hero-judul" className={display}>
        <span className="rise block">Latih bicara dengan tamu asing,</span>
        <span className="rise block [animation-delay:120ms]">
          sebelum bertemu yang sungguhan.
        </span>
      </h1>
      <p className={`rise mt-6 ${lede} [animation-delay:300ms]`}>
        Bicara lewat suara, lalu baca rapor yang menunjuk kalimatmu sendiri.
      </p>
      <div className="rise mt-8 flex flex-wrap justify-center gap-3 [animation-delay:420ms]">
        <Link href="/latihan" className={primaryButton}>
          Mulai latihan
        </Link>
        <a href="#cara-kerja" className={ghostButton}>
          Lihat cara kerjanya
        </a>
      </div>

      {/* Pusat visual: satu putaran latihan, dari ucapan tamu sampai rapor,
          dengan sorot cahaya di belakangnya (hanya gradasi CSS). */}
      <div className="relative mt-16 w-full max-w-xl">
        <div
          aria-hidden="true"
          className="beam pointer-events-none absolute -inset-x-24 -bottom-16 -top-24"
        />
        <figure className="rise card relative space-y-5 p-5 text-left [animation-delay:560ms] sm:p-6">
          <figcaption className="text-sm text-muted">
            Contoh latihan · {nyepi.title} · {channelLabel(nyepi)}
          </figcaption>
          <div className="space-y-1">
            <p className="text-sm font-semibold">
              {nyepi.guest.name}, tamu dari {nyepi.guest.origin}
            </p>
            <p lang="en" className="text-lg leading-relaxed text-soft">
              “{nyepi.openingLines.kesal}”
            </p>
          </div>
          <div className="ml-6 space-y-1 rounded-2xl bg-accent-soft p-4">
            <p className="text-sm font-semibold">Kamu, lewat suara</p>
            <p lang="en" className="leading-relaxed">
              “I&apos;m so sorry about the air con, Mr Henderson. Our technician
              can be in your room within 15 minutes.”
            </p>
          </div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-line pt-4">
            <p className="text-sm text-muted">Rapor setelah percakapan</p>
            <p className="font-display text-2xl font-semibold tabular-nums">
              16 dari 20 poin
            </p>
            <p className="w-full text-sm text-muted">
              Permintaan maaf 4/4 · Fokus berikutnya: penutup &amp; terima kasih
            </p>
          </div>
        </figure>
      </div>

      <dl className="rise mt-16 grid w-full max-w-3xl grid-cols-3 gap-4 [animation-delay:700ms]">
        {stats.map((st) => (
          <div key={st.label} className="flex flex-col-reverse gap-1">
            <dt className="text-sm text-muted">{st.label}</dt>
            <dd className="font-display text-[clamp(2.25rem,6vw,3.5rem)] font-semibold leading-none tabular-nums">
              {st.value}
            </dd>
          </div>
        ))}
      </dl>
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
          Skor 0-4 per kriteria, kutipan ucapanmu, dan kalimat yang lebih baik.
        </p>
      </div>
      <figure aria-label="Contoh rapor" className="space-y-4 card p-5 sm:p-6">
        <figcaption className="text-sm text-muted">Contoh rapor</figcaption>
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-bold">Solusi &amp; aturan Nyepi</p>
          <p className="font-display text-2xl font-semibold tabular-nums">
            3/4
          </p>
        </div>
        <div className="grid grid-cols-4 gap-1" aria-hidden="true">
          {[1, 2, 3, 4].map((n) => (
            <span
              key={n}
              className={`h-2.5 rounded-sm ${n <= 3 ? "bg-ink" : "bg-track"}`}
            />
          ))}
        </div>
        <blockquote
          lang="en"
          className="border-l-2 border-line pl-3 text-muted"
        >
          “I can send our technician to your room in 15 minutes.”
        </blockquote>
        <div className="space-y-1">
          <p className="text-sm text-muted">Coba katakan</p>
          <p
            lang="en"
            className="rounded-md bg-accent-soft px-3 py-2 font-bold"
          >
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
      title: "Buat akun dan masuk",
      visual: (
        <div className="space-y-1.5 text-sm">
          <p className="rounded-md border border-line px-2.5 py-1 text-muted">
            email@contoh.com
          </p>
          <p className="w-fit rounded-md bg-ink px-2.5 py-0.5 text-paper">
            Masuk
          </p>
        </div>
      ),
    },
    {
      title: "Pilih situasi dan suasana tamu",
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
      title: "Bicara sampai tamu puas",
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
      visual: (
        <div className="space-y-1">
          <p className="font-display text-2xl font-semibold tabular-nums">
            16 dari 20
          </p>
          <p className="text-sm text-muted">
            Fokus: Penutup &amp; terima kasih
          </p>
        </div>
      ),
    },
  ];
  return (
    <section aria-labelledby="langkah-judul" className="reveal space-y-10">
      <div className="max-w-3xl space-y-4">
        <h2 id="langkah-judul" className={h2}>
          Empat langkah.
        </h2>
        <p className={lede}>
          Cukup Chrome atau Edge dan mikrofon.
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
          </li>
        ))}
      </ol>
    </section>
  );
}

function ScenarioPreview() {
  return (
    <section
      id="situasi"
      aria-labelledby="situasi-judul"
      className="reveal scroll-mt-20 space-y-10"
    >
      <div className="max-w-3xl space-y-4">
        <h2 id="situasi-judul" className={h2}>
          {SCENARIOS.length} situasi yang benar-benar terjadi.
        </h2>
        <p className={lede}>
          Tamu bisa memberi kabar baru di tengah percakapan, seperti di hotel
          sungguhan.
        </p>
      </div>
      <div className="divide-y divide-line border-y border-line">
        {GROUPS.map((g) => (
          <div
            key={g.category}
            className="grid items-start gap-4 py-6 md:grid-cols-[14rem_1fr] md:gap-10"
          >
            <h3 className="text-xl font-bold">{g.title}</h3>
            <ul className="flex flex-wrap gap-2">
              {SCENARIOS.filter((s) => s.category === g.category).map((s) => (
                <li
                  key={s.id}
                  className="rounded-full border border-line-2 px-4 py-2 text-sm font-medium"
                >
                  {s.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Link href="/latihan" className={primaryButton}>
        Mulai latihan
      </Link>
    </section>
  );
}

function Principles() {
  const items = [
    {
      title: "Penilai terpisah dari tamu.",
      body: "Jalannya role-play tidak memengaruhi nilai.",
    },
    {
      title: "Tamu hanya tahu fakta hotel.",
      body: "Tidak ada harga atau layanan karangan.",
    },
    {
      title: "Aksen tidak dihukum.",
      body: "Yang dinilai jelas dan sopan, bukan logat.",
    },
    {
      title: "Rekaman suara tidak disimpan.",
      body: "Hanya transkrip dan rapor, di akunmu sendiri.",
    },
    {
      title: "Alat latihan, bukan sertifikasi.",
      body: "Skor yang kurang yakin ditandai perkiraan.",
    },
  ];
  return (
    <section
      id="prinsip"
      aria-labelledby="prinsip-judul"
      className="reveal scroll-mt-20 space-y-10"
    >
      <div className="max-w-3xl space-y-4">
        <h2 id="prinsip-judul" className={h2}>
          Yang kami jaga.
        </h2>
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
        <Link href="/latihan" className={primaryButton}>
          Mulai latihan
        </Link>
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
      <ScenarioPreview />
      <Principles />
      <Close />
    </div>
  );
}

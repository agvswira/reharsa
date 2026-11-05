"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { EmotionMeter } from "@/components/emotion-meter";
import { Frangipani } from "@/components/frangipani";
import { GuestAvatar } from "@/components/guest-avatar";
import { MOOD_LABEL, topLevel } from "@/lib/progress";
import { pageTitle } from "@/lib/ui";
import { Report, type ReportData } from "@/components/report";
import {
  browserRecognitionAvailable,
  MAX_RECORDING_MS,
  speak,
  startLiveCaption,
  startRecording,
  stopSpeaking,
  type LiveCaption,
  type Recorder,
} from "@/lib/client/audio";
import {
  MAX_STUDENT_TURNS,
  placeLabel,
  MOOD_START,
  type Mood,
  type Scenario,
} from "@/lib/scenarios";
import type {
  GuestReply,
  PronunciationResult,
  ServiceStatus,
  Turn,
} from "@/lib/types";

type Phase = "brief" | "talking" | "evaluating" | "report";
type Busy = null | "recording" | "transcribing" | "thinking" | "speaking";

async function postJSON<T>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Permintaan gagal. Coba lagi.");
  return data as T;
}

async function transcribeWithGroq(wav: Blob): Promise<string> {
  const form = new FormData();
  form.append("audio", wav, "speech.wav");
  const res = await fetch("/api/stt", { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Transkripsi gagal.");
  return String(data.text ?? "").trim();
}

const noopSubscribe = () => () => {};

export function PracticeSession({
  scenario,
  mood,
  status,
}: {
  scenario: Scenario;
  mood: Mood;
  status: ServiceStatus;
}) {
  const startEmotion = MOOD_START[mood];
  const who = scenario.kind === "interview" ? "pewawancara" : "tamu";

  // Pengenalan suara browser hanya bisa dicek di klien.
  const browserStt = useSyncExternalStore(
    noopSubscribe,
    browserRecognitionAvailable,
    () => true,
  );
  const voiceAvailable = status.stt || browserStt;

  const [phase, setPhase] = useState<Phase>("brief");
  const [busy, setBusy] = useState<Busy>(null);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [emotion, setEmotion] = useState(startEmotion);
  const [emotionReason, setEmotionReason] = useState<string>();
  const [resolved, setResolved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryPending, setRetryPending] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [draft, setDraft] = useState("");
  const [typingChosen, setTypingChosen] = useState(false);
  const [pronunciation, setPronunciation] = useState<PronunciationResult[]>([]);
  const [pronFailures, setPronFailures] = useState(0);
  const [report, setReport] = useState<ReportData | null>(null);
  const [level, setLevel] = useState(0);

  const typing = typingChosen || !voiceAvailable;

  const recorderRef = useRef<Recorder | null>(null);
  const captionRef = useRef<LiveCaption | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listEndRef = useRef<HTMLLIElement | null>(null);
  const composerRef = useRef<HTMLDivElement | null>(null);
  // Nomor pemutaran terakhir. Pemutaran yang sudah dipotong tidak boleh
  // mengubah status ketika akhirnya selesai.
  const speakIdRef = useRef(0);

  const studentTurns = turns.filter((t) => t.speaker === "student").length;
  const limitReached = studentTurns >= MAX_STUDENT_TURNS;
  const canAnswer = phase === "talking" && !resolved && !limitReached;

  // Gulir supaya pesan terakhir berada tepat di atas area jawab yang menempel
  // di bawah layar. Tingginya berubah (mode suara atau ketik), jadi diukur.
  useEffect(() => {
    const end = listEndRef.current;
    if (!end) return;
    const covered = composerRef.current?.offsetHeight ?? 0;
    const visibleBottom = window.innerHeight - covered - 16;
    const overflow = end.getBoundingClientRect().bottom - visibleBottom;
    if (overflow > 0) window.scrollBy({ top: overflow });
  }, [turns.length, liveText, busy]);

  useEffect(() => {
    return () => {
      recorderRef.current?.cancel();
      captionRef.current?.cancel();
      stopSpeaking();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const playGuest = useCallback(
    async (text: string, mood: number) => {
      const id = ++speakIdRef.current;
      setBusy("speaking");
      await speak(scenario.id, text, scenario.guest.locale, mood);
      if (speakIdRef.current === id) setBusy(null);
    },
    [scenario.id, scenario.guest.locale],
  );

  function interruptGuest() {
    speakIdRef.current++;
    stopSpeaking();
  }

  function begin() {
    const opening: Turn = {
      speaker: "guest",
      text: scenario.openingLines[mood],
      emotion: startEmotion,
    };
    setTurns([opening]);
    setPhase("talking");
    void playGuest(opening.text, startEmotion);
  }

  async function requestGuest(next: Turn[]) {
    setBusy("thinking");
    setError(null);
    try {
      const reply = await postJSON<GuestReply>("/api/guest", {
        scenarioId: scenario.id,
        emotion,
        turns: next,
      });
      setRetryPending(false);
      setTurns([
        ...next,
        { speaker: "guest", text: reply.reply, emotion: reply.emotion },
      ]);
      setEmotion(reply.emotion);
      setEmotionReason(reply.emotion_reason);
      setResolved(reply.resolved);
      await playGuest(reply.reply, reply.emotion);
    } catch (err) {
      // Jawabanmu tetap di transkrip; cukup tekan "Kirim ulang".
      setRetryPending(true);
      setError((err as Error).message);
      setBusy(null);
    }
  }

  async function sendAnswer(text: string, audio?: Blob) {
    const clean = text.trim();
    if (!clean) return;
    interruptGuest();
    // Jawaban baru menggantikan jawaban yang gagal terkirim.
    const base = retryPending ? turns.slice(0, -1) : turns;
    const next: Turn[] = [...base, { speaker: "student", text: clean }];
    setTurns(next);

    if (audio && status.azure) {
      const form = new FormData();
      form.append("audio", audio, "speech.wav");
      form.append("reference", clean);
      fetch("/api/pronunciation", { method: "POST", body: form })
        .then(async (res) => {
          if (!res.ok) throw new Error();
          const result = (await res.json()) as PronunciationResult;
          setPronunciation((prev) => [...prev, result]);
        })
        .catch(() => setPronFailures((n) => n + 1));
    }

    await requestGuest(next);
  }

  async function startTalking() {
    setError(null);
    setLiveText("");
    interruptGuest();
    try {
      recorderRef.current = await startRecording(setLevel);
    } catch {
      setError(
        "Mikrofon tidak bisa dipakai. Izinkan akses mikrofon di browser, lalu coba lagi.",
      );
      return;
    }
    captionRef.current = startLiveCaption(setLiveText);
    setBusy("recording");
    timerRef.current = setTimeout(() => {
      void stopTalkingRef.current();
    }, MAX_RECORDING_MS);
  }

  async function stopTalking() {
    if (timerRef.current) clearTimeout(timerRef.current);
    const recorder = recorderRef.current;
    const caption = captionRef.current;
    recorderRef.current = null;
    captionRef.current = null;
    if (!recorder) return;
    setBusy("transcribing");

    try {
      const [wav, browserText] = await Promise.all([
        recorder.stop(),
        caption ? caption.stop() : Promise.resolve(""),
      ]);

      // Whisper di server lebih akurat; teks browser jadi cadangan.
      let text = "";
      if (status.stt) {
        try {
          text = await transcribeWithGroq(wav);
        } catch {
          text = browserText;
        }
      } else {
        text = browserText;
      }

      setLiveText("");
      if (!text) {
        setBusy(null);
        setError(
          "Suaramu tidak terdengar jelas. Coba bicara lebih dekat ke mikrofon.",
        );
        return;
      }
      await sendAnswer(text, wav);
    } catch (err) {
      setLiveText("");
      setBusy(null);
      setError((err as Error).message || "Rekaman gagal diproses.");
    }
  }

  // Timer batas rekaman memanggil versi terbaru fungsi ini.
  const stopTalkingRef = useRef(stopTalking);
  useEffect(() => {
    stopTalkingRef.current = stopTalking;
  });

  async function finish() {
    recorderRef.current?.cancel();
    captionRef.current?.cancel();
    recorderRef.current = null;
    captionRef.current = null;
    interruptGuest();
    setBusy(null);
    setPhase("evaluating");
    setError(null);
    // Jawaban yang belum dibalas tamu tetap ikut dinilai.
    try {
      const data = await postJSON<
        Omit<ReportData, "pronunciation" | "pronFailures">
      >("/api/evaluate", {
        scenarioId: scenario.id,
        mood,
        turns,
        pronunciation,
      });
      setReport({ ...data, pronunciation, pronFailures });
      setPhase("report");
    } catch (err) {
      setError((err as Error).message);
      setPhase("talking");
    }
  }

  function restart() {
    interruptGuest();
    setTurns([]);
    setEmotion(startEmotion);
    setEmotionReason(undefined);
    setResolved(false);
    setRetryPending(false);
    setPronunciation([]);
    setPronFailures(0);
    setReport(null);
    setError(null);
    setDraft("");
    setLiveText("");
    setPhase("brief");
  }

  if (phase === "report" && report) {
    return (
      <Report
        scenario={scenario}
        data={report}
        turns={turns}
        onRestart={restart}
      />
    );
  }

  const recording = busy === "recording";
  const waiting = busy === "thinking" || busy === "transcribing";
  const guestLabel = scenario.kind === "interview" ? "Pewawancara" : "Tamu";
  const lastGuest = [...turns].reverse().find((t) => t.speaker === "guest");

  const finishButton = (
    <button
      type="button"
      onClick={() => void finish()}
      disabled={
        studentTurns === 0 || phase === "evaluating" || waiting || recording
      }
      className={`min-h-11 w-full rounded-md px-5 font-bold active:translate-y-px disabled:opacity-50 ${
        resolved || limitReached
          ? "bg-accent text-accent-ink hover:opacity-90"
          : "border border-edge text-ink hover:bg-accent-soft"
      }`}
    >
      {phase === "evaluating" ? "Menilai..." : "Selesai dan lihat rapor"}
    </button>
  );

  const guestCard = (
    <div className="card flex items-center gap-3 p-4">
      <GuestAvatar scenario={scenario} />
      <div className="min-w-0">
        <p className="truncate font-semibold">{scenario.guest.name}</p>
        <p className="text-sm text-muted">
          {guestLabel} dari {scenario.guest.origin} ·{" "}
          {MOOD_LABEL[mood].toLowerCase()}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Link href="/latihan" className="rounded text-sm text-muted underline">
          Kembali ke daftar situasi
        </Link>
        <p className="text-sm text-muted">
          {placeLabel(scenario)} · {scenario.department} ·{" "}
          {scenario.channel === "telepon" ? "Telepon" : "Tatap muka"}
        </p>
        <h1 className={pageTitle}>
          {scenario.title}
        </h1>
      </div>

      {phase === "brief" ? (
        <section
          aria-labelledby="brief"
          className="grid gap-10 lg:grid-cols-[1fr_22rem]"
        >
          <div className="min-w-0 space-y-8">
            <h2 id="brief" className="sr-only">
              Brief latihan
            </h2>
            <p className="max-w-prose text-xl leading-relaxed">
              {scenario.situation}
            </p>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div className="card space-y-1 p-4">
                <dt className="text-sm text-muted">Peranmu</dt>
                <dd className="font-semibold">{scenario.studentRole}</dd>
              </div>
              <div className="card space-y-1 p-4">
                <dt className="text-sm text-muted">Tujuan</dt>
                <dd>{scenario.goal}</dd>
              </div>
            </dl>

            {/* Garis kiri menandai peringatan nyata (ada twist), bukan hiasan. */}
            {scenario.twist ? (
              <p className="border-l-2 border-ink pl-4">
                <span className="font-semibold">Siap-siap menyesuaikan.</span>{" "}
                <span className="text-muted">
                  Di tengah percakapan, {scenario.guest.name} akan memberi kabar
                  baru yang mengubah kebutuhannya.
                </span>
              </p>
            ) : null}

            <section aria-labelledby="dinilai" className="space-y-3">
              <h3 id="dinilai" className="font-display text-xl font-semibold tracking-[-0.02em]">
                Yang dinilai, dan seperti apa skor 4
              </h3>
              <ol className="space-y-4">
                {scenario.criteria.map((c, i) => (
                  <li key={c.id} className="grid grid-cols-[2rem_1fr] gap-3">
                    <span className="font-display font-semibold tabular-nums text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-semibold">{c.label}</span>
                      <span className="block text-sm text-muted">
                        {topLevel(c.rubric)}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>
            </section>

            <details className="card p-4">
              <summary className="font-bold">
                Fakta hotel yang boleh kamu pakai ({scenario.facts.length})
              </summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {scenario.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </details>
          </div>

          <aside
            aria-label="Persiapan"
            className="lg:sticky lg:top-24 lg:self-start"
          >
            <div className="card space-y-5 p-5">
              <div className="flex items-center gap-3">
                <GuestAvatar scenario={scenario} size="lg" />
                <div>
                  <p className="text-lg font-semibold">{scenario.guest.name}</p>
                  <p className="text-sm text-muted">
                    {guestLabel} dari {scenario.guest.origin}
                  </p>
                </div>
              </div>

              <nav aria-label="Suasana awal" className="space-y-2">
                <p className="text-sm text-muted">Suasana awal</p>
                <div className="grid grid-cols-3 gap-1 rounded-full border border-line-2 p-1">
                  {(["sabar", "kesal", "marah"] as const).map((m) => (
                    <Link
                      key={m}
                      href={`/latihan/${scenario.id}?mood=${m}`}
                      replace
                      scroll={false}
                      aria-current={m === mood ? "true" : undefined}
                      className={`flex min-h-10 items-center justify-center rounded-full text-sm ${
                        m === mood
                          ? "bg-ink font-bold text-paper"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {MOOD_LABEL[m]}
                    </Link>
                  ))}
                </div>
              </nav>

              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-ink" />
                  {voiceAvailable
                    ? `Nyalakan suara perangkat. ${scenario.guest.name} bicara duluan.`
                    : "Browser ini tidak mendukung suara, jadi kamu menjawab dengan mengetik. Untuk latihan suara, pakai Chrome atau Edge."}
                </li>
                {voiceAvailable ? (
                  <li className="flex gap-2">
                    <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-ink" />
                    Izinkan mikrofon saat diminta, lalu jawab dalam bahasa Inggris.
                  </li>
                ) : null}
                <li className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1 shrink-0 rounded-full bg-ink" />
                  Maksimal {MAX_STUDENT_TURNS} giliran. Rapor tersimpan ke riwayatmu.
                </li>
              </ul>

              <button
                type="button"
                onClick={begin}
                className="min-h-12 w-full rounded-full bg-accent px-5 text-lg font-bold text-accent-ink hover:opacity-90 active:translate-y-px"
              >
                Mulai percakapan
              </button>
            </div>
          </aside>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem]">
          <section aria-labelledby="percakapan" className="min-w-0 space-y-4">
            <h2 id="percakapan" className="sr-only">
              Percakapan
            </h2>

            {/* Di HP meter emosi menempel di atas supaya tetap terlihat. */}
            <div className="sticky top-[4.3rem] z-10 -mx-4 border-b border-line bg-paper px-4 py-3 lg:hidden">
              <EmotionMeter value={emotion} who={who} compact />
            </div>

            <ol className="space-y-5" aria-label="Transkrip">
              {turns.map((t, i) => (
                <li
                  key={i}
                  className={
                    t.speaker === "guest"
                      ? "max-w-[88%] space-y-1"
                      : "ml-auto max-w-[88%] space-y-1 text-right"
                  }
                >
                  <p className="text-sm text-muted">
                    {t.speaker === "guest" ? scenario.guest.name : "Kamu"}
                    {t.speaker === "guest" && t.emotion !== undefined
                      ? ` · emosi ${t.emotion}`
                      : ""}
                  </p>
                  <p
                    lang="en"
                    className={`inline-block rounded-md px-4 py-2.5 text-left text-lg leading-relaxed ${
                      t.speaker === "guest"
                        ? "border border-line bg-surface"
                        : "bg-accent-soft"
                    }`}
                  >
                    {t.text}
                  </p>
                  {t.speaker === "guest" ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => void playGuest(t.text, t.emotion ?? 5)}
                        disabled={recording || waiting}
                        className="min-h-11 rounded-md px-2 text-sm text-muted underline hover:text-ink disabled:opacity-50"
                      >
                        Dengar lagi
                        <span className="sr-only">
                          {" "}
                          kalimat {scenario.guest.name}
                        </span>
                      </button>
                    </div>
                  ) : null}
                </li>
              ))}
              {recording ? (
                <li className="ml-auto max-w-[88%] space-y-1 text-right">
                  <p className="text-sm text-muted">Kamu, sedang bicara</p>
                  <p
                    lang="en"
                    className="inline-block min-h-11 rounded-md border border-dashed border-accent px-4 py-2.5 text-left text-lg"
                  >
                    {liveText ||
                      (browserStt ? "Mendengarkan..." : "Merekam...")}
                  </p>
                </li>
              ) : null}
              <li ref={listEndRef} aria-hidden="true" />
            </ol>

            {/* Jawaban tamu diumumkan ke pembaca layar. */}
            <p className="sr-only" aria-live="polite">
              {lastGuest && busy !== "thinking"
                ? `${scenario.guest.name}: ${lastGuest.text}. Emosi ${emotion} dari 10.`
                : ""}
            </p>

            {error ? (
              <div
                role="alert"
                className="flex flex-wrap items-center gap-3 rounded-md bg-alert-soft p-3 text-sm text-alert"
              >
                <p className="flex-1">{error}</p>
                {retryPending ? (
                  <button
                    type="button"
                    onClick={() => void requestGuest(turns)}
                    disabled={waiting}
                    className="min-h-11 rounded-md border border-alert px-4 font-bold hover:bg-accent-soft disabled:opacity-50"
                  >
                    Kirim ulang
                  </button>
                ) : null}
              </div>
            ) : null}

            {resolved || limitReached ? (
              <p className="card flex items-center gap-3 p-4">
                {/* Bunga jepun hanya muncul saat tamu benar-benar puas. */}
                {resolved ? <Frangipani size={28} className="shrink-0" /> : null}
                <span>
                  {resolved
                    ? `${scenario.guest.name} menganggap urusannya selesai. Lihat rapormu.`
                    : `Batas ${MAX_STUDENT_TURNS} giliran tercapai. Lihat rapormu.`}
                </span>
              </p>
            ) : null}

            {/* Area jawab menempel di bawah supaya tombol bicara selalu terlihat. */}
            <div
              ref={composerRef}
              className="sticky bottom-0 z-10 -mx-4 space-y-3 border-t border-line bg-paper px-4 pb-4 pt-3 sm:mx-0 sm:px-0"
            >
              <p className="min-h-5 text-sm text-muted" aria-live="polite">
                {busy === "transcribing" && "Memproses ucapanmu..."}
                {busy === "thinking" &&
                  `${scenario.guest.name} sedang menanggapi...`}
                {busy === "speaking" &&
                  `${scenario.guest.name} sedang bicara. Kamu boleh langsung menjawab.`}
                {phase === "evaluating" &&
                  "Menilai percakapanmu. Biasanya butuh sekitar 15 detik."}
              </p>

              {canAnswer ? (
                typing ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = draft;
                      setDraft("");
                      void sendAnswer(text);
                    }}
                    className="space-y-2"
                  >
                    <label
                      htmlFor="jawaban"
                      className="block text-sm text-muted"
                    >
                      Jawabanmu (bahasa Inggris)
                    </label>
                    <textarea
                      id="jawaban"
                      lang="en"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          e.currentTarget.form?.requestSubmit();
                        }
                      }}
                      rows={2}
                      maxLength={2000}
                      placeholder="Type what you would say..."
                      className="w-full rounded-2xl border border-edge bg-surface p-4 text-lg text-ink placeholder:text-muted"
                    />
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="submit"
                        disabled={waiting || !draft.trim()}
                        className="min-h-11 rounded-full bg-accent px-5 font-bold text-accent-ink hover:opacity-90 active:translate-y-px disabled:opacity-50"
                      >
                        Kirim jawaban
                      </button>
                      {voiceAvailable ? (
                        <button
                          type="button"
                          onClick={() => setTypingChosen(false)}
                          className="min-h-11 rounded-md px-2 text-sm text-muted underline hover:text-ink"
                        >
                          Kembali bicara pakai mikrofon
                        </button>
                      ) : null}
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        void (recording ? stopTalking() : startTalking())
                      }
                      disabled={waiting}
                      aria-pressed={recording}
                      aria-label={
                        recording ? "Selesai bicara" : "Tekan untuk bicara"
                      }
                      className={`grid size-16 shrink-0 place-items-center rounded-full active:translate-y-px disabled:opacity-50 ${
                        recording
                          ? "bg-alert text-white"
                          : "bg-accent text-accent-ink hover:opacity-90"
                      }`}
                    >
                      {recording ? (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-6"
                          fill="currentColor"
                        >
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          className="size-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        >
                          <rect x="9" y="3" width="6" height="11" rx="3" />
                          <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
                        </svg>
                      )}
                    </button>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="font-bold">
                        {recording ? "Selesai bicara" : "Tekan untuk bicara"}
                      </p>
                      {recording ? (
                        // Bar volume: bukti bahwa mikrofon menangkap suara.
                        <div
                          aria-hidden="true"
                          className="flex h-5 items-end gap-1"
                        >
                          {[0.15, 0.35, 0.55, 0.75, 0.95].map((t) => (
                            <span
                              key={t}
                              className={`w-1.5 rounded-sm transition-[height] duration-75 ${
                                level >= t ? "bg-alert" : "bg-track"
                              }`}
                              style={{ height: `${30 + t * 70}%` }}
                            />
                          ))}
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setTypingChosen(true)}
                          className="min-h-11 rounded-md text-sm text-muted underline hover:text-ink"
                        >
                          Tidak bisa bicara sekarang? Ketik saja
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : null}

              <div className="lg:hidden">{finishButton}</div>
            </div>
          </section>

          <aside
            aria-label="Info latihan"
            className="space-y-4 lg:sticky lg:top-24 lg:self-start"
          >
            <div className="hidden lg:block">{guestCard}</div>
            <div className="hidden card p-4 lg:block">
              <EmotionMeter value={emotion} reason={emotionReason} who={who} />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted">Tujuan</p>
              <p>{scenario.goal}</p>
            </div>
            <details className="card p-4">
              <summary className="font-bold">
                Fakta yang boleh kamu pakai
              </summary>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
                {scenario.facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </details>
            <div className="space-y-2">
              <p className="text-sm text-muted tabular-nums">
                Giliran {studentTurns} dari {MAX_STUDENT_TURNS}
              </p>
              <div aria-hidden="true" className="grid grid-cols-10 gap-1">
                {Array.from({ length: MAX_STUDENT_TURNS }, (_, i) => (
                  <span
                    key={i}
                    className={`h-1.5 rounded-sm ${i < studentTurns ? "bg-ink" : "bg-track"}`}
                  />
                ))}
              </div>
            </div>
            <div className="hidden lg:block">{finishButton}</div>
          </aside>
        </div>
      )}
    </div>
  );
}

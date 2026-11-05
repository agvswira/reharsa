// Utilitas audio di browser: merekam mikrofon, mengubahnya jadi WAV PCM
// 16 kHz mono (format yang diterima Groq Whisper dan Azure Pronunciation
// Assessment), dan memutar suara tamu.

export const MAX_RECORDING_MS = 60_000;

export type Recorder = {
  stop: () => Promise<Blob>;
  cancel: () => void;
};

/**
 * Mulai merekam. `onLevel` menerima volume 0-1 sekitar 15 kali per detik,
 * supaya siswa melihat bahwa suaranya tertangkap mikrofon.
 */
export async function startRecording(
  onLevel?: (level: number) => void,
): Promise<Recorder> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  recorder.start();

  let meterCtx: AudioContext | null = null;
  let meterTimer: ReturnType<typeof setInterval> | null = null;
  if (onLevel) {
    meterCtx = new AudioContext();
    const analyser = meterCtx.createAnalyser();
    analyser.fftSize = 512;
    meterCtx.createMediaStreamSource(stream).connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);
    meterTimer = setInterval(() => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const s of samples) sum += ((s - 128) / 128) ** 2;
      // RMS suara bicara biasanya 0.02-0.2; dikali agar terlihat jelas.
      onLevel(Math.min(1, Math.sqrt(sum / samples.length) * 6));
    }, 66);
  }

  const release = () => {
    if (meterTimer) clearInterval(meterTimer);
    void meterCtx?.close();
    meterCtx = null;
    onLevel?.(0);
    stream.getTracks().forEach((t) => t.stop());
  };

  return {
    stop: () =>
      new Promise<Blob>((resolve, reject) => {
        recorder.onstop = async () => {
          release();
          try {
            const raw = new Blob(chunks, { type: recorder.mimeType });
            resolve(await toWav16k(raw));
          } catch (err) {
            reject(err);
          }
        };
        recorder.stop();
      }),
    cancel: () => {
      recorder.onstop = null;
      if (recorder.state !== "inactive") recorder.stop();
      release();
    },
  };
}

async function toWav16k(blob: Blob): Promise<Blob> {
  const sampleRate = 16_000;
  const data = await blob.arrayBuffer();
  const ctx = new AudioContext();
  const decoded = await ctx.decodeAudioData(data);
  await ctx.close();

  const length = Math.ceil(decoded.duration * sampleRate);
  if (length === 0) throw new Error("Rekaman kosong.");
  const offline = new OfflineAudioContext(1, length, sampleRate);
  const source = offline.createBufferSource();
  source.buffer = decoded;
  source.connect(offline.destination);
  source.start();
  const rendered = await offline.startRendering();
  return encodeWav(rendered.getChannelData(0), sampleRate);
}

function encodeWav(samples: Float32Array, sampleRate: number): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const write = (offset: number, text: string) => {
    for (let i = 0; i < text.length; i++) {
      view.setUint8(offset + i, text.charCodeAt(i));
    }
  };
  write(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  write(8, "WAVE");
  write(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  write(36, "data");
  view.setUint32(40, samples.length * 2, true);
  let offset = 44;
  for (const s of samples) {
    const clamped = Math.max(-1, Math.min(1, s));
    view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: "audio/wav" });
}

// Pengenalan suara bawaan browser (Chrome, Edge, Safari). Dipakai untuk teks
// berjalan saat siswa bicara, dan sebagai cadangan bila Groq tidak tersedia.
type RecognitionResultList = ArrayLike<
  ArrayLike<{ transcript: string }> & { isFinal: boolean }
>;
type BrowserRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { results: RecognitionResultList }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};
type RecognitionCtor = new () => BrowserRecognition;

function recognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function browserRecognitionAvailable() {
  return recognitionCtor() !== null;
}

export type LiveCaption = {
  stop: () => Promise<string>;
  cancel: () => void;
};

/**
 * Mulai pengenalan suara browser. `onText` dipanggil setiap ada potongan
 * teks baru supaya siswa melihat ucapannya muncul saat bicara.
 */
export function startLiveCaption(onText: (text: string) => void): LiveCaption | null {
  const Ctor = recognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "en-US";
  rec.continuous = true;
  rec.interimResults = true;

  let text = "";
  let finished: ((value: string) => void) | null = null;
  let active = true;

  rec.onresult = (e) => {
    text = Array.from(e.results)
      .map((r) => r[0]?.transcript ?? "")
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
    onText(text);
  };
  rec.onerror = () => {
    active = false;
  };
  rec.onend = () => {
    // Browser menghentikan pengenalan setelah hening lama; nyalakan lagi
    // selama siswa belum menekan "Selesai bicara".
    if (finished) {
      finished(text);
      finished = null;
    } else if (active) {
      try {
        rec.start();
      } catch {
        active = false;
      }
    }
  };
  rec.start();

  return {
    stop: () =>
      new Promise<string>((resolve) => {
        finished = resolve;
        active = false;
        rec.stop();
        // Cadangan bila onend tidak pernah terpanggil.
        setTimeout(() => {
          if (finished) {
            finished(text);
            finished = null;
          }
        }, 1500);
      }),
    cancel: () => {
      active = false;
      finished = null;
      rec.abort();
    },
  };
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) return Promise.resolve(voices);
  // Daftar suara dimuat asinkron di Chrome; tunggu sebentar.
  return new Promise((resolve) => {
    const timer = setTimeout(
      () => resolve(window.speechSynthesis.getVoices()),
      1000,
    );
    window.speechSynthesis.addEventListener(
      "voiceschanged",
      () => {
        clearTimeout(timer);
        resolve(window.speechSynthesis.getVoices());
      },
      { once: true },
    );
  });
}

/**
 * Pilih suara browser yang paling natural untuk aksen tamu. Edge menyediakan
 * suara "Online (Natural)" gratis dan Chrome punya suara "Google"; keduanya
 * jauh kurang kaku dibanding suara bawaan sistem operasi.
 */
async function pickBrowserVoice(locale: string) {
  const voices = await loadVoices();
  const norm = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-");
  const quality = (v: SpeechSynthesisVoice) =>
    /natural/i.test(v.name) ? 3 : /online|google|neural/i.test(v.name) ? 2 : 0;
  const rank = (v: SpeechSynthesisVoice) =>
    (norm(v) === locale ? 10 : norm(v).startsWith("en") ? 4 : 0) + quality(v);
  const best = [...voices].sort((a, b) => rank(b) - rank(a))[0];
  return best && rank(best) > 0 ? best : undefined;
}

let current: HTMLAudioElement | null = null;

export function stopSpeaking() {
  current?.pause();
  current = null;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

/**
 * Putar suara tamu. Utamakan Azure Neural TTS lewat /api/tts; bila belum
 * dikonfigurasi atau kuota habis, pakai suara bawaan browser.
 * Mengembalikan sumber suara yang dipakai.
 */
export async function speak(
  scenarioId: string,
  text: string,
  locale: string,
  emotion: number,
): Promise<"azure" | "browser" | "none"> {
  stopSpeaking();
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenarioId, text, emotion }),
    });
    if (res.ok) {
      const url = URL.createObjectURL(await res.blob());
      const audio = new Audio(url);
      current = audio;
      await new Promise<void>((resolve) => {
        audio.onended = () => resolve();
        audio.onerror = () => resolve();
        audio.play().catch(() => resolve());
      });
      URL.revokeObjectURL(url);
      return "azure";
    }
  } catch {
    // Lanjut ke suara browser.
  }

  if (!("speechSynthesis" in window)) return "none";
  const voice = await pickBrowserVoice(locale);
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    if (voice) utterance.voice = voice;
    // Tamu yang kesal bicara sedikit lebih cepat.
    utterance.rate = emotion >= 7 ? 1.08 : 1;
    // Beberapa browser tidak pernah memanggil onend (misalnya tanpa suara
    // terpasang). Batas waktu ini mencegah status "sedang bicara" tertahan.
    const words = text.split(/\s+/).length;
    const guard = setTimeout(() => resolve("browser"), 3000 + words * 450);
    const done = () => {
      clearTimeout(guard);
      resolve("browser");
    };
    utterance.onend = done;
    utterance.onerror = done;
    window.speechSynthesis.speak(utterance);
  });
}

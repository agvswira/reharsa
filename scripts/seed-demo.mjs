// Mengisi akun demo juri dengan sesi latihan SUNGGUHAN: script ini memakai
// API Reharsa yang sama dengan browser. Jawaban siswa ditulis di bawah dengan
// kualitas bertahap (lemah ke baik) supaya riwayat menunjukkan perkembangan;
// balasan tamu dan semua skor dibuat oleh agen AI, bukan dikarang.
//
// Jalankan saat dev server hidup:
//   npm run demo:seed
// Kredensial dibaca dari DEMO_EMAIL dan DEMO_PASSWORD di .env.local.

const BASE = process.env.DEMO_BASE_URL || "http://localhost:3000";
const email = process.env.DEMO_EMAIL;
const password = process.env.DEMO_PASSWORD;
if (!email || !password) {
  console.error("Isi DEMO_EMAIL dan DEMO_PASSWORD di .env.local dulu.");
  process.exit(1);
}

let cookie = "";
async function call(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: BASE, cookie },
    body: JSON.stringify(body),
  });
  const setCookie = res.headers.getSetCookie?.() ?? [];
  if (setCookie.length) {
    cookie = setCookie.map((c) => c.split(";")[0]).join("; ");
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Daftar; bila akun sudah ada, masuk saja.
let r = await call("/api/auth/sign-up/email", {
  email,
  password,
  name: "Akun Demo Juri",
});
if (!r.ok) r = await call("/api/auth/sign-in/email", { email, password });
if (!r.ok) {
  console.error("Gagal masuk ke akun demo:", r.status, r.data);
  process.exit(1);
}
console.log("Masuk sebagai", email);

const OPENINGS = {
  "nyepi-ac-rusak": {
    sabar:
      "Hi, sorry to bother you. The air con in my room's stopped working and it's getting pretty warm. I was thinking I might just pop out to a cafe for a bit?",
    kesal:
      "Yeah, hi. Look, the air con in my room's completely died and it's boiling in there. I'm just gonna head out and find a cafe with some cool air, alright?",
    marah:
      "Mate, this is ridiculous. The air con's dead, it's like an oven in my room, and nobody's picking up the phone. I'm walking out to find somewhere cool. Right now.",
  },
  "checkin-pura": {
    kesal:
      "Hi. Booking under Raman, two nights. We've been travelling since five this morning, so if we could do this quickly. Also, what do we need for the temple tomorrow?",
  },
  "wawancara-kapal-pesiar": {
    sabar:
      "Hi there, thanks for joining. I'm Sarah, I look after guest services hiring. No rush, so to start, could you tell me a little about yourself?",
  },
};

// Lima sesi, dari jawaban yang lemah ke yang baik.
const SESSIONS = [
  {
    scenarioId: "nyepi-ac-rusak",
    mood: "kesal",
    answers: [
      "Sorry sir. You cannot go out today.",
      "The technician will come later. Please wait in your room.",
    ],
  },
  {
    scenarioId: "checkin-pura",
    mood: "kesal",
    answers: [
      "Good afternoon. Yes, Mrs Raman, two nights. Here is your key.",
      "For the temple you must wear a sarong. You can buy it there.",
    ],
  },
  {
    scenarioId: "nyepi-ac-rusak",
    mood: "marah",
    answers: [
      "I'm very sorry, Mr Henderson. I understand it's very hot in your room. Today is Nyepi, so the roads are closed and all guests need to stay in the hotel.",
      "I can send our technician to your room within 15 minutes. While you wait, you are welcome to sit in our restaurant, which is open today.",
    ],
  },
  {
    scenarioId: "wawancara-kapal-pesiar",
    mood: "sabar",
    answers: [
      "My name is Komang. I studied hospitality in Bali and did a six month internship at the front office of a resort in Ubud, where I handled check-ins and guest requests every day.",
      "Once a guest was angry because his room was not ready after a long flight. I apologised, offered him a drink in the lounge, and kept him updated every fifteen minutes. He thanked me when he finally got his room.",
    ],
  },
  {
    scenarioId: "nyepi-ac-rusak",
    mood: "kesal",
    answers: [
      "I'm so sorry about the air conditioning, Mr Henderson, that must be really uncomfortable in this heat. I'm afraid today is Nyepi, the Balinese Day of Silence, so the roads are closed and guests need to stay within the hotel.",
      "Here's what I can do: our technician will be in your room within 15 minutes. If it can't be fixed quickly, I'll move you to a Pool Villa at no extra cost. Shall I send him up now? Thank you for your patience.",
    ],
  },
];

for (const [i, s] of SESSIONS.entries()) {
  const turns = [
    { speaker: "guest", text: OPENINGS[s.scenarioId][s.mood], emotion: { sabar: 2, kesal: 5, marah: 8 }[s.mood] },
  ];
  let emotion = turns[0].emotion;
  for (const answer of s.answers) {
    turns.push({ speaker: "student", text: answer });
    const g = await call("/api/guest", { scenarioId: s.scenarioId, emotion, turns });
    if (!g.ok) throw new Error(`Agen tamu gagal: ${g.status} ${JSON.stringify(g.data)}`);
    emotion = g.data.emotion;
    turns.push({ speaker: "guest", text: g.data.reply, emotion });
  }
  const e = await call("/api/evaluate", { scenarioId: s.scenarioId, mood: s.mood, turns });
  if (!e.ok || !e.data.saved?.id) {
    throw new Error(`Penilaian gagal: ${e.status} ${JSON.stringify(e.data).slice(0, 300)}`);
  }
  const total = e.data.evaluation.criteria.reduce((sum, c) => sum + c.score, 0);
  console.log(`Sesi ${i + 1}: ${s.scenarioId} (${s.mood}) -> ${total} poin, emosi akhir ${emotion}`);
}
console.log("Selesai.");

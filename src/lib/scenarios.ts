// Skenario latihan. Hotel Puri Sekar adalah hotel fiktif; semua fakta hotel
// di sini dibuat tim untuk latihan dan menjadi satu-satunya sumber fakta
// yang boleh dipakai Agen Tamu (grounding).

export type Mood = "sabar" | "kesal" | "marah";

export const MOOD_START: Record<Mood, number> = {
  sabar: 2,
  kesal: 5,
  marah: 8,
};

export type Criterion = {
  id: string;
  label: string;
  // Deskripsi yang dibaca Agen Penilai. Skor 1-4.
  rubric: string;
};

export type Scenario = {
  id: string;
  title: string;
  situation: string;
  studentRole: string;
  goal: string;
  guest: {
    name: string;
    origin: string;
    // Nama suara Azure Neural TTS dan locale untuk cadangan speechSynthesis.
    azureVoice: string;
    locale: string;
    persona: string;
  };
  // Kalimat pembuka mengikuti suasana awal yang dipilih siswa.
  openingLines: Record<Mood, string>;
  hiddenGoal: string;
  facts: string[];
  criteria: Criterion[];
  kind: "service" | "interview";
};

const HOTEL_FACTS = [
  "Hotel Puri Sekar adalah hotel fiktif bintang 4 di Ubud, Bali, dengan 48 kamar.",
  "Tipe kamar: Deluxe Garden (Rp1.400.000/malam) dan Pool Villa (Rp3.200.000/malam).",
  "Sarapan pukul 06.30 sampai 10.30 di restoran Taman.",
  "Klinik terdekat yang bekerja sama dengan hotel berjarak 10 menit berkendara; dokter jaga bisa dipanggil ke kamar dengan biaya tambahan.",
  "Teknisi hotel bertugas 24 jam dan biasanya tiba di kamar dalam 15 menit.",
  "Staf front office boleh memberi kompensasi sampai satu kali makan malam gratis atau upgrade kamar bila Pool Villa kosong, tanpa izin manajer.",
];

const NYEPI_FACTS = [
  "Saat Nyepi, seluruh Bali hening selama 24 jam mulai pukul 06.00 sampai pukul 06.00 hari berikutnya.",
  "Saat Nyepi, tamu wajib tetap di area hotel; jalan raya tertutup dan dijaga pecalang.",
  "Saat Nyepi, bandara Ngurah Rai tidak beroperasi.",
  "Saat Nyepi, restoran hotel tetap melayani tamu, lampu kamar diminta diredupkan dan tirai ditutup setelah gelap.",
];

export const SCENARIOS: Scenario[] = [
  {
    id: "nyepi-ac-rusak",
    title: "AC kamar rusak saat Nyepi",
    situation:
      "Hari Nyepi. Tamu dari Australia menelepon front office karena AC kamarnya mati dan ia ingin keluar hotel mencari tempat yang lebih sejuk.",
    studentRole: "Staf front office Hotel Puri Sekar",
    goal: "Tenangkan tamu, jelaskan aturan Nyepi dengan sopan, dan tawarkan solusi nyata dari fakta hotel.",
    guest: {
      name: "Mark Henderson",
      origin: "Australia",
      azureVoice: "en-AU-WilliamNeural",
      locale: "en-AU",
      persona:
        "A 45-year-old Australian guest from Perth on his first trip to Bali. Direct, informal, uses Australian expressions now and then (mate, reckon, no worries). Hot, tired, and annoyed. He did not know much about Nyepi.",
    },
    openingLines: {
      sabar:
        "Hi, sorry to bother you. The air con in my room's stopped working and it's getting pretty warm. I was thinking I might just pop out to a cafe for a bit?",
      kesal:
        "Yeah, hi. Look, the air con in my room's completely died and it's boiling in there. I'm just gonna head out and find a cafe with some cool air, alright?",
      marah:
        "Mate, this is ridiculous. The air con's dead, it's like an oven in my room, and nobody's picking up the phone. I'm walking out to find somewhere cool. Right now.",
    },
    hiddenGoal:
      "Wants a cool place to stay today. Accepts a room move or a quick repair plus a goodwill gesture. Calms down when the staff apologises, explains Nyepi respectfully and gives a concrete time frame.",
    facts: [...HOTEL_FACTS, ...NYEPI_FACTS],
    kind: "service",
    criteria: [
      {
        id: "listen",
        label: "Mendengar & empati",
        rubric:
          "4: mengulang inti keluhan tamu dan menunjukkan empati dengan kalimat sendiri. 3: ada empati tapi generik. 2: langsung ke solusi tanpa mengakui perasaan tamu. 1: mengabaikan atau membantah tamu.",
      },
      {
        id: "apologize",
        label: "Permintaan maaf",
        rubric:
          "4: minta maaf secara tulus dan spesifik atas masalah AC. 3: minta maaf tapi umum. 2: maaf yang terdengar defensif. 1: tidak minta maaf.",
      },
      {
        id: "solve",
        label: "Solusi & aturan Nyepi",
        rubric:
          "4: menjelaskan aturan Nyepi dengan sopan DAN menawarkan solusi konkret sesuai fakta hotel (teknisi 15 menit, pindah kamar, kompensasi). 3: salah satu kuat, yang lain lemah. 2: solusi samar. 1: tidak ada solusi atau memberi info yang bertentangan dengan fakta.",
      },
      {
        id: "close",
        label: "Penutup & terima kasih",
        rubric:
          "4: mengonfirmasi langkah berikutnya dan berterima kasih. 3: berterima kasih tanpa konfirmasi. 2: penutup canggung. 1: tidak ada penutup.",
      },
      {
        id: "language",
        label: "Bahasa layanan",
        rubric:
          "4: bahasa Inggris jelas, sopan, kalimat lengkap, register layanan hotel. 3: jelas dengan sedikit kesalahan. 2: sering kaku atau kurang sopan. 1: sulit dipahami.",
      },
    ],
  },
  {
    id: "checkin-pura",
    title: "Check-in dan aturan berkunjung ke pura",
    situation:
      "Tamu dari India baru tiba untuk check-in dan bertanya apa yang perlu disiapkan untuk mengunjungi pura besok pagi.",
    studentRole: "Staf front office Hotel Puri Sekar",
    goal: "Proses check-in dengan ramah dan jelaskan etika berpakaian di pura secara akurat.",
    guest: {
      name: "Priya Raman",
      origin: "India",
      azureVoice: "en-IN-NeerjaNeural",
      locale: "en-IN",
      persona:
        "A 32-year-old software engineer from Bengaluru travelling with her husband. Polite, curious and detail-oriented, asks follow-up questions. Speaks Indian English.",
    },
    openingLines: {
      sabar:
        "Hello, good afternoon! We've got a booking under Raman, two nights. Oh, and we're hoping to visit a temple tomorrow morning. Anything we should know before we go?",
      kesal:
        "Hi. Booking under Raman, two nights. We've been travelling since five this morning, so if we could do this quickly. Also, what do we need for the temple tomorrow?",
      marah:
        "Hello. We booked two nights under Raman and the driver you sent never showed up, so we took a taxi. Can we please just check in? And someone needs to tell us about the temple rules.",
    },
    hiddenGoal:
      "Wants a smooth check-in and clear, respectful guidance about temple etiquette. Becomes uneasy if the staff gives vague or wrong information.",
    facts: [
      ...HOTEL_FACTS,
      "Pengunjung pura wajib memakai kain (sarung) dan selendang di pinggang; banyak pura menyewakannya di pintu masuk.",
      "Bahu dan lutut sebaiknya tertutup saat masuk area pura.",
      "Area dalam pura (utama mandala) hanya untuk orang yang bersembahyang.",
      "Wanita yang sedang menstruasi diminta tidak masuk ke area pura.",
      "Hotel meminjamkan sarung dan selendang gratis di meja concierge.",
      "Penjemputan bandara untuk tamu Raman hari ini gagal karena sopir terjebak macet; staf boleh menawarkan penggantian ongkos taksi.",
    ],
    kind: "service",
    criteria: [
      {
        id: "greeting",
        label: "Sambutan & check-in",
        rubric:
          "4: menyambut hangat, mengonfirmasi nama dan lama menginap, menyebut info penting (sarapan). 3: lengkap tapi kaku. 2: ada langkah check-in yang terlewat. 1: tidak memproses check-in.",
      },
      {
        id: "accuracy",
        label: "Akurasi info pura",
        rubric:
          "4: menjelaskan sarung, selendang, bahu dan lutut tertutup, serta area yang dibatasi sesuai fakta, dengan bahasa yang menghormati. 3: sebagian besar benar. 2: samar. 1: salah atau mengarang aturan.",
      },
      {
        id: "proactive",
        label: "Layanan proaktif",
        rubric:
          "4: menawarkan bantuan tambahan yang relevan (pinjam sarung di concierge, waktu berangkat). 3: menjawab saja dengan baik. 2: menjawab minimal. 1: tidak membantu.",
      },
      {
        id: "language",
        label: "Bahasa layanan",
        rubric:
          "4: bahasa Inggris jelas, sopan, kalimat lengkap, register layanan hotel. 3: jelas dengan sedikit kesalahan. 2: sering kaku atau kurang sopan. 1: sulit dipahami.",
      },
    ],
  },
  {
    id: "wawancara-kapal-pesiar",
    title: "Wawancara kru kapal pesiar",
    situation:
      "Wawancara kerja posisi Guest Services Associate di kapal pesiar. Pewawancara bertanya tentang pengalaman dan cara kamu menangani tamu.",
    studentRole: "Kandidat Guest Services Associate",
    goal: "Perkenalkan diri dengan jelas, ceritakan pengalaman yang relevan, dan jawab pertanyaan situasional dengan contoh.",
    guest: {
      name: "Sarah Whitfield",
      origin: "Inggris",
      azureVoice: "en-GB-SoniaNeural",
      locale: "en-GB",
      persona:
        "A crew recruiter in her 40s from the United Kingdom. Professional, friendly but brisk. Asks one question at a time, follows up when an answer is vague, and moves on when an answer is clear. Covers: self-introduction, hospitality experience, a difficult-guest situation, working away from home for months, and why this role.",
    },
    openingLines: {
      sabar:
        "Hi there, thanks for joining. I'm Sarah, I look after guest services hiring. No rush, so to start, could you tell me a little about yourself?",
      kesal:
        "Hi, I'm Sarah from crew recruitment. I've got a few interviews back to back today, so let's get going. Tell me about yourself.",
      marah:
        "Right, I'm Sarah. We're running late, so I'll be quick and I'll need clear answers. Tell me about yourself, briefly.",
    },
    hiddenGoal:
      "Wants a candidate who communicates clearly, gives concrete examples and stays calm. Warmer when answers are specific, cooler when answers are generic or memorised.",
    facts: [
      "Posisi: Guest Services Associate, kontrak 8 bulan di kapal.",
      "Tugas: menjawab pertanyaan tamu, menangani keluhan, mengurus tagihan kamar kabin.",
      "Pewawancara tidak menjanjikan hasil wawancara di akhir sesi.",
    ],
    kind: "interview",
    criteria: [
      {
        id: "intro",
        label: "Perkenalan diri",
        rubric:
          "4: ringkas, terstruktur, relevan dengan posisi. 3: jelas tapi panjang atau kurang relevan. 2: tidak terstruktur. 1: tidak menjawab.",
      },
      {
        id: "examples",
        label: "Contoh konkret",
        rubric:
          "4: memberi contoh nyata dengan situasi, tindakan dan hasil. 3: ada contoh tapi tipis. 2: jawaban umum tanpa contoh. 1: tidak menjawab pertanyaan.",
      },
      {
        id: "situational",
        label: "Menangani tamu sulit",
        rubric:
          "4: langkah jelas yang menunjukkan empati dan solusi. 3: cukup baik. 2: samar. 1: tidak tepat.",
      },
      {
        id: "language",
        label: "Kejelasan bahasa",
        rubric:
          "4: bahasa Inggris jelas dan lancar, mudah dipahami. 3: jelas dengan sedikit kesalahan. 2: sering terputus atau salah. 1: sulit dipahami.",
      },
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const MAX_STUDENT_TURNS = 10;

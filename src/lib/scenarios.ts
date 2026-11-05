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
  // Deskripsi yang dibaca Agen Penilai. Skor 0-4; 0 berarti tidak ada
  // ucapan yang menyentuh kriteria ini sama sekali.
  rubric: string;
};

export type Department =
  | "Front office"
  | "Reservasi"
  | "Housekeeping"
  | "Restoran"
  | "Concierge"
  | "Wawancara kerja";

// "harian" = situasi yang hampir setiap hari terjadi di hotel;
// "sulit" = jarang tapi menentukan; "wawancara" = persiapan kerja.
export type Category = "harian" | "sulit" | "wawancara";

export type Scenario = {
  id: string;
  title: string;
  department: Department;
  category: Category;
  // Telepon: tamu tidak bisa melihat staf, semua harus jelas lewat suara.
  channel: "telepon" | "tatap muka";
  situation: string;
  studentRole: string;
  goal: string;
  guest: {
    name: string;
    origin: string;
    // Nama suara Azure Neural TTS. Locale selalu varian bahasa Inggris dan
    // dipakai cadangan speechSynthesis di browser.
    azureVoice: string;
    locale: string;
    persona: string;
  };
  // Kalimat pembuka mengikuti suasana awal yang dipilih siswa.
  openingLines: Record<Mood, string>;
  hiddenGoal: string;
  // Informasi baru yang diungkap tamu di tengah percakapan, supaya siswa
  // harus menyesuaikan solusinya. Diungkap pada balasan tamu ke-`at`.
  twist?: { at: number; reveal: string };
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
  "Check-in pukul 14.00, check-out pukul 12.00.",
  "Late check-out sampai pukul 15.00 dikenakan 50% tarif kamar, hanya bila kamar tidak dipesan tamu berikutnya.",
  "Deposit kartu kredit Rp500.000 per malam diblokir saat check-in dan dilepas otomatis saat check-out; bank biasanya butuh 3 sampai 7 hari kerja sampai saldo kembali.",
  "Pungutan wisatawan asing Bali Rp150.000 dibayar tamu sendiri lewat situs resmi Love Bali, bukan dipungut hotel.",
  "Tamu bisa memesan transportasi lewat Grab, Gojek, atau taksi Blue Bird; concierge bisa memesankan sopir hotel dengan tarif tetap.",
];

const NYEPI_FACTS = [
  "Saat Nyepi, seluruh Bali hening selama 24 jam mulai pukul 06.00 sampai pukul 06.00 hari berikutnya.",
  "Saat Nyepi, tamu wajib tetap di area hotel; jalan raya tertutup dan dijaga pecalang.",
  "Saat Nyepi, bandara Ngurah Rai tidak beroperasi.",
  "Saat Nyepi, restoran hotel tetap melayani tamu, lampu kamar diminta diredupkan dan tirai ditutup setelah gelap.",
];

const LANGUAGE: Criterion = {
  id: "language",
  label: "Bahasa layanan",
  rubric:
    "4: bahasa Inggris jelas, sopan, kalimat lengkap, register layanan hotel. 3: jelas dengan sedikit kesalahan. 2: sering kaku atau kurang sopan. 1: sulit dipahami. 0: tidak ada kalimat bahasa Inggris yang bisa dinilai.",
};

export const SCENARIOS: Scenario[] = [
  {
    id: "nyepi-ac-rusak",
    department: "Front office",
    category: "sulit",
    channel: "telepon",
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
          "4: mengulang inti keluhan tamu dan menunjukkan empati dengan kalimat sendiri. 3: ada empati tapi generik. 2: langsung ke solusi tanpa mengakui perasaan tamu. 1: mengabaikan atau membantah tamu. 0: tidak menanggapi keluhan tamu sama sekali.",
      },
      {
        id: "apologize",
        label: "Permintaan maaf",
        rubric:
          "4: minta maaf secara tulus dan spesifik atas masalah AC. 3: minta maaf tapi umum. 2: maaf yang terdengar defensif. 1: maaf asal-asalan atau malah menyalahkan tamu. 0: tidak minta maaf sama sekali.",
      },
      {
        id: "solve",
        label: "Solusi & aturan Nyepi",
        rubric:
          "4: menjelaskan aturan Nyepi dengan sopan DAN menawarkan solusi konkret sesuai fakta hotel (teknisi 15 menit, pindah kamar, kompensasi). 3: salah satu kuat, yang lain lemah. 2: solusi samar. 1: memberi info yang bertentangan dengan fakta. 0: tidak menawarkan solusi dan tidak menjelaskan aturan sama sekali.",
      },
      {
        id: "close",
        label: "Penutup & terima kasih",
        rubric:
          "4: mengonfirmasi langkah berikutnya dan berterima kasih. 3: berterima kasih tanpa konfirmasi. 2: penutup canggung. 1: menutup dengan ketus atau terburu-buru. 0: tidak ada penutup sama sekali.",
      },
      {
        id: "language",
        label: "Bahasa layanan",
        rubric:
          "4: bahasa Inggris jelas, sopan, kalimat lengkap, register layanan hotel. 3: jelas dengan sedikit kesalahan. 2: sering kaku atau kurang sopan. 1: sulit dipahami. 0: tidak ada kalimat bahasa Inggris yang bisa dinilai.",
      },
    ],
  },
  {
    id: "checkin-pura",
    department: "Front office",
    category: "harian",
    channel: "tatap muka",
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
          "4: menyambut hangat, mengonfirmasi nama dan lama menginap, menyebut info penting (sarapan). 3: lengkap tapi kaku. 2: ada langkah check-in yang terlewat. 1: sambutan dingin dan check-in kacau. 0: tidak memproses check-in sama sekali.",
      },
      {
        id: "accuracy",
        label: "Akurasi info pura",
        rubric:
          "4: menjelaskan sarung, selendang, bahu dan lutut tertutup, serta area yang dibatasi sesuai fakta, dengan bahasa yang menghormati. 3: sebagian besar benar. 2: samar. 1: salah atau mengarang aturan. 0: tidak menjelaskan aturan pura sama sekali.",
      },
      {
        id: "proactive",
        label: "Layanan proaktif",
        rubric:
          "4: menawarkan bantuan tambahan yang relevan (pinjam sarung di concierge, waktu berangkat). 3: menjawab saja dengan baik. 2: menjawab minimal. 1: jawaban tidak membantu. 0: tidak menawarkan bantuan apa pun.",
      },
      {
        id: "language",
        label: "Bahasa layanan",
        rubric:
          "4: bahasa Inggris jelas, sopan, kalimat lengkap, register layanan hotel. 3: jelas dengan sedikit kesalahan. 2: sering kaku atau kurang sopan. 1: sulit dipahami. 0: tidak ada kalimat bahasa Inggris yang bisa dinilai.",
      },
    ],
  },
  {
    id: "wawancara-kapal-pesiar",
    department: "Wawancara kerja",
    category: "wawancara",
    channel: "tatap muka",
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
          "4: ringkas, terstruktur, relevan dengan posisi. 3: jelas tapi panjang atau kurang relevan. 2: tidak terstruktur. 1: tidak relevan dengan posisi. 0: tidak memperkenalkan diri sama sekali.",
      },
      {
        id: "examples",
        label: "Contoh konkret",
        rubric:
          "4: memberi contoh nyata dengan situasi, tindakan dan hasil. 3: ada contoh tapi tipis. 2: jawaban umum tanpa contoh. 1: contoh tidak relevan dengan pertanyaan. 0: tidak menjawab pertanyaan sama sekali.",
      },
      {
        id: "situational",
        label: "Menangani tamu sulit",
        rubric:
          "4: langkah jelas yang menunjukkan empati dan solusi. 3: cukup baik. 2: samar. 1: tidak tepat. 0: tidak membahas cara menangani tamu sulit.",
      },
      {
        id: "language",
        label: "Kejelasan bahasa",
        rubric:
          "4: bahasa Inggris jelas dan lancar, mudah dipahami. 3: jelas dengan sedikit kesalahan. 2: sering terputus atau salah. 1: sulit dipahami. 0: tidak ada kalimat bahasa Inggris yang bisa dinilai.",
      },
    ],
  },
  {
    id: "reservasi-telepon",
    department: "Reservasi",
    category: "harian",
    channel: "telepon",
    title: "Reservasi kamar lewat telepon",
    situation:
      "Calon tamu dari Korea Selatan menelepon untuk memesan kamar tiga malam bulan depan dan bertanya soal harga, sarapan, dan jemputan bandara.",
    studentRole: "Staf reservasi Hotel Puri Sekar",
    goal: "Sapa dengan standar telepon, gali kebutuhan tamu, jelaskan pilihan tarif dengan akurat, lalu ulangi detail pesanan sebelum menutup.",
    guest: {
      name: "Kim Ji-woo",
      origin: "Korea Selatan",
      azureVoice: "ko-KR-SunHiNeural",
      locale: "en-US",
      persona:
        "A 29-year-old office worker from Seoul planning a trip with a friend. Polite and organised, speaks careful English with a Korean accent, compares prices and asks to confirm numbers. Says sorry, can you repeat that, when something is said too fast.",
    },
    openingLines: {
      sabar:
        "Hello, good morning. I'd like to book a room, please. Three nights next month, for two people. Can you tell me the price?",
      kesal:
        "Hello? I tried to call before but no one answered. I want to book three nights next month, two people. How much is it?",
      marah:
        "Hello. This is my third time calling. I just want to book a room, three nights next month, two people. Can someone please help me?",
    },
    hiddenGoal:
      "Wants clear prices, breakfast included and a reliable airport pickup, and wants to hear the booking read back before hanging up. Will not give card details over the phone.",
    twist: {
      at: 2,
      reveal:
        "Your sister may join, so you now ask whether three adults can stay in one room and how much more it costs.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Untuk tanggal yang diminta tamu, Deluxe Garden dan Pool Villa tersedia.",
      "Semua tarif sudah termasuk sarapan untuk jumlah tamu yang terdaftar.",
      "Tarif Early Bird: diskon 15% bila memesan minimal 30 hari sebelumnya, tidak bisa dibatalkan atau dikembalikan.",
      "Tarif Flexible: harga normal, pembatalan gratis sampai 3 hari sebelum kedatangan.",
      "Deluxe Garden maksimal 2 dewasa; extra bed Rp450.000 per malam termasuk sarapan, sehingga bisa 3 dewasa.",
      "Pool Villa bisa untuk 3 dewasa tanpa biaya extra bed.",
      "Jemputan bandara Rp350.000 sekali jalan per mobil, perjalanan sekitar 75 sampai 90 menit.",
      "Staf reservasi mencatat nama lengkap, tanggal, jumlah tamu, dan email; pembayaran lewat tautan aman yang dikirim ke email. Staf tidak pernah meminta nomor kartu lewat telepon.",
    ],
    kind: "service",
    criteria: [
      {
        id: "phone-greeting",
        label: "Salam telepon",
        rubric:
          "4: menyebut nama hotel, nama sendiri, dan menawarkan bantuan dengan hangat. 3: dua dari tiga unsur. 2: salam seadanya. 1: langsung bertanya tanpa salam. 0: tidak ada salam sama sekali.",
      },
      {
        id: "rates",
        label: "Penjelasan tarif",
        rubric:
          "4: menjelaskan pilihan kamar dan tarif (Early Bird vs Flexible, extra bed atau Pool Villa) sesuai fakta dan membantu tamu memilih. 3: akurat tapi kurang membantu memilih. 2: sebagian info hilang atau samar. 1: menyebut harga atau aturan yang salah. 0: tidak menjelaskan tarif sama sekali.",
      },
      {
        id: "readback",
        label: "Mencatat & mengulang pesanan",
        rubric:
          "4: mencatat nama, tanggal, jumlah tamu, email, lalu mengulang ringkasan pesanan dan menjelaskan tautan pembayaran. 3: mengulang sebagian. 2: mencatat tanpa mengulang. 1: meminta nomor kartu lewat telepon atau mencatat data yang salah. 0: tidak mencatat data pesanan sama sekali.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "checkout-tagihan",
    department: "Front office",
    category: "harian",
    channel: "tatap muka",
    title: "Check-out dan tagihan yang dipersoalkan",
    situation:
      "Tamu dari Tiongkok sedang check-out dan mempersoalkan dua bir minibar di tagihan, juga bertanya kenapa dananya masih tertahan di kartu.",
    studentRole: "Staf front office Hotel Puri Sekar",
    goal: "Jelaskan tagihan dengan kalimat sederhana, selesaikan sengketa minibar sesuai wewenang, dan jelaskan deposit dengan akurat.",
    guest: {
      name: "Chen Wei",
      origin: "Tiongkok",
      azureVoice: "zh-CN-YunxiNeural",
      locale: "en-US",
      persona:
        "A 38-year-old businessman from Shanghai. His English is limited: short sentences, simple words, sometimes the wrong tense. Becomes frustrated when the staff talks fast or uses long words, and relaxes when they slow down and check he understood.",
    },
    openingLines: {
      sabar:
        "Hello. I check out now, please. Room two-one-five. Ah, but this bill, the beer, two beer. I don't drink beer.",
      kesal:
        "Check out, room two-one-five. Why two beer on my bill? I don't drink. And why my card, money still blocked?",
      marah:
        "This bill is wrong. Two beer, I never drink. You take money from my card two times? I want explanation, now.",
    },
    hiddenGoal:
      "Wants the beer charge removed and a simple, believable explanation of the card hold. Calms down when the staff speaks slowly and confirms each point.",
    twist: {
      at: 2,
      reveal:
        "Your taxi to the airport is already waiting outside and your flight is in about two and a half hours, so you need this finished quickly.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Tamu kamar 215 menginap 3 malam; deposit Rp1.500.000 diblokir saat check-in, bukan ditagih.",
      "Catatan housekeeping pagi ini: dua botol bir Bintang dari minibar kamar 215 hilang, Rp60.000 per botol.",
      "Staf front office boleh menghapus tagihan minibar yang dipersoalkan sampai Rp200.000 tanpa izin manajer.",
      "Hotel bisa mengirim tagihan final ke email tamu.",
    ],
    kind: "service",
    criteria: [
      {
        id: "clarity",
        label: "Penjelasan sederhana",
        rubric:
          "4: kalimat pendek dan sederhana, satu poin per kalimat, mengecek apakah tamu paham. 3: cukup jelas tapi ada kalimat panjang. 2: sering terlalu panjang atau memakai istilah sulit. 1: membingungkan. 0: tidak menjelaskan tagihan sama sekali.",
      },
      {
        id: "dispute",
        label: "Penyelesaian tagihan",
        rubric:
          "4: menanggapi bir tanpa menuduh, memakai wewenang menghapus tagihan, dan menjelaskan deposit dilepas dalam 3 sampai 7 hari kerja sesuai fakta. 3: salah satu tertangani baik. 2: solusi samar. 1: menuduh tamu atau memberi info deposit yang salah. 0: tidak menanggapi keluhan tagihan.",
      },
      {
        id: "adapt",
        label: "Menyesuaikan dengan tamu",
        rubric:
          "4: mempercepat proses saat tahu taksi menunggu, tetap jelas, dan menawarkan tagihan via email. 3: menyesuaikan sebagian. 2: lambat menyesuaikan. 1: mengabaikan desakan waktu tamu. 0: tidak ada penyesuaian sama sekali.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "concierge-transport",
    department: "Concierge",
    category: "harian",
    channel: "tatap muka",
    title: "Info wisata dan transportasi",
    situation:
      "Tamu dari Inggris ingin ke sawah Tegallalang dan Monkey Forest besok, dan bertanya cara paling mudah ke sana.",
    studentRole: "Concierge Hotel Puri Sekar",
    goal: "Berikan pilihan transportasi yang akurat, rekomendasi yang cocok untuk tamu, dan peringatan keselamatan yang jujur.",
    guest: {
      name: "Tom Harris",
      origin: "Inggris",
      azureVoice: "en-GB-RyanNeural",
      locale: "en-GB",
      persona:
        "A 27-year-old backpacker-turned-hotel-guest from Manchester. Friendly, budget-minded and a bit overconfident. Likes quick practical answers and asks about the cheapest option.",
    },
    openingLines: {
      sabar:
        "Morning! So I'm thinking of seeing the rice terraces and the monkey forest tomorrow. What's the best way to get around?",
      kesal:
        "Hiya. I tried booking a Grab back from town last night and the driver cancelled twice. How am I meant to get to the rice terraces tomorrow?",
      marah:
        "Right, I need some actual help. Last night I got stuck in town for an hour because no Grab would pick me up. Tomorrow I want the rice terraces and the monkey place, and I don't want a repeat.",
    },
    hiddenGoal:
      "Wants a cheap, reliable way to see both places. Secretly hopes the staff will say a scooter is fine; respects honest advice when it is explained politely.",
    twist: {
      at: 2,
      reveal:
        "You say you were actually planning to rent a scooter because it's cheaper, and admit you don't have a motorbike licence.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Sawah Tegallalang sekitar 20 menit berkendara dari hotel; Monkey Forest Ubud sekitar 10 menit.",
      "Monkey Forest buka 09.00 sampai 18.00. Pengunjung diminta tidak membawa makanan dan menyimpan kacamata serta barang kecil.",
      "Sopir hotel: Rp750.000 untuk 8 jam termasuk bensin, dipesan paling lambat malam sebelumnya.",
      "Di beberapa titik wisata Ubud ada kesepakatan transportasi lokal, sehingga penjemputan taksi online bisa ditolak; tamu perlu berjalan keluar area atau memakai sopir lokal.",
      "Mengendarai motor di Indonesia tanpa SIM yang berlaku (atau IDP dengan kategori motor) melanggar hukum, bisa ditilang, dan asuransi perjalanan sering tidak menanggung kecelakaannya.",
      "Hotel tidak menyewakan motor.",
    ],
    kind: "service",
    criteria: [
      {
        id: "options",
        label: "Pilihan yang akurat",
        rubric:
          "4: menjelaskan pilihan (sopir hotel, Grab/Gojek, taksi) beserta kelebihan dan batasannya sesuai fakta. 3: akurat tapi kurang lengkap. 2: info samar. 1: info salah atau mengarang harga. 0: tidak memberi pilihan sama sekali.",
      },
      {
        id: "recommend",
        label: "Rekomendasi personal",
        rubric:
          "4: memberi satu rekomendasi jelas yang cocok dengan anggaran dan rencana tamu, plus tips praktis (jam, monyet). 3: rekomendasi ada tapi umum. 2: hanya daftar pilihan tanpa saran. 1: rekomendasi tidak cocok. 0: tidak merekomendasikan apa pun.",
      },
      {
        id: "safety",
        label: "Kejujuran soal keselamatan",
        rubric:
          "4: menjelaskan risiko motor tanpa SIM dengan sopan dan tidak menggurui, lalu menawarkan alternatif. 3: menyebut risiko tanpa alternatif. 2: ragu-ragu atau samar. 1: mengatakan tidak apa-apa naik motor tanpa SIM. 0: tidak menanggapi soal motor sama sekali.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "housekeeping-kamar",
    department: "Housekeeping",
    category: "harian",
    channel: "telepon",
    title: "Kamar belum dibersihkan",
    situation:
      "Tamu dari Prancis menelepon pukul 15.00 karena kamarnya belum dibersihkan sejak pagi dan handuknya basah semua.",
    studentRole: "Staf housekeeping Hotel Puri Sekar yang menerima telepon",
    goal: "Minta maaf, cek penyebab tanpa menyalahkan tamu, dan tawarkan solusi dengan waktu yang jelas.",
    guest: {
      name: "Camille Laurent",
      origin: "Prancis",
      azureVoice: "fr-FR-DeniseNeural",
      locale: "en-GB",
      persona:
        "A 41-year-old architect from Lyon working remotely during her holiday. Speaks fluent English with a French accent, precise and a little dry. Dislikes excuses, appreciates exact times.",
    },
    openingLines: {
      sabar:
        "Hello, this is room one-oh-eight. I just came back and the room hasn't been cleaned yet. Could someone come, please?",
      kesal:
        "Hello, room one-oh-eight. It's three o'clock and my room is still not cleaned. The towels are all wet. This is not normal, no?",
      marah:
        "Room one-oh-eight. Honestly, I am very disappointed. Three in the afternoon, the room is a mess, no clean towels. What is happening with your service?",
    },
    hiddenGoal:
      "Wants the room fixed without being blamed. Accepts the Do Not Disturb explanation if it is told politely. Most of all needs quiet for a call soon.",
    twist: {
      at: 2,
      reveal:
        "You have an important video call in thirty minutes and need the room quiet for an hour, so a full clean right now is not ideal.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Catatan housekeeping: tanda Do Not Disturb kamar 108 terpasang sampai pukul 13.00, sehingga kamar dilewati pada putaran pagi.",
      "Pembersihan penuh butuh sekitar 30 menit; penyegaran cepat (handuk, sampah, rapikan tempat tidur) sekitar 10 menit.",
      "Handuk bersih bisa diantar dalam 10 menit.",
      "Turndown service tersedia pukul 18.00 sampai 21.00.",
    ],
    kind: "service",
    criteria: [
      {
        id: "apologize",
        label: "Maaf tanpa menyalahkan",
        rubric:
          "4: minta maaf tulus dan menjelaskan catatan Do Not Disturb dengan sopan tanpa menyalahkan tamu. 3: minta maaf, penjelasan agak kaku. 2: maaf generik. 1: menyalahkan tamu. 0: tidak minta maaf sama sekali.",
      },
      {
        id: "solve",
        label: "Solusi dengan waktu jelas",
        rubric:
          "4: menawarkan solusi yang menyesuaikan jadwal panggilan tamu (handuk dulu, bersih penuh setelahnya) dengan waktu yang jelas. 3: solusi baik tanpa waktu jelas. 2: solusi tidak menyesuaikan jadwal tamu. 1: janji yang tidak sesuai fakta. 0: tidak menawarkan solusi.",
      },
      {
        id: "confirm",
        label: "Konfirmasi & penutup",
        rubric:
          "4: mengulang rencana (apa, jam berapa) dan berterima kasih. 3: berterima kasih tanpa mengulang. 2: penutup canggung. 1: menutup telepon dengan ketus. 0: tidak ada penutup.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "restoran-alergi",
    department: "Restoran",
    category: "sulit",
    channel: "tatap muka",
    title: "Pesanan dengan alergi kacang",
    situation:
      "Di restoran Taman, tamu dari Inggris memesan makan malam untuk keluarganya dan bertanya menu mana yang mengandung kacang.",
    studentRole: "Pramusaji restoran Taman, Hotel Puri Sekar",
    goal: "Tangani alergi dengan serius: beri info bahan yang akurat, libatkan chef, dan jangan menjanjikan hal yang tidak pasti.",
    guest: {
      name: "Emma Clarke",
      origin: "Inggris",
      azureVoice: "en-GB-LibbyNeural",
      locale: "en-GB",
      persona:
        "A 36-year-old mother from Bristol on holiday with her husband and two children. Warm but very careful about food. Notices immediately when an answer sounds unsure.",
    },
    openingLines: {
      sabar:
        "Hi, we'd love to order. Before we do, which of these dishes have peanuts in them? We need to be a bit careful.",
      kesal:
        "Hi. The last place we ate told us something had no nuts and it did. So, which dishes here have peanuts?",
      marah:
        "Sorry, I need a straight answer before we order anything. Which of these have peanuts? Last night a restaurant got it wrong and it was frightening.",
    },
    hiddenGoal:
      "Wants a safe meal for her son and honest information. Trusts staff who check with the chef and admit limits; loses trust if they guess or say 'no problem' too fast.",
    twist: {
      at: 1,
      reveal:
        "You explain it is your seven-year-old son who has a severe peanut allergy and he carries an adrenaline auto-injector.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Gado-gado dan sate ayam disajikan dengan saus kacang.",
      "Nasi goreng dimasak di wajan yang juga dipakai untuk masakan berkacang.",
      "Ikan bakar dengan nasi dan sayur kukus bisa dimasak di wajan terpisah bila chef diberi tahu.",
      "Pramusaji wajib memberi tahu chef dan menulis alergi di pesanan; dapur tidak bisa menjamin 100% bebas jejak kacang.",
      "Klinik terdekat 10 menit berkendara dan hotel punya kendaraan siaga.",
    ],
    kind: "service",
    criteria: [
      {
        id: "seriousness",
        label: "Menanggapi alergi dengan serius",
        rubric:
          "4: menanyakan detail alergi, menyatakan akan memberi tahu chef, dan menandai pesanan. 3: memberi tahu chef tanpa menggali detail. 2: menanggapi sambil lalu. 1: meremehkan alergi. 0: tidak menanggapi alergi sama sekali.",
      },
      {
        id: "accuracy",
        label: "Info bahan yang jujur",
        rubric:
          "4: menyebut menu berkacang dengan benar, menjelaskan risiko wajan bersama, dan tidak menjanjikan 100% bebas kacang. 3: sebagian besar benar. 2: samar. 1: menjamin aman padahal tidak pasti, atau info salah. 0: tidak memberi info bahan.",
      },
      {
        id: "recommend",
        label: "Rekomendasi aman",
        rubric:
          "4: menyarankan pilihan yang bisa dimasak terpisah dan memastikan tamu nyaman dengan pilihannya. 3: menyarankan tanpa memastikan. 2: hanya menyebut yang tidak boleh. 1: menyarankan menu berisiko. 0: tidak memberi saran.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "overbooking",
    department: "Front office",
    category: "sulit",
    channel: "tatap muka",
    title: "Kamar penuh karena overbooking",
    situation:
      "Pukul 21.00 pasangan dari Jerman tiba untuk check-in, tetapi hotel penuh karena kesalahan overbooking. Kamu harus memindahkan mereka ke hotel mitra malam ini.",
    studentRole: "Staf front office Hotel Puri Sekar",
    goal: "Sampaikan kabar buruk dengan jujur, ambil tanggung jawab tanpa berdalih, dan jelaskan solusi pindah hotel dengan lengkap.",
    guest: {
      name: "Lukas Becker",
      origin: "Jerman",
      azureVoice: "de-DE-ConradNeural",
      locale: "en-US",
      persona:
        "A 33-year-old engineer from Munich, travelling with his wife Anna. Speaks clear, precise English with a German accent. Values reliability and facts; vague excuses make him colder and more insistent.",
    },
    openingLines: {
      sabar:
        "Good evening. Becker, we have a reservation, four nights in a Deluxe Garden room. It's been a long day, so we're happy to finally be here.",
      kesal:
        "Good evening, Becker. Four nights, Deluxe Garden. Our driver said there might be a problem with the room. Is that correct?",
      marah:
        "Becker. We booked and paid four nights months ago, and now the driver tells us there is no room? Please explain this to me.",
    },
    hiddenGoal:
      "Wants an honest explanation and a clear plan that makes up for the trouble. Accepts the partner hotel if the staff is transparent and the return plan is concrete.",
    twist: {
      at: 2,
      reveal:
        "You mention, more quietly, that this is your honeymoon and you had planned this trip for a year.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Malam ini semua kamar penuh karena kesalahan overbooking dari pihak hotel.",
      "Kebijakan hotel: tamu dipindahkan satu malam ke hotel mitra Sari Ubud (bintang 4, 5 menit berkendara), biaya kamar dan antar-jemput ditanggung Hotel Puri Sekar.",
      "Besok pukul 10.00 sopir hotel menjemput tamu kembali; Pool Villa tersedia mulai besok dan boleh diberikan sebagai upgrade gratis untuk tiga malam sisanya.",
      "Staf boleh menambahkan satu makan malam gratis sebagai permintaan maaf.",
    ],
    kind: "service",
    criteria: [
      {
        id: "honesty",
        label: "Jujur & bertanggung jawab",
        rubric:
          "4: menyampaikan masalah dengan jelas, mengakui kesalahan hotel, minta maaf tanpa berdalih. 3: jujur tapi berbelit. 2: menghindari inti masalah. 1: menyalahkan pihak lain atau tamu. 0: tidak menjelaskan masalahnya.",
      },
      {
        id: "plan",
        label: "Rencana yang lengkap",
        rubric:
          "4: menjelaskan hotel mitra, biaya ditanggung, antar-jemput, jam kembali, dan upgrade Pool Villa sesuai fakta. 3: sebagian besar lengkap. 2: rencana samar. 1: janji di luar fakta. 0: tidak menawarkan rencana.",
      },
      {
        id: "empathy",
        label: "Empati pada momen tamu",
        rubric:
          "4: menanggapi kabar bulan madu dengan tulus dan memakai wewenang (makan malam, upgrade) untuk membuatnya berkesan. 3: empati tanpa tindakan. 2: empati generik. 1: mengabaikan perasaan tamu. 0: tidak ada empati sama sekali.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "abu-vulkanik",
    department: "Front office",
    category: "sulit",
    channel: "tatap muka",
    title: "Penerbangan batal karena abu vulkanik",
    situation:
      "Penerbangan keluarga dari Australia dibatalkan karena abu vulkanik. Mereka kembali ke hotel setelah check-out dan perlu memperpanjang menginap.",
    studentRole: "Staf front office Hotel Puri Sekar",
    goal: "Tenangkan tamu, tawarkan perpanjangan sesuai ketersediaan, dan jelas soal apa yang bisa dan tidak bisa dilakukan hotel.",
    guest: {
      name: "Jessica Walsh",
      origin: "Australia",
      azureVoice: "en-AU-NatashaNeural",
      locale: "en-AU",
      persona:
        "A 42-year-old nurse from Brisbane travelling with her husband and two kids aged 6 and 9. Practical and organised but stressed; the kids are tired. Wants to know exactly what will happen next.",
    },
    openingLines: {
      sabar:
        "Hi, we checked out this morning, but our flight's been cancelled because of the volcanic ash. Is there any chance we can get our room back?",
      kesal:
        "Hi, it's us again. Flight's cancelled, the volcano thing. The kids are exhausted. Can we please get a room for tonight?",
      marah:
        "We've just spent four hours at the airport with two kids and the flight's been cancelled. Nobody tells us anything. We need a room, now.",
    },
    hiddenGoal:
      "Wants a room tonight, a fair price, and help with paperwork for the insurance claim. Becomes anxious if the staff promises things about flights they can't control.",
    twist: {
      at: 2,
      reveal:
        "The airline has just texted that the next available flight might be in three days, so you may need three nights, not one.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Deluxe Garden tersedia untuk malam ini dan besok saja; malam ketiga hanya Pool Villa yang kosong.",
      "Tarif tamu tertahan (stranded rate): Deluxe Garden Rp1.200.000 dan Pool Villa Rp2.700.000 per malam, sudah termasuk sarapan.",
      "Maskapai yang bertanggung jawab atas jadwal ulang penerbangan; hotel tidak bisa memesan ulang tiket atau memastikan jadwal terbang.",
      "Hotel bisa mencetak dokumen dan membuat invoice serta surat keterangan menginap untuk klaim asuransi.",
      "Tamu bisa memakai ruang tunggu dan kamar mandi di dekat lobi sambil kamar disiapkan, sekitar 30 menit.",
    ],
    kind: "service",
    criteria: [
      {
        id: "calm",
        label: "Menenangkan tamu",
        rubric:
          "4: mengakui situasi sulit keluarga dan langsung menawarkan kenyamanan (ruang tunggu, waktu kamar siap). 3: empati tanpa tindakan langsung. 2: empati generik. 1: terdengar tidak peduli. 0: tidak menanggapi kondisi tamu.",
      },
      {
        id: "options",
        label: "Perpanjangan yang akurat",
        rubric:
          "4: menjelaskan ketersediaan per malam, tarif stranded, dan opsi malam ketiga sesuai fakta. 3: sebagian besar akurat. 2: samar soal harga atau ketersediaan. 1: menyebut harga atau kamar yang salah. 0: tidak menawarkan perpanjangan.",
      },
      {
        id: "limits",
        label: "Jelas soal batas peran hotel",
        rubric:
          "4: jujur bahwa jadwal terbang urusan maskapai dan menawarkan bantuan yang nyata (dokumen asuransi, cetak). 3: menyebut batas tanpa bantuan tambahan. 2: samar. 1: menjanjikan jadwal penerbangan. 0: tidak membahas sama sekali.",
      },
      LANGUAGE,
    ],
  },
  {
    id: "tamu-sakit",
    department: "Concierge",
    category: "sulit",
    channel: "telepon",
    title: "Tamu sakit perut tengah malam",
    situation:
      "Pukul 23.00 tamu dari India menelepon karena sakit perut, muntah, dan diare sejak sore. Ia tidak tahu harus berbuat apa.",
    studentRole: "Concierge jaga malam Hotel Puri Sekar",
    goal: "Tetap tenang, tanyakan tanda bahaya, tawarkan bantuan medis yang tersedia, dan jangan mendiagnosis.",
    guest: {
      name: "Arjun Mehta",
      origin: "India",
      azureVoice: "en-IN-PrabhatNeural",
      locale: "en-IN",
      persona:
        "A 30-year-old marketing manager from Mumbai travelling alone. Normally confident, now weak and worried. Speaks Indian English, a bit slowly because he feels ill.",
    },
    openingLines: {
      sabar:
        "Hi, sorry to call so late. I've had a bad stomach since the afternoon, I keep throwing up. Is there anything you can do?",
      kesal:
        "Hello, I'm really not well. Vomiting, stomach cramps, since evening. I don't know what to do here. Can someone help?",
      marah:
        "Hello? I've been sick for hours and I called before, nobody came. I need a doctor or something, please, this is serious.",
    },
    hiddenGoal:
      "Wants to feel looked after and know the next step. Accepts a doctor visit if the cost and time are clear. Gets more worried if the staff guesses a diagnosis or offers random medicine.",
    twist: {
      at: 2,
      reveal:
        "You remember you have a flight tomorrow at ten in the morning and ask whether you can even fly like this.",
    },
    facts: [
      ...HOTEL_FACTS,
      "Dokter jaga bisa datang ke kamar sekitar 45 menit, biaya Rp850.000 dibayar tamu; invoice bisa diklaim ke asuransi.",
      "Hotel bisa mengantar air mineral dan oralit dari kotak P3K dalam 10 menit.",
      "Staf tidak boleh mendiagnosis atau memberi obat selain oralit.",
      "Bila ada darah, demam tinggi, pingsan, atau tidak bisa minum sama sekali, hotel memanggil ambulans ke rumah sakit rujukan sekitar 25 menit.",
      "Hanya dokter yang bisa memberi surat layak terbang; late check-out bisa diatur sesuai aturan hotel.",
    ],
    kind: "service",
    criteria: [
      {
        id: "care",
        label: "Tenang & peduli",
        rubric:
          "4: suara tenang, empati tulus, dan menanyakan tanda bahaya (darah, demam, bisa minum). 3: empati tanpa menggali kondisi. 2: kaku. 1: panik atau meremehkan. 0: tidak menanggapi keluhan sama sekali.",
      },
      {
        id: "action",
        label: "Langkah nyata",
        rubric:
          "4: menawarkan dokter dengan waktu dan biaya yang jelas, mengantar air dan oralit, menjelaskan kapan ambulans dipanggil. 3: sebagian. 2: bantuan samar. 1: mendiagnosis atau menyarankan obat sembarangan. 0: tidak menawarkan bantuan.",
      },
      {
        id: "followup",
        label: "Tindak lanjut",
        rubric:
          "4: menanggapi soal penerbangan dengan jujur (dokter yang menilai), menawarkan late check-out, dan berjanji menelepon balik. 3: sebagian. 2: samar. 1: menjanjikan tamu pasti bisa terbang. 0: tidak ada tindak lanjut.",
      },
      LANGUAGE,
    ],
  },
];

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}

export const MAX_STUDENT_TURNS = 10;

// Urutan tampil daftar situasi: dikelompokkan per kategori.
export const GROUPS: { category: Category; title: string; note: string }[] = [
  {
    category: "harian",
    title: "Sering terjadi setiap hari",
    note: "Situasi yang hampir pasti kamu temui di minggu pertama magang.",
  },
  {
    category: "sulit",
    title: "Situasi sulit",
    note: "Jarang terjadi, tapi menentukan apakah tamu kembali lagi.",
  },
  {
    category: "wawancara",
    title: "Wawancara kerja",
    note: "Latihan sebelum melamar ke hotel atau kapal pesiar.",
  },
];

// Nomor urut mengikuti urutan tampil per grup, bukan urutan array.
export const ORDERED = GROUPS.flatMap((g) =>
  SCENARIOS.filter((s) => s.category === g.category),
);

export function channelLabel(s: Scenario) {
  return s.channel === "telepon" ? "Telepon" : "Tatap muka";
}

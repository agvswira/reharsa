<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="public/brand/reharsa-mark-cream.svg">
    <img width="160" src="public/brand/reharsa-mark-ink.svg" alt="Logo Reharsa: candi bentar dari batang suara dengan matahari di celahnya">
  </picture>
  <br><br>
  <h1>Reharsa</h1>
  <p><strong>Latih bicara dengan tamu asing, sebelum bertemu yang sungguhan. Siswa pariwisata melayani tamu hotel AI lewat suara, lalu membaca rapor yang menunjuk kalimatnya sendiri.</strong></p>
  <p>
    <a href="#deployment-url"><strong>Live App</strong></a>
    &nbsp;|&nbsp;
    <a href="src/lib/server/agents.ts"><strong>Kode AI</strong></a>
    &nbsp;|&nbsp;
    <a href="#ai--technology-disclosure"><strong>AI &amp; Technology Disclosure</strong></a>
  </p>
  <p>
    <a href="https://nextjs.org/"><img alt="Next.js 16" src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white"></a>
    <a href="https://react.dev/"><img alt="React 19" src="https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB"></a>
    <a href="https://www.typescriptlang.org/"><img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"></a>
    <a href="https://tailwindcss.com/"><img alt="Tailwind CSS 4" src="https://img.shields.io/badge/Tailwind_CSS_4-0B1120?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8"></a>
    <a href="https://neon.tech/"><img alt="Neon Postgres" src="https://img.shields.io/badge/Neon_Postgres-00E599?style=for-the-badge&logo=postgresql&logoColor=111111"></a>
    <a href="https://www.better-auth.com/"><img alt="Better Auth" src="https://img.shields.io/badge/Better_Auth-111111?style=for-the-badge"></a>
    <a href="https://groq.com/"><img alt="Groq" src="https://img.shields.io/badge/Groq-F55036?style=for-the-badge"></a>
    <a href="https://azure.microsoft.com/products/ai-services/ai-speech"><img alt="Azure AI Speech" src="https://img.shields.io/badge/Azure_AI_Speech-0078D4?style=for-the-badge"></a>
  </p>
</div>

<img src="docs/readme/landing.jpg" alt="Halaman depan Reharsa: Latih bicara dengan tamu asing, sebelum bertemu yang sungguhan." width="100%">

| Suara dua arah yang beraksen | Penilai terpisah dari tamu | Tamu yang berpijak pada fakta | Tetap jalan saat layanan gagal |
|---|---|---|---|
| Siswa menjawab lewat mikrofon. Sebelas tamu dari tujuh negara membalas dengan suara [Azure Neural](src/lib/server/speech.ts) beraksen, dan tempo serta nada suaranya mengikuti emosi tamu. | [Agen tamu](src/lib/server/agents.ts) hanya bermain peran. Skor 0 sampai 4 per kriteria dibuat agen penilai lain sesudah percakapan, dengan kutipan ucapan siswa sebagai bukti. | Tamu hanya memakai lembar fakta [skenario](src/lib/scenarios.ts): harga, aturan, dan batas wewenang staf. Ia tidak mengarang layanan yang tidak ada. | [Rantai provider LLM](src/lib/server/llm.ts) melewati provider yang kena batas atau gagal. Ada cadangan suara browser dan mode ketik. URL dan model tidak ditanam di kode. |

Siswa SMK pariwisata dan mahasiswa D3/D4 perhotelan di Bali akan melayani tamu dari banyak negara, tetapi jarang bisa berlatih bicara dengan tamu asing sungguhan sebelum magang. Reharsa memberi mereka tamu hotel AI yang punya nama, asal, aksen, dan suasana hati, di hotel fiktif Hotel Puri Sekar di Ubud. Siswa menangani situasi seperti tagihan minibar yang dipersoalkan, kamar penuh karena overbooking, atau AC rusak saat Nyepi, dengan bicara dalam bahasa Inggris. Di tengah percakapan tamu bisa memberi kabar baru yang memaksa siswa menyesuaikan solusi. Setelah selesai, rapor menunjukkan skor tiap kriteria, kalimat siswa yang menjadi buktinya, dan contoh kalimat yang lebih baik.

**Status deployment:** [ISI setelah deploy, misalnya: Reharsa berjalan di URL publik di Vercel dengan database Neon. Versi yang dinilai: tag `v1.0-submission`.]

Karya untuk **AI Web Innovation Challenge Bali DigiFest 2026**, kategori Mahasiswa/Umum, subtema Education & Smart Information Systems.

## Description

Reharsa adalah simulator tamu berbasis AI untuk calon pekerja pariwisata. Satu sesi latihan berjalan seperti panggilan: tamu bicara lebih dulu, siswa menjawab lewat suara, dan tamu menanggapi sesuai fakta hotel dan emosinya. Setiap rapor tersimpan di akun siswa, sehingga perkembangan antar sesi bisa dilihat.

## Problem & Target User

**Masalah.** Kemampuan melayani tamu asing dalam bahasa Inggris menentukan kelulusan magang, uji kompetensi, dan wawancara kerja di hotel atau kapal pesiar. Di kelas, latihan biasanya berupa role-play antarteman: aksennya sama, teman tahu itu hanya latihan, skenario tidak berubah di tengah jalan, dan satu guru tidak sempat memberi umpan balik rinci untuk setiap pasangan. Catatan lisan di akhir kelas mudah terlupa sebelum latihan berikutnya.

**Pengguna utama.** Siswa SMK pariwisata dan perhotelan serta mahasiswa D3/D4 pariwisata, khususnya di Bali.

**Kebutuhan mereka:**

- **Lawan bicara yang terasa nyata:** aksen dan karakter tamu yang berbeda, bukan suara teman sekelas.
- **Situasi yang benar-benar terjadi:** dari reservasi lewat telepon sampai tamu yang terjebak abu vulkanik.
- **Umpan balik yang spesifik:** kalimat mana yang tepat, mana yang perlu diperbaiki, dan contoh penggantinya.
- **Latihan berulang tanpa malu:** bisa diulang kapan saja, dengan suasana awal tamu yang bisa dipilih.

## Key Features

**Fitur inti (sudah berfungsi):**

- **Percakapan suara dua arah:** rekaman mikrofon diubah menjadi teks, tamu AI menjawab dengan suara beraksen. Teks berjalan tampil selama siswa bicara.
- **11 situasi dalam tiga kategori:** lima situasi sehari-hari (check-in dan aturan pura, reservasi telepon, check-out dengan tagihan dipersoalkan, info wisata dan transportasi, kamar belum dibersihkan), lima situasi sulit (AC rusak saat Nyepi, alergi kacang, overbooking, penerbangan batal karena abu vulkanik, tamu sakit tengah malam), dan satu wawancara kru kapal pesiar.
- **Tamu dengan emosi dan kejutan:** suasana awal sabar, kesal, atau marah; emosi 0 sampai 10 berubah tiap giliran beserta alasannya; kabar baru di tengah percakapan.
- **Rapor berbasis rubrik:** skor 0 sampai 4 per kriteria, kutipan ucapan siswa, tingkat keyakinan penilai, ringkasan, dan contoh kalimat yang lebih baik dalam bahasa Indonesia.
- **Skor kejelasan pengucapan per kata** untuk jawaban yang diucapkan lewat mikrofon.
- **Akun siswa dan riwayat:** semua rapor tersimpan, grafik skor per sesi, rata-rata per kemampuan, kemampuan yang paling perlu dilatih, dan saran situasi berikutnya.

**Fitur tambahan:**

- Mode ketik bila mikrofon atau layanan suara tidak tersedia.
- Tema terang (bawaan) dan gelap, desain bernuansa Bali, dan aksesibilitas dasar (kontras AA, navigasi papan ketik, mode kurangi gerak).

### Product tour

| Pilih situasi | Brief sebelum mulai |
|---|---|
| <img src="docs/readme/latihan.jpg" alt="Halaman Latihan dengan saran situasi berikutnya dan kartu situasi"> | <img src="docs/readme/brief.jpg" alt="Brief latihan: peran, tujuan, kejutan, kriteria penilaian, dan profil tamu"> |
| Saran situasi berikutnya, lalu kartu situasi per kategori dengan skor terbaikmu. | Peran, tujuan, peringatan kejutan, gambaran skor 4 tiap kriteria, dan tamu yang akan kamu layani. |
| **Panggung suara** | **Rapor** |
| <img src="docs/readme/panggung-suara.jpg" alt="Panggung suara: foto tamu di tengah, kalimat tamu, meter emosi, dan tombol bicara"> | <img src="docs/readme/rapor.jpg" alt="Rapor: perasaan tamu di akhir, total poin, ringkasan, dan skor per kriteria"> |
| Tamu di tengah, kalimatnya dalam ukuran besar, meter emosi, dan tombol bicara. Cincin di sekitar foto mengikuti suara. | Perasaan tamu di akhir, total poin, ringkasan, fokus latihan berikutnya, dan skor per kriteria dengan kutipanmu. |
| **Riwayat** | **Tema gelap** |
| <img src="docs/readme/riwayat.jpg" alt="Riwayat: kemampuan yang paling perlu dilatih dan grafik skor per sesi"> | <img src="docs/readme/landing-gelap.jpg" alt="Halaman depan Reharsa dalam tema gelap"> |
| Kemampuan yang paling perlu dilatih, situasi untuk melatihnya, dan grafik skor tiap sesi. | Palet batu candi untuk tema gelap; terang memakai batu paras. |

## Tech Stack

| Lapisan | Implementasi |
|---|---|
| Frontend | Next.js 16.4 (App Router, Cache Components), React 19.3, TypeScript, Tailwind CSS 4 |
| Backend | Next.js Route Handlers di Node.js, validasi Zod 4 |
| Database | Postgres di Neon (tier gratis), driver `pg` |
| Akun | Better Auth 1.7, email dan password, sesi berbasis cookie |
| AI | Groq (Whisper, Qwen), provider kompatibel OpenAI lewat router, Azure AI Speech |
| Hosting | Vercel (aplikasi) dan Neon (database) |

## AI Implementation

AI adalah inti produk: tanpa AI tidak ada tamu yang bicara, menanggapi, dan menilai. Ada lima komponen AI dalam satu sesi.

| Komponen | Model / layanan | Input → output | Kode |
|---|---|---|---|
| Speech-to-Text | Groq `whisper-large-v3-turbo`; cadangan: pengenalan suara browser | Audio WAV 16 kHz → teks jawaban siswa | [`speech.ts`](src/lib/server/speech.ts) |
| Agen Tamu | LLM berantai `GUEST_LLM_ORDER`: Groq `qwen/qwen3.8-27b`, lalu Claude Sonnet lewat router kompatibel OpenAI | Persona, fakta skenario, kejutan, riwayat percakapan, emosi saat ini → `{reply, emotion, emotion_reason, resolved}` | [`agents.ts`](src/lib/server/agents.ts) |
| Text-to-Speech | Azure Neural TTS (11 suara: en-AU, en-IN, en-GB, ko-KR, zh-CN, fr-FR, de-DE); cadangan: suara browser | Kalimat tamu + emosi → audio; tempo dan nada naik saat tamu marah | [`speech.ts`](src/lib/server/speech.ts) |
| Pronunciation Assessment | Azure AI Speech | Audio + teks acuan → akurasi, kelancaran, skor per kata | [`speech.ts`](src/lib/server/speech.ts) |
| Agen Penilai dan Coach | LLM berantai `JUDGE_LLM_ORDER`: Claude Sonnet lewat router, lalu Groq | Transkrip + rubrik → skor 0 sampai 4, kutipan bukti, keyakinan per kriteria; ringkasan dan contoh kalimat lebih baik | [`agents.ts`](src/lib/server/agents.ts) |

**Kenapa AI diperlukan.** Tamu harus menanggapi jawaban siswa yang tidak bisa diduga, berubah emosinya sesuai cara siswa bicara, dan tetap konsisten dengan fakta hotel. Skrip bercabang tidak bisa melakukan itu. Penilaian juga harus membaca makna kalimat, bukan mencocokkan kata kunci.

**Keputusan desain:**

- **Agen tamu dan agen penilai dipisah,** supaya skor tidak dipengaruhi jalannya role-play dan tamu tidak "membocorkan" penilaian.
- **Grounding:** tamu hanya boleh memakai fakta skenario, termasuk batas wewenang staf (misalnya hapus tagihan minibar sampai Rp200.000).
- **Output terstruktur:** semua balasan LLM berupa JSON yang divalidasi Zod. Yang tidak valid dicoba ulang sekali, lalu pindah ke provider berikutnya.
- **Adil terhadap aksen:** penilai menilai kejelasan dan kesopanan, bukan kemiripan dengan penutur asli. Skor pengucapan ditampilkan terpisah dan tidak dihitung ke poin rapor.
- **Penanda markdown dibersihkan** dari kalimat tamu sebelum tampil dan dibacakan.

**Penanganan gagal:** provider yang membalas 429 atau 5xx dilewati sementara (mengikuti `retry-after`, bawaan 60 detik) dan permintaan pindah ke provider berikutnya. Transkripsi gagal → teks dari pengenalan suara browser. Suara Azure tidak tersedia → suara browser. Mikrofon ditolak → pesan jelas dan mode ketik. Semua gagal → pesan dalam bahasa awam dan tombol "Kirim ulang"; detail teknis hanya di log server.

**Data yang dikirim ke model:** teks percakapan latihan dan audio jawaban untuk transkripsi serta penilaian pengucapan. Rekaman suara tidak disimpan. Nama akun siswa tidak dikirim ke layanan AI.

## Architecture / Data Flow

```mermaid
flowchart LR
    S["Siswa<br/>browser + mikrofon"] --> W["Next.js 16<br/>halaman + Route Handlers"]
    W -- "audio WAV" --> STT["Groq Whisper<br/>speech-to-text"]
    W -- "riwayat + emosi" --> G["Agen Tamu<br/>LLM berantai"]
    W -- "kalimat + emosi" --> TTS["Azure Neural TTS<br/>suara beraksen"]
    W -- "audio + teks" --> PA["Azure Pronunciation<br/>Assessment"]
    W -- "transkrip + rubrik" --> J["Agen Penilai + Coach<br/>LLM berantai"]
    W --> DB[("Neon Postgres<br/>akun + rapor")]
```

```text
Per giliran
  Browser   rekam suara, ubah ke WAV 16 kHz, tampilkan teks berjalan
  /api/stt  audio → teks jawaban
  /api/guest  teks + riwayat + emosi → kalimat tamu + emosi baru
  /api/tts  kalimat tamu + emosi → suara beraksen
  /api/pronunciation  audio + teks → skor kejelasan per kata (berjalan di latar)

Akhir sesi
  /api/evaluate  transkrip → Agen Penilai dan Agen Coach (paralel) → rapor → tersimpan ke akun
```

Semua route AI menolak permintaan tanpa sesi login, jadi kuota layanan tidak bisa dipakai pengunjung anonim. Database hanya menyimpan akun dan rapor (tabel `practice_session`: transkrip, skor, umpan balik, skor pengucapan). Setiap kueri riwayat difilter dengan `user_id`, sehingga siswa hanya bisa membuka rapornya sendiri ([`history.ts`](src/lib/server/history.ts)).

## Installation / Run Instructions

Butuh Node.js 20 atau lebih baru dan database Postgres (misalnya Neon tier gratis).

```bash
npm install
cp .env.example .env.local     # isi key dan DATABASE_URL, lalu:
npm run db:migrate             # buat tabel akun dan practice_session
npm run dev                    # buka http://localhost:3000
```

| Perintah | Kegunaan |
|---|---|
| `npm run dev` | Server pengembangan |
| `npm run build` lalu `npm start` | Build dan jalankan versi produksi |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | Pemeriksaan tipe TypeScript |
| `npm run db:migrate` | Membuat tabel Better Auth dan `practice_session` |
| `npm run demo:seed` | Mengisi akun demo dengan sesi latihan sungguhan lewat API (dev server harus berjalan) |

Belum ada rangkaian tes otomatis. Sebelum setiap commit, lint, pemeriksaan tipe, dan production build dijalankan, lalu alur utama dicoba di browser.

### Konfigurasi

Nama variabel ada di [`.env.example`](.env.example), tanpa nilai. Kode tidak menyimpan URL, model, atau urutan provider; semuanya dibaca dari environment.

| Variabel | Fungsi |
|---|---|
| `GUEST_LLM_ORDER`, `JUDGE_LLM_ORDER` | Urutan provider per agen, nama dipisah koma |
| `{NAMA}_BASE_URL`, `{NAMA}_MODEL`, `{NAMA}_API_KEY` | Satu provider dengan endpoint kompatibel OpenAI; provider tanpa key dilewati |
| `{NAMA}_JSON_MODE=false` | Opsional, untuk provider yang menolak `response_format` |
| `STT_BASE_URL`, `STT_MODEL`, `STT_API_KEY` | Speech-to-Text (`/audio/transcriptions`) |
| `AZURE_SPEECH_REGION`, `AZURE_SPEECH_KEY` | Suara tamu dan skor pengucapan |
| `DATABASE_URL` | Koneksi Postgres |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Kunci sesi login dan alamat aplikasi |

Menambah provider, misalnya OpenRouter: isi `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY`, lalu tambahkan `OPENROUTER` ke urutan agen.

## Deployment URL

[ISI URL deployment setelah deploy]

## Demo Account

Latihan memerlukan akun. Juri bisa membuat akun sendiri di halaman **Daftar**, atau memakai akun demo khusus juri yang sudah berisi riwayat latihan (balasan tamu dan skor dibuat AI; jawaban siswa ditulis tim dengan kualitas bertahap). **Kredensial akun demo dikirim lewat form panitia, tidak dicantumkan di repository.** Akun demo bisa diisi ulang dengan `npm run demo:seed` ([`scripts/seed-demo.mjs`](scripts/seed-demo.mjs)).

## Known Limitations

- **Kuota tier gratis** (Groq, Azure Speech F0, router LLM) bisa habis bila banyak pengguna berlatih bersamaan. Bila suara Azure habis, suara tamu memakai suara browser dan skor pengucapan tidak tersedia sementara.
- **Batas pemakaian per IP** disimpan di memori server, jadi di lingkungan serverless batasnya per instance.
- **Penilai kadang terlalu murah hati** untuk jawaban yang sopan tetapi kurang lengkap. Skrip evaluasi otomatis (golden set) belum dibuat.
- **Skor pengucapan** memakai acuan en-US dan hanya ditampilkan sebagai kejelasan kata.
- **Skor rapor adalah alat latihan, bukan sertifikasi.**
- Mikrofon dan suara paling andal di Chrome dan Edge. Belum ada reset password lewat email.

## AI & Technology Disclosure

| Komponen | Isi |
|---|---|
| Nama Produk | Reharsa |
| Framework / Frontend | Next.js 16.4 (App Router), React 19.3, TypeScript, Tailwind CSS 4 |
| Backend / Runtime | Next.js Route Handlers di Node.js, validasi Zod 4 |
| Database / Storage | Postgres di Neon, driver `pg`; rekaman suara tidak disimpan |
| Hosting / Deployment | Vercel (aplikasi), Neon (database) |
| AI Model / API / Method | Groq `whisper-large-v3-turbo` (speech-to-text); Groq `qwen/qwen3.8-27b` dan Claude Sonnet lewat router kompatibel OpenAI (agen tamu, penilai, coach); Azure AI Speech Neural TTS dan Pronunciation Assessment |
| Peran AI dalam Produk | Memerankan tamu yang bicara dan beremosi, mengubah suara siswa menjadi teks, membacakan kalimat tamu dengan aksen, menilai transkrip dengan rubrik, memberi umpan balik dan contoh kalimat, menilai kejelasan pengucapan |
| Dataset / Data Source | Tidak memakai dataset eksternal. Skenario, fakta Hotel Puri Sekar (fiktif), dan rubrik ditulis tim. Tidak ada data pribadi nyata |
| Open-source Libraries | Next.js, React, Tailwind CSS, Zod, Better Auth, node-postgres, ESLint, TypeScript |
| Template / Boilerplate | Tidak memakai template atau boilerplate pihak ketiga selain struktur proyek standar Next.js. Arah desain halaman depan diadaptasi dari landing page [OpenLC](https://github.com/zghanw/openlc) (lisensi MIT) |
| AI Coding Assistant | [ISI dan periksa: Claude Code (Anthropic) dipakai sebagai asisten pengembangan untuk menulis dan merapikan kode, menyusun draf skenario dan rubrik, merancang antarmuka, dan membantu pengujian. Setiap perubahan diarahkan, ditinjau, dan diuji tim] |
| Pre-existing Components | Tidak ada. Seluruh kode dibuat untuk kompetisi ini, dimulai dari commit pertama `956ea60` (5 November 2026) |
| Third-party Assets / Credits | Font Bricolage Grotesque dan Mona Sans (SIL Open Font License); foto tamu dan foto gerbang dari Unsplash (Unsplash License); lihat bagian berikut |

> Kami menyatakan bahwa informasi di atas benar dan lengkap. Kami bertanggung jawab atas penggunaan teknologi, source code, data, library, API, model AI, dan aset yang digunakan pada produk.

## Third-party Resources / Credits

- **Library:** Next.js, React, Tailwind CSS, Zod, Better Auth, node-postgres (lisensi MIT).
- **Font:** Bricolage Grotesque dan Mona Sans (SIL Open Font License).
- **Layanan:** Groq API, Azure AI Speech, router LLM kompatibel OpenAI, Neon Postgres, Vercel.
- **Arah desain** halaman depan diadaptasi dari landing page [OpenLC](https://github.com/zghanw/openlc) (lisensi MIT); lihat [DESIGN.md](DESIGN.md).
- **Foto tamu** dari Unsplash (Unsplash License), dipotong ke wajah. Orang di foto adalah model, bukan tokoh yang diperankan. Fotografer: Sophie Paterson, Nandu Vasudevan, Olga Zhuravleva, panitan punpuang, Let hho, Vicky Hladynets, Zoran Borojevic, Jake Nackos, Beatriz Cattel, Brooke Balentine, DICSON. Tautan tiap foto ada di [`src/lib/guest-photos.ts`](src/lib/guest-photos.ts).
- **Foto gerbang candi bentar di pantai** pada bagian penutup halaman depan: Galih Jelih, [Unsplash](https://unsplash.com/photos/NfbnXtCxoWI), Unsplash License.
- **Logo** dibuat tim. Hotel Puri Sekar dan semua tokoh tamu adalah fiktif, dibuat untuk latihan.

## Repository layout

```text
src/app/           halaman (depan, latihan, riwayat, masuk, daftar) dan Route Handlers di api/
src/components/    panggung suara, rapor, grafik riwayat, logo, saklar tema
src/lib/           skenario dan rubrik, perhitungan progres, foto tamu
src/lib/server/    agen AI, rantai LLM, layanan suara, akun, riwayat, batas pemakaian
scripts/           migrasi database dan pengisian akun demo
public/            foto tamu, foto tempat, file merek
docs/readme/       tangkapan layar README
DESIGN.md          arah desain, token warna, dan keputusan pemilik
```

## Team Members

| Nama | Peran |
|---|---|
| Komang Agus Wira Adnyana (ketua) | [ISI peran] |
| I Made Megadhana | [ISI peran] |

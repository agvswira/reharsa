# Reharsa

Simulator tamu berbasis AI untuk calon pekerja pariwisata Bali. Siswa berbicara dengan suara kepada tamu hotel virtual yang punya kebangsaan, aksen, dan emosi, lalu menerima rapor pelayanan berbasis rubrik kompetensi dengan umpan balik dalam Bahasa Indonesia.

Karya untuk AI Web Innovation Challenge Bali DigiFest 2026, subtema Education & Smart Information Systems.

## Problem & Target User

Siswa SMK pariwisata dan mahasiswa D3/D4 pariwisata jarang punya kesempatan berlatih bicara dengan tamu asing sungguhan, padahal kemampuan itu menentukan kelulusan magang, uji kompetensi, dan wawancara kerja (termasuk kapal pesiar). Role-play di kelas biasanya dilakukan antarteman, dan satu guru tidak bisa memberi umpan balik rinci ke setiap siswa.

Pengguna: siswa SMK dan mahasiswa D3/D4 pariwisata/perhotelan.

## Key Features

Sudah berfungsi:

- Tiga situasi latihan: AC rusak saat Nyepi (tamu Australia), check-in dan aturan pura (tamu India), wawancara kru kapal pesiar (pewawancara Inggris).
- Suasana awal tamu bisa dipilih: sabar, kesal, atau marah.
- Percakapan suara dua arah: rekam dari mikrofon, ditranskripsi, tamu AI menjawab dengan suara beraksen.
- Meter emosi tamu 0-10 yang berubah setiap giliran, beserta alasannya.
- Mode ketik sebagai cadangan bila mikrofon atau layanan suara tidak tersedia.
- Rapor: skor 0-4 per kriteria rubrik, kutipan ucapan siswa sebagai bukti, tingkat keyakinan penilai, contoh kalimat yang lebih baik, dan skor kejelasan pengucapan per kata.
- Akun siswa (email + password, wajib untuk berlatih): rapor tersimpan otomatis, halaman riwayat dengan perbandingan skor 3 sesi pertama dan terbaru. Halaman latihan dan semua API AI menolak permintaan tanpa sesi login, sehingga kuota layanan tidak bisa dipakai pengunjung anonim.
- Tema gelap (bawaan) dan terang.

Belum dibuat: skrip evaluasi otomatis (`npm run eval`).

## Tech Stack

| Bagian | Pilihan |
| --- | --- |
| Frontend | Next.js 16 (App Router), React 19, Tailwind CSS 4 |
| Backend | Next.js Route Handlers (Node.js) |
| Validasi | Zod |
| Database | Postgres di Neon (tier gratis), driver `pg` |
| Akun | Better Auth (email + password), sesi berbasis cookie |
| Hosting | Vercel Hobby (rencana) |

## AI Implementation

| Komponen | Layanan / model | Input → output |
| --- | --- | --- |
| Speech-to-Text | `STT_*`, contoh Groq Whisper `whisper-large-v3-turbo` (cadangan: pengenalan suara browser) | Audio WAV 16 kHz → teks |
| Agen Tamu | Rantai `GUEST_LLM_ORDER`, contoh Groq Qwen 3.8 27B → provider custom | Riwayat percakapan + emosi saat ini → `{reply, emotion, emotion_reason, resolved}` |
| Text-to-Speech | Azure Neural TTS F0 (cadangan: suara browser) | Teks tamu + emosi → MP3 beraksen (en-AU, en-IN, en-GB) |
| Pronunciation Assessment | Azure AI Speech F0 | Audio + teks → skor akurasi, kelancaran, skor per kata |
| Agen Penilai | Rantai `JUDGE_LLM_ORDER`, contoh provider custom → Groq | Transkrip + rubrik → skor 0-4, kutipan bukti, keyakinan per kriteria |
| Agen Coach | Rantai `JUDGE_LLM_ORDER` | Transkrip → ringkasan dan contoh kalimat lebih baik |

Semua LLM dipanggil lewat endpoint kompatibel OpenAI (`{BASE_URL}/chat/completions`), jadi endpoint, model, dan urutan provider diatur sepenuhnya lewat `.env.local` tanpa mengubah kode (lihat Konfigurasi). Provider yang membalas 429 atau 5xx dilewati sementara (sesuai header `retry-after`, default 60 detik) dan permintaan langsung pindah ke provider berikutnya.

Kode utama:

- Prompt dan aturan tiap agen: [`src/lib/server/agents.ts`](src/lib/server/agents.ts)
- Pemanggilan LLM, validasi skema, dan urutan cadangan: [`src/lib/server/llm.ts`](src/lib/server/llm.ts)
- Speech-to-Text, TTS, Pronunciation Assessment: [`src/lib/server/speech.ts`](src/lib/server/speech.ts)
- Skenario, fakta hotel, rubrik: [`src/lib/scenarios.ts`](src/lib/scenarios.ts)

Keputusan desain:

- Agen Tamu dan Agen Penilai dipisah supaya skor tidak dipengaruhi jalannya role-play.
- Agen Tamu hanya boleh memakai fakta dari skenario (grounding), sehingga tidak mengarang harga atau layanan.
- Semua output LLM diminta dalam JSON dan divalidasi dengan Zod. Output yang tidak valid dicoba ulang sekali, lalu pindah ke provider cadangan.
- Penilai diminta menilai kejelasan dan kesopanan, bukan kemiripan dengan penutur asli.

Penanganan gagal: Whisper gagal → teks dari pengenalan suara browser; mikrofon ditolak → pesan jelas dan pilihan mengetik; LLM gagal atau kena limit → provider berikutnya di rantai, lalu pesan error dengan tombol "Kirim ulang"; Azure TTS tidak tersedia → suara browser.

## Architecture / Data Flow

```
Per giliran:
Browser (rekam, ubah ke WAV 16 kHz, teks berjalan dari browser) → /api/stt (Whisper) → teks
teks + riwayat → /api/guest (Agen Tamu) → jawaban + emosi → /api/tts (Azure) → suara
audio + teks → /api/pronunciation (Azure) → skor pengucapan (berjalan di latar)

Akhir sesi:
transkrip → /api/evaluate → Agen Penilai + Agen Coach (paralel) → rapor
```

Database hanya menyimpan akun siswa dan rapor milik siswa yang sedang masuk (tabel `practice_session`: transkrip, skor, umpan balik, skor pengucapan). Rekaman suara tidak pernah disimpan. Setiap kueri riwayat difilter dengan `user_id`, jadi siswa hanya bisa membuka rapornya sendiri ([`src/lib/server/history.ts`](src/lib/server/history.ts)).

## Installation / Run Instructions

Butuh Node.js 20 atau lebih baru.

```bash
npm install
cp .env.example .env.local
# isi key dan DATABASE_URL, lalu buat tabel:
npm run db:migrate
npm run dev
```

Isi key di `.env.local`, lalu buka http://localhost:3000. Aplikasi tetap terbuka tanpa key, tetapi menampilkan layanan mana yang belum aktif.

### Konfigurasi

Kode tidak menyimpan URL, model, atau urutan bawaan; semuanya dibaca dari `.env.local`.

| Variabel | Fungsi |
| --- | --- |
| `GUEST_LLM_ORDER`, `JUDGE_LLM_ORDER` | Urutan cadangan per agen, nama provider dipisah koma |
| `{NAMA}_BASE_URL`, `{NAMA}_MODEL`, `{NAMA}_API_KEY` | Satu provider dengan endpoint kompatibel OpenAI. Provider tanpa key dilewati |
| `{NAMA}_JSON_MODE=false` | Opsional, untuk provider yang menolak `response_format` |
| `STT_BASE_URL`, `STT_MODEL`, `STT_API_KEY` | Speech-to-Text (`/audio/transcriptions`) |
| `AZURE_SPEECH_REGION`, `AZURE_SPEECH_KEY` | Suara tamu dan skor pengucapan |
| `DATABASE_URL` | Koneksi Postgres untuk akun dan riwayat |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` | Kunci rahasia sesi login dan alamat aplikasi |

Menambah provider, misalnya OpenRouter: tulis `OPENROUTER_BASE_URL`, `OPENROUTER_MODEL`, `OPENROUTER_API_KEY`, lalu sebut `OPENROUTER` di urutan agen.

## Deployment URL

[ISI URL deployment]

## Demo Account

Latihan memerlukan akun. Juri bisa membuat akun sendiri di halaman Daftar, atau memakai satu akun demo juri berisi 5 sesi latihan sungguhan (balasan tamu dan skor dibuat AI; jawaban siswa ditulis tim dengan kualitas bertahap). Kredensialnya dikirim lewat form panitia, tidak dicantumkan di repository. Akun dapat dibuat ulang dengan `npm run demo:seed` ([`scripts/seed-demo.mjs`](scripts/seed-demo.mjs)).

## Known Limitations

- Batas pemakaian per IP disimpan di memori server, jadi di serverless angkanya per instance.
- Kuota tier gratis (Groq, Azure F0) dan provider custom bisa habis saat banyak pengguna.
- Skor pengucapan Azure memakai acuan en-US; ditampilkan sebagai kejelasan kata dan tidak dihitung ke poin rapor.
- Skor rapor adalah alat latihan, bukan sertifikasi.
- Belum ada reset password lewat email.

## Third-party Resources / Credits

- Next.js, React, Tailwind CSS, Zod, Better Auth, node-postgres (lisensi MIT)
- Font Bricolage Grotesque dan Mona Sans (SIL Open Font License)
- Arah desain halaman depan diadaptasi dari landing page OpenLC (github.com/zghanw/openlc, lisensi MIT); lihat DESIGN.md
- Groq API, Azure AI Speech, Neon Postgres, dan provider custom yang dikonfigurasi tim (layanan pihak ketiga)
- Hotel Puri Sekar dan semua tokoh tamu adalah fiktif, dibuat tim untuk latihan.
- Foto tamu dari Unsplash (Unsplash License), dipotong ke wajah. Orang di foto adalah model, bukan tokoh yang diperankan. Fotografer: Sophie Paterson, Nandu Vasudevan, Olga Zhuravleva, panitan punpuang, Let hho, Vicky Hladynets, Zoran Borojevic, Jake Nackos, Beatriz Cattel, Brooke Balentine, DICSON. Tautan tiap foto ada di [`src/lib/guest-photos.ts`](src/lib/guest-photos.ts).

## AI Coding Assistant

[ISI: alat bantu AI yang dipakai saat coding dan untuk apa. Wajib diungkapkan sesuai panduan lomba.]

## Team Members

- Komang Agus Wira Adnyana: [ISI peran]
- I Made Megadhana: [ISI peran]

// Timeline dua jalur di halaman depan, diadaptasi dari "credit timeline"
// referensi OpenLC. Versi ini komponen server tanpa JavaScript: garis tengah
// terisi dan baris menyala lewat animasi CSS yang mengikuti gulir
// (lihat .tl-* di globals.css).
//
// Isinya satu latihan yang sama dijalani dua cara, tahap demi tahap. Jalur
// Reharsa mengikuti skenario "AC kamar rusak saat Nyepi" apa adanya: fakta,
// kejutan di giliran kedua, dan wewenang staf sesuai lembar fakta.

type Step = {
  when: string;
  // Jalur kelas: judul tegas, atau catatan redup bila tidak ada yang terjadi.
  classroom?: string;
  quiet?: string;
  reharsa?: {
    title: string;
    // Emosi tamu setelah tahap ini, bila tahap ini bagian dari percakapan.
    emotion?: number;
    meta: string;
  };
};

const STEPS: Step[] = [
  {
    when: "Persiapan",
    classroom: "Peran dibagi, naskah dibaca bersama.",
    reharsa: {
      title: "Kamu pilih situasi Nyepi dan suasana awal tamu: kesal.",
      meta: "Brief dan fakta hotel",
    },
  },
  {
    when: "Tamu bicara",
    classroom: "Teman sekelas jadi tamu. Aksennya sama, dan ia tahu ini latihan.",
    reharsa: {
      title: "Mark mengeluh AC mati dan ingin keluar mencari kafe.",
      emotion: 8,
      meta: "Suara beraksen Australia",
    },
  },
  {
    when: "Kamu menjawab",
    quiet: "Tidak ada yang mencatat kalimatmu.",
    reharsa: {
      title: "Kamu minta maaf dan jelaskan aturan Nyepi dengan sopan.",
      emotion: 6,
      meta: "Giliran 1",
    },
  },
  {
    when: "Kabar baru",
    quiet: "Naskah tetap sama sampai akhir.",
    reharsa: {
      title: "Mark bilang istrinya hamil dan pusing karena panas.",
      emotion: 7,
      meta: "Giliran 2",
    },
  },
  {
    when: "Solusi",
    quiet: "Belum ada umpan balik.",
    reharsa: {
      title: "Kamu pindahkan mereka ke Pool Villa dan tawarkan dokter jaga.",
      emotion: 3,
      meta: "Giliran 3",
    },
  },
  {
    when: "Selesai",
    classroom: "Guru memberi catatan singkat. Puluhan pasangan lain menunggu.",
    reharsa: {
      title: "Rapor: skor 0-4 per kriteria, kutipan ucapanmu, kalimat yang lebih baik.",
      meta: "Tersimpan di riwayat",
    },
  },
  {
    when: "Minggu depan",
    classroom: "Catatan lisan sudah terlupa.",
    reharsa: {
      title: "Riwayat menunjukkan kemampuan yang paling perlu dilatih.",
      meta: "Lanjut ke situasi yang disarankan",
    },
  },
];

export function PracticeTimeline() {
  return (
    <div className="tl">
      <div className="tl-lanes" aria-hidden="true">
        <div className="tl-lane-head tl-lane-head--left">
          <strong>Role-play antarteman</strong>
          <span className="tl-state">Umpan balik lisan di akhir</span>
        </div>
        <div className="tl-lane-head tl-lane-head--right">
          <strong>Dengan Reharsa</strong>
          <span className="tl-state">Contoh: AC rusak saat Nyepi</span>
        </div>
      </div>

      <div className="tl-track">
        <div className="tl-staff" aria-hidden="true">
          <span className="tl-staff-fill" />
          <span className="tl-staff-light" />
        </div>

        <ol className="tl-steps">
          {STEPS.map((step) => (
            <li key={step.when} className="tl-step">
              <div className="tl-when">
                <span>{step.when}</span>
              </div>

              <div className="tl-cell tl-cell--left">
                {step.quiet ? (
                  <p className="tl-quiet">
                    <span className="tl-lane-label">Role-play antarteman: </span>
                    {step.quiet}
                  </p>
                ) : null}
                {step.classroom ? (
                  <div className="tl-entry-left">
                    <span className="tl-lane-label">Role-play antarteman</span>
                    <p className="tl-title">{step.classroom}</p>
                  </div>
                ) : null}
              </div>

              <div className="tl-cell tl-cell--right">
                {step.reharsa ? (
                  <div className="card tl-entry-right">
                    <span className="tl-lane-label">Dengan Reharsa</span>
                    <p className="tl-title">{step.reharsa.title}</p>
                    <div className="tl-foot">
                      {step.reharsa.emotion !== undefined ? (
                        <span>Emosi tamu {step.reharsa.emotion}/10</span>
                      ) : null}
                      <span className="text-muted">{step.reharsa.meta}</span>
                    </div>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

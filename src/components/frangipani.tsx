// Bunga jepun (kamboja/frangipani): simbol sambutan di hotel Bali, diletakkan
// di atas handuk, ranjang, atau di telinga tamu. Lima kelopak berpilin
// searah, digambar geometris supaya tetap bersih di ukuran kecil.
// Dekoratif: aria-hidden; warna lewat token --petal, --petal-edge, --bloom.

// Satu kelopak: lebar, pangkalnya menumpuk dengan kelopak sebelah, dan
// tidak simetris (satu sisi lurus, satu sisi membulat) supaya kelimanya
// berpilin seperti baling-baling, ciri bunga jepun.
const PETAL =
  "M50 50 C 36 46 26 32 30 17 C 34 4 54 0 63 9 C 70 17 66 34 50 50 Z";

export function Frangipani({
  className = "",
  size = 24,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {/* Kelopak selalu putih seperti bunga aslinya. Tepi memisahkan kelopak
          yang bertumpuk; di tema terang tepinya gelap supaya terlihat di krem. */}
      <g fill="var(--petal)" stroke="var(--petal-edge)" strokeWidth="2.5">
        {[0, 72, 144, 216, 288].map((deg) => (
          <path key={deg} d={PETAL} transform={`rotate(${deg} 50 50)`} />
        ))}
      </g>
      {/* Pusat kuning, ciri bunga jepun; satu-satunya warna hangat dekoratif
          selain cahaya gerbang di hero. */}
      <circle cx="50" cy="50" r="11" fill="var(--bloom)" />
    </svg>
  );
}

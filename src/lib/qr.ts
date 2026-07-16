export function buildQrUrl(origin: string, toolId: string): string {
  return `${origin.replace(/\/$/, '')}/return/${toolId}`
}

// Menerima dua bentuk: URL penuh dari label cetak (dibuka kamera bawaan HP)
// dan ID telanjang. Mengembalikan null untuk QR asing — misalnya QR promosi
// yang kebetulan tertempel di kemasan.
//
// Host pada URL sengaja TIDAK diperiksa. Alasannya dua:
//   1. Id hasil ekstraksi hanya dipakai untuk navigasi internal
//      (`navigate('/return/<id>')`), tidak pernah untuk membuka host asing
//      atau mengambil data dari sana. Regex juga membatasi id ke
//      [A-Za-z0-9_-]+, jadi tidak ada protokol atau path yang bisa diselipkan.
//   2. Label dicetak memakai origin saat itu. Kalau host diperiksa, seluruh
//      label yang dicetak sebelum aplikasi pindah domain (misal dari
//      localhost ke Netlify) akan berhenti bisa di-scan.
// Ancaman yang tersisa — QR palsu agar tools dikembalikan ke tempat salah —
// sudah bisa dilakukan siapa pun yang menempel label palsu berisi ID asli,
// jadi memeriksa host tidak menambah perlindungan nyata.
export function parseScannedValue(text: string): string | null {
  const raw = text.trim()
  if (raw === '') return null

  const fromUrl = raw.match(/\/return\/([A-Za-z0-9_-]+)\/?$/)
  if (fromUrl) return fromUrl[1]

  if (/^[A-Za-z0-9_-]+$/.test(raw)) return raw

  return null
}

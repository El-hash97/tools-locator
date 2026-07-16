export function buildQrUrl(origin: string, toolId: string): string {
  return `${origin.replace(/\/$/, '')}/return/${toolId}`
}

// Menerima dua bentuk: URL penuh dari label cetak (dibuka kamera bawaan HP)
// dan ID telanjang. Mengembalikan null untuk QR asing — misalnya QR promosi
// yang kebetulan tertempel di kemasan.
export function parseScannedValue(text: string): string | null {
  const raw = text.trim()
  if (raw === '') return null

  const fromUrl = raw.match(/\/return\/([A-Za-z0-9_-]+)\/?$/)
  if (fromUrl) return fromUrl[1]

  if (/^[A-Za-z0-9_-]+$/.test(raw)) return raw

  return null
}

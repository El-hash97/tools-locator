function normalize(value: string): string {
  return value.toLowerCase().trim()
}

export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let previous = Array.from({ length: b.length + 1 }, (_, j) => j)

  for (let i = 1; i <= a.length; i++) {
    const current = new Array<number>(b.length + 1)
    current[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + cost,
      )
    }
    previous = current
  }

  return previous[b.length]
}

// Query pendek tidak ditoleransi typo-nya: pada kata 3 huruf, jarak 1 sudah
// mencocokkan hampir apa saja dan hasil pencarian jadi sampah.
export function maxDistanceFor(query: string): number {
  if (query.length <= 3) return 0
  if (query.length <= 5) return 1
  return 2
}

export function matchScore(query: string, text: string): number | null {
  const q = normalize(query)
  const t = normalize(text)

  if (q === '') return 0
  if (t.includes(q)) return 0

  const max = maxDistanceFor(q)
  if (max === 0) return null

  let best = Infinity
  for (const word of t.split(/\s+/)) {
    const whole = levenshtein(q, word)
    // Bandingkan juga dengan potongan awal kata sepanjang query, supaya
    // "kombinasl" tetap cocok dengan kata panjang seperti "kombinasi".
    const prefix =
      word.length > q.length ? levenshtein(q, word.slice(0, q.length)) : whole
    best = Math.min(best, whole, prefix)
  }

  return best <= max ? best : null
}

export function searchByName<T>(
  items: T[],
  query: string,
  getText: (item: T) => string,
): T[] {
  if (normalize(query) === '') return items

  const scored: Array<{ item: T; score: number }> = []
  for (const item of items) {
    const score = matchScore(query, getText(item))
    if (score !== null) scored.push({ item, score })
  }

  scored.sort((a, b) => a.score - b.score)
  return scored.map((s) => s.item)
}

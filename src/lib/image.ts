export const MAX_SIDE = 800
export const QUALITY = 0.7

export function fitDimensions(
  width: number,
  height: number,
  max: number,
): { width: number; height: number } {
  if (width <= max && height <= max) return { width, height }
  const scale = width >= height ? max / width : max / height
  return { width: Math.round(width * scale), height: Math.round(height * scale) }
}

export async function compressImage(
  file: File,
  max: number = MAX_SIDE,
  quality: number = QUALITY,
): Promise<string> {
  const bitmap = await createImageBitmap(file)
  try {
    const { width, height } = fitDimensions(bitmap.width, bitmap.height, max)
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height

    const context = canvas.getContext('2d')
    if (!context) throw new Error('Kanvas tidak tersedia di browser ini')

    context.drawImage(bitmap, 0, 0, width, height)
    return canvas.toDataURL('image/jpeg', quality)
  } finally {
    bitmap.close()
  }
}

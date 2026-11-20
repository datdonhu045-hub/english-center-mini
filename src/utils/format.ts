export function removeDiacritics(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
}

// Tìm kiếm không phân biệt hoa/thường và dấu tiếng Việt
export function matchText(haystack: string, needle: string): boolean {
  const n = removeDiacritics(needle.trim().toLowerCase())
  if (!n) return true
  return removeDiacritics(haystack.toLowerCase()).includes(n)
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

export function paginate<T>(items: T[], page: number, size: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / size))
  const current = Math.min(Math.max(page, 1), totalPages)
  return {
    items: items.slice((current - 1) * size, current * size),
    page: current,
    totalPages,
  }
}
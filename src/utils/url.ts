export function isSafeUrl(url: string | undefined | null): boolean {
  if (!url) return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

export function safeHref(url: string | undefined | null): string {
  return isSafeUrl(url) ? url! : '#'
}

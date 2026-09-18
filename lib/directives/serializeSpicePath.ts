const SPICE_PATH_NEEDS_QUOTES = /[\s=+\-*/^(),:;"'$]/

export function serializeSpicePath(path: string): string {
  if (!SPICE_PATH_NEEDS_QUOTES.test(path)) return path

  if (!path.includes('"')) return `"${path}"`
  if (!path.includes("'")) return `'${path}'`

  return path
}

export function formatFilePath(path: string): string {
  if (/^[a-zA-Z_][a-zA-Z0-9_.]*$/.test(path)) return path
  if (/[\r\n]/.test(path))
    throw new Error("SPICE filenames cannot contain newlines")
  if (!path.includes('"')) return `"${path}"`
  if (!path.includes("'")) return `'${path}'`
  throw new Error("SPICE filenames cannot contain both quote delimiters")
}

export function splitSourceFields(source: string): string[] {
  const fields: string[] = []
  let start = 0
  let depth = 0
  let quote = ""
  for (let index = 0; index < source.length; index++) {
    const char = source.charAt(index)
    if (quote) {
      if (char === quote) quote = ""
      continue
    }
    if (char === '"' || char === "'") quote = char
    else if ("({[".includes(char)) depth++
    else if (")}]".includes(char)) depth--
    else if (depth === 0 && /[\s,]/.test(char)) {
      const field = source.slice(start, index).trim()
      if (field) fields.push(field)
      start = index + 1
    }
  }
  const last = source.slice(start).trim()
  if (last) fields.push(last)
  return fields
}

import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export function readPassiveValue(card: SpiceLogicalCard): {
  value: string
  paramsStart: number
} {
  const tokens = SpiceTokenCard.from(card)
  let value = ""
  let depth = 0
  let previousEnd: number | undefined
  let index = 3
  for (; index < tokens.tokens.length; index += 1) {
    const token = tokens.tokens[index]!
    if (token.type === "comment") {
      if (depth === 0) break
      continue
    }
    const gap =
      previousEnd === undefined
        ? ""
        : tokens.originalSource.slice(
            previousEnd - card.range.start.offset,
            token.range.start.offset - card.range.start.offset,
          )
    if (previousEnd !== undefined && depth === 0 && gap.length > 0) break
    value += `${/^[ \t]*$/.test(gap) ? gap : " "}${token.raw}`
    if (token.type !== "string") {
      for (const char of token.raw) {
        if ("({[".includes(char)) depth += 1
        else if (")}]".includes(char)) depth = Math.max(0, depth - 1)
      }
    }
    previousEnd = token.range.end.offset
  }
  return { value, paramsStart: index - 1 }
}

import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export function readOutputExpressions(card: SpiceLogicalCard): string[] {
  const tokens = SpiceTokenCard.from(card)
  const expressions: string[] = []
  let depth = 0
  let previousEnd: number | undefined
  for (const token of tokens.tokens.slice(1)) {
    if (token.type === "comment") continue
    const gap =
      previousEnd === undefined
        ? ""
        : tokens.originalSource.slice(
            previousEnd - card.range.start.offset,
            token.range.start.offset - card.range.start.offset,
          )
    if (
      expressions.length === 0 ||
      (depth === 0 && gap.length > 0 && token.raw !== "(" && token.raw !== "[")
    ) {
      expressions.push(token.raw)
    } else {
      expressions[expressions.length - 1] +=
        `${/^[ \t]*$/.test(gap) ? gap : " "}${token.raw}`
    }
    if (token.type !== "string") {
      for (const char of token.raw) {
        if ("({[".includes(char)) depth += 1
        else if (")}]".includes(char)) depth = Math.max(0, depth - 1)
      }
    }
    previousEnd = token.range.end.offset
  }
  return expressions
}

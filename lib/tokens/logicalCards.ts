import type { SpiceLogicalCard, SpiceToken } from "./types"

export function tokensToLogicalCards(tokens: SpiceToken[]): SpiceLogicalCard[] {
  const cards: SpiceLogicalCard[] = []
  let current: SpiceToken[] = []

  const finish = () => {
    if (current.length === 0) return
    const range = {
      start: current[0]!.range.start,
      end: current.at(-1)!.range.end,
    }
    cards.push({
      tokens: current,
      originalSource: current.map((token) => token.raw).join(""),
      range,
    })
    current = []
  }

  for (const token of tokens) {
    if (token.type === "newline") {
      finish()
      continue
    }
    if (token.type === "continuation") {
      current.push({ ...token, raw: " " })
      continue
    }
    current.push(token)
  }
  finish()

  return cards
}

export function significantTokens(tokens: SpiceToken[]): SpiceToken[] {
  return tokens.filter((token) => token.type !== "whitespace")
}

export function tokenValue(token: SpiceToken | undefined): string | undefined {
  if (token === undefined) return undefined
  if ("value" in token && typeof token.value === "string") return token.value
  return token.raw
}

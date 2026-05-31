import type { SpiceLogicalCard, SpiceToken } from "./types"

export function tokensToLogicalCards(tokens: SpiceToken[]): SpiceLogicalCard[] {
  const cards: SpiceLogicalCard[] = []
  let current: SpiceToken[] = []
  let pendingNewline: SpiceToken | undefined
  let currentLeadingNewlineRaw: "\n" | "\r\n" | "\r" | undefined

  const addBlankLine = (leadingNewline: SpiceToken) => {
    cards.push({
      tokens: [],
      originalSource: "",
      range: {
        start: leadingNewline.range.end,
        end: leadingNewline.range.end,
      },
      leadingNewlineRaw: leadingNewline.raw as "\n" | "\r\n" | "\r",
    })
  }

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
      leadingNewlineRaw: currentLeadingNewlineRaw,
    })
    current = []
    pendingNewline = undefined
    currentLeadingNewlineRaw = undefined
  }

  for (const token of tokens) {
    if (token.type === "newline") {
      if (pendingNewline !== undefined) {
        const blankLineLeadingNewline = pendingNewline
        finish()
        addBlankLine(blankLineLeadingNewline)
        pendingNewline = token
        continue
      }
      if (current.length === 0) addBlankLine(token)
      else pendingNewline = token
      continue
    }

    if (pendingNewline !== undefined) {
      if (token.type === "continuation") {
        current.push(pendingNewline, token)
        pendingNewline = undefined
      } else {
        const leadingNewlineRaw = pendingNewline.raw as "\n" | "\r\n" | "\r"
        finish()
        currentLeadingNewlineRaw = leadingNewlineRaw
        pendingNewline = undefined
        current.push(token)
      }
      continue
    }

    if (token.type === "continuation") {
      current.push(token)
      continue
    }
    current.push(token)
  }
  finish()

  return cards
}

export function significantTokens(tokens: SpiceToken[]): SpiceToken[] {
  return tokens.filter(
    (token) =>
      token.type !== "whitespace" &&
      token.type !== "newline" &&
      token.type !== "continuation",
  )
}

export function tokenValue(token: SpiceToken | undefined): string | undefined {
  if (token === undefined) return undefined
  if ("value" in token && typeof token.value === "string") return token.value
  return token.raw
}

export function groupSpiceBlocks(
  cards: SpiceLogicalCard[],
): SpiceLogicalCard[] {
  const grouped: SpiceLogicalCard[] = []

  for (let i = 0; i < cards.length; i += 1) {
    const card = cards[i]
    if (card === undefined) continue
    const head = cardHead(card)

    if (head === ".control") {
      const childCards: SpiceLogicalCard[] = []
      let endCard: SpiceLogicalCard | undefined
      let originalSource = card.originalSource
      for (i += 1; i < cards.length; i += 1) {
        const next = cards[i]
        if (next === undefined) continue
        originalSource = `${originalSource}${next.leadingNewlineRaw ?? "\n"}${next.originalSource}`
        if (cardHead(next) === ".endc") {
          endCard = next
          break
        }
        childCards.push(next)
      }
      grouped.push({ ...card, childCards, endCard, originalSource })
      continue
    }

    if (head === ".subckt") {
      const childCards: SpiceLogicalCard[] = []
      let endCard: SpiceLogicalCard | undefined
      let originalSource = card.originalSource
      for (i += 1; i < cards.length; i += 1) {
        const next = cards[i]
        if (next === undefined) continue
        originalSource = `${originalSource}${next.leadingNewlineRaw ?? "\n"}${next.originalSource}`
        if (cardHead(next) === ".ends") {
          endCard = next
          break
        }
        childCards.push(next)
      }
      grouped.push({ ...card, childCards, endCard, originalSource })
      continue
    }

    grouped.push(card)
  }

  return grouped
}

export function cardHead(card: SpiceLogicalCard): string | undefined {
  const [head] = significantTokens(card.tokens)
  if (head === undefined) return undefined
  if (head.type === "directive") return `.${head.value}`
  return tokenValue(head)
}

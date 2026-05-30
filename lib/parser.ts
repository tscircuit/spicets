import { SpiceCard, type SpiceParseOptions } from "./ast"
import { End, Subckt, ControlBlock } from "./directives"
import { SpiceLibrary, SpiceNetlist, type SpiceCardInput } from "./roots"
import {
  significantTokens,
  tokenizeSpice,
  tokenValue,
  tokensToLogicalCards,
  type SpiceLogicalCard,
} from "./tokens"

export function parseSpiceNetlist(
  source: string,
  options: SpiceParseOptions = {},
): SpiceNetlist {
  const split = splitSource(source)
  const logicalCards = tokenizeToLogicalCards(source)
  const firstCard = logicalCards[0]
  const title =
    firstCard !== undefined && isTitleCard(firstCard)
      ? firstCard.originalSource
      : undefined
  const bodyCards = title === undefined ? logicalCards : logicalCards.slice(1)
  const cards = parseLogicalCards(bodyCards, options)
  const endIndex = cards.findIndex((card) => card instanceof End)
  const end = endIndex === -1 ? undefined : (cards.splice(endIndex, 1)[0] as End)

  return new SpiceNetlist({
    title,
    cards,
    end: end ?? false,
    dialect: options.dialect,
    trailingNewline: split.trailingNewline,
    lineEnding: split.lineEnding,
  })
}

export function parseSpiceLibrary(
  source: string,
  options: SpiceParseOptions = {},
): SpiceLibrary {
  const split = splitSource(source)
  return new SpiceLibrary({
    cards: parseSpiceCards(source, options),
    dialect: options.dialect,
    trailingNewline: split.trailingNewline,
    lineEnding: split.lineEnding,
  })
}

export function parseSpiceCards(
  source: string,
  options: SpiceParseOptions = {},
): SpiceCardInput[] {
  return parseLogicalCards(tokenizeToLogicalCards(source), options)
}

export function parseSpiceCard(
  source: string,
  _options: SpiceParseOptions = {},
): SpiceCardInput {
  const [card] = tokenizeToLogicalCards(source)
  if (card === undefined) {
    return SpiceCard.parseSpiceTokens({
      tokens: [],
      originalSource: source,
      range: {
        start: { offset: 0, line: 1, column: 1 },
        end: { offset: source.length, line: 1, column: source.length + 1 },
      },
    }) as SpiceCardInput
  }
  return SpiceCard.parseSpiceTokens(card) as SpiceCardInput
}

function parseLogicalCards(
  logicalCards: SpiceLogicalCard[],
  _options: SpiceParseOptions,
): SpiceCardInput[] {
  const cards: SpiceCardInput[] = []

  for (let i = 0; i < logicalCards.length; i += 1) {
    const card = logicalCards[i]
    if (card === undefined) continue
    const head = cardHead(card)

    if (head === ".control") {
      const lines: string[] = []
      let originalSource = card.originalSource
      for (i += 1; i < logicalCards.length; i += 1) {
        const next = logicalCards[i]
        if (next === undefined) continue
        originalSource += `\n${next.originalSource}`
        if (cardHead(next) === ".endc") break
        lines.push(next.originalSource)
      }
      cards.push(new ControlBlock({ lines, originalSource }))
      continue
    }

    if (head === ".subckt") {
      const subckt = Subckt.fromSpiceTokens(card)
      let originalSource = card.originalSource
      for (i += 1; i < logicalCards.length; i += 1) {
        const next = logicalCards[i]
        if (next === undefined) continue
        originalSource += `\n${next.originalSource}`
        if (cardHead(next) === ".ends") {
          subckt.endsName = cardArgs(next)[0]
          break
        }
        subckt.cards.push(SpiceCard.parseSpiceTokens(next) as SpiceCardInput)
      }
      subckt.originalSource = originalSource
      cards.push(subckt)
      continue
    }

    cards.push(SpiceCard.parseSpiceTokens(card) as SpiceCardInput)
  }

  return cards
}

function tokenizeToLogicalCards(source: string): SpiceLogicalCard[] {
  const result = tokenizeSpice(source, {
    preserveWhitespace: true,
    preserveComments: true,
    normalizeNumbers: true,
  })
  return mergeContinuationCards(tokensToLogicalCards(result.tokens))
}

function mergeContinuationCards(cards: SpiceLogicalCard[]): SpiceLogicalCard[] {
  const merged: SpiceLogicalCard[] = []
  for (const card of cards) {
    const first = significantTokens(card.tokens)[0]
    if (first?.type === "continuation" && merged.length > 0) {
      const previous = merged.at(-1)!
      previous.tokens.push(...card.tokens)
      previous.originalSource = `${previous.originalSource}\n${card.originalSource}`
      previous.range.end = card.range.end
      continue
    }
    merged.push(card)
  }
  return merged
}

function cardHead(card: SpiceLogicalCard): string | undefined {
  const [head] = significantTokens(card.tokens)
  if (head === undefined) return undefined
  if (head.type === "directive") return `.${head.value}`
  return tokenValue(head)?.toString()
}

function cardArgs(card: SpiceLogicalCard): string[] {
  return significantTokens(card.tokens)
    .slice(1)
    .map((token) => tokenValue(token) ?? token.raw)
}

function isTitleCard(card: SpiceLogicalCard): boolean {
  const tokens = significantTokens(card.tokens)
  const [head] = tokens
  if (head === undefined) return false
  if (head.type === "directive" || head.type === "comment") return false
  if (head.type !== "identifier") return false
  return tokens.length === 1
}

function splitSource(source: string): {
  trailingNewline: boolean
  lineEnding: "\n" | "\r\n" | "\r"
} {
  const lineEnding = source.includes("\r\n")
    ? "\r\n"
    : source.includes("\r")
      ? "\r"
      : "\n"
  const trailingNewline =
    lineEnding === "\r\n"
      ? source.endsWith("\r\n")
      : source.endsWith(lineEnding)
  return { trailingNewline, lineEnding }
}

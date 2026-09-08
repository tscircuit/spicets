import "./registerAll"
import { SpiceCard, type SpiceParseOptions } from "./ast"
import { End } from "./directives"
import {
  LibSection,
  SpiceLibrary,
  SpiceNetlist,
  type SpiceCardInput,
} from "./roots"
import { SpiceTokenCard } from "./tokens/fromTokens"
import {
  groupSpiceBlocks,
  significantTokens,
  tokenizeSpice,
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
  const end =
    endIndex === -1 ? undefined : (cards.splice(endIndex, 1)[0] as End)

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
  const logicalCards = tokenizeToLogicalCards(source)
  const cards: SpiceCardInput[] = []
  const sections: LibSection[] = []
  const sourceOrder: Array<"card" | "section"> = []
  for (let index = 0; index < logicalCards.length; index += 1) {
    const card = logicalCards[index]!
    const tokens = SpiceTokenCard.from(card)
    const contentTokens = tokens.tokens.filter(
      (token) => token.type !== "comment",
    )
    if (
      tokens.headRaw().toLowerCase() === ".lib" &&
      contentTokens.length === 2
    ) {
      let endIndex = index + 1
      while (
        endIndex < logicalCards.length &&
        SpiceTokenCard.from(logicalCards[endIndex]!).headRaw().toLowerCase() !==
          ".endl"
      )
        endIndex += 1
      if (endIndex < logicalCards.length) {
        sections.push(
          new LibSection({
            name: tokens.arg(0) ?? "",
            cards: parseLogicalCards(
              logicalCards.slice(index + 1, endIndex),
              options,
            ),
            lineEnding: split.lineEnding,
            originalHeader: card.originalSource,
            originalEnd: logicalCards[endIndex]!.originalSource,
          }),
        )
        sourceOrder.push("section")
        index = endIndex
        continue
      }
    }
    cards.push(...parseLogicalCards([card], options))
    sourceOrder.push("card")
  }
  return new SpiceLibrary({
    cards,
    sections,
    sourceOrder,
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
  return logicalCards.map(
    (card) => SpiceCard.parseSpiceTokens(card) as SpiceCardInput,
  )
}

function tokenizeToLogicalCards(source: string): SpiceLogicalCard[] {
  const result = tokenizeSpice(source, {
    preserveWhitespace: true,
    preserveComments: true,
    normalizeNumbers: true,
  })
  return groupSpiceBlocks(tokensToLogicalCards(result.tokens))
}

function isTitleCard(card: SpiceLogicalCard): boolean {
  const tokens = significantTokens(card.tokens)
  const [head] = tokens
  if (head === undefined) return false
  if (head.type === "directive" || head.type === "comment") return false
  if (head.type !== "identifier") return false
  if (tokens.length === 1) return true
  return SpiceCard.classes[head.raw[0]?.toLowerCase() ?? ""] === undefined
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

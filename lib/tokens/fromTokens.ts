import type { SpiceLogicalCard, SpiceToken } from "./types"
import { significantTokens, tokenValue } from "./logicalCards"

export function cardOriginalSource(card: SpiceLogicalCard): string {
  return card.originalSource
}

export function cardTokens(card: SpiceLogicalCard): SpiceToken[] {
  return significantTokens(card.tokens)
}

export function tokenStrings(card: SpiceLogicalCard): string[] {
  return cardTokens(card).map((token) => tokenValue(token) ?? token.raw)
}

export function tokenRawStrings(card: SpiceLogicalCard): string[] {
  return cardTokens(card).map((token) => token.raw)
}

export function directiveArgs(card: SpiceLogicalCard): string[] {
  return tokenStrings(card).slice(1)
}

export function elementName(card: SpiceLogicalCard): string {
  return tokenValue(cardTokens(card)[0]) ?? ""
}

export function elementArgs(card: SpiceLogicalCard): string[] {
  return tokenStrings(card).slice(1)
}

export function parseParamTokenStrings(tokens: string[]): Array<[string, string]> {
  const entries: Array<[string, string]> = []
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i]
    if (token === undefined || token === "(" || token === ")") continue
    const equalsIndex = token.indexOf("=")
    if (equalsIndex > 0) {
      entries.push([
        token.slice(0, equalsIndex).replace(/^\(/, ""),
        token.slice(equalsIndex + 1).replace(/\)$/, ""),
      ])
      continue
    }
    if (tokens[i + 1] === "=" && tokens[i + 2] !== undefined) {
      entries.push([token.replace(/^\(/, ""), tokens[i + 2]!.replace(/\)$/, "")])
      i += 2
    }
  }
  return entries
}

export class SpiceTokenCard {
  readonly tokens: SpiceToken[]
  readonly originalSource: string

  private constructor(private readonly card: SpiceLogicalCard) {
    this.tokens = cardTokens(card)
    this.originalSource = cardOriginalSource(card)
  }

  static from(card: SpiceLogicalCard): SpiceTokenCard {
    return new SpiceTokenCard(card)
  }

  head(): string {
    return tokenValue(this.tokens[0]) ?? ""
  }

  headRaw(): string {
    return this.tokens[0]?.raw ?? ""
  }

  headDesignator(): string {
    return this.tokens[0]?.raw[0]?.toUpperCase() ?? ""
  }

  arg(index: number): string | undefined {
    return tokenValue(this.tokens[index + 1])
  }

  args(): string[] {
    return this.tokens.slice(1).map((token) => tokenValue(token) ?? token.raw)
  }

  argsAfter(index: number): string[] {
    return this.args().slice(index)
  }

  argsUntilLast(): string[] {
    return this.args().slice(0, -1)
  }

  lastArg(): string | undefined {
    return this.args().at(-1)
  }

  keywordIndex(keyword: string): number {
    return this.args().findIndex(
      (arg) => arg.toLowerCase() === keyword.toLowerCase(),
    )
  }

  argAfterKeyword(keyword: string): string | undefined {
    const index = this.keywordIndex(keyword)
    return index === -1 ? undefined : this.arg(index + 1)
  }

  hasKeyword(keyword: string): boolean {
    return this.keywordIndex(keyword) !== -1
  }

  sweepArg(index: number, fallback: "dec" | "oct" | "lin"): "dec" | "oct" | "lin" {
    const value = this.arg(index)?.toLowerCase()
    return value === "oct" || value === "lin" || value === "dec" ? value : fallback
  }

  paramsAfter(index: number): Array<[string, string]> {
    return parseParamTokenStrings(this.argsAfter(index))
  }

  paramsAfterKeyword(keyword: string): Array<[string, string]> | undefined {
    const index = this.keywordIndex(keyword)
    return index === -1 ? undefined : parseParamTokenStrings(this.argsAfter(index + 1))
  }

  argsBeforeKeyword(keyword: string, startIndex = 0): string[] {
    const args = this.args()
    const index = args.findIndex(
      (arg, i) => i >= startIndex && arg.toLowerCase() === keyword.toLowerCase(),
    )
    return index === -1 ? args.slice(startIndex) : args.slice(startIndex, index)
  }

  restJoined(startIndex: number): string {
    return this.argsAfter(startIndex).join(" ")
  }
}

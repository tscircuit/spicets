import type { SpiceLogicalCard, SpiceToken } from "./types"
import { significantTokens, tokenValue } from "./logicalCards"

type KeywordMatch = {
  argIndex: number
  tokenIndex: number
  tokenCount: number
}

function tokenText(token: SpiceToken | undefined): string | undefined {
  return tokenValue(token)
}

function isIgnorableParamToken(token: SpiceToken): boolean {
  return (
    token.type === "punctuation" &&
    (token.value === "(" || token.value === ")" || token.value === ",")
  )
}

export class SpiceTokenCard {
  readonly tokens: SpiceToken[]
  readonly originalSource: string

  private constructor(private readonly card: SpiceLogicalCard) {
    this.tokens = significantTokens(card.tokens)
    this.originalSource = card.originalSource
  }

  static from(card: SpiceLogicalCard): SpiceTokenCard {
    return new SpiceTokenCard(card)
  }

  head(): string {
    return tokenText(this.tokens[0]) ?? ""
  }

  headRaw(): string {
    return this.tokens[0]?.raw ?? ""
  }

  headDesignator(): string {
    return this.tokens[0]?.raw[0]?.toUpperCase() ?? ""
  }

  arg(index: number): string | undefined {
    return tokenText(this.tokens[index + 1])
  }

  args(): string[] {
    return this.tokens.slice(1).map((token) => tokenText(token) ?? token.raw)
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
    return this.findKeyword(keyword)?.argIndex ?? -1
  }

  argAfterKeyword(keyword: string): string | undefined {
    const match = this.findKeyword(keyword)
    return match === undefined
      ? undefined
      : tokenText(this.tokens[match.tokenIndex + match.tokenCount])
  }

  hasKeyword(keyword: string): boolean {
    return this.findKeyword(keyword) !== undefined
  }

  sweepArg(
    index: number,
    fallback: "dec" | "oct" | "lin",
  ): "dec" | "oct" | "lin" {
    const value = this.arg(index)?.toLowerCase()
    return value === "oct" || value === "lin" || value === "dec"
      ? value
      : fallback
  }

  paramsAfter(index: number): Array<[string, string]> {
    return this.readParamsFrom(1 + index)
  }

  paramsAfterKeyword(keyword: string): Array<[string, string]> | undefined {
    const match = this.findKeyword(keyword)
    if (match === undefined) return undefined
    return this.readParamsFrom(match.tokenIndex + match.tokenCount)
  }

  argsBeforeKeyword(keyword: string, startIndex = 0): string[] {
    const match = this.findKeyword(keyword, startIndex)
    const endTokenIndex = match?.tokenIndex ?? this.tokens.length
    return this.tokens
      .slice(1 + startIndex, endTokenIndex)
      .map((token) => tokenText(token) ?? token.raw)
  }

  restJoined(startIndex: number): string {
    return this.argsAfter(startIndex).join(" ")
  }

  private findKeyword(
    keyword: string,
    startArgIndex = 0,
  ): KeywordMatch | undefined {
    const keywordHasColon = keyword.endsWith(":")
    const keywordName = keywordHasColon ? keyword.slice(0, -1) : keyword

    for (
      let tokenIndex = 1 + startArgIndex;
      tokenIndex < this.tokens.length;
      tokenIndex += 1
    ) {
      const token = this.tokens[tokenIndex]
      const value = tokenText(token)
      if (value === undefined) continue
      if (value.toLowerCase() !== keywordName.toLowerCase()) continue

      if (keywordHasColon) {
        const next = this.tokens[tokenIndex + 1]
        if (next?.type !== "punctuation" || next.value !== ":") continue
        return {
          argIndex: tokenIndex - 1,
          tokenIndex,
          tokenCount: 2,
        }
      }

      return {
        argIndex: tokenIndex - 1,
        tokenIndex,
        tokenCount: 1,
      }
    }

    return undefined
  }

  private readParamsFrom(tokenIndex: number): Array<[string, string]> {
    const entries: Array<[string, string]> = []
    let index = tokenIndex

    while (index < this.tokens.length) {
      const nameToken = this.tokens[index]
      if (nameToken === undefined) break
      if (isIgnorableParamToken(nameToken)) {
        index += 1
        continue
      }

      const equalsToken = this.tokens[index + 1]
      const valueToken = this.tokens[index + 2]
      if (
        equalsToken?.type === "operator" &&
        equalsToken.value === "=" &&
        valueToken !== undefined &&
        !isIgnorableParamToken(valueToken)
      ) {
        const name = tokenText(nameToken)
        const value = tokenText(valueToken)
        if (name !== undefined && value !== undefined)
          entries.push([name, value])
        index += 3
        continue
      }

      index += 1
    }

    return entries
  }
}

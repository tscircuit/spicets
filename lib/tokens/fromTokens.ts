import { significantTokens, tokenValue } from "./logicalCards"
import type { SpiceLogicalCard, SpiceToken } from "./types"

type KeywordMatch = {
  argIndex: number
  tokenIndex: number
  tokenCount: number
}

const abmForms = new Set(["VALUE", "TABLE", "LAPLACE", "FREQ", "CHEBYSHEV"])

function tokenText(token: SpiceToken | undefined): string | undefined {
  return tokenValue(token)
}

function isIgnorableParamToken(token: SpiceToken): boolean {
  return (
    token.type === "punctuation" &&
    (token.value === "(" || token.value === ")" || token.value === ",")
  )
}

function isContiguousNodePart(token: SpiceToken): boolean {
  if (token.type === "punctuation" || token.type === "comment") return false
  if (token.type === "operator" && token.value === "=") return false
  return true
}

function readMergedGroup(
  tokens: SpiceToken[],
  startIndex: number,
): { token: SpiceToken; nextIndex: number } {
  const first = tokens[startIndex]!
  if (!isContiguousNodePart(first)) {
    return { token: first, nextIndex: startIndex + 1 }
  }
  const group: SpiceToken[] = [first]
  let idx = startIndex
  while (idx + 1 < tokens.length) {
    const prev = group.at(-1)!
    const next = tokens[idx + 1]!
    if (prev.range.end.offset !== next.range.start.offset) break
    if (!isContiguousNodePart(next)) break
    group.push(next)
    idx += 1
  }
  if (group.length === 1) {
    return { token: first, nextIndex: idx + 1 }
  }
  const raw = group.map((t) => t.raw).join("")
  return {
    token: {
      type: "identifier",
      raw,
      value: raw,
      range: {
        start: first.range.start,
        end: group.at(-1)!.range.end,
      },
    },
    nextIndex: idx + 1,
  }
}

function mergeCardNodeTokens(tokens: SpiceToken[]): SpiceToken[] {
  if (tokens.length <= 1) return tokens
  const head = tokens[0]!

  if (head.type === "directive") {
    if (head.value.toLowerCase() !== "subckt") return tokens
    const result: SpiceToken[] = [head]
    let idx = 1
    while (idx < tokens.length) {
      const nextTok = tokens[idx + 1]
      if (
        tokens[idx]?.raw.toLowerCase() === "params" &&
        nextTok?.type === "punctuation" &&
        nextTok.value === ":"
      ) {
        break
      }
      const { token, nextIndex } = readMergedGroup(tokens, idx)
      const afterGroup = tokens[nextIndex]
      if (afterGroup?.type === "operator" && afterGroup.value === "=") {
        break
      }
      result.push(token)
      idx = nextIndex
    }
    result.push(...tokens.slice(idx))
    return result
  }

  if (head.type !== "identifier") return tokens

  const designator = head.raw[0]?.toUpperCase() ?? ""
  let targetNodes =
    designator === "M" || designator === "Q"
      ? 4
      : designator === "X"
        ? Number.POSITIVE_INFINITY
        : 2

  const result: SpiceToken[] = [head]
  let idx = 1
  let nodesRead = 0

  while (idx < tokens.length && nodesRead < targetNodes) {
    const { token, nextIndex } = readMergedGroup(tokens, idx)
    if (
      tokens[nextIndex]?.type === "operator" &&
      tokens[nextIndex]?.value === "="
    ) {
      break
    }
    result.push(token)
    idx = nextIndex
    nodesRead += 1

    if (
      (designator === "E" || designator === "G") &&
      nodesRead === 2 &&
      targetNodes === 2 &&
      idx < tokens.length
    ) {
      const peek = readMergedGroup(tokens, idx)
      if (!abmForms.has(peek.token.raw.toUpperCase())) {
        targetNodes = 4
      }
    }
  }

  result.push(...tokens.slice(idx))
  return result
}

export class SpiceTokenCard {
  readonly tokens: SpiceToken[]
  readonly originalSource: string

  private constructor(private readonly card: SpiceLogicalCard) {
    this.tokens = mergeCardNodeTokens(significantTokens(card.tokens))
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

  paramAfter(index: number, name: string): string | undefined {
    const lowerName = name.toLowerCase()
    return this.paramsAfter(index).find(
      ([key]) => key.toLowerCase() === lowerName,
    )?.[1]
  }

  paramsAfterExcept(index: number, names: string[]): Array<[string, string]> {
    const lowerNames = new Set(names.map((name) => name.toLowerCase()))
    return this.paramsAfter(index).filter(
      ([key]) => !lowerNames.has(key.toLowerCase()),
    )
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

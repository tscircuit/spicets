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

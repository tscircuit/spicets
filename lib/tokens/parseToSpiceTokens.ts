import { tokenizeSpice } from "./tokenizeSpice"
import type { SpiceTokenizerOptions } from "./types"

export function parseToSpiceTokens(source: string, options?: SpiceTokenizerOptions) {
  return tokenizeSpice(source, options)
}

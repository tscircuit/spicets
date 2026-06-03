import type { SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  IndependentSource,
  parseIndependentSourceValues,
} from "./IndependentSource"

export class CurrentSource extends IndependentSource {
  static spiceTokenKeys = ["I"]
  readonly type = "current_source" as const

  static fromSpiceTokens(card: SpiceLogicalCard): CurrentSource {
    const tokens = SpiceTokenCard.from(card)
    const sourceValues = parseIndependentSourceValues(tokens)
    return new CurrentSource({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      dc: sourceValues.dc,
      ac: sourceValues.ac,
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}
IndependentSource.register(CurrentSource)

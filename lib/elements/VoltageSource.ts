import type { SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  IndependentSource,
  parseIndependentSourceValues,
} from "./IndependentSource"

export class VoltageSource extends IndependentSource {
  static spiceTokenKeys = ["V"]
  readonly type = "voltage_source" as const

  static fromSpiceTokens(card: SpiceLogicalCard): VoltageSource {
    const tokens = SpiceTokenCard.from(card)
    const sourceValues = parseIndependentSourceValues(tokens)
    return new VoltageSource({
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
IndependentSource.register(VoltageSource)

import type { SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { IndependentSource } from "./IndependentSource"

export class VoltageSource extends IndependentSource {
  static spiceTokenKeys = ["V"]
  readonly type = "voltage_source" as const

  static fromSpiceTokens(card: SpiceLogicalCard): VoltageSource {
    const tokens = SpiceTokenCard.from(card)
    return new VoltageSource({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      dc: tokens.argAfterKeyword("dc") ?? tokens.arg(2),
      ac: tokens.argAfterKeyword("ac"),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}
IndependentSource.register(VoltageSource)

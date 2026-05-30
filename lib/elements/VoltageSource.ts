import type { SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
import { IndependentSource } from "./IndependentSource"

export class VoltageSource extends IndependentSource {
  static spiceTokenKeys = ["V"]
  readonly type = "voltage_source" as const

  static fromSpiceTokens(card: SpiceLogicalCard): VoltageSource {
    const args = elementArgs(card)
    const sourceArgs = args.slice(2)
    const dcIndex = sourceArgs.findIndex((arg) => arg.toLowerCase() === "dc")
    const acIndex = sourceArgs.findIndex((arg) => arg.toLowerCase() === "ac")
    return new VoltageSource({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? ""],
      dc: dcIndex === -1 ? sourceArgs[0] : sourceArgs[dcIndex + 1],
      ac: acIndex === -1 ? undefined : sourceArgs[acIndex + 1],
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(this.sourceParts(), options)
  }
}
IndependentSource.register(VoltageSource)

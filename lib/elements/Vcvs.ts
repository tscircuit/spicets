import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Vcvs extends ElementCard {
  readonly type = "vcvs" as const
  gain: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    control: [NodeRefInput, NodeRefInput]
    gain: SpiceValueInput
  }) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.gain = normalizeValue(init.gain)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Vcvs {
    const args = elementArgs(card)
    return new Vcvs({
      name: elementName(card),
      output: [args[0] ?? "", args[1] ?? ""],
      control: [args[2] ?? "", args[3] ?? ""],
      gain: args[4] ?? "",
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.gain.getString()],
      options,
    )
  }
}

import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class SubcktInstance extends ElementCard {
  static spiceTokenKeys = ["X"]
  readonly type = "subckt_instance" as const
  subckt: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: NodeRefInput[]
    subckt: string
    params?: ParamsInput
  }) {
    super(init)
    this.subckt = init.subckt
  }

  static fromSpiceTokens(card: SpiceLogicalCard): SubcktInstance {
    const tokens = SpiceTokenCard.from(card)
    return new SubcktInstance({
      name: tokens.head(),
      nodes: tokens.argsUntilLast(),
      subckt: tokens.lastArg() ?? "",
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.subckt],
      options,
    )
  }
}
ElementCard.register(SubcktInstance)

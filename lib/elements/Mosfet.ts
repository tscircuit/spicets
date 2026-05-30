import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Mosfet extends ElementCard {
  static spiceTokenKeys = ["M"]
  readonly type = "mosfet" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [drain: NodeRefInput, gate: NodeRefInput, source: NodeRefInput, bulk: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super(init)
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Mosfet {
    const tokens = SpiceTokenCard.from(card)
    return new Mosfet({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? "", tokens.arg(2) ?? "", tokens.arg(3) ?? ""],
      model: tokens.arg(4) ?? "",
      params: tokens.paramsAfter(5),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}
ElementCard.register(Mosfet)

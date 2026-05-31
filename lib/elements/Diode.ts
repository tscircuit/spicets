import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Diode extends ElementCard {
  static spiceTokenKeys = ["D"]
  readonly type = "diode" as const
  model: string

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      model: string
      params?: ParamsInput
    },
  ) {
    super(init)
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Diode {
    const tokens = SpiceTokenCard.from(card)
    return new Diode({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      model: tokens.arg(2) ?? "",
      params: tokens.paramsAfter(3),
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
ElementCard.register(Diode)

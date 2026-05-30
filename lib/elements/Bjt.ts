import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Bjt extends ElementCard {
  static spiceTokenKeys = ["Q"]
  readonly type = "bjt" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [collector: NodeRefInput, base: NodeRefInput, emitter: NodeRefInput, substrate?: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Bjt {
    const tokens = SpiceTokenCard.from(card)
    const hasSubstrate = tokens.args().length > 4
    const nodes: [string, string, string, string?] = hasSubstrate
      ? [tokens.arg(0) ?? "", tokens.arg(1) ?? "", tokens.arg(2) ?? "", tokens.arg(3) ?? ""]
      : [tokens.arg(0) ?? "", tokens.arg(1) ?? "", tokens.arg(2) ?? ""]
    const modelIndex = hasSubstrate ? 4 : 3
    return new Bjt({
      name: tokens.head(),
      nodes,
      model: tokens.arg(modelIndex) ?? "",
      params: tokens.paramsAfter(modelIndex + 1),
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
ElementCard.register(Bjt)

import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Mosfet extends ElementCard {
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
    const args = elementArgs(card)
    return new Mosfet({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? "", args[2] ?? "", args[3] ?? ""],
      model: args[4] ?? "",
      params: parseParamTokenStrings(args.slice(5)),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

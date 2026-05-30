import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Diode extends ElementCard {
  static spiceTokenKeys = ["D"]
  readonly type = "diode" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super(init)
    this.model = init.model
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Diode {
    const args = elementArgs(card)
    return new Diode({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? ""],
      model: args[2] ?? "",
      params: parseParamTokenStrings(args.slice(3)),
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
ElementCard.register(Diode)

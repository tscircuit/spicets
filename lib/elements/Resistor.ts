import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type ParamsInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Resistor extends ElementCard {
  readonly type = "resistor" as const
  resistance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    resistance: SpiceValueInput
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.resistance = normalizeValue(init.resistance)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Resistor {
    const args = elementArgs(card)
    return new Resistor({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? ""],
      resistance: args[2] ?? "",
      params: parseParamTokenStrings(args.slice(3)),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.resistance.getString()],
      options,
    )
  }
}

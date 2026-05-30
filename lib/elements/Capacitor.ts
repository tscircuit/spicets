import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type ParamsInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Capacitor extends ElementCard {
  static spiceTokenKeys = ["C"]
  readonly type = "capacitor" as const
  capacitance: SpiceValue
  initialCondition?: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    capacitance: SpiceValueInput
    ic?: SpiceValueInput
    params?: ParamsInput
  }) {
    super(init)
    this.capacitance = normalizeValue(init.capacitance)
    this.initialCondition =
      init.ic === undefined ? undefined : normalizeValue(init.ic)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Capacitor {
    const args = elementArgs(card)
    return new Capacitor({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? ""],
      capacitance: args[2] ?? "",
      params: parseParamTokenStrings(args.slice(3)),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.capacitance.getString(),
        this.initialCondition === undefined
          ? undefined
          : `IC=${this.initialCondition.getString()}`,
      ],
      options,
    )
  }
}
ElementCard.register(Capacitor)

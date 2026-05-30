import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName, parseParamTokenStrings } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type ParamsInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Inductor extends ElementCard {
  readonly type = "inductor" as const
  inductance: SpiceValue
  initialCondition?: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [NodeRefInput, NodeRefInput]
    inductance: SpiceValueInput
    ic?: SpiceValueInput
    params?: ParamsInput
  }) {
    super(init)
    this.inductance = normalizeValue(init.inductance)
    this.initialCondition =
      init.ic === undefined ? undefined : normalizeValue(init.ic)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Inductor {
    const args = elementArgs(card)
    return new Inductor({
      name: elementName(card),
      nodes: [args[0] ?? "", args[1] ?? ""],
      inductance: args[2] ?? "",
      params: parseParamTokenStrings(args.slice(3)),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.inductance.getString(),
        this.initialCondition === undefined
          ? undefined
          : `IC=${this.initialCondition.getString()}`,
      ],
      options,
    )
  }
}

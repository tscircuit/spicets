import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type ParamsInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Inductor extends ElementCard {
  static spiceTokenKeys = ["L"]
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
    const tokens = SpiceTokenCard.from(card)
    return new Inductor({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      inductance: tokens.arg(2) ?? "",
      params: tokens.paramsAfter(3),
      originalSource: tokens.originalSource,
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
ElementCard.register(Inductor)

import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  SpiceValue,
  type NodeRefInput,
  type ParamsInput,
  type SpiceValueInput,
  normalizeValue,
} from "../values"
import { ElementCard } from "./ElementCard"

export class Resistor extends ElementCard {
  static spiceTokenKeys = ["R"]
  readonly type = "resistor" as const
  resistance: SpiceValue

  constructor(
    init: SpiceNodeInit & {
      name: string
      nodes: [NodeRefInput, NodeRefInput]
      resistance: SpiceValueInput
      params?: ParamsInput
    },
  ) {
    super({
      ...init,
      nodes: init.nodes.filter(
        (node): node is NodeRefInput => node !== undefined,
      ),
    })
    this.resistance = normalizeValue(init.resistance)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Resistor {
    const tokens = SpiceTokenCard.from(card)
    return new Resistor({
      name: tokens.head(),
      nodes: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      resistance: tokens.arg(2) ?? "",
      params: tokens.paramsAfter(3),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.resistance.getString(),
      ],
      options,
    )
  }
}
ElementCard.register(Resistor)

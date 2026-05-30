import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
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

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.resistance.getString()],
      options,
    )
  }
}

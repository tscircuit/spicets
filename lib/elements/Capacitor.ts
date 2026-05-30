import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import { SpiceValue, type NodeRefInput, type ParamsInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Capacitor extends ElementCard {
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

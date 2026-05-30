import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
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

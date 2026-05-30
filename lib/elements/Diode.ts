import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Diode extends ElementCard {
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

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

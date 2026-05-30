import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Mosfet extends ElementCard {
  readonly type = "mosfet" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [drain: NodeRefInput, gate: NodeRefInput, source: NodeRefInput, bulk: NodeRefInput]
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

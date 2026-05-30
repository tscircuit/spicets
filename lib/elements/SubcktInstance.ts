import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class SubcktInstance extends ElementCard {
  readonly type = "subckt_instance" as const
  subckt: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: NodeRefInput[]
    subckt: string
    params?: ParamsInput
  }) {
    super(init)
    this.subckt = init.subckt
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.subckt],
      options,
    )
  }
}

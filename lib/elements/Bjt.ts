import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { NodeRefInput, ParamsInput } from "../values"
import { ElementCard } from "./ElementCard"

export class Bjt extends ElementCard {
  readonly type = "bjt" as const
  model: string

  constructor(init: SpiceNodeInit & {
    name: string
    nodes: [collector: NodeRefInput, base: NodeRefInput, emitter: NodeRefInput, substrate?: NodeRefInput]
    model: string
    params?: ParamsInput
  }) {
    super({
      ...init,
      nodes: init.nodes.filter((node): node is NodeRefInput => node !== undefined),
    })
    this.model = init.model
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.model],
      options,
    )
  }
}

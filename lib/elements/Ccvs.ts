import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Ccvs extends ElementCard {
  readonly type = "ccvs" as const
  source: string
  transresistance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    source: string
    transresistance: SpiceValueInput
  }) {
    super({ ...init, nodes: init.output })
    this.source = init.source
    this.transresistance = normalizeValue(init.transresistance)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.source,
        this.transresistance.getString(),
      ],
      options,
    )
  }
}

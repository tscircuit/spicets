import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Cccs extends ElementCard {
  readonly type = "cccs" as const
  source: string
  gain: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    source: string
    gain: SpiceValueInput
  }) {
    super({ ...init, nodes: init.output })
    this.source = init.source
    this.gain = normalizeValue(init.gain)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.source,
        this.gain.getString(),
      ],
      options,
    )
  }
}

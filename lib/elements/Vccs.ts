import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Vccs extends ElementCard {
  readonly type = "vccs" as const
  transconductance: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    control: [NodeRefInput, NodeRefInput]
    transconductance: SpiceValueInput
  }) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.transconductance = normalizeValue(init.transconductance)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [
        this.name,
        ...this.nodes.map((node) => node.getString()),
        this.transconductance.getString(),
      ],
      options,
    )
  }
}

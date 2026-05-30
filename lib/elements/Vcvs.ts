import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Vcvs extends ElementCard {
  readonly type = "vcvs" as const
  gain: SpiceValue

  constructor(init: SpiceNodeInit & {
    name: string
    output: [NodeRefInput, NodeRefInput]
    control: [NodeRefInput, NodeRefInput]
    gain: SpiceValueInput
  }) {
    super({ ...init, nodes: [...init.output, ...init.control] })
    this.gain = normalizeValue(init.gain)
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts(
      [this.name, ...this.nodes.map((node) => node.getString()), this.gain.getString()],
      options,
    )
  }
}

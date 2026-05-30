import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Vccs extends ElementCard {
  static spiceTokenKeys = ["G"]
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

  static fromSpiceTokens(card: SpiceLogicalCard): Vccs {
    const tokens = SpiceTokenCard.from(card)
    return new Vccs({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      control: [tokens.arg(2) ?? "", tokens.arg(3) ?? ""],
      transconductance: tokens.arg(4) ?? "",
      originalSource: tokens.originalSource,
    })
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
ElementCard.register(Vccs)

import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
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
    const args = elementArgs(card)
    return new Vccs({
      name: elementName(card),
      output: [args[0] ?? "", args[1] ?? ""],
      control: [args[2] ?? "", args[3] ?? ""],
      transconductance: args[4] ?? "",
      originalSource: cardOriginalSource(card),
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

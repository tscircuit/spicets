import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Cccs extends ElementCard {
  static spiceTokenKeys = ["F"]
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

  static fromSpiceTokens(card: SpiceLogicalCard): Cccs {
    const args = elementArgs(card)
    return new Cccs({
      name: elementName(card),
      output: [args[0] ?? "", args[1] ?? ""],
      source: args[2] ?? "",
      gain: args[3] ?? "",
      originalSource: cardOriginalSource(card),
    })
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
ElementCard.register(Cccs)

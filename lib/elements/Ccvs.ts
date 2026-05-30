import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type NodeRefInput, type SpiceValueInput, normalizeValue } from "../values"
import { ElementCard } from "./ElementCard"

export class Ccvs extends ElementCard {
  static spiceTokenKeys = ["H"]
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

  static fromSpiceTokens(card: SpiceLogicalCard): Ccvs {
    const tokens = SpiceTokenCard.from(card)
    return new Ccvs({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      source: tokens.arg(2) ?? "",
      transresistance: tokens.arg(3) ?? "",
      originalSource: tokens.originalSource,
    })
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
ElementCard.register(Ccvs)

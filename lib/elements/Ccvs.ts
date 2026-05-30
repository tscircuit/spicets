import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
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

  static fromSpiceTokens(card: SpiceLogicalCard): Ccvs {
    const args = elementArgs(card)
    return new Ccvs({
      name: elementName(card),
      output: [args[0] ?? "", args[1] ?? ""],
      source: args[2] ?? "",
      transresistance: args[3] ?? "",
      originalSource: cardOriginalSource(card),
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

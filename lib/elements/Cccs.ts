import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import {
  SpiceValue,
  type NodeRefInput,
  type SpiceValueInput,
  normalizeValue,
} from "../values"
import { ElementCard } from "./ElementCard"

export class Cccs extends ElementCard {
  static spiceTokenKeys = ["F"]
  readonly type = "cccs" as const
  source: string
  gain: SpiceValue

  constructor(
    init: SpiceNodeInit & {
      name: string
      output: [NodeRefInput, NodeRefInput]
      source: string
      gain: SpiceValueInput
    },
  ) {
    super({ ...init, nodes: init.output })
    this.source = init.source
    this.gain = normalizeValue(init.gain)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Cccs {
    const tokens = SpiceTokenCard.from(card)
    return new Cccs({
      name: tokens.head(),
      output: [tokens.arg(0) ?? "", tokens.arg(1) ?? ""],
      source: tokens.arg(2) ?? "",
      gain: tokens.arg(3) ?? "",
      originalSource: tokens.originalSource,
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

import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import type { NodeRefInput } from "../values"
import { ElementCard } from "./ElementCard"

export class UnknownElementCard extends ElementCard {
  static spiceTokenKeys = ["__unknown_element__"]
  readonly type = "unknown_element" as const
  designator: string
  tokens: string[]

  constructor(
    init: SpiceNodeInit & {
      name: string
      designator: string
      nodes?: NodeRefInput[]
      tokens: string[]
    },
  ) {
    super(init)
    this.designator = init.designator
    this.tokens = init.tokens
  }

  static fromSpiceTokens(card: SpiceLogicalCard): UnknownElementCard {
    const tokens = SpiceTokenCard.from(card)
    const name = tokens.head()
    return new UnknownElementCard({
      name,
      designator: tokens.headDesignator(),
      tokens: tokens.args(),
      originalSource: tokens.originalSource,
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts([this.name, ...this.tokens], options)
  }
}
ElementCard.register(UnknownElementCard)

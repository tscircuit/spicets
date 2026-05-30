import type { SpiceNodeInit, SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, elementArgs, elementName } from "../tokens/fromTokens"
import type { NodeRefInput } from "../values"
import { ElementCard } from "./ElementCard"

export class UnknownElementCard extends ElementCard {
  static spiceTokenKeys = ["__unknown_element__"]
  readonly type = "unknown_element" as const
  designator: string
  tokens: string[]

  constructor(init: SpiceNodeInit & {
    name: string
    designator: string
    nodes?: NodeRefInput[]
    tokens: string[]
  }) {
    super(init)
    this.designator = init.designator
    this.tokens = init.tokens
  }

  static fromSpiceTokens(card: SpiceLogicalCard): UnknownElementCard {
    const name = elementName(card)
    return new UnknownElementCard({
      name,
      designator: name[0]?.toUpperCase() ?? "",
      tokens: elementArgs(card),
      originalSource: cardOriginalSource(card),
    })
  }

  toSource(options?: SpiceSerializeOptions): string {
    return this.formatParts([this.name, ...this.tokens], options)
  }
}
ElementCard.register(UnknownElementCard)

import { SpiceCard } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource } from "../tokens/fromTokens"

export class RawCard extends SpiceCard {
  readonly type = "raw_card" as const
  readonly cardKind = "raw" as const
  source: string

  constructor(source: string) {
    super({ originalSource: source })
    this.source = source
  }

  static fromSpiceTokens(card: SpiceLogicalCard): RawCard {
    return new RawCard(cardOriginalSource(card))
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.source
  }
}

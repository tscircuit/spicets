import { SpiceCard } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class RawCard extends SpiceCard {
  static spiceTokenKeys = ["raw", "error", "number", "operator", "punctuation"]
  readonly type = "raw_card" as const
  readonly cardKind = "raw" as const
  source: string

  constructor(source: string) {
    super({ originalSource: source })
    this.source = source
  }

  static fromSpiceTokens(card: SpiceLogicalCard): RawCard {
    return new RawCard(SpiceTokenCard.from(card).originalSource)
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.source
  }
}
SpiceCard.register(RawCard)

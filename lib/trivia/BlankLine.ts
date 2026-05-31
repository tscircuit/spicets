import { SpiceCard, SpiceTrivia } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class BlankLine extends SpiceTrivia {
  static spiceTokenKeys = ["blank"]
  readonly type = "blank" as const
  readonly cardKind = "blank" as const
  originalSource?: string

  constructor(init: { originalSource?: string } = {}) {
    super()
    this.originalSource = init.originalSource
  }

  static fromSpiceTokens(card: SpiceLogicalCard): BlankLine {
    return new BlankLine({
      originalSource: SpiceTokenCard.from(card).originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.originalSource ?? ""
  }
}
SpiceCard.register(BlankLine)

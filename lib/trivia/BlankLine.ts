import { SpiceTrivia } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource } from "../tokens/fromTokens"

export class BlankLine extends SpiceTrivia {
  readonly type = "blank" as const
  readonly cardKind = "blank" as const
  originalSource?: string

  constructor(init: { originalSource?: string } = {}) {
    super()
    this.originalSource = init.originalSource
  }

  static fromSpiceTokens(card: SpiceLogicalCard): BlankLine {
    return new BlankLine({ originalSource: cardOriginalSource(card) })
  }

  getChildren(): [] {
    return []
  }

  toSource(): string {
    return this.originalSource ?? ""
  }
}

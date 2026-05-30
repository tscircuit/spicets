import { SpiceTrivia, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, cardTokens } from "../tokens/fromTokens"

export class Comment extends SpiceTrivia {
  readonly type = "comment" as const
  readonly cardKind = "comment" as const
  text: string
  marker: "*" | ";" | "$"
  originalSource?: string

  constructor(text: string, init: { marker?: "*" | ";" | "$"; originalSource?: string } = {}) {
    super()
    this.text = text
    this.marker = init.marker ?? "*"
    this.originalSource = init.originalSource
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Comment {
    const [token] = cardTokens(card)
    if (token?.type === "comment") {
      return new Comment(token.value, {
        marker: token.marker,
        originalSource: cardOriginalSource(card),
      })
    }
    return new Comment(cardOriginalSource(card), {
      originalSource: cardOriginalSource(card),
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) {
      return this.originalSource
    }
    return `${this.marker} ${this.text}`.trimEnd()
  }
}

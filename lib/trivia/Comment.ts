import { SpiceCard, SpiceTrivia, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Comment extends SpiceTrivia {
  static spiceTokenKeys = ["comment"]
  readonly type = "comment" as const
  readonly cardKind = "comment" as const
  text: string
  marker: "*" | ";" | "$"
  originalSource?: string

  constructor(
    text: string,
    init: { marker?: "*" | ";" | "$"; originalSource?: string } = {},
  ) {
    super()
    this.text = text
    this.marker = init.marker ?? "*"
    this.originalSource = init.originalSource
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Comment {
    const tokens = SpiceTokenCard.from(card)
    const [token] = tokens.tokens
    if (token?.type === "comment") {
      return new Comment(token.value, {
        marker: token.marker,
        originalSource: tokens.originalSource,
      })
    }
    return new Comment(tokens.originalSource, {
      originalSource: tokens.originalSource,
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
SpiceCard.register(Comment)

import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Include extends DotCommand {
  static spiceTokenKeys = [".include"]
  readonly type = "include" as const
  command = ".include"
  path: string

  constructor(path: string | { path: string }, init: SpiceNodeInit = {}) {
    super(init)
    this.path = typeof path === "string" ? path : path.path
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Include {
    const tokens = SpiceTokenCard.from(card)
    return new Include(tokens.restJoined(0), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.path}`
  }
}
DotCommand.register(Include)

import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, directiveArgs } from "../tokens/fromTokens"

export class Include extends DotCommand {
  readonly type = "include" as const
  command = ".include"
  path: string

  constructor(path: string | { path: string }, init: SpiceNodeInit = {}) {
    super(init)
    this.path = typeof path === "string" ? path : path.path
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Include {
    return new Include(directiveArgs(card).join(" "), {
      originalSource: cardOriginalSource(card),
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

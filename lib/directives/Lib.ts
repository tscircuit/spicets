import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, directiveArgs } from "../tokens/fromTokens"

export class Lib extends DotCommand {
  readonly type = "lib" as const
  command = ".lib"
  path?: string
  section?: string

  constructor(init: SpiceNodeInit & { path?: string; section?: string } = {}) {
    super(init)
    this.path = init.path
    this.section = init.section
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Lib {
    const args = directiveArgs(card)
    return new Lib({
      path: args[0],
      section: args[1],
      originalSource: cardOriginalSource(card),
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, this.path, this.section].filter(Boolean).join(" ")
  }
}

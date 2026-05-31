import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Lib extends DotCommand {
  static spiceTokenKeys = [".lib"]
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
    const tokens = SpiceTokenCard.from(card)
    return new Lib({
      path: tokens.arg(0),
      section: tokens.arg(1),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, this.path, this.section].filter(Boolean).join(" ")
  }
}
DotCommand.register(Lib)

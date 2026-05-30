import { DotCommand, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class End extends DotCommand {
  static spiceTokenKeys = [".end"]
  readonly type = "end" as const
  command = ".end"

  static fromSpiceTokens(card: SpiceLogicalCard): End {
    return new End({ originalSource: SpiceTokenCard.from(card).originalSource })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return this.command
  }
}
DotCommand.register(End)

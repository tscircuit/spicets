import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class UnknownDotCommand extends DotCommand {
  static spiceTokenKeys = ["__default__"]
  readonly type = "unknown_dot_command" as const
  command: string
  args: string[]

  constructor(init: SpiceNodeInit & { command: string; args: string[] }) {
    super(init)
    this.command = init.command
    this.args = init.args
  }

  static fromSpiceTokens(card: SpiceLogicalCard): UnknownDotCommand {
    const tokens = SpiceTokenCard.from(card)
    return new UnknownDotCommand({
      command: tokens.headRaw(),
      args: tokens.args(),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
DotCommand.register(UnknownDotCommand)

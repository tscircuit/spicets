import {
  DotCommand,
  assertPspiceTarget,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class PspiceText extends DotCommand {
  static spiceTokenKeys = [".text"]
  readonly type = "pspice_text" as const
  command = ".TEXT"
  args: string[]

  constructor(args: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.args = args
  }

  static fromSpiceTokens(card: SpiceLogicalCard): PspiceText {
    const tokens = SpiceTokenCard.from(card)
    return new PspiceText(tokens.args(), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    assertPspiceTarget(options, ".TEXT")
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
DotCommand.register(PspiceText)

import {
  DotCommand,
  assertPspiceTarget,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class PspiceWatch extends DotCommand {
  static spiceTokenKeys = [".watch"]
  readonly type = "pspice_watch" as const
  command = ".WATCH"
  args: string[]

  constructor(args: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.args = args
  }

  static fromSpiceTokens(card: SpiceLogicalCard): PspiceWatch {
    const tokens = SpiceTokenCard.from(card)
    return new PspiceWatch(tokens.args(), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    assertPspiceTarget(options, ".WATCH")
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
DotCommand.register(PspiceWatch)

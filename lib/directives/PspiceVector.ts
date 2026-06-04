import {
  DotCommand,
  assertPspiceTarget,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class PspiceVector extends DotCommand {
  static spiceTokenKeys = [".vector"]
  readonly type = "pspice_vector" as const
  command = ".VECTOR"
  args: string[]

  constructor(args: string[], init: SpiceNodeInit = {}) {
    super(init)
    this.args = args
  }

  static fromSpiceTokens(card: SpiceLogicalCard): PspiceVector {
    const tokens = SpiceTokenCard.from(card)
    return new PspiceVector(tokens.args(), {
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    assertPspiceTarget(options, ".VECTOR")
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.args].join(" ")
  }
}
DotCommand.register(PspiceVector)

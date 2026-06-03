import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Probe extends DotCommand {
  static spiceTokenKeys = [".probe"]
  readonly type = "probe" as const
  command = ".probe"
  expressions: string[]

  constructor(expressions: string[] = [], init: SpiceNodeInit = {}) {
    super(init)
    this.expressions = expressions
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Probe {
    const tokens = SpiceTokenCard.from(card)
    return new Probe(tokens.args(), { originalSource: tokens.originalSource })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [this.command, ...this.expressions].join(" ")
  }
}
DotCommand.register(Probe)

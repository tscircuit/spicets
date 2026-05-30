import { DotCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

export class Measure extends DotCommand {
  static spiceTokenKeys = [".measure"]
  readonly type = "measure" as const
  command = ".measure"
  analysis?: string
  name: string
  expression: string

  constructor(init: SpiceNodeInit & {
    analysis?: string
    name: string
    expression: string
  }) {
    super(init)
    this.analysis = init.analysis
    this.name = init.name
    this.expression = init.expression
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Measure {
    const tokens = SpiceTokenCard.from(card)
    return new Measure({
      analysis: tokens.arg(0),
      name: tokens.arg(1) ?? "",
      expression: tokens.restJoined(2),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [this.command, this.analysis, this.name, this.expression]
      .filter(Boolean)
      .join(" ")
  }
}
DotCommand.register(Measure)

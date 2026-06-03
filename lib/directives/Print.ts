import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

function parsePrintSource(source: string): {
  analysis?: string
  expressions: string[]
} {
  const body = source.trim().replace(/^\.print\s+/i, "")
  const [analysis, ...rest] = body.split(/\s+/)
  const expressionSource = rest.join(" ")
  return {
    analysis,
    expressions:
      expressionSource.length === 0
        ? []
        : expressionSource.split(",").map((expression) => expression.trim()),
  }
}

export class Print extends DotCommand {
  static spiceTokenKeys = [".print"]
  readonly type = "print" as const
  command = ".print"
  analysis?: string
  expressions: string[]

  constructor(
    init: SpiceNodeInit & {
      analysis?: string
      expressions?: string[]
    } = {},
  ) {
    super(init)
    this.analysis = init.analysis
    this.expressions = init.expressions ?? []
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Print {
    const tokens = SpiceTokenCard.from(card)
    return new Print({
      ...parsePrintSource(tokens.originalSource),
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return [
      this.command,
      this.analysis,
      this.expressions.length > 0 ? this.expressions.join(", ") : undefined,
    ]
      .filter(Boolean)
      .join(" ")
  }
}
DotCommand.register(Print)

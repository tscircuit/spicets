import {
  DotCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"

function splitPrintExpressions(source: string): string[] {
  const expressions: string[] = []
  let start = 0
  let depth = 0
  let quote = ""
  for (let index = 0; index < source.length; index++) {
    const character = source.charAt(index)
    if (quote) {
      if (character === "\\") index++
      else if (character === quote) quote = ""
      continue
    }
    if (character === "'" || character === '"') {
      quote = character
    } else if (character === "(" || character === "{" || character === "[") {
      depth++
    } else if (character === ")" || character === "}" || character === "]") {
      depth = Math.max(0, depth - 1)
    } else if (depth === 0 && (character === "," || /\s/.test(character))) {
      const expression = source.slice(start, index).trim()
      if (expression) expressions.push(expression)
      start = index + 1
    }
  }
  const expression = source.slice(start).trim()
  if (expression) expressions.push(expression)
  return expressions
}

function parsePrintSource(source: string): {
  analysis?: string
  expressions: string[]
} {
  const body = source.trim().replace(/^\.print\s+/i, "")
  const [analysis, ...rest] = body.split(/\s+/)
  const expressionSource = rest.join(" ")
  return {
    analysis,
    expressions: splitPrintExpressions(expressionSource),
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

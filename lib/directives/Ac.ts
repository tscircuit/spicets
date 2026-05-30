import { AnalysisCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, directiveArgs } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Ac extends AnalysisCommand {
  static spiceTokenKeys = [".ac"]
  readonly type = "ac" as const
  command = ".ac"
  sweep: "dec" | "oct" | "lin"
  points: number
  start: SpiceValue
  stop: SpiceValue

  constructor(init: SpiceNodeInit & {
    sweep: "dec" | "oct" | "lin"
    points: number
    start: SpiceValueInput
    stop: SpiceValueInput
  }) {
    super(init)
    this.sweep = init.sweep
    this.points = init.points
    this.start = normalizeValue(init.start)
    this.stop = normalizeValue(init.stop)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Ac {
    const args = directiveArgs(card)
    const sweep = args[0]?.toLowerCase()
    return new Ac({
      sweep: sweep === "oct" || sweep === "lin" ? sweep : "dec",
      points: Number(args[1] ?? 0),
      start: args[2] ?? "",
      stop: args[3] ?? "",
      originalSource: cardOriginalSource(card),
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.sweep} ${this.points} ${this.start.getString()} ${this.stop.getString()}`
  }
}
AnalysisCommand.register(Ac)

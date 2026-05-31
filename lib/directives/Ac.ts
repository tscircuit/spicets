import {
  AnalysisCommand,
  type SpiceNodeInit,
  type SpiceSerializeOptions,
} from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { SpiceTokenCard } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Ac extends AnalysisCommand {
  static spiceTokenKeys = [".ac"]
  readonly type = "ac" as const
  command = ".ac"
  sweep: "dec" | "oct" | "lin"
  points: number
  start: SpiceValue
  stop: SpiceValue

  constructor(
    init: SpiceNodeInit & {
      sweep: "dec" | "oct" | "lin"
      points: number
      start: SpiceValueInput
      stop: SpiceValueInput
    },
  ) {
    super(init)
    this.sweep = init.sweep
    this.points = init.points
    this.start = normalizeValue(init.start)
    this.stop = normalizeValue(init.stop)
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Ac {
    const tokens = SpiceTokenCard.from(card)
    return new Ac({
      sweep: tokens.sweepArg(0, "dec"),
      points: Number(tokens.arg(1) ?? 0),
      start: tokens.arg(2) ?? "",
      stop: tokens.arg(3) ?? "",
      originalSource: tokens.originalSource,
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined)
      return this.originalSource
    return `${this.command} ${this.sweep} ${this.points} ${this.start.getString()} ${this.stop.getString()}`
  }
}
AnalysisCommand.register(Ac)

import { AnalysisCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Ac extends AnalysisCommand {
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

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return `${this.command} ${this.sweep} ${this.points} ${this.start.getString()} ${this.stop.getString()}`
  }
}

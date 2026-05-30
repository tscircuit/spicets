import { AnalysisCommand, type SpiceNodeInit, type SpiceSerializeOptions } from "../ast"
import type { SpiceLogicalCard } from "../tokens"
import { cardOriginalSource, directiveArgs } from "../tokens/fromTokens"
import { SpiceValue, type SpiceValueInput, normalizeValue } from "../values"

export class Tran extends AnalysisCommand {
  static spiceTokenKeys = [".tran"]
  readonly type = "tran" as const
  command = ".tran"
  step?: SpiceValue
  stop: SpiceValue
  start?: SpiceValue
  maxStep?: SpiceValue
  uic?: boolean

  constructor(init: SpiceNodeInit & {
    step?: SpiceValueInput
    stop: SpiceValueInput
    start?: SpiceValueInput
    maxStep?: SpiceValueInput
    uic?: boolean
  }) {
    super(init)
    this.step = init.step === undefined ? undefined : normalizeValue(init.step)
    this.stop = normalizeValue(init.stop)
    this.start = init.start === undefined ? undefined : normalizeValue(init.start)
    this.maxStep =
      init.maxStep === undefined ? undefined : normalizeValue(init.maxStep)
    this.uic = init.uic
  }

  static fromSpiceTokens(card: SpiceLogicalCard): Tran {
    const args = directiveArgs(card)
    return new Tran({
      step: args[0],
      stop: args[1] ?? "",
      start: args[2],
      maxStep: args[3],
      uic: args.some((arg) => arg.toLowerCase() === "uic"),
      originalSource: cardOriginalSource(card),
    })
  }

  getChildren(): [] {
    return []
  }

  toSource(options?: SpiceSerializeOptions): string {
    if (options?.format !== "pretty" && this.originalSource !== undefined) return this.originalSource
    return [
      this.command,
      this.step?.getString(),
      this.stop.getString(),
      this.start?.getString(),
      this.maxStep?.getString(),
      this.uic ? "UIC" : undefined,
    ]
      .filter(Boolean)
      .join(" ")
  }
}
AnalysisCommand.register(Tran)
